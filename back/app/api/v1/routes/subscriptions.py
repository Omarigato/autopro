from datetime import datetime, timedelta
import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_owner
from app.db.session import get_db
from app.models import (
    OwnerSubscription,
    PaymentTransaction,
    SubscriptionPlan,
)
from app.schemas.subscriptions import BuySubscriptionRequest
from app.services.kassa24_service import kassa24_service
from app.services.subscriptions_service import (
    activate_subscription_after_success_payment,
    get_active_subscription_for_owner,
)
from app.core.responses import create_response
from app.core.logger import logger

router = APIRouter()


@router.get("/plans")
def list_plans(request: Request, db: Session = Depends(get_db)):
    plans = (
        db.query(SubscriptionPlan)
        .filter(SubscriptionPlan.is_active.is_(True))
        .order_by(SubscriptionPlan.price_kzt.asc())
        .all()
    )
    return create_response(data=[{
        "id": p.id, "name": p.name, "code": p.code, "price_kzt": p.price_kzt, "period_days": p.period_days
    } for p in plans], lang=request.state.lang)


@router.get("/me")
def my_subscription_status(
    request: Request,
    db: Session = Depends(get_db), current_owner=Depends(get_current_owner)
):
    subscription = get_active_subscription_for_owner(db, current_owner.id)
    if not subscription:
        return create_response(data=None, lang=request.state.lang)

    return create_response(data={
        "plan_name": subscription.plan.name,
        "status": subscription.status,
        "valid_until": subscription.valid_until.isoformat() if subscription.valid_until else None,
        "started_at": subscription.started_at.isoformat() if subscription.started_at else None,
    }, lang=request.state.lang)


@router.post("/checkout")
async def buy_subscription(
    payload: BuySubscriptionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_owner=Depends(get_current_owner),
):
    """Покупка подписки через Kassa24."""
    plan = (
        db.query(SubscriptionPlan)
        .filter(SubscriptionPlan.id == payload.plan_id, SubscriptionPlan.is_active.is_(True))
        .first()
    )
    if not plan:
        return create_response(code=404, message="Subscription plan not found", lang=request.state.lang)

    if payload.provider != "kassa24":
        return create_response(code=400, message="Поддерживается только Kassa24", lang=request.state.lang)

    subscription = OwnerSubscription(
        owner_id=current_owner.id,
        plan_id=plan.id,
        status="pending",
    )
    db.add(subscription)
    db.flush()

    internal_order_id = str(uuid.uuid4())

    transaction = PaymentTransaction(
        provider="kassa24",
        external_id=None,
        order_id=internal_order_id,
        status="created",
        amount_kzt=plan.price_kzt,
        currency="KZT",
        owner_id=current_owner.id,
        subscription_id=subscription.id,
    )
    db.add(transaction)
    db.flush()

    success, payment_url, external_id = await kassa24_service.create_payment(
        order_id=internal_order_id,
        amount_kzt=plan.price_kzt,
        description=f"Оплата подписки {plan.name}"
    )

    if not success or not payment_url:
        # Провайдер не смог создать платеж
        return create_response(code=502, message="Ошибка создания платежа в Kassa24", lang=request.state.lang)

    transaction.payment_url = payment_url
    if external_id:
        transaction.external_id = str(external_id)
    transaction.status = "pending"
    
    db.commit()

    return create_response(data={
        "transaction_id": transaction.id,
        "payment_url": transaction.payment_url,
    }, lang=request.state.lang)


@router.post("/kassa24/callback")
async def kassa24_callback(request: Request, payload: dict, db: Session = Depends(get_db)):
    """Webhook от Kassa24. По успешному статусу активируем подписку."""
    
    # Логируем
    logger.info(f"Kassa24 Callback received: {payload}")
    
    if not kassa24_service.validate_callback(payload):
        return {"error": "invalid signature"}

    # Предположим, что Kassa24 присылает orderId (наш внутренний) или transactionId
    order_id = payload.get("orderId")
    status = payload.get("status") # Ищем статус, например "paid" или "success"

    if not order_id:
        return {"error": "no orderId"}

    transaction = db.query(PaymentTransaction).filter(PaymentTransaction.order_id == str(order_id)).first()
    if not transaction:
        return {"error": "transaction not found"}

    # Сохраним сырые данные
    transaction.raw_data = payload

    if transaction.status == "paid":
        # Уже оплачено, идемпотентность
        db.commit()
        return {"accepted": True}

    # Если статус успешный:
    if status in ("success", "paid", "PAID"):
        transaction.status = "paid"
        subscription = transaction.subscription
        if subscription.status != "active":
            subscription.status = "active"
            subscription.started_at = datetime.utcnow()
            subscription.valid_until = datetime.utcnow() + timedelta(days=subscription.plan.period_days)
            # Если есть функция активации
            # activate_subscription_after_success_payment(db, subscription)
    elif status in ("failed", "cancelled", "expired", "error"):
        transaction.status = "failed"
        transaction.subscription.status = "failed"
    
    db.commit()
    return {"accepted": True}

@router.get("/payments/history")
def payment_history(
    request: Request,
    db: Session = Depends(get_db), current_owner=Depends(get_current_owner)
):
    transactions = (
        db.query(PaymentTransaction)
        .filter(PaymentTransaction.owner_id == current_owner.id)
        .order_by(PaymentTransaction.create_date.desc())
        .limit(20)
        .all()
    )
    
    res = []
    for t in transactions:
        res.append({
            "id": t.id,
            "provider": t.provider,
            "amount_kzt": t.amount_kzt,
            "status": t.status,
            "create_date": t.create_date.isoformat() if t.create_date else None,
            "plan_name": t.subscription.plan.name if t.subscription and t.subscription.plan else "Подписка"
        })
    return create_response(data=res, lang=request.state.lang)

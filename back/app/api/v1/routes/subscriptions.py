from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import get_current_owner
from app.db.session import get_db
from app.models.entities import (
    OwnerSubscription,
    PaymentTransaction,
    SubscriptionPlan,
)
from app.schemas.subscriptions import (
    BuySubscriptionRequest,
)
from app.services.kassa24_service import Kassa24Error, create_kassa24_payment
from app.services.subscriptions_service import (
    activate_subscription_after_success_payment,
    get_active_subscription_for_owner,
)
from app.core.responses import create_response

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
        "id": p.id, "name": p.name, "price": p.price_kzt, "period": p.period_days
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
        "valid_until": subscription.valid_until,
    }, lang=request.state.lang)

@router.post("/buy")
async def buy_subscription(
    payload: BuySubscriptionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_owner=Depends(get_current_owner),
):
    """
    Покупка подписки (Lite / Premium).
    Сейчас поддерживается только провайдер Kassa24.
    """
    plan: SubscriptionPlan | None = (
        db.query(SubscriptionPlan)
        .filter(SubscriptionPlan.id == payload.plan_id, SubscriptionPlan.is_active.is_(True))
        .first()
    )
    if not plan:
        return create_response(code=404, message="Subscription plan not found", lang=request.state.lang)

    if payload.provider != "kassa24":
        return create_response(code=400, message="Provider not supported", lang=request.state.lang)

    subscription = OwnerSubscription(
        owner_id=current_owner.id,
        plan_id=plan.id,
        status="pending",
    )
    db.add(subscription)
    db.flush()

    transaction = PaymentTransaction(
        provider="kassa24",
        external_id=None,
        order_id=str(subscription.id),
        status="created",
        amount_kzt=plan.price_kzt,
        owner_id=current_owner.id,
        subscription_id=subscription.id,
    )
    db.add(transaction)
    db.flush()

    try:
        payment_url, external_id = await create_kassa24_payment(
            db=db, transaction=transaction, subscription=subscription, plan=plan
        )
    except Kassa24Error as exc:
        return create_response(code=502, message=str(exc), lang=request.state.lang)

    transaction.payment_url = payment_url
    transaction.external_id = external_id
    db.add(transaction)
    db.commit()

    return create_response(data={
        "transaction_id": transaction.id,
        "payment_url": transaction.payment_url,
    }, lang=request.state.lang)


@router.post("/payments/kassa24/callback")
def kassa24_callback(
    request: Request,
    payload: dict,
    db: Session = Depends(get_db),
):
    """
    Callback от Kassa24.
    По успешному статусу активируем подписку арендодателя.
    Документация: https://business.kassa24.kz/documentation/payment-methods
    """
    data = payload

    external_id = str(data.get("id", ""))
    status_value = int(data.get("status", 0))

    transaction: PaymentTransaction | None = (
        db.query(PaymentTransaction)
        .filter(
            PaymentTransaction.provider == "kassa24",
            PaymentTransaction.external_id == external_id,
        )
        .first()
    )

    if not transaction:
        # Ничего не нашли, но чтобы Kassa24 не спамил, всё равно подтверждаем.
        return {"accepted": True}

    transaction.raw_data = data
    now = datetime.utcnow()

    # Базовые статусы Kassa24: 0 - неуспех, 1 - успех, 2 - hold, 3 - cancel
    if status_value == 1:
        transaction.status = "success"
        subscription = transaction.subscription
        if subscription:
            # Определяем, первая ли это успешная подписка для арендодателя
            has_other_success = (
                db.query(OwnerSubscription)
                .filter(
                    OwnerSubscription.owner_id == subscription.owner_id,
                    OwnerSubscription.id != subscription.id,
                    OwnerSubscription.status == "active",
                )
                .count()
                > 0
            )
            activate_subscription_after_success_payment(
                db=db,
                subscription=subscription,
                is_first_subscription=not has_other_success,
            )
    else:
        transaction.status = "failed"
        if transaction.subscription:
            transaction.subscription.status = "failed"

    transaction.update_date = now
    db.add(transaction)
    db.commit()

    # Kassa24 ожидает {"accepted": true}, иначе будет ретраить callback
    return {"accepted": True}


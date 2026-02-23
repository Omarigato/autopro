from datetime import datetime

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_owner
from app.db.session import get_db
from app.models.entities import (
    OwnerSubscription,
    PaymentTransaction,
    SubscriptionPlan,
)
from app.schemas.subscriptions import BuySubscriptionRequest
from app.services.tiptoppay_service import TipTopPayError, create_tiptoppay_payment
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


@router.get("/check")
def subscription_check(
    request: Request,
    db: Session = Depends(get_db),
    current_owner=Depends(get_current_owner),
):
    """
    Для страницы добавления объявления: включены ли подписки, первое ли объявление бесплатно, есть ли активная подписка, список планов.
    """
    from app.models.entities import AppSetting

    setting = db.query(AppSetting).filter(AppSetting.key == "subscriptions_enabled").first()
    subscriptions_enabled = setting and setting.value and setting.value.lower() == "true"

    from app.services.subscriptions_service import owner_cars_count
    current_cars = owner_cars_count(db, current_owner.id)
    first_ad_free = subscriptions_enabled and current_cars == 0

    subscription = get_active_subscription_for_owner(db, current_owner.id)
    has_active_subscription = subscription is not None

    plans = (
        db.query(SubscriptionPlan)
        .filter(SubscriptionPlan.is_active.is_(True))
        .order_by(SubscriptionPlan.price_kzt.asc())
        .all()
    )
    plans_data = [{"id": p.id, "name": p.name, "code": p.code, "price_kzt": p.price_kzt, "period_days": p.period_days, "max_cars": p.max_cars} for p in plans]

    return create_response(data={
        "subscriptions_enabled": subscriptions_enabled,
        "first_ad_free": first_ad_free,
        "has_active_subscription": has_active_subscription,
        "current_cars_count": current_cars,
        "my_subscription": {
            "plan_name": subscription.plan.name,
            "status": subscription.status,
            "valid_until": subscription.valid_until.isoformat() if subscription and subscription.valid_until else None,
        } if subscription else None,
        "plans": plans_data,
    }, lang=request.state.lang)


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
    }, lang=request.state.lang)


@router.post("/buy")
async def buy_subscription(
    payload: BuySubscriptionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_owner=Depends(get_current_owner),
):
    """Покупка подписки через TipTopPay."""
    plan = (
        db.query(SubscriptionPlan)
        .filter(SubscriptionPlan.id == payload.plan_id, SubscriptionPlan.is_active.is_(True))
        .first()
    )
    if not plan:
        return create_response(code=404, message="Subscription plan not found", lang=request.state.lang)

    if payload.provider != "tiptoppay":
        return create_response(code=400, message="Поддерживается только TipTopPay", lang=request.state.lang)

    subscription = OwnerSubscription(
        owner_id=current_owner.id,
        plan_id=plan.id,
        status="pending",
    )
    db.add(subscription)
    db.flush()

    transaction = PaymentTransaction(
        provider="tiptoppay",
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
        payment_url, external_id = await create_tiptoppay_payment(
            db=db, transaction=transaction, subscription=subscription, plan=plan
        )
    except TipTopPayError as exc:
        return create_response(code=502, message=str(exc), lang=request.state.lang)

    transaction.payment_url = payment_url
    transaction.external_id = external_id
    db.add(transaction)
    db.commit()

    return create_response(data={
        "transaction_id": transaction.id,
        "payment_url": transaction.payment_url,
    }, lang=request.state.lang)


@router.post("/payments/tiptoppay/callback")
def tiptoppay_callback(request: Request, payload: dict, db: Session = Depends(get_db)):
    """Webhook от TipTopPay. По успешному статусу активируем подписку."""
    from app.services.tiptoppay_service import handle_tiptoppay_callback
    handle_tiptoppay_callback(db, payload)
    return {"accepted": True}

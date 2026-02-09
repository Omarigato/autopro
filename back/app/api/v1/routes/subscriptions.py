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
    BuySubscriptionResponse,
    OwnerSubscriptionStatusResponse,
    SubscriptionPlanResponse,
)
from app.services.kassa24_service import Kassa24Error, create_kassa24_payment
from app.services.subscriptions_service import (
    activate_subscription_after_success_payment,
    get_active_subscription_for_owner,
)

router = APIRouter()


@router.get("/plans", response_model=list[SubscriptionPlanResponse])
def list_plans(db: Session = Depends(get_db)) -> list[SubscriptionPlanResponse]:
    plans = (
        db.query(SubscriptionPlan)
        .filter(SubscriptionPlan.is_active.is_(True))
        .order_by(SubscriptionPlan.price_kzt.asc())
        .all()
    )
    return plans


@router.get("/me", response_model=OwnerSubscriptionStatusResponse | None)
def my_subscription_status(
    db: Session = Depends(get_db), current_owner=Depends(get_current_owner)
):
    subscription = get_active_subscription_for_owner(db, current_owner.id)
    if not subscription:
        return None
    return OwnerSubscriptionStatusResponse(
        plan=SubscriptionPlanResponse.model_validate(subscription.plan),
        status=subscription.status,
        started_at=subscription.started_at,
        valid_until=subscription.valid_until,
        trial_until=subscription.trial_until,
    )


@router.post("/buy", response_model=BuySubscriptionResponse)
async def buy_subscription(
    payload: BuySubscriptionRequest,
    db: Session = Depends(get_db),
    current_owner=Depends(get_current_owner),
) -> BuySubscriptionResponse:
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
        raise HTTPException(status_code=404, detail="Тариф подписки не найден")

    if payload.provider != "kassa24":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пока поддерживается только оплата через Kassa24",
        )

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
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    transaction.payment_url = payment_url
    transaction.external_id = external_id
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return BuySubscriptionResponse(
        transaction_id=transaction.id,
        payment_url=transaction.payment_url,
    )


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


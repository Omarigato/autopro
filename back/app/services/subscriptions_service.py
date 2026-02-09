from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.entities import Car, OwnerSubscription, SubscriptionPlan


def get_active_subscription_for_owner(db: Session, owner_id: int) -> OwnerSubscription | None:
    """
    Возвращает самую "свежую" активную подписку арендодателя.
    """
    now = datetime.utcnow()
    return (
        db.query(OwnerSubscription)
        .join(SubscriptionPlan)
        .filter(
            OwnerSubscription.owner_id == owner_id,
            OwnerSubscription.status == "active",
            OwnerSubscription.valid_until.is_not(None),
            OwnerSubscription.valid_until >= now,
            SubscriptionPlan.is_active.is_(True),
        )
        .order_by(OwnerSubscription.valid_until.desc())
        .first()
    )


def owner_cars_count(db: Session, owner_id: int) -> int:
    return (
        db.query(Car)
        .filter(Car.author_id == owner_id, Car.delete_date.is_(None))
        .count()
    )


def activate_subscription_after_success_payment(
    db: Session,
    subscription: OwnerSubscription,
    is_first_subscription: bool,
) -> None:
    """
    Активирует подписку после успешной оплаты с учётом бесплатных дней.
    """
    plan = subscription.plan
    now = datetime.utcnow()

    trial_days = plan.free_days if is_first_subscription else 0
    total_days = plan.period_days + trial_days

    subscription.started_at = now
    subscription.trial_until = now + timedelta(days=trial_days) if trial_days > 0 else None
    subscription.valid_until = now + timedelta(days=total_days)
    subscription.status = "active"

    db.add(subscription)


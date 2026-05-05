from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

class PaymentAccount(Base):
    __tablename__ = "payment_accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    provider: Mapped[str] = mapped_column(String(50))
    login: Mapped[str] = mapped_column(String(255))
    password: Mapped[str] = mapped_column(String(255))
    merchant_id: Mapped[str] = mapped_column(String(100))

    callback_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    return_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    success_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    fail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    demo: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    price_kzt: Mapped[int] = mapped_column(Integer)
    period_days: Mapped[int] = mapped_column(Integer, default=30)
    free_days: Mapped[int] = mapped_column(Integer, default=0)
    max_cars: Mapped[int | None] = mapped_column(Integer, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    subscriptions: Mapped[list["OwnerSubscription"]] = relationship(
        "OwnerSubscription", back_populates="plan"
    )


class OwnerSubscription(Base):
    __tablename__ = "owner_subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("client_cars.user_id"))
    plan_id: Mapped[int] = mapped_column(ForeignKey("subscription_plans.id"))

    status: Mapped[str] = mapped_column(String(50), default="pending")
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    trial_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped["CarOwner"] = relationship("CarOwner", back_populates="subscriptions")
    plan: Mapped[SubscriptionPlan] = relationship("SubscriptionPlan", back_populates="subscriptions")
    transactions: Mapped[list["PaymentTransaction"]] = relationship(
        "PaymentTransaction", back_populates="subscription"
    )


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    provider: Mapped[str] = mapped_column(String(50))
    external_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    order_id: Mapped[str] = mapped_column(String(100), index=True)
    status: Mapped[str] = mapped_column(String(50), default="created")

    amount_kzt: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10), default="KZT")

    owner_id: Mapped[int] = mapped_column(ForeignKey("client_cars.user_id"))
    subscription_id: Mapped[int] = mapped_column(ForeignKey("owner_subscriptions.id"))

    payment_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    subscription: Mapped[OwnerSubscription] = relationship(
        "OwnerSubscription", back_populates="transactions"
    )

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Dictionary(Base):
    __tablename__ = "dictionaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    code: Mapped[str] = mapped_column(String(100), index=True)
    type: Mapped[str] = mapped_column(String(50), index=True)  # MARKA, MODEL, CATEGORY, etc.
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True) # Lucide icon name
    color: Mapped[str | None] = mapped_column(String(50), nullable=True) # Tailwind or Hex color
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    parent: Mapped["Dictionary | None"] = relationship("Dictionary", remote_side=[id])
    translations: Mapped[list["DictionaryTranslation"]] = relationship("DictionaryTranslation", back_populates="dictionary")


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    phone_number: Mapped[str] = mapped_column(String(30))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class BlackList(Base):
    __tablename__ = "blacklist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), unique=True)

    client: Mapped[Client] = relationship("Client")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    login: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(30), unique=True, index=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="owner")  # owner, admin
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    pin_code: Mapped[str | None] = mapped_column(String(4), nullable=True) # 4-значный код
    address: Mapped[str | None] = mapped_column(String(500), nullable=True) # Адрес арендодателя
    
    otp_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    otp_expiry: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    delete_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    owner: Mapped["CarOwner"] = relationship("CarOwner", uselist=False, back_populates="user")
    
    avatar_image: Mapped["Image | None"] = relationship(
        "Image",
        primaryjoin="and_(Image.entity_id==User.id, Image.entity_type=='USER')",
        foreign_keys="[Image.entity_id]",
        uselist=False,
        overlaps="images",
        cascade="all, delete-orphan"
    )


class CarOwner(Base):
    __tablename__ = "car_owners"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    subscription_id: Mapped[int | None] = mapped_column(
        ForeignKey("dictionaries.id"), nullable=True
    )

    user: Mapped[User] = relationship("User", back_populates="owner")
    subscription: Mapped[Dictionary | None] = relationship("Dictionary")
    subscriptions: Mapped[list["OwnerSubscription"]] = relationship(
        "OwnerSubscription", back_populates="owner"
    )


class Car(Base):
    __tablename__ = "cars"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_per_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    vehicle_mark_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    vehicle_model_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    category_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    
    transmission_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    fuel_type_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    color_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    engine_volume: Mapped[str | None] = mapped_column(String(50)) # "2.5", "3.0" итд
    
    transport_number: Mapped[str | None] = mapped_column(String(50)) # Гос номер (080ABC01)
    motor_number: Mapped[str | None] = mapped_column(String(100)) # Номер двигателя
    body_number: Mapped[str | None] = mapped_column(String(100)) # Номер кузова
    tech_passport_number: Mapped[str | None] = mapped_column(String(50)) # Номер техпаспорта
    tech_passport_date: Mapped[datetime | None] = mapped_column(DateTime) # Дата техпаспорта
    
    bin: Mapped[str | None] = mapped_column(String(50))
    release_year: Mapped[int | None] = mapped_column(Integer)
    city_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id")) # Город
    
    is_top: Mapped[bool] = mapped_column(Boolean, default=False)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)  # активирует админ
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    delete_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    author: Mapped[User] = relationship("User")
    images: Mapped[list["Image"]] = relationship(
        "Image", 
        primaryjoin="and_(Image.entity_id==Car.id, Image.entity_type=='CAR')",
        foreign_keys="[Image.entity_id]",
        overlaps="avatar_image",
        cascade="all, delete-orphan"
    )

    # Relationships for dictionaries
    mark: Mapped[Dictionary | None] = relationship("Dictionary", foreign_keys=[vehicle_mark_id])
    model: Mapped[Dictionary | None] = relationship("Dictionary", foreign_keys=[vehicle_model_id])
    category: Mapped[Dictionary | None] = relationship("Dictionary", foreign_keys=[category_id])
    transmission: Mapped[Dictionary | None] = relationship("Dictionary", foreign_keys=[transmission_id])
    fuel_type: Mapped[Dictionary | None] = relationship("Dictionary", foreign_keys=[fuel_type_id])
    color: Mapped[Dictionary | None] = relationship("Dictionary", foreign_keys=[color_id])
    city: Mapped[Dictionary | None] = relationship("Dictionary", foreign_keys=[city_id])


class Image(Base):
    __tablename__ = "images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    url: Mapped[str] = mapped_column(String(500))
    image_id: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Cloudinary public_id
    
    entity_id: Mapped[int] = mapped_column(Integer, index=True)
    entity_type: Mapped[str] = mapped_column(String(50), index=True)  # 'CAR', 'USER'
    position: Mapped[int] = mapped_column(Integer, default=0)


from sqlalchemy import event
from app.services.cloudinary_service import CloudinaryService

@event.listens_for(Image, 'after_delete')
def receive_after_delete(mapper, connection, target):
    if target.image_id:
        CloudinaryService.delete_image(target.image_id)


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id"))
    car_owner_id: Mapped[int] = mapped_column(ForeignKey("car_owners.user_id"))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Review(Base):
    """
    Отзыв о машине и/или арендодателе.
    Может оставлять клиент после аренды.
    """

    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id"))
    car_owner_id: Mapped[int] = mapped_column(ForeignKey("car_owners.user_id"))
    client_id: Mapped[int | None] = mapped_column(ForeignKey("clients.id"))
    rating: Mapped[int] = mapped_column(Integer)  # 1-5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DictionaryTranslation(Base):
    """
    Переводы для записей из Dictionary.
    Позволяет возвращать названия на разных языках.
    """

    __tablename__ = "dictionary_translations"
    __table_args__ = (UniqueConstraint("dictionary_id", "lang", name="uq_dict_lang"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dictionary_id: Mapped[int] = mapped_column(ForeignKey("dictionaries.id"))
    lang: Mapped[str] = mapped_column(String(5))  # ru, en, kk и т.п.
    name: Mapped[str] = mapped_column(String(255))

    dictionary: Mapped[Dictionary] = relationship("Dictionary", back_populates="translations")


class PaymentAccount(Base):
    """
    Платёжный аккаунт (реквизиты Kassa24 / Kaspi и т.п.).
    Можно менять через админ‑панель без перезапуска бэкенда.
    """

    __tablename__ = "payment_accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    provider: Mapped[str] = mapped_column(String(50))  # kassa24, kaspi
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
    """
    Тарифы подписки (Lite, Premium).
    Параметры (период, цена, бесплатные дни, лимит машин) можно менять через админку.
    """

    __tablename__ = "subscription_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)  # LITE, PREMIUM
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    price_kzt: Mapped[int] = mapped_column(Integer)  # цена в тенге
    period_days: Mapped[int] = mapped_column(Integer, default=30)
    free_days: Mapped[int] = mapped_column(Integer, default=0)
    max_cars: Mapped[int | None] = mapped_column(Integer, nullable=True)  # None = безлимит

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    subscriptions: Mapped[list["OwnerSubscription"]] = relationship(
        "OwnerSubscription", back_populates="plan"
    )


class OwnerSubscription(Base):
    """
    Подписка конкретного арендодателя.
    """

    __tablename__ = "owner_subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("car_owners.user_id"))
    plan_id: Mapped[int] = mapped_column(ForeignKey("subscription_plans.id"))

    status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )  # pending, active, expired, failed, cancelled
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    trial_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped[CarOwner] = relationship("CarOwner", back_populates="subscriptions")
    plan: Mapped[SubscriptionPlan] = relationship("SubscriptionPlan", back_populates="subscriptions")
    transactions: Mapped[list["PaymentTransaction"]] = relationship(
        "PaymentTransaction", back_populates="subscription"
    )


class PaymentTransaction(Base):
    """
    Транзакция оплаты подписки через платёжный провайдер (Kassa24, Kaspi и т.д.).
    """

    __tablename__ = "payment_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    provider: Mapped[str] = mapped_column(String(50))  # kassa24, kaspi
    external_id: Mapped[str | None] = mapped_column(String(100), nullable=True)  # id в Kassa24
    order_id: Mapped[str] = mapped_column(String(100), index=True)
    status: Mapped[str] = mapped_column(
        String(50), default="created"
    )  # created, success, failed, pending

    amount_kzt: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10), default="KZT")

    owner_id: Mapped[int] = mapped_column(ForeignKey("car_owners.user_id"))
    subscription_id: Mapped[int] = mapped_column(ForeignKey("owner_subscriptions.id"))

    payment_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    subscription: Mapped[OwnerSubscription] = relationship(
        "OwnerSubscription", back_populates="transactions"
    )


class OTPVerification(Base):
    """
    История и логи верификации через OTP (WhatsApp/SMS/Email).
    Позволяет фиксировать все попытки входа и сброса пароля.
    """

    __tablename__ = "otp_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    target: Mapped[str] = mapped_column(String(255), index=True)  # номер телефона или email
    code: Mapped[str] = mapped_column(String(10))
    type: Mapped[str] = mapped_column(String(50))  # login, register, password_reset
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


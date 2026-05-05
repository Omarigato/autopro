from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(30), unique=True, index=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="client")  # client, admin
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    date_birth: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    balance: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    city_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    notify_by_email: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_by_whatsapp: Mapped[bool] = mapped_column(Boolean, default=True)

    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    delete_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    owner: Mapped["CarOwner"] = relationship("CarOwner", uselist=False, back_populates="user")
    likes: Mapped[list["UserLike"]] = relationship("UserLike", back_populates="user", cascade="all, delete-orphan")
    events: Mapped[list["UserEvent"]] = relationship("UserEvent", back_populates="user", cascade="all, delete-orphan")
    
    avatar_image: Mapped["Image | None"] = relationship(
        "Image",
        primaryjoin="and_(Image.entity_id==User.id, Image.entity_type=='USER')",
        foreign_keys="[Image.entity_id]",
        uselist=False,
        overlaps="images,avatar_image,car_images,application_images",
        cascade="all, delete-orphan"
    )
    city: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[city_id])


class CarOwner(Base):
    __tablename__ = "client_cars"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    subscription_id: Mapped[int | None] = mapped_column(
        ForeignKey("dictionaries.id"), nullable=True
    )

    user: Mapped[User] = relationship("User", back_populates="owner")
    subscription: Mapped["Dictionary | None"] = relationship("Dictionary")
    subscriptions: Mapped[list["OwnerSubscription"]] = relationship(
        "OwnerSubscription", back_populates="owner"
    )

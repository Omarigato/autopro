from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, event
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.services.cloudinary_service import CloudinaryService

class Car(Base):
    __tablename__ = "cars"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    additional_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_per_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    vehicle_mark_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    vehicle_model_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    category_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    
    transmission_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    fuel_type_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    color_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    engine_volume: Mapped[str | None] = mapped_column(String(50))
    
    release_year: Mapped[int | None] = mapped_column(Integer)
    mileage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    body_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    steering_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    condition_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    car_class_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    city_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"))
    
    is_top: Mapped[bool] = mapped_column(Boolean, default=False)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default="AWAIT", index=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    delete_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    author: Mapped["User"] = relationship("User")
    car_images: Mapped[list["Image"]] = relationship(
        "Image", 
        primaryjoin="and_(Image.entity_id==Car.id, Image.entity_type=='CAR')",
        foreign_keys="[Image.entity_id]",
        overlaps="avatar_image,images,application_images,car_images",
        cascade="all, delete-orphan"
    )

    mark: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[vehicle_mark_id])
    model: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[vehicle_model_id])
    category: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[category_id])
    transmission: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[transmission_id])
    fuel_type: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[fuel_type_id])
    color: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[color_id])
    steering: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[steering_id])
    condition: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[condition_id])
    car_class: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[car_class_id])
    city: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[city_id])


class Image(Base):
    __tablename__ = "images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    url: Mapped[str] = mapped_column(String(500))
    image_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    entity_id: Mapped[int] = mapped_column(Integer, index=True)
    entity_type: Mapped[str] = mapped_column(String(50), index=True)  # 'CAR', 'USER', 'APPLICATION'
    position: Mapped[int] = mapped_column(Integer, default=0)


@event.listens_for(Image, 'after_delete')
def receive_after_delete(mapper, connection, target):
    if target.image_id:
        CloudinaryService.delete_image(target.image_id)


class UserLike(Base):
    __tablename__ = "user_likes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="likes")
    car: Mapped["Car"] = relationship("Car")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id"))
    car_owner_id: Mapped[int] = mapped_column(ForeignKey("client_cars.user_id"))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

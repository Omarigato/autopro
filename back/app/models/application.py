from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("dictionaries.id"))
    category_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    vehicle_mark_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    vehicle_model_id: Mapped[int | None] = mapped_column(ForeignKey("dictionaries.id"), nullable=True)
    requested_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", index=True)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    create_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship("User")
    city: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[city_id])
    category: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[category_id])
    mark: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[vehicle_mark_id])
    model: Mapped["Dictionary | None"] = relationship("Dictionary", foreign_keys=[vehicle_model_id])
    application_images: Mapped[list["Image"]] = relationship(
        "Image",
        primaryjoin="and_(Image.entity_id==Application.id, Image.entity_type=='APPLICATION')",
        foreign_keys="[Image.entity_id]",
        overlaps="images,car_images,avatar_image,application_images",
        cascade="all, delete-orphan",
    )
    application_cars: Mapped[list["ApplicationCar"]] = relationship(
        "ApplicationCar", back_populates="application", cascade="all, delete-orphan"
    )


class ApplicationCar(Base):
    __tablename__ = "application_cars"
    __table_args__ = (UniqueConstraint("application_id", "car_id", name="uq_application_car"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id"), index=True)
    owner_read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    application: Mapped["Application"] = relationship("Application", back_populates="application_cars")
    car: Mapped["Car"] = relationship("Car")


class ApplicationSelectedCar(Base):
    __tablename__ = "application_selected_cars"
    __table_args__ = (UniqueConstraint("application_id", "car_id", name="uq_application_selected_car"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id"), index=True)

    application: Mapped["Application"] = relationship("Application")
    car: Mapped["Car"] = relationship("Car")

from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_owner
from app.db.session import get_db
from app.models.entities import Application, Car, CarImage, User
from app.schemas.cars import CarResponse
from app.services.cloudinary_service import upload_image, delete_image
from app.services.subscriptions_service import (
    get_active_subscription_for_owner,
    owner_cars_count,
)
from app.core.responses import create_response
from fastapi import Request
from app.services.telegram import send_new_application_message

router = APIRouter()


@router.get("")
def list_cars(request: Request, db: Session = Depends(get_db)):
    cars = db.query(Car).filter(Car.is_active.is_(True), Car.delete_date.is_(None)).all()
    # Increment views for each car (usually done on single car view, but doing here for demo)
    for car in cars:
        car.views_count += 1
    db.commit()
    
    # We should return a list of serialized cars
    # For now returning as is, but create_response will handle JSON serialisation if possible
    return create_response(data=[{"id": c.id, "name": c.name, "views": c.views_count} for c in cars], lang=request.state.lang)


@router.post("")
def create_car(
    name: str = Form(...),
    marka_id: int | None = Form(default=None),
    model_id: int | None = Form(default=None),
    bin: str | None = Form(default=None),
    release_year: int | None = Form(default=None),
    is_top: bool = Form(default=False),
    description: str | None = Form(default=None),
    photos: list[UploadFile] = File(default=[]),
    request: Request = None,
    db: Session = Depends(get_db),
    current_owner: User = Depends(get_current_owner),
):
    """
    Создание объявления арендодателем.
    По умолчанию объявление не активно (ждёт модерации администратора).
    Фотографии загружаются в Cloudinary.
    Доступность и лимит объявлений определяется активной подпиской (Lite / Premium).
    """
    subscription = get_active_subscription_for_owner(db, current_owner.id)
    if not subscription:
        return create_response(
            code=403,
            message_key="no_subscription",
            lang=request.state.lang
        )

    plan = subscription.plan
    if plan.max_cars is not None:
        current_cars = owner_cars_count(db, current_owner.id)
        if current_cars >= plan.max_cars:
            return create_response(
                code=403,
                message_key="car_limit_reached",
                lang=request.state.lang
            )

    car = Car(
        name=name,
        marka_id=marka_id,
        model_id=model_id,
        bin=bin,
        release_year=release_year,
        is_top=is_top,
        author_id=current_owner.id,
        is_active=False,
    )
    db.add(car)
    db.flush()

    # Save photos to Cloudinary
    if photos:
        for idx, photo in enumerate(photos):
            url, public_id = upload_image(photo.file, folder="autopro/cars")
            if url:
                car_image = CarImage(
                    car_id=car.id,
                    url=url,
                    image_id=public_id,
                    position=idx
                )
                db.add(car_image)

    application = Application(
        car_id=car.id,
        car_owner_id=current_owner.id,
        description=description,
    )
    db.add(application)
    db.commit()
    db.refresh(car)

    # Send Telegram notification
    from asyncio import create_task

    message = (
        f"New Announcement #{car.id}\n"
        f"Owner: {current_owner.name} ({current_owner.phone_number})\n"
        f"Name: {car.name}\n"
        f"Description: {description or '-'}\n"
        f"Link: /admin/cars/{car.id}"
    )
    # create_task(send_new_application_message(message)) # Commented out as function import might change or need context

    return create_response(
        data={"id": car.id, "name": car.name},
        message_key="client_application_sent",
        lang=request.state.lang
    )


@router.delete("/{car_id}")
def delete_car(
    car_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_owner: User = Depends(get_current_owner),
):
    """
    Удаление объявления. Удаляет фото из Cloudinary.
    """
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Check ownership or admin
    if car.author_id != current_owner.id and current_owner.role != "admin":
         raise HTTPException(status_code=403, detail="Not authorized to delete this car")

    # Delete images from Cloudinary
    for image in car.images:
        if image.image_id:
            delete_image(image.image_id)
    
    db.delete(car)
    db.commit()
    
    return create_response(
        message_key="car_deleted",
        lang=request.state.lang
    )


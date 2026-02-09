from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_owner
from app.db.session import get_db
from app.models.entities import Application, Car, CarPhoto, User
from app.schemas.cars import CarResponse
from app.services.cloudinary_service import upload_car_image
from app.services.subscriptions_service import (
    get_active_subscription_for_owner,
    owner_cars_count,
)
from app.services.telegram import send_new_application_message

router = APIRouter()


@router.get("", response_model=List[CarResponse])
def list_cars(db: Session = Depends(get_db)) -> List[CarResponse]:
    cars = db.query(Car).filter(Car.is_active.is_(True), Car.delete_date.is_(None)).all()
    return cars


@router.post("", response_model=CarResponse)
async def create_car(
    name: str = Form(...),
    marka_id: int | None = Form(default=None),
    model_id: int | None = Form(default=None),
    bin: str | None = Form(default=None),
    release_year: int | None = Form(default=None),
    is_top: bool = Form(default=False),
    description: str | None = Form(default=None),
    photos: list[UploadFile] | None = File(default=None),
    db: Session = Depends(get_db),
    current_owner: User = Depends(get_current_owner),
) -> CarResponse:
    """
    Создание объявления арендодателем.
    По умолчанию объявление не активно (ждёт модерации администратора).
    Фотографии загружаются в Cloudinary.
    Доступность и лимит объявлений определяется активной подпиской (Lite / Premium).
    """
    subscription = get_active_subscription_for_owner(db, current_owner.id)
    if not subscription:
        raise HTTPException(
            status_code=403,
            detail="Нет активной подписки. Оформите подписку, чтобы добавить объявление.",
        )

    plan = subscription.plan
    if plan.max_cars is not None:
        current_cars = owner_cars_count(db, current_owner.id)
        if current_cars >= plan.max_cars:
            raise HTTPException(
                status_code=403,
                detail="Достигнут лимит автомобилей для вашей подписки.",
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

    # Сохраняем фото в Cloudinary
    if photos:
        for idx, photo in enumerate(photos):
            image_url = await upload_car_image(photo, car.id, idx)
            car_photo = CarPhoto(car_id=car.id, url=image_url, position=idx)
            db.add(car_photo)

    application = Application(
        car_id=car.id,
        car_owner_id=current_owner.id,
        description=description,
    )
    db.add(application)
    db.commit()
    db.refresh(car)

    # Отправляем заявку в Telegram (асинхронно, без ожидания)
    from asyncio import create_task

    message = (
        f"Новое объявление #{car.id}\n"
        f"Владелец: {current_owner.name} ({current_owner.phone_number})\n"
        f"Название: {car.name}\n"
        f"Описание: {description or '-'}\n"
        f"Ссылка на карточку: /admin/cars/{car.id}"
    )
    create_task(send_new_application_message(message))

    return car


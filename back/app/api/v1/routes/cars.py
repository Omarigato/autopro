from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_owner
from app.db.session import get_db
from app.models.entities import Application, Car, Image, User
from app.schemas.cars import CarResponse
from app.services.cloudinary_service import CloudinaryService
from app.services.subscriptions_service import (
    get_active_subscription_for_owner,
    owner_cars_count,
)
from app.core.responses import create_response
from app.services.telegram import send_new_application_message

router = APIRouter()


@router.get("")
def list_cars(request: Request, db: Session = Depends(get_db)):
    cars = db.query(Car).filter(Car.is_active.is_(True), Car.delete_date.is_(None)).all()
    
    result = []
    for c in cars:
        result.append({
            "id": c.id,
            "name": c.name,
            "release_year": c.release_year,
            "price_per_day": c.price_per_day,
            "views_count": c.views_count,
            "images": [{"url": img.url} for img in c.images],
            "city": c.city.name if c.city else "Алматы",
            "author": {
                "name": c.author.name,
                "address": c.author.address
            }
        })
    
    return create_response(data=result, lang=request.state.lang)


@router.post("")
def create_car(
    name: str = Form(...),
    vehicle_mark_id: int | None = Form(default=None),
    vehicle_model_id: int | None = Form(default=None),
    category_id: int | None = Form(default=None),
    transmission_id: int | None = Form(default=None),
    fuel_type_id: int | None = Form(default=None),
    color_id: int | None = Form(default=None),
    city_id: int | None = Form(default=None),
    engine_volume: str | None = Form(default=None),
    price_per_day: int | None = Form(default=None),
    bin: str | None = Form(default=None),
    release_year: int | None = Form(default=None),
    transport_number: str | None = Form(default=None),
    # New fields
    mileage: int | None = Form(default=None),
    body_type: str | None = Form(default=None),
    steering: str | None = Form(default=None),  # LEFT/RIGHT
    condition: str | None = Form(default=None),  # EXCELLENT/GOOD/FAIR
    customs_cleared: bool | None = Form(default=None),
    additional_info: str | None = Form(default=None),
    is_top: bool = Form(default=False),
    description: str | None = Form(default=None),
    images: list[UploadFile] = File(default=[]),
   request: Request = None,
    db: Session = Depends(get_db),
    current_owner: User = Depends(get_current_owner),
):
    """
    Создание объявления арендодателем.
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
        description=description,
        additional_info=additional_info,
        vehicle_mark_id=vehicle_mark_id,
        vehicle_model_id=vehicle_model_id,
        category_id=category_id,
        transmission_id=transmission_id,
        fuel_type_id=fuel_type_id,
        color_id=color_id,
        city_id=city_id,
        engine_volume=engine_volume,
        price_per_day=price_per_day,
        bin=bin,
        release_year=release_year,
        transport_number=transport_number,
        mileage=mileage,
        body_type=body_type,
        steering=steering,
        condition=condition,
        customs_cleared=customs_cleared,
        is_top=is_top,
        author_id=current_owner.id,
        is_active=False,
    )
    db.add(car)
    db.flush()

    # Save photos to Cloudinary
    if images:
        for idx, photo in enumerate(images):
            url, public_id = CloudinaryService.upload_image(photo.file, folder="autopro/cars")
            if url:
                img_record = Image(
                    entity_id=car.id,
                    entity_type='CAR',
                    url=url,
                    image_id=public_id,
                    position=idx
                )
                db.add(img_record)

    application = Application(
        car_id=car.id,
        car_owner_id=current_owner.id,
        description=description,
    )
    db.add(application)
    db.commit()
    db.refresh(car)

    return create_response(
        data={"id": car.id, "name": car.name},
        message_key="client_application_sent",
        lang=request.state.lang
    )


@router.get("/my")
def get_my_cars(
    request: Request,
    db: Session = Depends(get_db),
    current_owner: User = Depends(get_current_owner),
):
    """
    Получить объявления текущего пользователя.
    """
    cars = db.query(Car).filter(
        Car.author_id == current_owner.id,
        Car.delete_date.is_(None)
    ).all()
    
    result = []
    for c in cars:
        result.append({
            "id": c.id,
            "name": c.name,
            "release_year": c.release_year,
            "price_per_day": c.price_per_day,
            "is_active": c.is_active,
            "views_count": c.views_count,
            "create_date": c.create_date.isoformat(),
            "images": [{"url": img.url} for img in c.images],
        })
    
    return create_response(data=result, lang=request.state.lang)


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
            CloudinaryService.delete_image(image.image_id)
    
    db.delete(car)
    db.commit()
    
    return create_response(
        message_key="car_deleted",
        lang=request.state.lang
    )

from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_owner, get_current_user_optional
from app.db.session import get_db
from app.models.entities import Car, Image, User, AppSetting, Dictionary, City
from app.schemas.cars import CarResponse
from sqlalchemy import or_, String, cast
from app.services.cloudinary_service import CloudinaryService
from app.services.subscriptions_service import (
    get_active_subscription_for_owner,
    owner_cars_count,
)
from app.services.telegram import send_new_application_message
from app.core.responses import create_response
from app.core.config import settings

router = APIRouter()


@router.get("")
def list_cars(
    request: Request,
    skip: int = 0,
    limit: int = 15,
    q: str = None,
    marka_id: int = None,
    model_id: int = None,
    release_year: int = None,
    category_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    # Показываем только опубликованные объявления
    query = db.query(Car).filter(
        Car.status == "PUBLISHED",
        Car.delete_date.is_(None),
    )
    if current_user and getattr(current_user, "city_id", None) is not None:
        query = query.filter(Car.city_id == current_user.city_id)
        
    if marka_id:
        query = query.filter(Car.marka_id == marka_id)
        
    if model_id:
        query = query.filter(Car.model_id == model_id)
        
    if release_year:
        query = query.filter(Car.release_year == release_year)
        
    if category_id:
        query = query.filter(Car.category_id == category_id)
        
    if q:
        search_term = f"%{q.lower()}%"
        query = query.outerjoin(Dictionary, Car.marka_id == Dictionary.id).outerjoin(City, Car.city_id == City.id)
        query = query.filter(
            or_(
                Car.name.ilike(search_term),
                Car.description.ilike(search_term),
                Dictionary.name.ilike(search_term),
                City.name.ilike(search_term),
                cast(Car.release_year, String).ilike(search_term),
            )
        )
        
    total = query.count()
    cars = query.offset(skip).limit(limit).all()

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
                "name": c.author.name if c.author else "Без имени",
                "address": c.author.address if c.author else None
            }
        })

    return create_response(data={"items": result, "total": total}, lang=request.state.lang)


@router.post("")
async def create_car(
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
    release_year: int | None = Form(default=None),
    # New fields
    mileage: int | None = Form(default=None),
    body_type: str | None = Form(default=None),
    steering_id: int | None = Form(default=None),  # id из справочника STEERING (LEFT/RIGHT)
    condition_id: int | None = Form(default=None),  # id из справочника CONDITION
    car_class_id: int | None = Form(default=None),  # id из справочника CAR_CLASS (Бизнес, Эконом и т.д.)
    additional_info: str | None = Form(default=None),
    is_top: bool = Form(default=False),
    description: str | None = Form(default=None),
    images: list[UploadFile] = File(default=[]),
    save_as_draft: bool = Form(default=False),  # True = в черновики (DRAFT), False = на модерацию (CREATED)
    request: Request = None,
    db: Session = Depends(get_db),
    current_owner: User = Depends(get_current_owner),
):
    """
    Создание объявления арендодателем.
    Если подписки выключены в настройках — разрешаем всем.
    Если включены — первое объявление бесплатно, далее для публикации нужна активная подписка.
    Черновики (DRAFT) можно сохранять всегда, даже без подписки.
    """
    setting = db.query(AppSetting).filter(AppSetting.key == "subscriptions_enabled").first()
    subscriptions_enabled = (setting and setting.value and setting.value.lower() == "true")

    status = "DRAFT" if save_as_draft else "CREATED"

    current_cars = owner_cars_count(db, current_owner.id)

    if subscriptions_enabled and status != "DRAFT":
        # Первое объявление бесплатно (не требуем подписку)
        if current_cars >= 1:
            subscription = get_active_subscription_for_owner(db, current_owner.id)
            if not subscription:
                return create_response(
                    code=403,
                    message_key="no_subscription",
                    lang=request.state.lang
                )
            plan = subscription.plan
            if plan.max_cars is not None and current_cars >= plan.max_cars:
                return create_response(
                    code=403,
                    message_key="car_limit_reached",
                    lang=request.state.lang
                )
    # Если подписки выключены или это черновик — лимиты не проверяем

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
        release_year=release_year,
        mileage=mileage,
        body_type=body_type,
        steering_id=steering_id,
        condition_id=condition_id,
        car_class_id=car_class_id,
        is_top=is_top,
        author_id=current_owner.id,
        status=status,
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

    db.commit()
    db.refresh(car)

    # Уведомление в Telegram о новом объявлении (для админов)
    if not save_as_draft:
        # Формируем красивое сообщение
        created_at = car.create_date or datetime.utcnow()
        dt_str = created_at.strftime("%d.%m.%Y %H:%M:%S")

        # Марка / модель / цвет из справочников
        def dict_name(d):
            return d.name if d else ""

        mark_name = dict_name(car.mark)
        model_name = dict_name(car.model)
        color_name = dict_name(car.color)

        frontend_base = (settings.FRONTEND_BASE_URL or "http://localhost:3000").rstrip("/")
        admin_url = f"{frontend_base}/dashboard/cars/{car.id}"

        text_lines = [
            f"🆕 <b>Новое объявление #{car.id}</b>",
            "",
            f"Дата: <b>{dt_str}</b>",
            f"Автор: <b>{current_owner.name or ''}</b> {current_owner.phone_number or ''}",
            "",
            "<b>Объявление</b>",
            f"Заголовок: <b>{car.name}</b>",
            f"Цена: <b>{car.price_per_day or 0} ₸/день</b>",
            f"Машина: <b>{mark_name} {model_name}</b>{', ' + color_name if color_name else ''}",
            "",
            f"Админ‑панель: {admin_url}",
        ]
        text = "\n".join(text_lines)

        await send_new_application_message(text)

    message_key = "car_saved_draft" if save_as_draft else "client_application_sent"
    return create_response(
        data={"id": car.id, "name": car.name, "status": car.status},
        message_key=message_key,
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
        Car.delete_date.is_(None),
        Car.status != "DELETED",
    ).all()

    result = []
    for c in cars:
        result.append({
            "id": c.id,
            "name": c.name,
            "release_year": c.release_year,
            "price_per_day": c.price_per_day,
            "status": c.status,
            "views_count": c.views_count,
            "create_date": c.create_date.isoformat(),
            "update_date": c.update_date.isoformat() if c.update_date else None,
            "images": [{"url": img.url} for img in c.images],
        })

    return create_response(data=result, lang=request.state.lang)


@router.get("/{car_id}")
def get_car(
    car_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Публичное получение объявления по id. Только со статусом PUBLISHED."""
    car = db.query(Car).filter(
        Car.id == car_id,
        Car.status.in_(["PUBLISHED", "DRAFT"]),
        Car.delete_date.is_(None),
    ).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    def dict_name(d):
        if not d:
            return None
        return d.name

    return create_response(data={
        "id": car.id,
        "name": car.name,
        "description": car.description,
        "additional_info": car.additional_info,
        "price_per_day": car.price_per_day,
        "release_year": car.release_year,
        "mileage": car.mileage,
        "body_type": car.body_type,
        "engine_volume": car.engine_volume,
        "city": dict_name(car.city),
        "city_id": car.city_id,
        "steering": dict_name(car.steering),
        "steering_id": car.steering_id,
        "condition": dict_name(car.condition),
        "condition_id": car.condition_id,
        "car_class": dict_name(car.car_class),
        "car_class_id": car.car_class_id,
        "transmission": dict_name(car.transmission),
        "transmission_id": car.transmission_id,
        "fuel_type": dict_name(car.fuel_type),
        "fuel_type_id": car.fuel_type_id,
        "color": dict_name(car.color),
        "color_id": car.color_id,
        "mark": dict_name(car.mark),
        "model": dict_name(car.model),
        "category": dict_name(car.category),
        "views_count": car.views_count,
        "author": {
            "name": car.author.name if car.author else None, 
            "address": car.author.address if car.author else None,
            "phone_number": car.author.phone_number if car.author else None,
        },
        "images": [{"url": img.url, "id": img.id} for img in car.images],
        "create_date": car.create_date.isoformat() if car.create_date else None,
        "update_date": car.update_date.isoformat() if car.update_date else None,
    }, lang=request.state.lang)


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

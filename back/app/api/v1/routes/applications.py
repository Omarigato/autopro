from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Request, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.responses import create_response
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.entities import (
    Application,
    ApplicationCar,
    ApplicationSelectedCar,
    Car,
    Dictionary,
    Image,
    User,
)
from app.services.cloudinary_service import CloudinaryService
from app.services.subscriptions_service import get_active_subscription_for_owner
from app.services.email_service import email_service
from app.services.whatsapp_service import whatsapp_service
from app.schemas.applications import ApplicationUpdateStatus

router = APIRouter()


def _dict_name(d: Optional[Dictionary], lang: str = "ru") -> Optional[str]:
    if not d:
        return None
    trans = next((t for t in d.translations if t.lang == lang), None)
    return trans.name if trans else d.name


def _application_payload(app: Application, lang: str, include_cars: bool = False, cars_list=None):
    cars_list = cars_list or []
    payload = {
        "id": app.id,
        "user_id": app.user_id,
        "city_id": app.city_id,
        "category_id": app.category_id,
        "vehicle_mark_id": app.vehicle_mark_id,
        "vehicle_model_id": app.vehicle_model_id,
        "requested_at": app.requested_at.isoformat() if app.requested_at else None,
        "message": app.message,
        "status": app.status,
        "views_count": app.views_count,
        "create_date": app.create_date.isoformat() if app.create_date else None,
        "update_date": app.update_date.isoformat() if app.update_date else None,
        "completed_at": app.completed_at.isoformat() if app.completed_at else None,
        "city_name": _dict_name(app.city, lang),
        "category_name": _dict_name(app.category, lang),
        "mark_name": _dict_name(app.mark, lang),
        "model_name": _dict_name(app.model, lang),
        "images": [{"url": img.url, "id": img.id} for img in app.images],
        "matching_cars_count": len(cars_list),
        "matching_cars": include_cars and [
            {
                "id": c.id,
                "name": c.name,
                "author_id": c.author_id,
                "price_per_day": c.price_per_day,
                "release_year": c.release_year,
                "images": [{"url": img.url} for img in c.images[:1]],
            }
            for c in cars_list
        ] or [],
    }
    return payload


def _applicant_contact(user: User, has_subscription: bool) -> Optional[dict]:
    if not has_subscription:
        return None
    return {
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
    }


@router.post("")
async def create_application(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    city_id: int = Form(...),
    category_id: Optional[int] = Form(None),
    vehicle_mark_id: Optional[int] = Form(None),
    vehicle_model_id: Optional[int] = Form(None),
    requested_at: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
):
    if message and len(message) > 1000:
        return create_response(code=400, message="Сообщение не более 1000 символов", lang=request.state.lang)
    req_dt = None
    if requested_at:
        try:
            req_dt = datetime.fromisoformat(requested_at.replace("Z", "+00:00"))
        except ValueError:
            pass

    app = Application(
        user_id=current_user.id,
        city_id=city_id,
        category_id=category_id,
        vehicle_mark_id=vehicle_mark_id,
        vehicle_model_id=vehicle_model_id,
        requested_at=req_dt,
        message=message,
        status="ACTIVE",
    )
    db.add(app)
    db.flush()

    for idx, img_file in enumerate(images):
        if img_file and img_file.filename:
            url, public_id = CloudinaryService.upload_image(img_file.file, folder="autopro/applications")
            if url:
                db.add(Image(
                    entity_id=app.id,
                    entity_type="APPLICATION",
                    url=url,
                    image_id=public_id,
                    position=idx,
                ))

    # Matching cars: ACTIVE, same city, category; mark/model optional
    q = db.query(Car).filter(
        Car.status == "ACTIVE",
        Car.delete_date.is_(None),
        Car.city_id == app.city_id,
    )
    if app.category_id is not None:
        q = q.filter(Car.category_id == app.category_id)
    if app.vehicle_mark_id is not None:
        q = q.filter(Car.vehicle_mark_id == app.vehicle_mark_id)
    if app.vehicle_model_id is not None:
        q = q.filter(Car.vehicle_model_id == app.vehicle_model_id)

    matching_cars = q.all()
    for car in matching_cars:
        db.add(ApplicationCar(application_id=app.id, car_id=car.id))

    db.commit()
    db.refresh(app)

    # Notifications
    owner_dict = {}
    for car in matching_cars:
        owner = db.query(User).filter(User.id == car.author_id).first()
        if owner and owner.id not in owner_dict:
            owner_dict[owner.id] = owner
    
    for owner in owner_dict.values():
        text_whatsapp = (
            f"🔔 *Уведомление AutoPro*\n\n"
            f"Поступила новая заявка на авто, которая может вас заинтересовать!\n\n"
            f"👉 Зайдите в приложение (вкладка 'Заявки'), чтобы посмотреть подробности и предложить свой автомобиль."
        )
        text_email = (
            f"Здравствуйте!\n\n"
            f"В приложении AutoPro появилась новая заявка на поиск автомобиля, которая совпадает с вашими настройками или объявлениями.\n\n"
            f"Зайдите в приложение (вкладка 'Заявки'), чтобы предложить свой автомобиль!\n\n"
            f"С уважением,\nКоманда AutoPro"
        )
        subject_email = "🔔 Новая заявка на поиск авто (AutoPro)"
        
        if getattr(owner, 'notify_by_email', True) and owner.email:
            background_tasks.add_task(email_service.send_notification, email=owner.email, subject=subject_email, text=text_email)
        if getattr(owner, 'notify_by_whatsapp', True) and owner.phone_number:
            background_tasks.add_task(whatsapp_service.send_notification, phone_number=owner.phone_number, text=text_whatsapp)

    lang = getattr(request.state, "lang", "ru")
    payload = _application_payload(app, lang, include_cars=True, cars_list=matching_cars)
    return create_response(data=payload, message="Заявка создана", lang=lang)


@router.get("")
def list_my_applications(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None,
):
    q = db.query(Application).filter(Application.user_id == current_user.id)
    if status:
        q = q.filter(Application.status == status)
    q = q.order_by(Application.create_date.desc())
    apps = q.all()

    lang = getattr(request.state, "lang", "ru")
    result = []
    for app in apps:
        ac_list = db.query(ApplicationCar).filter(ApplicationCar.application_id == app.id).all()
        cars = [ac.car for ac in ac_list if ac.car]
        
        view_history = []
        for ac in ac_list:
            if ac.owner_read_at and ac.car and ac.car.author:
                view_history.append({
                    "date": ac.owner_read_at.isoformat(),
                    "name": ac.car.author.name,
                    "phone": ac.car.author.phone_number
                })
                
        payload = _application_payload(app, lang, include_cars=True, cars_list=cars)
        payload["viewers"] = view_history
        result.append(payload)
    return create_response(data=result, lang=lang)


@router.get("/to-my-ads/count")
def count_to_my_ads(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    my_car_ids = [r[0] for r in db.query(Car.id).filter(Car.author_id == current_user.id).all()]
    if not my_car_ids:
        return create_response(data={"count": 0}, lang=getattr(request.state, "lang", "ru"))

    city_id = getattr(current_user, "city_id", None)
    subq = (
        db.query(ApplicationCar.application_id)
        .filter(ApplicationCar.car_id.in_(my_car_ids), ApplicationCar.owner_read_at.is_(None))
        .distinct()
    )
    q = db.query(Application).filter(Application.id.in_(subq))
    if city_id is not None:
        q = q.filter(Application.city_id == city_id)
    count = q.count()
    return create_response(data={"count": count}, lang=getattr(request.state, "lang", "ru"))


@router.post("/to-my-ads/mark-read")
def mark_to_my_ads_read(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    my_car_ids = [r[0] for r in db.query(Car.id).filter(Car.author_id == current_user.id).all()]
    if not my_car_ids:
        return create_response(message="OK", lang=getattr(request.state, "lang", "ru"))

    now = datetime.utcnow()
    db.query(ApplicationCar).filter(
        ApplicationCar.car_id.in_(my_car_ids),
        ApplicationCar.owner_read_at.is_(None),
    ).update({ApplicationCar.owner_read_at: now}, synchronize_session=False)
    db.commit()
    return create_response(message="OK", lang=getattr(request.state, "lang", "ru"))


@router.get("/to-my-ads")
def list_to_my_ads(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    my_car_ids = [r[0] for r in db.query(Car.id).filter(Car.author_id == current_user.id).all()]
    if not my_car_ids:
        return create_response(data=[], lang=getattr(request.state, "lang", "ru"))

    app_ids = [r[0] for r in db.query(ApplicationCar.application_id).filter(
        ApplicationCar.car_id.in_(my_car_ids)
    ).distinct().all()]
    if not app_ids:
        return create_response(data=[], lang=getattr(request.state, "lang", "ru"))

    city_id = getattr(current_user, "city_id", None)
    q = db.query(Application).filter(Application.id.in_(app_ids)).order_by(Application.create_date.desc())
    if city_id is not None:
        q = q.filter(Application.city_id == city_id)
    apps = q.all()

    has_subscription = get_active_subscription_for_owner(db, current_user.id) is not None
    lang = getattr(request.state, "lang", "ru")
    result = []
    for app in apps:
        ac_list = db.query(ApplicationCar).filter(ApplicationCar.application_id == app.id, ApplicationCar.car_id.in_(my_car_ids)).all()
        cars = [ac.car for ac in ac_list if ac.car]
        payload = _application_payload(app, lang, include_cars=True, cars_list=cars)
        payload["applicant_contact"] = _applicant_contact(app.user, has_subscription)
        result.append(payload)
    return create_response(data=result, lang=lang)


@router.get("/other")
def list_other_applications(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    my_car_ids = [r[0] for r in db.query(Car.id).filter(Car.author_id == current_user.id).all()]
    city_id = getattr(current_user, "city_id", None)

    q = db.query(Application).filter(Application.status == "ACTIVE")
    if city_id is not None:
        q = q.filter(Application.city_id == city_id)

    if my_car_ids:
        subq = db.query(ApplicationCar.application_id).filter(ApplicationCar.car_id.in_(my_car_ids)).distinct()
        q = q.filter(~Application.id.in_(subq))

    apps = q.order_by(Application.create_date.desc()).limit(100).all()
    has_subscription = get_active_subscription_for_owner(db, current_user.id) is not None
    lang = getattr(request.state, "lang", "ru")
    result = []
    for app in apps:
        payload = _application_payload(app, lang)
        payload["applicant_contact"] = _applicant_contact(app.user, has_subscription)
        result.append(payload)
    return create_response(data=result, lang=lang)


@router.get("/{application_id}")
def get_application(
    application_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    is_author = app.user_id == current_user.id
    my_car_ids = [r[0] for r in db.query(Car.id).filter(Car.author_id == current_user.id).all()]
    acs = db.query(ApplicationCar).filter(
        ApplicationCar.application_id == app.id,
        ApplicationCar.car_id.in_(my_car_ids),
    ).all() if my_car_ids else []

    is_owner = len(acs) > 0
    if not is_author and not is_owner:
        raise HTTPException(status_code=403, detail="Not authorized")

    if is_owner:
        app.views_count = (app.views_count or 0) + 1
        now = datetime.utcnow()
        for ac in acs:
            if ac.owner_read_at is None:
                ac.owner_read_at = now
        db.commit()
        db.refresh(app)

    ac_list = db.query(ApplicationCar).filter(ApplicationCar.application_id == app.id).all()
    cars = [ac.car for ac in ac_list if ac.car]

    selected_car_ids = []
    if app.status == "COMPLETED":
        sel = db.query(ApplicationSelectedCar).filter(ApplicationSelectedCar.application_id == app.id).all()
        selected_car_ids = [s.car_id for s in sel]

    lang = getattr(request.state, "lang", "ru")
    payload = _application_payload(app, lang, include_cars=True, cars_list=cars)
    payload["selected_car_ids"] = selected_car_ids
    return create_response(data=payload, lang=lang)


@router.patch("/{application_id}")
def update_application_status(
    application_id: int,
    payload: ApplicationUpdateStatus,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    status = payload.status
    selected_car_ids = payload.selected_car_ids or []

    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.status != "ACTIVE":
        return create_response(
            code=400,
            message="Заявка уже завершена или отклонена",
            lang=getattr(request.state, "lang", "ru"),
        )

    is_author = app.user_id == current_user.id
    my_car_ids = [r[0] for r in db.query(Car.id).filter(Car.author_id == current_user.id).all()]
    ac_list = db.query(ApplicationCar).filter(ApplicationCar.application_id == app.id).all()
    allowed_car_ids = [ac.car_id for ac in ac_list]
    is_owner = any(cid in my_car_ids for cid in allowed_car_ids)

    if status == "REJECTED":
        if not is_author and not is_owner:
            raise HTTPException(status_code=403, detail="Not authorized")
        app.status = "REJECTED"
        app.update_date = datetime.utcnow()
        db.commit()
        return create_response(message="Заявка отклонена", lang=getattr(request.state, "lang", "ru"))

    if status == "COMPLETED":
        if not is_author:
            return create_response(
                code=403,
                message="Завершить заявку может только автор",
                lang=getattr(request.state, "lang", "ru"),
            )
        if allowed_car_ids:
            if not selected_car_ids or not all(cid in allowed_car_ids for cid in selected_car_ids):
                return create_response(
                    code=400,
                    message="Выберите хотя бы одно объявление из списка совпадений",
                    lang=getattr(request.state, "lang", "ru"),
                )
        else:
            if selected_car_ids:
                return create_response(
                    code=400,
                    message="Недопустимые объявления",
                    lang=getattr(request.state, "lang", "ru"),
                )
        for cid in selected_car_ids:
            if not db.query(ApplicationSelectedCar).filter(
                ApplicationSelectedCar.application_id == app.id,
                ApplicationSelectedCar.car_id == cid,
            ).first():
                db.add(ApplicationSelectedCar(application_id=app.id, car_id=cid))
        app.status = "COMPLETED"
        app.completed_at = datetime.utcnow()
        app.update_date = datetime.utcnow()
        db.commit()
        return create_response(message="Заявка завершена", lang=getattr(request.state, "lang", "ru"))

    return create_response(code=400, message="Недопустимый статус", lang=getattr(request.state, "lang", "ru"))

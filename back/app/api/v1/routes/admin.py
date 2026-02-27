from datetime import datetime
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import (
    User,
    Car,
    Application,
    ApplicationCar,
    Dictionary,
    DictionaryTranslation,
    CarOwner,
    PaymentAccount,
    PaymentTransaction,
    SubscriptionPlan,
    AppSetting,
    OTPVerification,
)
from app.core.security import get_current_user, get_password_hash
from app.core.responses import create_response
from app.services.dictionary_service import dictionary_service
from app.services.admin_service import admin_service
from fastapi.responses import StreamingResponse
from fastapi import UploadFile, File

router = APIRouter()

def check_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admins only."
        )
    return current_user

# --- Глобальные настройки (подписки вкл/выкл) ---

@router.get("/settings")
def get_admin_settings(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    items = db.query(AppSetting).all()
    data = {item.key: item.value for item in items}
    if "subscriptions_enabled" not in data:
        data["subscriptions_enabled"] = "true"
    return create_response(data=data)

@router.patch("/settings")
def update_admin_settings(payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    for key, value in payload.items():
        row = db.query(AppSetting).filter(AppSetting.key == key).first()
        if row:
            row.value = str(value).lower() if isinstance(value, bool) else str(value)
        else:
            db.add(AppSetting(key=key, value=str(value).lower() if isinstance(value, bool) else str(value)))
    db.commit()
    items = db.query(AppSetting).all()
    return create_response(data={item.key: item.value for item in items})


@router.post("/sync/defaults")
async def trigger_sync_defaults(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    success = await dictionary_service.sync_defaults(db)
    return create_response(data={"success": success})


@router.post("/sync/car-data")
async def trigger_sync(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    success = await dictionary_service.sync_from_json(db)
    return create_response(data={"success": success})


# --- Управление справочниками (Dictionaries) ---

@router.get("/dictionaries")
def list_dictionaries(
    type: str | None = None,
    parent_id: int | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin),
):
    """
    Список элементов словаря для админ‑панели.
    Отдаём только примитивные поля, чтобы избежать проблем сериализации ORM‑объектов.
    """
    query = db.query(Dictionary)
    if type:
        query = query.filter(Dictionary.type == type)
    if parent_id:
        query = query.filter(Dictionary.parent_id == parent_id)
    items = query.all()
    data = [
        {
            "id": d.id,
            "name": d.name,
            "code": d.code,
            "type": d.type,
            "parent_id": d.parent_id,
            "display_order": d.display_order,
            "is_active": d.is_active,
        }
        for d in items
    ]
    return create_response(data=data)

@router.post("/dictionaries")
def create_dictionary_item(payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    """
    Создание новой записи в справочнике.
    """
    new_item = Dictionary(
        name=payload.get("name"),
        code=payload.get("code"),
        type=payload.get("type"),
        parent_id=payload.get("parent_id"),
        is_active=True
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return create_response(data={
        "id": new_item.id,
        "name": new_item.name,
        "code": new_item.code,
        "type": new_item.type
    })

@router.patch("/dictionaries/{item_id}")
def update_dictionary_item(item_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    item = db.query(Dictionary).filter(Dictionary.id == item_id).first()
    if not item: raise HTTPException(404)
    
    for key, value in payload.items():
        if hasattr(item, key):
            setattr(item, key, value)
    
    db.commit()
    return create_response(data=item)

@router.delete("/dictionaries/{item_id}")
def delete_dictionary_item(item_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    item = db.query(Dictionary).filter(Dictionary.id == item_id).first()
    if not item: raise HTTPException(404)
    
    # Удаляем также переводы
    db.query(DictionaryTranslation).filter(DictionaryTranslation.dictionary_id == item_id).delete()
    db.delete(item)
    db.commit()
    return create_response(data={"success": True})

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    most_viewed = db.query(Car).order_by(Car.views_count.desc()).limit(10).all()
    total_users = db.query(User).count()
    total_cars = db.query(Car).count()

    return create_response(data={
        "totals": {"users": total_users, "cars": total_cars},
        "most_viewed": [{"id": c.id, "name": c.name, "views": c.views_count} for c in most_viewed],
    })

@router.get("/users")
def list_users(role: str = None, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()
    return create_response(
        data=[
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone_number": u.phone_number,
                "role": u.role,
                "is_active": u.is_active,
            }
            for u in users
        ]
    )


@router.patch("/users/{user_id}")
def update_user(user_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404)
    for key in ("name", "email", "phone_number", "role", "is_active"):
        if key in payload:
            if key == "is_active":
                user.is_active = bool(payload[key])
            else:
                setattr(user, key, payload[key])
    db.commit()
    db.refresh(user)
    return create_response(data={"id": user.id, "is_active": user.is_active})

@router.get("/cars")
def list_cars_admin(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    cars = db.query(Car).filter(Car.delete_date.is_(None)).all()
    return create_response(data=[{
        "id": c.id, "name": c.name, "status": c.status, "views": c.views_count,
        "create_date": c.create_date.isoformat() if c.create_date else None,
        "update_date": c.update_date.isoformat() if c.update_date else None,
        "author": c.author.name if c.author else "Unknown"
    } for c in cars])

@router.post("/cars/{car_id}/approve")
def approve_car(car_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    """Одобрить объявление — статус ACTIVE (показывается в каталоге)."""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(404)
    car.status = "ACTIVE"
    car.update_date = datetime.utcnow()
    db.commit()
    return create_response(data={"id": car.id, "status": car.status})

@router.post("/cars/{car_id}/reject")
def reject_car(car_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    """Отклонить объявление — статус REJECT (отказано)."""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(404)
    car.status = "REJECT"
    car.update_date = datetime.utcnow()
    db.commit()
    return create_response(data={"id": car.id, "status": car.status})


@router.patch("/cars/{car_id}")
def update_car_admin(car_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    """Редактирование объявления админом (статус и др.)."""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(404)
    for key in ("status", "name", "price_per_day"):
        if key in payload:
            setattr(car, key, payload[key])
    car.update_date = datetime.utcnow()
    db.commit()
    return create_response(data={"id": car.id, "status": car.status})


@router.delete("/cars/{car_id}")
def delete_car_admin(car_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    """Мягкое удаление объявления (status=DELETED или delete_date)."""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(404)
    car.status = "DELETED"
    car.update_date = datetime.utcnow()
    if hasattr(car, "delete_date"):
        car.delete_date = datetime.utcnow()
    db.commit()
    return create_response(data={"id": car.id, "status": "DELETED"})

@router.get("/applications")
def list_applications_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    q: str | None = None,
    db: Session = Depends(get_db), 
    admin: User = Depends(check_admin)
):
    from sqlalchemy import or_
    query = db.query(Application).filter(Application.status != "DELETED")
    
    if q:
        query = query.join(User, Application.user_id == User.id).filter(
            or_(
                User.name.ilike(f"%{q}%"),
                Application.message.ilike(f"%{q}%")
            )
        )
        
    total = query.count()
    apps = query.order_by(Application.create_date.desc()).offset(skip).limit(limit).all()
    
    result = []
    for app in apps:
        ac_count = db.query(ApplicationCar).filter(ApplicationCar.application_id == app.id).count()
        result.append({
            "id": app.id,
            "user": app.user.name if app.user else "Unknown",
            "user_email": app.user.email if app.user else "",
            "message": app.message,
            "status": app.status,
            "create_date": app.create_date.isoformat() if app.create_date else None,
            "views_count": app.views_count,
            "matching_cars_count": ac_count,
            "images": [{"url": img.url} for img in app.images]
        })
    return create_response(data={"items": result, "total": total})

@router.patch("/applications/{app_id}")
def update_application_admin(app_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(404)
    for key in ("status", "message"):
        if key in payload:
            setattr(app, key, payload[key])
    app.update_date = datetime.utcnow()
    db.commit()
    return create_response(data={"id": app.id, "status": app.status})

@router.delete("/applications/{app_id}")
def delete_application_admin(app_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(404)
    app.status = "DELETED"
    app.update_date = datetime.utcnow()
    db.commit()
    return create_response(data={"id": app.id, "status": "DELETED"})



@router.post("/create-admin")
def create_admin(payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    # Проверяем по email или телефону, чтобы не дублировать админа.
    existing = db.query(User).filter(
        (User.email == payload.get("email"))
        | (User.phone_number == payload.get("phone_number"))
    ).first()
    if existing:
        raise HTTPException(400, "User exists")

    new_admin = User(
        name=payload.get("name"),
        phone_number=payload.get("phone_number"),
        email=payload.get("email"),
        password_hash=get_password_hash(payload.get("password")),
        role="admin",
        is_active=True,
    )
    db.add(new_admin)
    db.commit()
    return create_response(data={"id": new_admin.id})


@router.get("/otp")
def list_otp_codes(
    target: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin),
):
    """
    История OTP‑кодов (для поддержки: если код не дошёл, админ может подсказать пользователю).
    """
    query = db.query(OTPVerification).order_by(OTPVerification.created_at.desc())
    if target:
        query = query.filter(OTPVerification.target == target)
    if limit:
        query = query.limit(limit)
    items = query.all()
    data = [
        {
            "id": o.id,
            "target": o.target,
            "code": o.code,
            "type": o.type,
            "is_used": o.is_used,
            "expires_at": o.expires_at.isoformat() if o.expires_at else None,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in items
    ]
    return create_response(data=data)

@router.get("/cars/{car_id}")
def get_car_detail_admin(car_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(404)
    return create_response(data={
        "id": car.id,
        "name": car.name,
        "images": [{"url": i.url, "id": i.id} for i in car.images],
        "status": car.status,
        "views": car.views_count,
        "create_date": car.create_date.isoformat() if car.create_date else None,
        "update_date": car.update_date.isoformat() if car.update_date else None,
    })


@router.get("/export/excel")
async def export_data_excel(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    output, filename = await admin_service.export_to_excel(db)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/import/excel")
async def import_data_excel(file: UploadFile = File(...), db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    content = await file.read()
    success = await admin_service.import_from_excel(content, db)
    return create_response(data={"success": success})


# --- Платежи (полные данные по транзакциям) ---

@router.get("/payments/transactions")
def list_payment_transactions(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    """Полный список всех платёжных транзакций."""
    tx_list = db.query(PaymentTransaction).order_by(PaymentTransaction.create_date.desc()).all()
    return create_response(data=[{
        "id": t.id,
        "provider": t.provider,
        "order_id": t.order_id,
        "external_id": t.external_id,
        "status": t.status,
        "amount_kzt": t.amount_kzt,
        "currency": t.currency,
        "owner_id": t.owner_id,
        "subscription_id": t.subscription_id,
        "payment_url": t.payment_url,
        "create_date": t.create_date.isoformat() if t.create_date else None,
        "update_date": t.update_date.isoformat() if t.update_date else None,
        "raw_data": t.raw_data,
    } for t in tx_list])


# --- Управление платёжными аккаунтами ---

@router.get("/payments/accounts")
def list_payment_accounts(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    accounts = db.query(PaymentAccount).all()
    data = [
        {
            "id": a.id,
            "provider": a.provider,
            "name": a.name,
            "is_active": a.is_active,
            "config": a.config,
        }
        for a in accounts
    ]
    return create_response(data=data)

@router.patch("/payments/accounts/{account_id}")
def update_payment_account(account_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    account = db.query(PaymentAccount).filter(PaymentAccount.id == account_id).first()
    if not account:
        raise HTTPException(404)

    for key, value in payload.items():
        if hasattr(account, key):
            setattr(account, key, value)

    db.commit()
    db.refresh(account)
    return create_response(data={
        "id": account.id,
        "provider": account.provider,
        "name": account.name,
        "is_active": account.is_active,
        "config": account.config,
    })


# --- Управление подписками ---

def _plan_to_dict(plan: SubscriptionPlan) -> dict:
    return {
        "id": plan.id,
        "code": plan.code,
        "name": plan.name,
        "description": plan.description,
        "price_kzt": plan.price_kzt,
        "period_days": plan.period_days,
        "free_days": plan.free_days,
        "max_cars": plan.max_cars,
        "is_active": plan.is_active,
        "create_date": plan.create_date.isoformat() if plan.create_date else None,
    }


@router.get("/subscriptions/plans")
def list_subscription_plans(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    plans = db.query(SubscriptionPlan).all()
    return create_response(data=[_plan_to_dict(p) for p in plans])

@router.post("/subscriptions/plans")
def create_subscription_plan(payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    plan = SubscriptionPlan(**payload)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return create_response(data=_plan_to_dict(plan))

@router.patch("/subscriptions/plans/{plan_id}")
def update_subscription_plan(plan_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404)
    for key, value in payload.items():
        if hasattr(plan, key):
            setattr(plan, key, value)
    db.commit()
    db.refresh(plan)
    return create_response(data=_plan_to_dict(plan))


@router.delete("/subscriptions/plans/{plan_id}")
def delete_subscription_plan(plan_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404)
    plan.is_active = False
    db.commit()
    return create_response(data={"id": plan_id, "is_active": False})

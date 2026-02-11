from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.entities import User, Car, Application, Client, Dictionary, CarOwner, PaymentAccount, SubscriptionPlan
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
def list_dictionaries(type: str = None, parent_id: int = None, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    query = db.query(Dictionary)
    if type: query = query.filter(Dictionary.type == type)
    if parent_id: query = query.filter(Dictionary.parent_id == parent_id)
    items = query.all()
    return create_response(data=items)

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
    most_applied = db.query(
        Car.id, Car.name, func.count(Application.id).label('app_count')
    ).join(Application).group_by(Car.id).order_by(func.count(Application.id).desc()).limit(10).all()
    
    total_users = db.query(User).count()
    total_cars = db.query(Car).count()
    total_apps = db.query(Application).count()

    return create_response(data={
        "totals": {"users": total_users, "cars": total_cars, "applications": total_apps},
        "most_viewed": [{"id": c.id, "name": c.name, "views": c.views_count} for c in most_viewed],
        "most_applied": [{"id": a.id, "name": a.name, "applications": a.app_count} for a in most_applied]
    })

@router.get("/users")
def list_users(role: str = None, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()
    return create_response(data=[{
        "id": u.id, "name": u.name, "login": u.login, "email": u.email, 
        "phone_number": u.phone_number, "role": u.role, "is_active": u.is_active
    } for u in users])

@router.get("/cars")
def list_cars_admin(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    cars = db.query(Car).all()
    return create_response(data=[{
        "id": c.id, "name": c.name, "is_active": c.is_active, "views": c.views_count,
        "author": c.author.name if c.author else "Unknown"
    } for c in cars])

@router.post("/cars/{car_id}/toggle-active")
def toggle_car_active(car_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car: raise HTTPException(404)
    car.is_active = not car.is_active
    db.commit()
    return create_response(data={"id": car.id, "is_active": car.is_active})

@router.get("/applications")
def list_applications(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    apps = db.query(Application).all()
    return create_response(data=[{
        "id": a.id, "car_id": a.car_id, "owner_id": a.car_owner_id, "create_date": a.create_date
    } for a in apps])

@router.post("/create-admin")
def create_admin(payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    existing = db.query(User).filter(User.login == payload.get("login")).first()
    if existing: raise HTTPException(400, "User exists")
    new_admin = User(
        name=payload.get("name"), login=payload.get("login"),
        phone_number=payload.get("phone_number"), email=payload.get("email"),
        password_hash=get_password_hash(payload.get("password")), role="admin"
    )
    db.add(new_admin)
    db.commit()
    return create_response(data={"id": new_admin.id, "login": new_admin.login})

@router.get("/cars/{car_id}")
def get_car_detail_admin(car_id: int, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car: raise HTTPException(404)
    return create_response(data={
        "id": car.id,
        "name": car.name,
        "images": [{"url": i.url, "id": i.id} for i in car.images],
        "is_active": car.is_active,
        "views": car.views_count
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


# --- Управление платежными системами ---

@router.get("/payments/accounts")
def list_payment_accounts(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    accounts = db.query(PaymentAccount).all()
    return create_response(data=accounts)

@router.patch("/payments/accounts/{account_id}")
def update_payment_account(account_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    account = db.query(PaymentAccount).filter(PaymentAccount.id == account_id).first()
    if not account: raise HTTPException(404)
    
    for key, value in payload.items():
        if hasattr(account, key):
            setattr(account, key, value)
    
    db.commit()
    return create_response(data=account)


# --- Управление подписками ---

@router.get("/subscriptions/plans")
def list_subscription_plans(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    plans = db.query(SubscriptionPlan).all()
    return create_response(data=plans)

@router.post("/subscriptions/plans")
def create_subscription_plan(payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    plan = SubscriptionPlan(**payload)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return create_response(data=plan)

@router.patch("/subscriptions/plans/{plan_id}")
def update_subscription_plan(plan_id: int, payload: dict, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan: raise HTTPException(404)
    
    for key, value in payload.items():
        if hasattr(plan, key):
            setattr(plan, key, value)
            
    db.commit()
    return create_response(data=plan)

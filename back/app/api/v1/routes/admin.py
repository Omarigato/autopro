from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.entities import User, Car, Application, Client, Dictionary, CarOwner
from app.core.security import get_current_user, get_password_hash
from app.core.responses import create_response
from app.services.car_data_service import sync_all_makes, sync_models_for_make

router = APIRouter()

def check_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admins only."
        )
    return current_user

@router.post("/sync/car-data")
async def trigger_sync(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    makes_count = await sync_all_makes(db)
    return create_response(data={"makes_synced": makes_count})

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

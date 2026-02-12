from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.entities import User, UserLike, UserEvent, Car
from app.core.responses import create_response

router = APIRouter()

@router.get("/likes")
def get_user_likes(
    request: Request,
    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)
):
    """Получить избранные объявления пользователя"""
    likes = db.query(UserLike).filter(UserLike.user_id == current_user.id).all()
    
    result = []
    for like in likes:
        car = like.car
        result.append({
            "id": like.id,
            "car_id": car.id,
            "car_name": car.name,
            "car_price": car.price_per_day,
            "created_at": like.created_at.isoformat()
        })
    
    return create_response(data=result, lang=request.state.lang)

@router.post("/likes/{car_id}")
def add_to_likes(
    car_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Добавить объявление в избранное"""
    # Check if already liked
    existing = db.query(UserLike).filter(
        UserLike.user_id == current_user.id,
        UserLike.car_id == car_id
    ).first()
    
    if existing:
        return create_response(message="Уже в избранном", lang=request.state.lang)
    
    like = UserLike(user_id=current_user.id, car_id=car_id)
    db.add(like)
    db.commit()
    
    return create_response(message="Добавлено в избранное", lang=request.state.lang)

@router.delete("/likes/{car_id}")
def remove_from_likes(
    car_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удалить объявление из избранного"""
    like = db.query(UserLike).filter(
        UserLike.user_id == current_user.id,
        UserLike.car_id == car_id
    ).first()
    
    if not like:
        return create_response(code=404, message="Не найдено в избранном", lang=request.state.lang)
    
    db.delete(like)
    db.commit()
    
    return create_response(message="Удалено из избранного", lang=request.state.lang)

@router.get("/events")
def get_user_events(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить историю событий пользователя"""
    events = db.query(UserEvent).filter(
        UserEvent.user_id == current_user.id
    ).order_by(UserEvent.created_at.desc()).limit(50).all()
    
    result = []
    for event in events:
        car = event.car
        result.append({
            "id": event.id,
            "event_type": event.event_type,
            "car_id": car.id,
            "car_name": car.name,
            "car_price": car.price_per_day,
            "application_id": event.application_id,
            "created_at": event.created_at.isoformat()
        })
    
    return create_response(data=result, lang=request.state.lang)

@router.post("/events/view/{car_id}")
def track_car_view(
    car_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Отследить просмотр объявления"""
    event = UserEvent(
        user_id=current_user.id,
        car_id=car_id,
        event_type="view"
    )
    db.add(event)
    db.commit()
    
    return create_response(message="Просмотр зафиксирован", lang=request.state.lang)

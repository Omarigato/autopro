from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import Review
from app.schemas.reviews import ReviewCreateRequest
from app.core.responses import create_response

router = APIRouter()

@router.post("")
def create_review(
    payload: ReviewCreateRequest, 
    request: Request,
    db: Session = Depends(get_db)
):
    review = Review(
        car_id=payload.car_id,
        car_owner_id=payload.car_owner_id,
        client_id=payload.client_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    return create_response(message="Review added", lang=request.state.lang)

@router.get("/car/{car_id}")
def list_reviews_for_car(car_id: int, request: Request, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.car_id == car_id).all()
    return create_response(data=[{"id": r.id, "rating": r.rating, "comment": r.comment} for r in reviews], lang=request.state.lang)


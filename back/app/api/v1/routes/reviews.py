from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Review
from app.schemas.reviews import ReviewCreateRequest, ReviewResponse

router = APIRouter()


@router.post("", response_model=ReviewResponse)
def create_review(
    payload: ReviewCreateRequest, db: Session = Depends(get_db)
) -> ReviewResponse:
    review = Review(
        car_id=payload.car_id,
        car_owner_id=payload.car_owner_id,
        client_id=payload.client_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/car/{car_id}", response_model=List[ReviewResponse])
def list_reviews_for_car(car_id: int, db: Session = Depends(get_db)) -> List[ReviewResponse]:
    reviews = db.query(Review).filter(Review.car_id == car_id).all()
    return reviews


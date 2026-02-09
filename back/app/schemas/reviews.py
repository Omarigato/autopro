from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreateRequest(BaseModel):
    car_id: int
    car_owner_id: int
    client_id: int | None = None
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    car_id: int
    car_owner_id: int
    client_id: int | None
    rating: int
    comment: str | None
    create_date: datetime

    class Config:
        from_attributes = True


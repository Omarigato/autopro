from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    city_id: int
    category_id: Optional[int] = None
    vehicle_mark_id: Optional[int] = None
    vehicle_model_id: Optional[int] = None
    requested_at: Optional[datetime] = None
    message: Optional[str] = Field(None, max_length=1000)


class ApplicationUpdateStatus(BaseModel):
    status: str  # COMPLETED | REJECTED
    selected_car_ids: Optional[List[int]] = None  # required when status=COMPLETED


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    city_id: int
    category_id: Optional[int] = None
    vehicle_mark_id: Optional[int] = None
    vehicle_model_id: Optional[int] = None
    requested_at: Optional[str] = None
    message: Optional[str] = None
    status: str
    views_count: int
    create_date: str
    update_date: Optional[str] = None
    completed_at: Optional[str] = None
    city_name: Optional[str] = None
    category_name: Optional[str] = None
    mark_name: Optional[str] = None
    model_name: Optional[str] = None
    images: List[dict] = []
    matching_cars_count: int = 0
    matching_cars: List[dict] = []

    class Config:
        from_attributes = True

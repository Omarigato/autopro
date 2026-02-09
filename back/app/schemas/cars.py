from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CarBase(BaseModel):
    name: str
    marka_id: Optional[int] = None
    model_id: Optional[int] = None
    bin: Optional[str] = None
    release_year: Optional[int] = Field(default=None, ge=1900, le=datetime.utcnow().year + 1)
    is_top: bool = False


class CarImageCreate(BaseModel):
    url: str
    image_id: Optional[str] = None
    position: int = 0


class CarCreateRequest(CarBase):
    description: Optional[str] = None
    images: List[CarImageCreate] = []


class CarImageResponse(BaseModel):
    id: int
    url: str
    image_id: Optional[str]
    position: int

    class Config:
        from_attributes = True


class CarResponse(CarBase):
    id: int
    author_id: int
    is_active: bool
    create_date: datetime

    images: List[CarImageResponse] = []

    class Config:
        from_attributes = True


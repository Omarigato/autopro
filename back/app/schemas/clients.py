from datetime import datetime

from pydantic import BaseModel, Field


class ClientCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    age: int | None = Field(default=None, ge=18, le=100)
    phone_number: str = Field(..., min_length=5, max_length=30)
    car_id: int


class ClientResponse(BaseModel):
    id: int
    name: str
    age: int | None
    phone_number: str
    create_date: datetime

    class Config:
        from_attributes = True


class WhatsAppContactResponse(BaseModel):
    client: ClientResponse
    whatsapp_url: str


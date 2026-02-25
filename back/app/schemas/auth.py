from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OwnerRegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone_number: str = Field(..., min_length=5, max_length=30)
    # Логин как отдельное поле больше не нужен — используем email.
    email: EmailStr | None = Field(default=None)
    # Пароль заполняется только если клиент хочет входить по email.
    password: str | None = Field(default=None, min_length=6, max_length=255)


class OwnerLoginRequest(BaseModel):
    login: str
    password: str | None = None
    otp_code: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    phone_number: str
    role: Literal["client", "admin"]
    create_date: datetime

    class Config:
        from_attributes = True


from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.entities import CarOwner, User
from app.schemas.auth import OwnerLoginRequest, OwnerRegisterRequest, Token, UserResponse

router = APIRouter()


@router.post("/register-owner", response_model=UserResponse)
def register_owner(
    payload: OwnerRegisterRequest, db: Session = Depends(get_db)
) -> UserResponse:
    existing = (
        db.query(User)
        .filter(
            (User.login == payload.login) | (User.phone_number == payload.phone_number)
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким логином или телефоном уже существует",
        )

    user = User(
        name=payload.name,
        login=payload.login,
        phone_number=payload.phone_number,
        password_hash=get_password_hash(payload.password),
        role="owner",
    )
    db.add(user)
    db.flush()
    owner = CarOwner(user_id=user.id)
    db.add(owner)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login_owner(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Token:
    user = db.query(User).filter(User.login == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный логин или пароль",
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return current_user


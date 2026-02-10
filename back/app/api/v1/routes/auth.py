from datetime import datetime, timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.entities import CarOwner, User, OTPVerification
from app.schemas.auth import OwnerLoginRequest, OwnerRegisterRequest, Token, UserResponse
from app.core.responses import create_response
from pydantic import BaseModel

router = APIRouter()

class EntranceRequest(BaseModel):
    login: str  # Can be phone, email or username

class PasswordResetRequest(BaseModel):
    target: str
    otp_code: str
    new_password: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class PhoneLoginRequest(BaseModel):
    phone_number: str

class OTPVerifyRequest(BaseModel):
    email: str | None = None
    phone_number: str | None = None
    otp_code: str

@router.post("/check-entrance")
def check_entrance(payload: EntranceRequest, request: Request, db: Session = Depends(get_db)):
    """
    Проверка существования пользователя для адаптивного входа в систему.
    Если пользователь существует - предлагаем вход по паролю.
    Если нет - отправляем OTP для регистрации.
    """
    user = db.query(User).filter(
        or_(
            User.login == payload.login,
            User.phone_number == payload.login,
            User.email == payload.login
        )
    ).first()

    if user:
        return create_response(
            data={"exists": True, "type": "password", "login": payload.login},
            lang=request.state.lang
        )
    else:
        # Если не найден - считаем это регистрацией по номеру телефона/email
        otp_code = str(random.randint(100000, 999999))
        
        # Логируем в таблицу верификации
        verification = OTPVerification(
            target=payload.login,
            code=otp_code,
            type="register",
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        db.add(verification)
        db.commit()

        print(f"DEBUG: Registration OTP for {payload.login} is {otp_code}")
        
        return create_response(
            data={"exists": False, "type": "otp", "login": payload.login},
            message_key="otp_sent",
            lang=request.state.lang
        )

@router.post("/login-json")
def login_json(
    payload: OwnerLoginRequest, 
    request: Request,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        or_(
            User.login == payload.login,
            User.phone_number == payload.login,
            User.email == payload.login
        )
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        return create_response(
            code=400,
            message_key="auth_failed",
            lang=request.state.lang
        )

    access_token = create_access_token(subject=user.id)
    return create_response(
        data={"access_token": access_token, "token_type": "bearer", "user_id": user.id},
        lang=request.state.lang
    )

@router.post("/otp/request")
def request_otp(
    payload: PhoneLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Генерация OTP для входа или сброса пароля"""
    user = db.query(User).filter(User.phone_number == payload.phone_number).first()
    
    otp = str(random.randint(100000, 999999))
    
    # Сохраняем в историю верификации
    verification = OTPVerification(
        target=payload.phone_number,
        code=otp,
        type="login" if user else "register",
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    db.add(verification)
    
    if user:
        user.otp_code = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    
    db.commit()
    print(f"DEBUG: OTP for {payload.phone_number} is {otp}")
    
    return create_response(
        message_key="otp_sent",
        lang=request.state.lang
    )

@router.post("/otp/verify")
def verify_otp(
    payload: OTPVerifyRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    target = payload.phone_number or payload.email
    
    # Проверяем в основной таблице верификации
    verification = db.query(OTPVerification).filter(
        OTPVerification.target == target,
        OTPVerification.code == payload.otp_code,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()

    if not verification:
        return create_response(code=400, message_key="invalid_otp", lang=request.state.lang)

    verification.is_used = True
    
    # Пытаемся найти пользователя или создать нового
    user = db.query(User).filter(
        or_(User.phone_number == target, User.email == target)
    ).first()

    if not user:
        user = User(
            name=f"User {target[-4:]}" if payload.phone_number else target.split('@')[0],
            phone_number=payload.phone_number,
            email=payload.email,
            role="owner",
            is_active=True
        )
        db.add(user)
        db.flush()
        owner = CarOwner(user_id=user.id)
        db.add(owner)
    
    db.commit()
    
    access_token = create_access_token(subject=user.id)
    return create_response(
        data={"access_token": access_token, "token_type": "bearer"},
        message_key="login_success",
        lang=request.state.lang
    )

@router.post("/password/reset/request")
def reset_password_request(payload: EntranceRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(User.login == payload.login, User.phone_number == payload.login, User.email == payload.login)
    ).first()
    
    if not user:
        return create_response(code=404, message_key="user_not_found", lang=request.state.lang)

    otp_code = str(random.randint(100000, 999999))
    verification = OTPVerification(
        target=payload.login,
        code=otp_code,
        type="password_reset",
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(verification)
    db.commit()
    print(f"DEBUG: Password Reset OTP for {payload.login} is {otp_code}")
    
    return create_response(message_key="otp_sent", lang=request.state.lang)

@router.post("/password/reset/confirm")
def reset_password_confirm(payload: PasswordResetRequest, request: Request, db: Session = Depends(get_db)):
    verification = db.query(OTPVerification).filter(
        OTPVerification.target == payload.target,
        OTPVerification.code == payload.otp_code,
        OTPVerification.type == "password_reset",
        OTPVerification.is_used == False,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()

    if not verification:
        return create_response(code=400, message_key="invalid_otp", lang=request.state.lang)

    user = db.query(User).filter(
        or_(User.login == payload.target, User.phone_number == payload.target, User.email == payload.target)
    ).first()

    if not user:
        return create_response(code=404, message_key="user_not_found", lang=request.state.lang)

    user.password_hash = get_password_hash(payload.new_password)
    verification.is_used = True
    db.commit()
    
    return create_response(message_key="password_updated", lang=request.state.lang)

@router.post("/password/change")
def change_password_auth(
    payload: PasswordChangeRequest, 
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(payload.old_password, current_user.password_hash):
        return create_response(code=400, message="Неверный старый пароль", lang=request.state.lang)
    
    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return create_response(message="Пароль успешно изменен", lang=request.state.lang)

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), request: Request = None):
    return create_response(data={
        "id": current_user.id,
        "name": current_user.name,
        "role": current_user.role,
        "email": current_user.email,
        "phone_number": current_user.phone_number
    }, lang=request.state.lang if request else "ru")


from datetime import datetime, timedelta
import random
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.entities import CarOwner, User, OTPVerification, Image, Dictionary
from app.schemas.auth import OwnerLoginRequest, OwnerRegisterRequest, Token, UserResponse
from app.core.responses import create_response
from pydantic import BaseModel, EmailStr
import re

from app.services.whatsapp_service import whatsapp_service
from app.services.email_service import email_service

router = APIRouter()

def is_password_strong(password: str) -> bool:
    """
    Пароль должен содержать минимум 8 символов, заглавную букву, строчную букву, число и спецсимвол.
    """
    if len(password) < 8:
        return False
    if not re.search("[a-z]", password):
        return False
    if not re.search("[A-Z]", password):
        return False
    if not re.search("[0-9]", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True

class RegisterCompleteRequest(BaseModel):
    name: str
    target: str
    otp_code: str
    password: str
    confirm_password: str

class OTPVerifyRequest(BaseModel):
    target: str # email or phone
    otp_code: str

class PasswordChangeRequest(BaseModel):
    target: str
    password: str
    otp_code: str | None = None # Required if resetting password via OTP

class LoginRequest(BaseModel):
    # Идентификатор для входа — номер телефона или email.
    login: str
    password: str | None = None
    otp_code: str | None = None

class CheckExistsRequest(BaseModel):
    email: str | None = None
    phone_number: str | None = None

@router.post("/login")
def login(
    payload: LoginRequest, 
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Вход по паролю ИЛИ по одноразовому коду (OTP).
    Идентификатором может быть номер телефона или email.
    """
    user = db.query(User).filter(
        or_(
            User.phone_number == payload.login,
            User.email == payload.login,
        )
    ).first()

    if not user:
        return create_response(code=404, message_key="user_not_found", lang=request.state.lang)

    # Вход по OTP
    if payload.otp_code:
        # Проверяем код для указанного идентификатора (телефон или email).
        verification = db.query(OTPVerification).filter(
            or_(
                OTPVerification.target == payload.login,
                OTPVerification.target == user.phone_number,
                OTPVerification.target == user.email,
            ),
            OTPVerification.code == payload.otp_code,
            OTPVerification.is_used == False,
            OTPVerification.expires_at > datetime.utcnow()
        ).first()
        
        if not verification:
             return create_response(code=400, message_key="invalid_otp", lang=request.state.lang)
             
        verification.is_used = True
        db.commit()

    # Вход по паролю
    elif payload.password:
        if not verify_password(payload.password, user.password_hash):
            return create_response(
                code=400,
                message_key="auth_failed",
                lang=request.state.lang
            )
    else:
        return create_response(code=400, message="Необходимо указать пароль или код", lang=request.state.lang)

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return create_response(
        data={"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer", "user_id": user.id},
        lang=request.state.lang
    )

@router.post("/register")
def register(
    payload: OwnerRegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Регистрация клиента.
    Проверяем уникальность телефона и (опционально) email.
    """
    # Проверяем телефон
    if db.query(User).filter(User.phone_number == payload.phone_number).first():
        return create_response(code=400, message="Пользователь с таким номером телефона уже существует", lang=request.state.lang)

    # Проверяем email (если указан)
    target_email = payload.email
    if target_email:
        if db.query(User).filter(User.email == target_email).first():
             return create_response(code=400, message="Пользователь с таким email уже существует", lang=request.state.lang)
    
    # Если клиент хочет пароль (для входа по email) — проверяем сложность.
    password_hash = None
    if payload.password:
        if not is_password_strong(payload.password):
            return create_response(
                code=400,
                message="Пароль должен содержать минимум 8 символов, включая заглавную букву, цифру и спецсимвол",
                lang=request.state.lang,
            )
        password_hash = get_password_hash(payload.password)

    new_user = User(
        name=payload.name,
        phone_number=payload.phone_number,
        email=target_email,
        password_hash=password_hash,
        role="client", 
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Дефолтный город — Алматы
    almaty = db.query(Dictionary).filter(Dictionary.type == "CITY", Dictionary.code == "ALA").first()
    if almaty:
        new_user.city_id = almaty.id

    owner = CarOwner(user_id=new_user.id)
    db.add(owner)
    
    db.commit()
    
    access_token = create_access_token(subject=new_user.id)
    refresh_token = create_refresh_token(subject=new_user.id)
    return create_response(
        data={"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"},
        message="Регистрация успешно завершена",
        lang=request.state.lang
    )

class CheckExistsRequest(BaseModel):
    email: str | None = None
    phone_number: str | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
def refresh_tokens(
    payload: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Обмен refresh_token на новую пару access_token и refresh_token.
    """
    user_id = decode_refresh_token(payload.refresh_token)
    if not user_id:
        return create_response(code=401, message_key="invalid_refresh_token", lang=request.state.lang)
    user = db.query(User).filter(User.id == user_id, User.delete_date.is_(None)).first()
    if not user or not user.is_active:
        return create_response(code=401, message_key="invalid_refresh_token", lang=request.state.lang)
    access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)
    return create_response(
        data={
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "user_id": user.id,
        },
        lang=request.state.lang,
    )


@router.post("/check-exists")
def check_user_exists(
    payload: CheckExistsRequest, 
    request: Request,
    db: Session = Depends(get_db)
):
    result = {"email_exists": False, "phone_exists": False}
    
    if payload.email:
        if db.query(User).filter(User.email == payload.email).first():
            result["email_exists"] = True
            
    if payload.phone_number:
        if db.query(User).filter(User.phone_number == payload.phone_number).first():
            result["phone_exists"] = True
            
    return create_response(data=result, lang=request.state.lang)

class OTPRequest(BaseModel):
    target: str  # email or phone
    type: str | None = None  # e.g., 'update' for profile changes

@router.post("/otp/request")
async def request_otp(
    payload: OTPRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Отправка одноразового кода (OTP) для входа или восстановления пароля.
    Используется с телефоном или email.
    """
    user = db.query(User).filter(
        or_(
            User.phone_number == payload.target,
            User.email == payload.target,
        )
    ).first()

    # Если это не запрос на обновление профиля и пользователь не найден — ошибка:
    if not user and payload.type != "update":
        return create_response(
            code=404,
            message="Пользователь с такими данными не найден. Пожалуйста, зарегистрируйтесь.",
            lang=request.state.lang,
        )

    otp = str(random.randint(100000, 999999))

    # Определяем тип OTP (по умолчанию login/register, или 'update' если передан)
    otp_type = payload.type if payload.type else ("login" if user else "register")

    verification = OTPVerification(
        target=payload.target,
        code=otp,
        type=otp_type,
        expires_at=datetime.utcnow() + timedelta(minutes=5),
    )
    db.add(verification)
    db.commit()

    # Отправка кода пользователю
    if "@" in payload.target:
        # Отправка на email
        await email_service.send_otp(payload.target, otp)
    else:
        # Отправка в WhatsApp/SMS по номеру телефона
        phone = user.phone_number or payload.target
        await whatsapp_service.send_otp(phone, otp)

    print(f"DEBUG: OTP for {payload.target} is {otp}")

    return create_response(
        message_key="otp_sent",
        lang=request.state.lang,
    )

@router.post("/otp/verify")
def verify_otp(
    payload: OTPVerifyRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Verify OTP. 
    If used for login (and user exists), could potentially login here too, 
    but user asked for 'Login via code' in the login endpoint. 
    This endpoint might be for 'Forgot Password' verification step 
    or just checking if OTP is valid before proceeding.
    """
    verification = db.query(OTPVerification).filter(
        OTPVerification.target == payload.target,
        OTPVerification.code == payload.otp_code,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()

    if not verification:
        return create_response(code=400, message_key="invalid_otp", lang=request.state.lang)

    # We mark it used ONLY if this is a final step or we pass a token to next step.
    # For 'Forgot Password', we might verify here, then 'change-password' checks it again or trusts a token?
    # Simpler: just return success. 'change-password' will check OTP again and mark used.
    # OR: mark used here and return a temporary 'reset_token'.
    # Let's keep it simple: just return Valid. The 'change-password' or 'login' will consume it.
    
    return create_response(
        message="Код верен",
        data={"verified": True, "target": payload.target, "code": payload.otp_code},
        lang=request.state.lang
    )

@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest, 
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Change password. 
    If unauthenticated (Forgot Password flow), requires 'target' and 'otp_code'.
    If authenticated (Change Password flow), we can adapt or use a separate endpoint.
    User asked for 'change-password' in the context of 'forgot password'.
    """
    # Verify OTP
    verification = db.query(OTPVerification).filter(
        OTPVerification.target == payload.target,
        OTPVerification.code == payload.otp_code,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not verification:
         return create_response(code=400, message_key="invalid_otp", lang=request.state.lang)

    # Find User — сброс пароля разрешён только по email.
    if "@" not in payload.target:
        return create_response(
            code=400,
            message="Сброс пароля возможен только по email",
            lang=request.state.lang,
        )

    user = db.query(User).filter(User.email == payload.target).first()

    if not user:
         return create_response(code=404, message_key="user_not_found", lang=request.state.lang)

    # Update Password
    if not is_password_strong(payload.password):
        return create_response(
            code=400, 
            message="Пароль должен содержать минимум 8 символов, включая заглавную букву, цифру и спецсимвол", 
            lang=request.state.lang
        )
        
    user.password_hash = get_password_hash(payload.password)
    verification.is_used = True
    db.commit()
    
    return create_response(message="Пароль успешно обновлен", lang=request.state.lang)

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), request: Request = None):
    avatar_url = current_user.avatar_image.url if current_user.avatar_image else current_user.avatar_url
    return create_response(data={
        "id": current_user.id,
        "name": current_user.name or "",
        "role": current_user.role,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "gender": current_user.gender,
        "date_birth": current_user.date_birth.isoformat() if current_user.date_birth else None,
        "balance": current_user.balance,
        "avatar_url": avatar_url,
        "city_id": getattr(current_user, "city_id", None),
        "notify_by_email": getattr(current_user, "notify_by_email", True),
        "notify_by_whatsapp": getattr(current_user, "notify_by_whatsapp", True),
    }, lang=request.state.lang if request else "ru")


class ProfileUpdateRequest(BaseModel):
    # Полное имя одним полем
    name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    gender: str | None = None  # male, female
    date_birth: str | None = None  # ISO format date string
    city_id: int | None = None
    notify_by_email: bool | None = None
    notify_by_whatsapp: bool | None = None


@router.put("/me")
def update_profile(
    payload: ProfileUpdateRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.name:
        current_user.name = payload.name
    if payload.email:
        current_user.email = payload.email
    if payload.phone_number:
        current_user.phone_number = payload.phone_number
    if payload.gender:
        current_user.gender = payload.gender
    if payload.date_birth:
        from datetime import datetime as dt
        current_user.date_birth = dt.fromisoformat(payload.date_birth)
    if payload.city_id is not None:
        current_user.city_id = payload.city_id
    if payload.notify_by_email is not None:
        current_user.notify_by_email = payload.notify_by_email
    if payload.notify_by_whatsapp is not None:
        current_user.notify_by_whatsapp = payload.notify_by_whatsapp

    db.commit()
    return create_response(message="Профиль обновлен", lang=request.state.lang)


from fastapi import File, UploadFile
from app.services.cloudinary_service import CloudinaryService

@router.post("/avatar")
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Upload to Cloudinary
    url, public_id = CloudinaryService.upload_image(file.file, folder="avatars")
    if not url:
        return create_response(code=500, message="Ошибка загрузки фото", lang=request.state.lang)
    
    # Remove old avatar if exists (cascade delete-orphan will handle DB side, 
    # but we need to ensure the Image record is replaced)
    if current_user.avatar_image:
        db.delete(current_user.avatar_image)
        db.flush()

    new_avatar = Image(
        entity_id=current_user.id,
        entity_type='USER',
        url=url,
        image_id=public_id
    )
    db.add(new_avatar)
    
    # Also update the legacy string field for compatibility
    current_user.avatar_url = url
    
    db.commit()
    return create_response(data={"url": url}, message="Аватар обновлен", lang=request.state.lang)


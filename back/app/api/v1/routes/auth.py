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
from app.models.entities import CarOwner, User, OTPVerification, Image
from app.schemas.auth import OwnerLoginRequest, OwnerRegisterRequest, Token, UserResponse
from app.core.responses import create_response
from pydantic import BaseModel, EmailStr
import re

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
    login: str # phone or email
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
    Login with password OR with OTP code.
    If otp_code is provided, verifies OTP and logs in.
    If password is provided, verifies password and logs in.
    """
    user = db.query(User).filter(
        or_(
            User.login == payload.login,
            User.phone_number == payload.login,
            User.email == payload.login
        )
    ).first()

    if not user:
        return create_response(code=404, message_key="user_not_found", lang=request.state.lang)

    # Login via OTP
    if payload.otp_code:
        # Verify OTP
        # We need to find valid verification
        target = user.phone_number if user.phone_number else user.email
        # Or better, just check against payload.login as target
        # But verification usually stored with canonical target.
        # Let's try matching against payload.login first, if fails try user fields.
        
        verification = db.query(OTPVerification).filter(
            or_(OTPVerification.target == payload.login, OTPVerification.target == user.phone_number, OTPVerification.target == user.email),
            OTPVerification.code == payload.otp_code,
            OTPVerification.is_used == False,
            OTPVerification.expires_at > datetime.utcnow()
        ).first()
        
        if not verification:
             return create_response(code=400, message_key="invalid_otp", lang=request.state.lang)
             
        verification.is_used = True
        db.commit()

    # Login via Password
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
    return create_response(
        data={"access_token": access_token, "token_type": "bearer", "user_id": user.id},
        lang=request.state.lang
    )

@router.post("/register")
def register(
    payload: OwnerRegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Registration (Owners/Clients).
    Checks for existing phone/email.
    """
    # Check Phone
    if db.query(User).filter(User.phone_number == payload.phone_number).first():
        return create_response(code=400, message="Пользователь с таким номером телефона уже существует", lang=request.state.lang)
        
    # Check Email
    target_email = payload.login if "@" in payload.login else None
    if target_email:
        if db.query(User).filter(User.email == target_email).first():
             return create_response(code=400, message="Пользователь с таким email уже существует", lang=request.state.lang)
    
    # Password Validation
    if not is_password_strong(payload.password):
        return create_response(
            code=400, 
            message="Пароль должен содержать минимум 8 символов, включая заглавную букву, цифру и спецсимвол", 
            lang=request.state.lang
        )

    # Split name into first and last name
    name_parts = payload.name.strip().split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else None

    new_user = User(
        name=payload.name,
        first_name=first_name,
        last_name=last_name,
        phone_number=payload.phone_number,
        email=target_email,
        password_hash=get_password_hash(payload.password),
        role="client", 
        is_active=True
    )
    db.add(new_user)
    db.flush()
    
    owner = CarOwner(user_id=new_user.id)
    db.add(owner)
    
    db.commit()
    
    access_token = create_access_token(subject=new_user.id)
    return create_response(
        data={"access_token": access_token, "token_type": "bearer"},
        message="Регистрация успешно завершена",
        lang=request.state.lang
    )

class CheckExistsRequest(BaseModel):
    email: str | None = None
    phone_number: str | None = None

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
    target: str # email or phone

@router.post("/otp/request")
def request_otp(
    payload: OTPRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Generates OTP for Login (if user exists) or Forgot Password.
    Also used for verifying phone/email during generic processes if needed.
    """
    user = db.query(User).filter(
        or_(
            User.phone_number == payload.target,
            User.email == payload.target,
            User.login == payload.target
        )
    ).first()
    
    otp = str(random.randint(100000, 999999))
    
    verification = OTPVerification(
        target=payload.target,
        code=otp,
        type="login" if user else "register", # Generic type, or refine based on context? 
        # User said "Forgot password... send otp". 
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    db.add(verification)
    
    if user:
        user.otp_code = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    
    db.commit()
    print(f"DEBUG: OTP for {payload.target} is {otp}")
    
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

    # Find User
    user = db.query(User).filter(
        or_(
            User.login == payload.target,
            User.email == payload.target,
            User.phone_number == payload.target
        )
    ).first()

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
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "name": current_user.name or f"{current_user.first_name} {current_user.last_name or ''}".strip(),
        "role": current_user.role,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "gender": current_user.gender,
        "date_birth": current_user.date_birth.isoformat() if current_user.date_birth else None,
        "balance": current_user.balance,
        "avatar_url": avatar_url
    }, lang=request.state.lang if request else "ru")


class ProfileUpdateRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    gender: str | None = None  # male, female
    date_birth: str | None = None  # ISO format date string


@router.put("/me")
def update_profile(
    payload: ProfileUpdateRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.first_name:
        current_user.first_name = payload.first_name
    if payload.last_name:
        current_user.last_name = payload.last_name
    if payload.email:
        current_user.email = payload.email
    if payload.phone_number:
        current_user.phone_number = payload.phone_number
    if payload.gender:
        current_user.gender = payload.gender
    if payload.date_birth:
        from datetime import datetime as dt
        current_user.date_birth = dt.fromisoformat(payload.date_birth)
    
    # Update name for backwards compatibility
    current_user.name = f"{current_user.first_name} {current_user.last_name or ''}".strip()
    
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


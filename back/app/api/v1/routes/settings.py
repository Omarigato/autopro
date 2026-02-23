"""Публичные настройки приложения (без авторизации)."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import AppSetting
from app.core.responses import create_response

router = APIRouter()


def _get_setting(db: Session, key: str, default: str = "") -> str:
    row = db.query(AppSetting).filter(AppSetting.key == key).first()
    return row.value if row else default


@router.get("")
def get_public_settings(request: Request, db: Session = Depends(get_db)):
    """Публичный endpoint: включены ли подписки (для отображения шага подписки при добавлении объявления)."""
    subscriptions_enabled = _get_setting(db, "subscriptions_enabled", "true").lower() == "true"
    return create_response(data={"subscriptions_enabled": subscriptions_enabled}, lang=request.state.lang)

from functools import lru_cache
from typing import List, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Общие настройки
    APP_NAME: str = "AutoRentGo API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    API_V1_STR: str = "/api/v1"

    # БД – PostgreSQL (ожидаем через переменную окружения)
    SQLALCHEMY_DATABASE_URI: str

    # Supabase (для инициализации клиента)
    SUPABASE_URL: str | None = None
    SUPABASE_KEY: str | None = None

    # JWT
    SECRET_KEY: str = "CHANGE_ME_SECRET"  # заменить в .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 день
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Server
    HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # CORS
    CORS_ORIGINS: Any = ["*"]

    # Telegram уведомления
    TELEGRAM_NOTIFICATION_BOT_TOKEN: str | None = None
    TELEGRAM_ADMIN_CHAT_ID: str | None = None

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None

    # Email (SMTP)
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str | None = None  # от кого отправляем письма

    # WhatsApp API (внешний провайдер / собственный шлюз)
    WHATSAPP_API_URL: str | None = None
    WHATSAPP_API_TOKEN: str | None = None
    # Альтернативный WhatsApp API (POST /api/messages/text, body: { to, body })
    WHATSAPP_ALT_API_URL: str | None = None
    WHATSAPP_ALT_API_TOKEN: str | None = None

    # Базовый URL фронтенда (для ссылок в Telegram)
    FRONTEND_BASE_URL: str | None = None  # например, https://autorentgo.kz или http://localhost:3000

    @field_validator("SMTP_PORT", mode="before")
    @classmethod
    def parse_smtp_port(cls, v):
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return int(v) if isinstance(v, str) else v

    @field_validator("SMTP_USE_TLS", mode="before")
    @classmethod
    def parse_smtp_use_tls(cls, v):
        if v is None or (isinstance(v, str) and not v.strip()):
            return True
        if isinstance(v, str):
            return v.strip().lower() in ("true", "1", "yes")
        return bool(v)

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """
        Позволяет задавать CORS_ORIGINS строкой через запятую в .env
        или как список.
        """
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        extra="ignore",
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Общие настройки
    APP_NAME: str = "AUTOPRO API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    API_V1_STR: str = "/api/v1"

    # БД – PostgreSQL (по умолчанию используем твою Supabase‑БД)
    SQLALCHEMY_DATABASE_URI: str = (
        "postgresql://postgres:AutoPro2026@db.tqeelzduldgfwvazvxry.supabase.co:5432/postgres"
    )

    # JWT
    SECRET_KEY: str = "CHANGE_ME_SECRET"  # заменить в .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 день
    ALGORITHM: str = "HS256"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    # Telegram уведомления
    TELEGRAM_NOTIFICATION_BOT_TOKEN: str | None = None
    TELEGRAM_ADMIN_CHAT_ID: str | None = None

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None

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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


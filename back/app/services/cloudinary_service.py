from typing import Any

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

from app.core.config import settings


def _configure_cloudinary() -> None:
    """
    Однократная конфигурация Cloudinary на основе настроек.
    Если переменные не заданы, загрузка будет падать с понятной ошибкой.
    """

    if not all(
        [
            settings.CLOUDINARY_CLOUD_NAME,
            settings.CLOUDINARY_API_KEY,
            settings.CLOUDINARY_API_SECRET,
        ]
    ):
        raise RuntimeError("Cloudinary не сконфигурирован. Проверьте переменные окружения.")

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_car_image(file: UploadFile, car_id: int, position: int) -> str:
    """
    Загружает фото авто в Cloudinary и возвращает защищённый URL.
    """

    _configure_cloudinary()
    content: bytes = await file.read()
    result: dict[str, Any] = cloudinary.uploader.upload(
        content,
        folder="autopro/cars",
        public_id=f"car_{car_id}_{position}",
        overwrite=True,
        resource_type="image",
    )
    return str(result.get("secure_url") or result.get("url"))


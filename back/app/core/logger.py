import logging
import sys
from logging.handlers import RotatingFileHandler
from app.core.config import settings

def setup_logging():
    # Формат логов
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    formatter = logging.Formatter(log_format)

    # Настройка корневого логгера
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO if not settings.DEBUG else logging.DEBUG)

    # Вывод в консоль
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Вывод в файл (с ротацией: 10 МБ, максимум 5 файлов)
    file_handler = RotatingFileHandler(
        "app.log", maxBytes=10*1024*1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    # Снижаем уровень шума от сторонних библиотек
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return root_logger

logger = logging.getLogger("autopro")

"""
Платёжный сервис — только TipTopPay.
"""
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import PaymentTransaction, OwnerSubscription
from app.services.tiptoppay_service import handle_tiptoppay_callback
from app.core.logger import logger


class PaymentService:
    """Интеграция с TipTopPay."""

    @staticmethod
    async def handle_callback(db: Session, provider: str, data: dict) -> bool:
        if provider != "tiptoppay":
            logger.warning("Unknown payment provider: %s", provider)
            return False
        return handle_tiptoppay_callback(db, data)


payment_service = PaymentService()

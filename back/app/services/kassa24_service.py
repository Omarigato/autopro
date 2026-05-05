import httpx
from typing import Dict, Any, Tuple
from app.core.config import settings
from app.core.logger import logger

class Kassa24Service:
    def __init__(self):
        self.api_url = settings.KASSA24_API_URL or "https://ecommerce.kassa24.kz/api/v1"
        self.merchant_id = settings.KASSA24_MERCHANT_ID
        self.login = settings.KASSA24_LOGIN
        self.password = settings.KASSA24_PASSWORD
        self.secret_key = settings.KASSA24_SECRET_KEY
        self.is_demo = settings.KASSA24_DEMO
        self.return_url = settings.KASSA24_RETURN_URL
        self.callback_url = settings.KASSA24_CALLBACK_URL

    async def create_payment(self, order_id: str, amount_kzt: int, description: str) -> Tuple[bool, str | None, str | None]:
        """
        Создает платеж в Kassa24.
        Возвращает: (success, payment_url, external_id)
        """
        if not settings.KASSA24_ENABLED:
            logger.warning("[KASSA24] Integration disabled in config")
            return False, None, None

        endpoint = f"{self.api_url}/payment/create"
        
        # Пример типичного payload для Kassa24 Ecommerce:
        payload = {
            "merchantId": self.merchant_id,
            "orderId": order_id,
            "amount": amount_kzt * 100,  # Типично в тиынах
            "currency": "KZT",
            "description": description,
            "returnUrl": self.return_url,
            "callbackUrl": self.callback_url,
            "demo": self.is_demo
        }

        try:
            logger.info(f"[KASSA24] Creating payment for order {order_id}, amount {amount_kzt} KZT")
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    endpoint,
                    json=payload,
                    auth=(self.login, self.password),
                    timeout=15.0
                )
                resp.raise_for_status()
                data = resp.json()

                # Ожидаем ответ типа: {"success": true, "url": "https://...", "transactionId": "12345"}
                # Формат может отличаться, нужно уточнять по доке, пока делаем гибко
                if data.get("success") or data.get("url"):
                    payment_url = data.get("url") or data.get("paymentUrl")
                    external_id = data.get("transactionId") or str(data.get("id", ""))
                    return True, payment_url, external_id
                else:
                    logger.error(f"[KASSA24] Failed to create payment: {data}")
                    return False, None, None
        except Exception as e:
            logger.error(f"[KASSA24] HTTP error on create_payment: {e}")
            return False, None, None

    def validate_callback(self, payload: Dict[str, Any]) -> bool:
        """
        Проверка подписи/валидности callback.
        Пока просто возвращаем True, но здесь должна быть сверка HASH или статуса.
        """
        # Если есть secret_key, можно посчитать хеш. Для примера считаем всегда валидным:
        return True

kassa24_service = Kassa24Service()

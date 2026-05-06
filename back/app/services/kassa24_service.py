import httpx
from typing import Dict, Any, Tuple
from app.core.config import settings
from app.core.logger import logger

class Kassa24Service:
    def __init__(self):
        # Правильный URL согласно документации Kassa24
        self.api_url = settings.KASSA24_API_URL or "https://ecommerce.pult24.kz"
        # merchantId = логин (по документации: "Продублировать логин в это поле")
        self.merchant_id = settings.KASSA24_LOGIN
        self.login = settings.KASSA24_LOGIN
        self.password = settings.KASSA24_PASSWORD
        self.is_demo = settings.KASSA24_DEMO
        self.return_url = settings.KASSA24_RETURN_URL
        self.callback_url = settings.KASSA24_CALLBACK_URL
        self.success_url = settings.KASSA24_SUCCESS_URL
        self.fail_url = settings.KASSA24_FAIL_URL

    async def create_payment(self, order_id: str, amount_kzt: int, description: str) -> Tuple[bool, str | None, str | None]:
        """
        Создает платеж в Kassa24.
        Возвращает: (success, payment_url, external_id)
        """
        if not settings.KASSA24_ENABLED:
            logger.warning("[KASSA24] Integration disabled in config")
            return False, None, None

        # Согласно документации: https://ecommerce.pult24.kz/payment/create
        endpoint = f"{self.api_url}/payment/create"

        payload = {
            # merchantId = логин (по документации Kassa24)
            "merchantId": self.merchant_id,
            "orderId": order_id,
            "amount": amount_kzt * 100,  # В тиынах: 1 KZT = 100 тиын
            "description": description,
            "callbackUrl": self.callback_url,
            "demo": self.is_demo,
        }

        # returnUrl или пара successUrl/failUrl (если есть — returnUrl игнорируется)
        if self.success_url and self.fail_url:
            payload["successUrl"] = self.success_url
            payload["failUrl"] = self.fail_url
        elif self.return_url:
            payload["returnUrl"] = self.return_url

        try:
            logger.info(f"[KASSA24] Creating payment: order={order_id}, amount={amount_kzt} KZT")
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    endpoint,
                    json=payload,
                    auth=(self.login, self.password),
                    timeout=15.0
                )
                resp.raise_for_status()
                data = resp.json()

                # Ответ по документации: {"url": "...", "id": "..."}
                payment_url = data.get("url")
                external_id = str(data.get("id", ""))

                if payment_url:
                    logger.info(f"[KASSA24] Payment created: id={external_id}, url={payment_url}")
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

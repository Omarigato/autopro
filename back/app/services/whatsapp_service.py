import httpx

from app.core.logger import logger
from app.core.config import settings


class WhatsAppService:
    """
    Сервис для взаимодействия с внешним WhatsApp API.

    Ожидаемые переменные окружения:
      WHATSAPP_API_URL  - базовый URL вашего провайдера (например, https://api.mywa.com/send)
      WHATSAPP_API_TOKEN - токен авторизации (Bearer / API key)

    Формат запроса можно адаптировать под конкретного провайдера.
    Сейчас отправляем JSON:
      { "phone_number": "+7...", "message": "..." }
    с заголовком Authorization: Bearer <token>.
    """

    async def _post_message(self, phone_number: str, message: str) -> bool:
        if not settings.WHATSAPP_API_URL or not settings.WHATSAPP_API_TOKEN:
            logger.error("WhatsApp API не настроен: проверьте WHATSAPP_API_URL и WHATSAPP_API_TOKEN в .env")
            return False

        payload = {
            "phone_number": phone_number,
            "message": message,
        }
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
            "Content-Type": "application/json",
        }

        try:
            logger.info(f"[WHATSAPP] Sending to {phone_number}: {message}")
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(settings.WHATSAPP_API_URL, json=payload, headers=headers)
                resp.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"[WHATSAPP] Error sending to {phone_number}: {e}")
            return False

    async def send_otp(self, phone_number: str, otp_code: str) -> bool:
        """
        Отправка OTP-кода пользователю.
        """
        message = (
            f"🔑 *Код подтверждения AutoPro*\n\n"
            f"Ваш код: *{otp_code}*\n\n"
            f"⚠️ Пожалуйста, никому не сообщайте этот код."
        )
        return await self._post_message(phone_number, message)

    async def send_notification(self, phone_number: str, text: str) -> bool:
        """
        Отправка произвольного текстового сообщения.
        """
        return await self._post_message(phone_number, text)


whatsapp_service = WhatsAppService()


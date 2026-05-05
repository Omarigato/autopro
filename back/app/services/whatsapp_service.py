import httpx

from app.core.logger import logger
from app.core.config import settings


def _normalize_phone(phone: str) -> str:
    """Номер только цифрами: 77056948240."""
    return "".join(c for c in phone if c.isdigit())


class WhatsAppAltService:
    """
    WhatsApp через Whapi.Cloud: POST {base}/messages/text.
    Body: { "to": "77056948240", "body": "текст" }
    """
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self._text_url = f"{self.base_url}/messages/text"

    async def send_otp(self, phone_number: str, otp_code: str) -> bool:
        message = (
            f"🔑 *Код подтверждения AutoRentGo*\n\n"
            f"Ваш код: *{otp_code}*\n\n"
            f"⚠️ Пожалуйста, никому не сообщайте этот код."
        )
        return await self._post_text(phone_number, message)

    async def send_notification(self, phone_number: str, text: str) -> bool:
        return await self._post_text(phone_number, text)

    async def _post_text(self, phone_number: str, body: str) -> bool:
        to = _normalize_phone(phone_number)
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}",
        }
        payload = {"to": to, "body": body}
        try:
            logger.info(f"[WHATSAPP_ALT] Sending to {phone_number}: {body[:50]}...")
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(self._text_url, json=payload, headers=headers)
                resp.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"[WHATSAPP_ALT] Error sending to {phone_number}: {e}")
            return False


class WhatsAppCloudService:
    """Facebook WhatsApp Cloud API (graph.facebook.com)."""
    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token

    async def send_otp(self, phone_number: str, otp_code: str) -> bool:
        message = (
            f"🔑 *Код подтверждения AutoRentGo*\n\n"
            f"Ваш код: *{otp_code}*\n\n"
            f"⚠️ Пожалуйста, никому не сообщайте этот код."
        )
        return await self._post_message(phone_number, message)

    async def send_notification(self, phone_number: str, text: str) -> bool:
        return await self._post_message(phone_number, text)

    async def _post_message(self, phone_number: str, message: str) -> bool:
        to = _normalize_phone(phone_number)
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"preview_url": False, "body": message},
        }
        try:
            logger.info(f"[WHATSAPP_CLOUD] Sending to {phone_number}: {message[:50]}...")
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(self.url, json=payload, headers=headers)
                resp.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"[WHATSAPP_CLOUD] Error sending to {phone_number}: {e}")
            return False


class WhatsAppService:
    """
    Единая точка отправки в WhatsApp.
    Если заданы WHATSAPP_ALT_API_URL и WHATSAPP_ALT_API_TOKEN — используется альтернативный API (POST /api/messages/text).
    Иначе, если заданы WHATSAPP_API_URL (graph.facebook.com) и WHATSAPP_API_TOKEN — Cloud API.
    """
    def __init__(self):
        self._impl = None
        if settings.WHATSAPP_ALT_API_URL and settings.WHATSAPP_ALT_API_TOKEN:
            self._impl = WhatsAppAltService(
                settings.WHATSAPP_ALT_API_URL,
                settings.WHATSAPP_ALT_API_TOKEN,
            )
            logger.info("[WHATSAPP] Using ALT API (POST /api/messages/text)")
        elif settings.WHATSAPP_API_URL and settings.WHATSAPP_API_TOKEN and "graph.facebook.com" in settings.WHATSAPP_API_URL:
            self._impl = WhatsAppCloudService(
                settings.WHATSAPP_API_URL,
                settings.WHATSAPP_API_TOKEN,
            )
            logger.info("[WHATSAPP] Using Cloud API (graph.facebook.com)")
        else:
            if not (settings.WHATSAPP_API_URL and settings.WHATSAPP_API_TOKEN):
                logger.warning("WhatsApp API не настроен: задайте WHATSAPP_ALT_API_URL/TOKEN или WHATSAPP_API_URL/TOKEN в .env")

    async def send_otp(self, phone_number: str, otp_code: str) -> bool:
        if not self._impl:
            return False
        return await self._impl.send_otp(phone_number, otp_code)

    async def send_notification(self, phone_number: str, text: str) -> bool:
        if not self._impl:
            return False
        return await self._impl.send_notification(phone_number, text)


whatsapp_service = WhatsAppService()


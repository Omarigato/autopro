import httpx
from app.core.logger import logger
from app.core.config import settings

def _normalize_phone(phone: str) -> str:
    """Номер только цифрами: +77056948240."""
    phone = phone.replace("+", "")
    digits = "".join(c for c in phone if c.isdigit())
    return "+" + digits if digits else ""

class WhatsAppLocalGatewayService:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self._send_url = f"{self.base_url}/messages/send"

    async def send_otp(self, phone_number: str, otp_code: str) -> bool:
        message = (
            f"🔑 *Код подтверждения AutoPro*\n\n"
            f"Ваш код: *{otp_code}*\n\n"
            f"⚠️ Пожалуйста, никому не сообщайте этот код."
        )
        return await self._post_message(phone_number, message)

    async def send_notification(self, phone_number: str, text: str) -> bool:
        return await self._post_message(phone_number, text)

    async def _post_message(self, phone_number: str, message: str) -> bool:
        to = _normalize_phone(phone_number)
        if not to:
            logger.error(f"[WHATSAPP_GATEWAY] Invalid phone number: {phone_number}")
            return False
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}",
        }
        payload = {"phone": to, "message": message}
        try:
            logger.info(f"[WHATSAPP_GATEWAY] Sending to {to}: {message[:50]}...")
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(self._send_url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                if not data.get("success"):
                    logger.error(f"[WHATSAPP_GATEWAY] Gateway returned error: {data.get('error')}")
                    return False
            return True
        except Exception as e:
            logger.error(f"[WHATSAPP_GATEWAY] HTTP Error sending to {to}: {e}")
            return False

class WhatsAppService:
    def __init__(self):
        self._impl = None
        if settings.WHATSAPP_ENABLED and settings.WHATSAPP_GATEWAY_URL and settings.WHATSAPP_GATEWAY_TOKEN:
            self._impl = WhatsAppLocalGatewayService(
                settings.WHATSAPP_GATEWAY_URL,
                settings.WHATSAPP_GATEWAY_TOKEN,
            )
            logger.info("[WHATSAPP] Using Local Gateway")
        else:
            logger.warning("[WHATSAPP] Disabled or missing WHATSAPP_GATEWAY_URL/TOKEN in config")

    async def send_otp(self, phone_number: str, otp_code: str) -> bool:
        if not self._impl:
            return False
        return await self._impl.send_otp(phone_number, otp_code)

    async def send_notification(self, phone_number: str, text: str) -> bool:
        if not self._impl:
            return False
        return await self._impl.send_notification(phone_number, text)

whatsapp_service = WhatsAppService()

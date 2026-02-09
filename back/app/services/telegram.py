import httpx

from app.core.config import settings


async def send_new_application_message(text: str) -> None:
    """
    Отправка сообщения в Telegram‑чат при создании заявки/объявления.
    Работает только если заданы TELEGRAM_NOTIFICATION_BOT_TOKEN и TELEGRAM_ADMIN_CHAT_ID.
    """
    if not settings.TELEGRAM_NOTIFICATION_BOT_TOKEN or not settings.TELEGRAM_ADMIN_CHAT_ID:
        return

    url = (
        f"https://api.telegram.org/bot{settings.TELEGRAM_NOTIFICATION_BOT_TOKEN}/sendMessage"
    )
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(
            url,
            json={
                "chat_id": settings.TELEGRAM_ADMIN_CHAT_ID,
                "text": text,
                "parse_mode": "HTML",
                "disable_web_page_preview": True,
            },
        )


from email.mime.text import MIMEText

import aiosmtplib

from app.core.logger import logger
from app.core.config import settings


class EmailService:
    """
    Реальный SMTP‑сервис для отправки писем.

    Требуемые переменные в .env:
      SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_USE_TLS, EMAIL_FROM
    """

    async def _send(
        self,
        to_email: str,
        subject: str,
        body: str,
    ) -> bool:
        if not settings.SMTP_HOST or not settings.EMAIL_FROM:
            logger.error("SMTP не настроен: проверьте SMTP_HOST и EMAIL_FROM в .env")
            return False

        message = MIMEText(body, "plain", "utf-8")
        message["From"] = settings.EMAIL_FROM
        message["To"] = to_email
        message["Subject"] = subject

        try:
            logger.info(f"[EMAIL] Sending to {to_email} | subject={subject}")
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT or (587 if settings.SMTP_USE_TLS else 25),
                start_tls=settings.SMTP_USE_TLS,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
            )
            return True
        except Exception as e:
            logger.error(f"[EMAIL] Error sending to {to_email}: {e}")
            return False

    async def send_otp(self, email: str, otp_code: str) -> bool:
        """
        Отправка OTP‑кода на email.
        """
        subject = "Ваш код подтверждения AutoPro"
        body = (
            f"Здравствуйте!\n\n"
            f"Ваш код для входа в приложение AutoPro: {otp_code}\n\n"
            f"Никому не сообщайте этот код. Если вы не запрашивали код, просто проигнорируйте это сообщение.\n\n"
            f"С уважением,\n"
            f"Команда AutoPro"
        )
        return await self._send(email, subject, body)

    async def send_notification(self, email: str, subject: str, text: str) -> bool:
        return await self._send(email, subject, text)

    async def send_password_reset(self, email: str, new_password: str) -> bool:
        """
        Отправка нового пароля пользователю после сброса админом.
        """
        subject = "Новый пароль для входа в AutoPro"
        body = (
            f"Здравствуйте!\n\n"
            f"Администратор сбросил ваш пароль. Ваш новый временный пароль для входа:\n\n"
            f"  {new_password}\n\n"
            f"Рекомендуем сменить его после входа в личном кабинете.\n"
            f"Никому не сообщайте этот пароль.\n\n"
            f"С уважением,\n"
            f"Команда AutoPro"
        )
        return await self._send(email, subject, body)


email_service = EmailService()


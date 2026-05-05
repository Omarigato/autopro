from email.mime.text import MIMEText
import os
import aiosmtplib
from jinja2 import Environment, FileSystemLoader

from app.core.logger import logger
from app.core.config import settings
from app.models import Application, Car
from sqlalchemy.orm import Session

# Определение пути к шаблонам
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "email")
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


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
        subtype: str = "plain"
    ) -> bool:
        if not settings.SMTP_HOST or not settings.EMAIL_FROM:
            logger.error("SMTP не настроен: проверьте SMTP_HOST и EMAIL_FROM в .env")
            return False

        message = MIMEText(body, subtype, "utf-8")
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
        Отправка OTP‑кода на email (HTML).
        """
        subject = "Ваш код подтверждения AutoRentGo"
        try:
            template = jinja_env.get_template("otp.html")
            html_content = template.render(otp_code=otp_code)
            return await self._send(email, subject, html_content, subtype="html")
        except Exception as e:
            logger.error(f"Error rendering OTP template: {e}")
            # Fallback to plain text if template fails
            body = f"Ваш код для входа в AutoRentGo: {otp_code}"
            return await self._send(email, subject, body)

    async def send_notification(self, email: str, subject: str, text: str, action_url: str = None) -> bool:
        """
        Отправка общего уведомления (HTML).
        """
        try:
            template = jinja_env.get_template("notification.html")
            html_content = template.render(
                title=subject,
                message=text,
                action_url=action_url,
                action_text="Перейти в приложение"
            )
            return await self._send(email, subject, html_content, subtype="html")
        except Exception as e:
            logger.error(f"Error rendering notification template: {e}")
            return await self._send(email, subject, text)

    async def send_password_reset(self, email: str, new_password: str) -> bool:
        """
        Отправка нового пароля пользователю (HTML).
        """
        subject = "Новый пароль для входа в AutoRentGo"
        login_url = f"{settings.FRONTEND_BASE_URL}/login"
        try:
            template = jinja_env.get_template("password_reset.html")
            html_content = template.render(new_password=new_password, login_url=login_url)
            return await self._send(email, subject, html_content, subtype="html")
        except Exception as e:
            logger.error(f"Error rendering password_reset template: {e}")
            body = (
                f"Здравствуйте!\n\n"
                f"Ваш новый временный пароль для входа в AutoRentGo: {new_password}\n\n"
                f"Рекомендуем сменить его после входа.\n"
                f"С уважением, Команда AutoRentGo"
            )
            return await self._send(email, subject, body)

    async def send_new_car_for_applications(self, car: Car) -> bool:

        special_applications = db.query(Application).filter(Application.city_id == car.city_id 
        and Application.status == "ACTIVE"
        and Application.marka_id == car.marka_id
        and Application.model_id == car.model_id
        ).all()

        users = db.query(User).filter(User.id.in_([app.user_id for app in special_applications])).all()

        for user in users:
            """
            Отправка уведомления о новом автомобиле для заявки (HTML).
            """
            subject = "Новый автомобиль для вашей заявки"
            try:
                template = jinja_env.get_template("new_car_for_application.html")
                html_content = template.render(car_name=car_name)
                return await self._send(email, subject, html_content, subtype="html")
            except Exception as e:
                logger.error(f"Error rendering new_car_for_application template: {e}")
                body = (
                    f"Здравствуйте!\n\n"
                    f"Новый автомобиль добавлен в вашу заявку: {car_name}\n\n"
                    f"С уважением, Команда AutoRentGo"
                )
                return await self._send(email, subject, body)

email_service = EmailService()


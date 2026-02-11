import hashlib
import hmac
import httpx
from sqlalchemy.orm import Session
from app.models.entities import PaymentAccount, PaymentTransaction, OwnerSubscription
from app.core.logger import logger

class PaymentService:
    """
    Интеграция с платежными системами Kassa24 и Kaspi.
    """

    @staticmethod
    async def create_kassa24_payment(
        db: Session, 
        subscription: OwnerSubscription, 
        amount: int, 
        order_id: str
    ):
        """
        Создание счета в Kassa24.
        """
        # Получаем настройки аккаунта Kassa24
        account = db.query(PaymentAccount).filter(
            PaymentAccount.provider == "kassa24", 
            PaymentAccount.is_active == True
        ).first()

        if not account:
            logger.error("Активный аккаунт Kassa24 не найден в базе")
            return None

        # Формируем данные для API Kassa24 (примерная структура)
        # Реальная интеграция требует соблюдения протокола Kassa24 (XML или JSON)
        payload = {
            "merchant_id": account.merchant_id,
            "order_id": order_id,
            "amount": amount,
            "demo": account.demo,
            "callback_url": f"https://api.autopro.kz/v1/payments/kassa24/callback"
        }
        
        logger.info(f"Инициализация платежа Kassa24 для заказа {order_id}")
        
        # В режиме демо просто возвращаем тестовую ссылку
        if account.demo:
            return f"https://demo.kassa24.kz/payment/{order_id}"
            
        return f"https://kassa24.kz/pay/{order_id}"

    @staticmethod
    async def create_kaspi_payment(
        db: Session, 
        subscription: OwnerSubscription, 
        amount: int, 
        order_id: str
    ):
        """
        Создание счета для Kaspi (обычно формирование ссылки для Kaspi.kz)
        """
        account = db.query(PaymentAccount).filter(
            PaymentAccount.provider == "kaspi", 
            PaymentAccount.is_active == True
        ).first()

        if not account:
            return None

        # Для Kaspi часто используется формирование ссылки вида:
        # https://kaspi.kz/pay/StoreName?service_id=123&amount=...
        
        logger.info(f"Инициализация платежа Kaspi для заказа {order_id}")
        
        return f"https://kaspi.kz/pay/AutoPro?amount={amount}&order_id={order_id}"

    @staticmethod
    async def handle_callback(db: Session, provider: str, data: dict):
        """
        Обработка уведомления об оплате от провайдера.
        """
        logger.info(f"Получен webhook от {provider}: {data}")
        # 1. Проверка подписи (Signature)
        # 2. Поиск транзакции по order_id
        # 3. Обновление статуса транзакции и активация подписки
        return True

payment_service = PaymentService()

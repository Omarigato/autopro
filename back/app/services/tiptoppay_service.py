"""
Интеграция с платёжной системой TipTopPay.
Документация: https://tiptoppay.net/
Параметры: Public ID (сайт), API Secret — настраиваются в админке (PaymentAccount, provider=tiptoppay).
"""
import httpx
from sqlalchemy.orm import Session

from app.models import PaymentAccount, PaymentTransaction, OwnerSubscription, SubscriptionPlan
from app.core.logger import logger


class TipTopPayError(Exception):
    pass


def _get_active_tiptoppay_account(db: Session) -> PaymentAccount | None:
    return (
        db.query(PaymentAccount)
        .filter(
            PaymentAccount.provider == "tiptoppay",
            PaymentAccount.is_active.is_(True),
        )
        .first()
    )


async def create_tiptoppay_payment(
    db: Session,
    transaction: PaymentTransaction,
    subscription: OwnerSubscription,
    plan: SubscriptionPlan,
) -> tuple[str, str]:
    """
    Создаёт платёж в TipTopPay и возвращает (payment_url, external_id).
    В PaymentAccount для provider=tiptoppay: login = Public ID, password = API Secret.
    """
    account = _get_active_tiptoppay_account(db)
    if not account:
        raise TipTopPayError("Не настроен платёжный аккаунт TipTopPay в админке")

    amount_kzt = plan.price_kzt
    # TipTopPay: Public ID = login, API Secret = password
    public_id = account.login
    api_secret = account.password

    # Пример запроса к API TipTopPay (уточните endpoint и формат в документации TipTopPay)
    payload = {
        "public_id": public_id,
        "amount": amount_kzt,
        "order_id": transaction.order_id,
        "description": f"Подписка {plan.name}",
        "callback_url": account.callback_url or "",
        "success_url": account.success_url or "",
        "fail_url": account.fail_url or "",
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_secret}",
    }

    # Базовый URL API TipTopPay — замените на актуальный из документации
    create_url = "https://api.tiptoppay.net/v1/payments/create"

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            response = await client.post(create_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as e:
            logger.exception("TipTopPay HTTP error: %s", e)
            raise TipTopPayError(f"Ошибка TipTopPay: {e}") from e

    payment_url = data.get("payment_url") or data.get("url") or data.get("redirect_url")
    external_id = data.get("id") or data.get("transaction_id") or str(transaction.id)

    if not payment_url:
        raise TipTopPayError("TipTopPay не вернул ссылку на оплату")

    return str(payment_url), str(external_id)


def handle_tiptoppay_callback(db: Session, payload: dict) -> bool:
    """
    Обработка webhook от TipTopPay (Check / Pay / Refund).
    Возвращает True при успешной обработке.
    """
    logger.info("TipTopPay callback: %s", payload)

    order_id = str(payload.get("order_id", ""))
    status = payload.get("status", payload.get("state", "")).lower()

    transaction = (
        db.query(PaymentTransaction)
        .filter(
            PaymentTransaction.provider == "tiptoppay",
            PaymentTransaction.order_id == order_id,
        )
        .first()
    )

    if not transaction:
        return True

    transaction.raw_data = payload

    if status in ("paid", "success", "completed", "1"):
        transaction.status = "success"
        sub = transaction.subscription
        if sub:
            from app.services.subscriptions_service import activate_subscription_after_success_payment
            has_other = (
                db.query(OwnerSubscription)
                .filter(
                    OwnerSubscription.owner_id == sub.owner_id,
                    OwnerSubscription.id != sub.id,
                    OwnerSubscription.status == "active",
                )
                .count()
                > 0
            )
            activate_subscription_after_success_payment(
                db=db,
                subscription=sub,
                is_first_subscription=not has_other,
            )
    else:
        transaction.status = "failed"
        if transaction.subscription:
            transaction.subscription.status = "failed"

    from datetime import datetime
    transaction.update_date = datetime.utcnow()
    db.commit()
    return True

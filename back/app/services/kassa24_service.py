import base64
from typing import Tuple

import httpx
from sqlalchemy.orm import Session

from app.models.entities import OwnerSubscription, PaymentAccount, PaymentTransaction, SubscriptionPlan


KASSA24_CREATE_URL = "https://ecommerce.pult24.kz/payment/create"


class Kassa24Error(RuntimeError):
    pass


def _get_active_kassa24_account(db: Session) -> PaymentAccount:
    account = (
        db.query(PaymentAccount)
        .filter(PaymentAccount.provider == "kassa24", PaymentAccount.is_active.is_(True))
        .first()
    )
    if not account:
        raise Kassa24Error("Не настроен платёжный аккаунт Kassa24")
    return account


async def create_kassa24_payment(
    db: Session,
    transaction: PaymentTransaction,
    subscription: OwnerSubscription,
    plan: SubscriptionPlan,
) -> Tuple[str, str]:
    """
    Создаёт платёж в Kassa24 и возвращает (payment_url, external_id).
    """

    account = _get_active_kassa24_account(db)

    amount_tiyn = plan.price_kzt * 100  # 1 тенге = 100 тиын

    body: dict = {
        "merchantId": account.merchant_id,
        "amount": amount_tiyn,
        "orderId": transaction.order_id,
        "description": f"Подписка {plan.name} для владельца #{subscription.owner_id}",
        "demo": account.demo,
    }

    if account.callback_url:
        body["callbackUrl"] = account.callback_url
    if account.return_url:
        body["returnUrl"] = account.return_url
    if account.success_url:
        body["successUrl"] = account.success_url
    if account.fail_url:
        body["failUrl"] = account.fail_url

    credentials = f"{account.login}:{account.password}"
    auth_header = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {auth_header}",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(KASSA24_CREATE_URL, json=body, headers=headers)
        try:
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise Kassa24Error(f"Kassa24 HTTP error: {exc}") from exc

    data = response.json()
    payment_url = data.get("url")
    external_id = data.get("id")

    if not payment_url or not external_id:
        raise Kassa24Error("Некорректный ответ от Kassa24 (нет url или id)")

    return str(payment_url), str(external_id)


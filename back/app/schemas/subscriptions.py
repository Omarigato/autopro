from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class SubscriptionPlanResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    price_kzt: int
    period_days: int
    free_days: int
    max_cars: Optional[int] = None

    class Config:
        from_attributes = True


class BuySubscriptionRequest(BaseModel):
    plan_id: int = Field(..., description="ID тарифа подписки")
    provider: Literal["kassa24", "kaspi"] = Field(
        default="kassa24", description="Платёжный провайдер"
    )


class BuySubscriptionResponse(BaseModel):
    transaction_id: int
    payment_url: str


class OwnerSubscriptionStatusResponse(BaseModel):
    plan: SubscriptionPlanResponse
    status: str
    started_at: datetime | None
    valid_until: datetime | None
    trial_until: datetime | None

*** End Patch***"} -->
+++++++++assistant to=functions.ApplyPatchобритuser to=functions.ApplyPatchicipants +#+#+#+#+#+assistant to=functions.ApplyPatch.SerializedNameյա to=functions.ApplyPatchัจ to=functions.ApplyPatchassistant to=functions.ApplyPatch	RTLRassistant to=functions.ApplyPatch:@"%@"Overallassistant to=functions.ApplyPatchschirm to=functions.ApplyPatchassistant to=functions.ApplyPatch((&___assistant to=functions.ApplyPatch:-------------</assistant to=functions.ApplyPatch​ន to=functions.ApplyPatchassistant to=functions.ApplyPatch RichTextBox to=functions.ApplyPatchassistant to=functions.ApplyPatch:@"%@*** Begin Patch

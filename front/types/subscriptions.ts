export interface SubscriptionPlanResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  price_kzt: number;
  period_days: number;
  free_days: number;
  max_cars?: number;
}

export interface BuySubscriptionRequest {
  plan_id: number;
  provider: "kassa24" | "kaspi";
}

export interface BuySubscriptionResponse {
  transaction_id: number;
  payment_url: string;
}

export interface OwnerSubscriptionStatusResponse {
  plan: SubscriptionPlanResponse;
  status: string;
  started_at?: string;
  valid_until?: string;
  trial_until?: string;
}

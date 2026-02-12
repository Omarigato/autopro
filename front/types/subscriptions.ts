export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  period: number;
  description?: string;
  features?: string[];
}

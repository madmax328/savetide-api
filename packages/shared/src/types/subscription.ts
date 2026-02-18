export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  amount: number;
  currency: 'EUR' | 'USD';
}

export interface CheckoutResponse {
  clientSecret: string;
  subscriptionId: string;
}

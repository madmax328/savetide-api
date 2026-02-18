import api from './api';

export interface SubscriptionStatus {
  status: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
}

export interface CheckoutResult {
  sessionId: string;
  url: string | null;
}

/**
 * Create a Stripe Checkout Session.
 * Returns the checkout URL for web redirect (Expo Go compatible).
 */
export async function createCheckout(country: string = 'FR'): Promise<CheckoutResult> {
  const { data } = await api.post('/subscription/create-checkout', { country });
  return data;
}

/**
 * Get current subscription status.
 */
export async function getStatus(): Promise<SubscriptionStatus> {
  const { data } = await api.get('/subscription/status');
  return data;
}

/**
 * Cancel subscription at period end.
 */
export async function cancelSubscription(): Promise<void> {
  await api.post('/subscription/cancel');
}

/**
 * Reactivate a canceled subscription.
 */
export async function reactivateSubscription(): Promise<void> {
  await api.post('/subscription/reactivate');
}

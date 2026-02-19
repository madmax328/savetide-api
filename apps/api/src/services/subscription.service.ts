import Stripe from 'stripe';
import { User } from '../models/User';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Stripe client — lazy init, only when STRIPE_SECRET_KEY is set
// ---------------------------------------------------------------------------

const STRIPE_CONFIGURED = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.length > 3);

const stripe = STRIPE_CONFIGURED
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

function requireStripe(): Stripe {
  if (!STRIPE_CONFIGURED || !stripe) {
    throw new Error(
      'Stripe is not configured. Please set STRIPE_SECRET_KEY, STRIPE_PRICE_ID_EUR, and STRIPE_PRICE_ID_USD in your environment variables on Railway.',
    );
  }
  return stripe;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the current_period_end from a Stripe Subscription.
 * In the 2025 API, this lives on the subscription items, not the top-level
 * subscription object. We take the maximum across all items.
 */
function getPeriodEnd(subscription: Stripe.Subscription): Date {
  const items = subscription.items?.data ?? [];
  if (items.length > 0) {
    const maxEnd = Math.max(...items.map((i) => i.current_period_end));
    return new Date(maxEnd * 1000);
  }
  // Fallback: use cancel_at or created + 30 days
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  return new Date(subscription.created * 1000 + 30 * 24 * 60 * 60 * 1000);
}

/**
 * Extract a subscription ID from an Invoice object.
 * In the 2025 API, `subscription` is no longer a top-level field.
 * It lives in `parent.subscription_details.subscription`.
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  // Try new structure first
  const parent = (invoice as any).parent;
  if (parent?.subscription_details?.subscription) {
    const sub = parent.subscription_details.subscription;
    return typeof sub === 'string' ? sub : sub.id;
  }
  // Fallback for older API versions (belt-and-suspenders)
  if ((invoice as any).subscription) {
    const sub = (invoice as any).subscription;
    return typeof sub === 'string' ? sub : sub.id;
  }
  return null;
}

function getAppBaseUrl(): string {
  return env.NODE_ENV === 'production'
    ? 'https://savetide-api-production.up.railway.app'
    : `http://localhost:${env.PORT}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Checkout Session for the given user.
 * Returns the session URL (for web redirect) and the session ID.
 */
export async function createCheckoutSession(
  userId: string,
  country: string = 'FR',
): Promise<{ sessionId: string; url: string | null }> {
  const s = requireStripe();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Create or reuse Stripe Customer
  let customerId = user.subscription.stripeCustomerId;

  if (!customerId) {
    const customer = await s.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim() || undefined,
      metadata: { userId: user._id.toString() },
    });
    customerId = customer.id;

    user.subscription.stripeCustomerId = customerId;
    await user.save();

    logger.info({ userId, customerId }, 'Created Stripe customer');
  }

  // Select price ID based on country
  const priceId = country === 'US' ? env.STRIPE_PRICE_ID_USD : env.STRIPE_PRICE_ID_EUR;

  if (!priceId) {
    throw new Error('Stripe price ID not configured for this country. Set STRIPE_PRICE_ID_EUR and STRIPE_PRICE_ID_USD on Railway.');
  }

  // Create Checkout Session
  const session = await s.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getAppBaseUrl()}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getAppBaseUrl()}/subscription/cancel`,
    metadata: { userId: user._id.toString() },
    subscription_data: {
      metadata: { userId: user._id.toString() },
    },
  });

  logger.info({ userId, sessionId: session.id }, 'Stripe Checkout session created');

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Get the current subscription status for a user.
 */
export async function getSubscriptionStatus(userId: string) {
  const user = await User.findById(userId).select('subscription');
  if (!user) throw new Error('User not found');

  return {
    status: user.subscription.status,
    currentPeriodEnd: user.subscription.currentPeriodEnd,
    cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
    stripeSubscriptionId: user.subscription.stripeSubscriptionId,
  };
}

/**
 * Cancel a subscription (at period end — user keeps premium until expiry).
 */
export async function cancelSubscription(userId: string): Promise<void> {
  const s = requireStripe();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const subId = user.subscription.stripeSubscriptionId;
  if (!subId) throw new Error('No active subscription');

  await s.subscriptions.update(subId, {
    cancel_at_period_end: true,
  });

  user.subscription.status = 'canceled';
  user.subscription.cancelAtPeriodEnd = true;
  await user.save();

  logger.info({ userId, subId }, 'Subscription canceled at period end');
}

/**
 * Reactivate a canceled subscription (undo cancel_at_period_end).
 */
export async function reactivateSubscription(userId: string): Promise<void> {
  const s = requireStripe();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const subId = user.subscription.stripeSubscriptionId;
  if (!subId) throw new Error('No subscription to reactivate');

  await s.subscriptions.update(subId, {
    cancel_at_period_end: false,
  });

  user.subscription.status = 'active';
  user.subscription.cancelAtPeriodEnd = false;
  await user.save();

  logger.info({ userId, subId }, 'Subscription reactivated');
}

// ---------------------------------------------------------------------------
// Webhook handlers
// ---------------------------------------------------------------------------

/**
 * Verify and parse a Stripe webhook event.
 */
export function constructWebhookEvent(
  rawBody: Buffer,
  signature: string,
): Stripe.Event {
  const s = requireStripe();
  return s.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );
}

/**
 * Handle all relevant Stripe webhook events.
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  logger.info({ type: event.type, id: event.id }, 'Processing Stripe webhook');

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    default:
      logger.info({ type: event.type }, 'Unhandled Stripe event type');
  }
}

// ---------------------------------------------------------------------------
// Webhook event handlers (private)
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const s = requireStripe();
  const userId = session.metadata?.userId;
  if (!userId) {
    logger.warn({ sessionId: session.id }, 'Checkout completed without userId in metadata');
    return;
  }

  const subscriptionId = session.subscription as string;

  const user = await User.findById(userId);
  if (!user) {
    logger.warn({ userId }, 'User not found for checkout completion');
    return;
  }

  // Fetch subscription details from Stripe (includes items with period_end)
  const subscription = await s.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data'],
  });

  user.subscription.status = 'active';
  user.subscription.stripeSubscriptionId = subscriptionId;
  user.subscription.currentPeriodEnd = getPeriodEnd(subscription);
  user.subscription.cancelAtPeriodEnd = false;
  await user.save();

  logger.info({ userId, subscriptionId }, 'User subscription activated via checkout');
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const s = requireStripe();
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscriptionId,
  });

  if (!user) {
    logger.warn({ subscriptionId }, 'No user found for paid invoice');
    return;
  }

  // Update period end from the subscription
  const subscription = await s.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data'],
  });

  user.subscription.status = 'active';
  user.subscription.currentPeriodEnd = getPeriodEnd(subscription);
  user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
  await user.save();

  logger.info({ userId: user._id, subscriptionId }, 'Invoice paid — subscription renewed');
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscriptionId,
  });

  if (!user) return;

  user.subscription.status = 'past_due';
  await user.save();

  logger.warn({ userId: user._id, subscriptionId }, 'Invoice payment failed — status set to past_due');
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscription.id,
  });

  if (!user) return;

  user.subscription.currentPeriodEnd = getPeriodEnd(subscription);
  user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;

  if (subscription.status === 'active') {
    user.subscription.status = 'active';
  } else if (subscription.status === 'past_due') {
    user.subscription.status = 'past_due';
  } else if (subscription.status === 'canceled') {
    user.subscription.status = 'canceled';
  }

  await user.save();

  logger.info(
    { userId: user._id, stripeStatus: subscription.status },
    'Subscription updated via webhook',
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscription.id,
  });

  if (!user) return;

  user.subscription.status = 'free';
  user.subscription.stripeSubscriptionId = null;
  user.subscription.currentPeriodEnd = null;
  user.subscription.cancelAtPeriodEnd = false;
  await user.save();

  logger.info({ userId: user._id }, 'Subscription deleted — user downgraded to free');
}

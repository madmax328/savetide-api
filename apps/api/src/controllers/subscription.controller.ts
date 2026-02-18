import { Request, Response } from 'express';
import * as subscriptionService from '../services/subscription.service';
import { logger } from '../utils/logger';

/**
 * POST /subscription/create-checkout
 * Creates a Stripe Checkout Session and returns the URL to redirect to.
 */
export async function createCheckout(req: Request, res: Response): Promise<void> {
  try {
    const { country } = req.body || {};
    const result = await subscriptionService.createCheckoutSession(
      req.userId!,
      country || 'FR',
    );
    res.json(result);
  } catch (error: any) {
    logger.error({ error }, 'Create checkout failed');
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}

/**
 * GET /subscription/status
 */
export async function getStatus(req: Request, res: Response): Promise<void> {
  try {
    const status = await subscriptionService.getSubscriptionStatus(req.userId!);
    res.json(status);
  } catch (error: any) {
    logger.error({ error }, 'Get subscription status failed');
    res.status(500).json({ error: error.message || 'Failed to get subscription status' });
  }
}

/**
 * POST /subscription/cancel
 */
export async function cancelSubscription(req: Request, res: Response): Promise<void> {
  try {
    await subscriptionService.cancelSubscription(req.userId!);
    res.json({ message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error: any) {
    logger.error({ error }, 'Cancel subscription failed');
    res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
}

/**
 * POST /subscription/reactivate
 */
export async function reactivateSubscription(req: Request, res: Response): Promise<void> {
  try {
    await subscriptionService.reactivateSubscription(req.userId!);
    res.json({ message: 'Subscription reactivated' });
  } catch (error: any) {
    logger.error({ error }, 'Reactivate subscription failed');
    res.status(500).json({ error: error.message || 'Failed to reactivate subscription' });
  }
}

/**
 * POST /subscription/webhook
 * Stripe webhook endpoint — receives raw body.
 */
export async function webhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  try {
    // req.body is raw Buffer thanks to the express.raw() middleware on this route
    const event = subscriptionService.constructWebhookEvent(
      req.body as Buffer,
      signature,
    );

    await subscriptionService.handleWebhookEvent(event);

    res.json({ received: true });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Stripe webhook error');
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
}

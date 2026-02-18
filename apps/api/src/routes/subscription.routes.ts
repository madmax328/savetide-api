import { Router } from 'express';
import express from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Create checkout session — returns URL for Stripe Checkout
router.post('/create-checkout', authMiddleware, subscriptionController.createCheckout);

// Get current subscription status
router.get('/status', authMiddleware, subscriptionController.getStatus);

// Cancel subscription (at period end)
router.post('/cancel', authMiddleware, subscriptionController.cancelSubscription);

// Reactivate a canceled subscription
router.post('/reactivate', authMiddleware, subscriptionController.reactivateSubscription);

// Stripe webhook — MUST use raw body parser (not JSON)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionController.webhook,
);

export default router;

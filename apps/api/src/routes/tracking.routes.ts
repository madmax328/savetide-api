import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { premiumMiddleware } from '../middleware/premium.middleware';
import * as trackingController from '../controllers/tracking.controller';

const router = Router();

// All tracking routes require authentication + premium subscription
router.use(authMiddleware, premiumMiddleware);

// GET  /api/tracked           — list all tracked products
router.get('/', trackingController.getTrackedProducts);

// POST /api/tracked           — start tracking a product
router.post('/', trackingController.trackProduct);

// GET  /api/tracked/check/:productId — check if tracking
router.get('/check/:productId', trackingController.checkTracking);

// PUT  /api/tracked/:productId/target-price — update target price
router.put('/:productId/target-price', trackingController.updateTargetPrice);

// DELETE /api/tracked/:productId — stop tracking
router.delete('/:productId', trackingController.untrackProduct);

export default router;

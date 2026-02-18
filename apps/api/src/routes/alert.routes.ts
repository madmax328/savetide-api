import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { premiumMiddleware } from '../middleware/premium.middleware';
import * as alertController from '../controllers/alert.controller';

const router = Router();

// All alert routes require authentication + premium subscription
router.use(authMiddleware, premiumMiddleware);

// GET    /api/alerts?productId=xxx — list alerts
router.get('/', alertController.getAlerts);

// POST   /api/alerts              — create alert
router.post('/', alertController.createAlert);

// PUT    /api/alerts/:alertId     — update alert
router.put('/:alertId', alertController.updateAlert);

// DELETE /api/alerts/:alertId     — delete alert
router.delete('/:alertId', alertController.deleteAlert);

export default router;

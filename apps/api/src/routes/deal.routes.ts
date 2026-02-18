import { Router } from 'express';
import * as dealController from '../controllers/deal.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get deals — paginated, filtered by country and category
router.get('/', authMiddleware, dealController.getDeals);

// Get a single deal by ID
router.get('/:id', authMiddleware, dealController.getDealById);

// Manually trigger deal detection (admin / cron endpoint)
router.post('/detect', authMiddleware, dealController.triggerDetection);

export default router;

import { Router } from 'express';
import * as dealController from '../controllers/deal.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get deals — guest-accessible (for home page top deals section)
router.get('/', optionalAuthMiddleware, dealController.getDeals);

// Get a single deal by ID — guest-accessible
router.get('/:id', optionalAuthMiddleware, dealController.getDealById);

// Manually trigger deal detection (admin / cron endpoint)
router.post('/detect', authMiddleware, dealController.triggerDetection);

export default router;

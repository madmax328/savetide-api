import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import dealRoutes from './deal.routes';
import subscriptionRoutes from './subscription.routes';
import trackingRoutes from './tracking.routes';
import alertRoutes from './alert.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/deals', dealRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/tracked', trackingRoutes);
router.use('/alerts', alertRoutes);
router.use('/notifications', notificationRoutes);

export default router;

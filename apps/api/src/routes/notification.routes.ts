import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// POST   /api/notifications/register-token  — register/update push token
router.post('/register-token', notificationController.registerToken);

// DELETE /api/notifications/token            — remove push token
router.delete('/token', notificationController.removeToken);

// GET    /api/notifications/preferences      — get notification prefs
router.get('/preferences', notificationController.getPreferences);

// PUT    /api/notifications/preferences      — update notification prefs
router.put('/preferences', notificationController.updatePreferences);

export default router;

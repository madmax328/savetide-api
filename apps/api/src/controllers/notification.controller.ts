import { Request, Response } from 'express';
import { z } from 'zod';
import * as notificationService from '../services/notification.service';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const registerTokenSchema = z.object({
  token: z.string().min(1, 'Push token is required'),
});

const preferencesSchema = z.object({
  notificationsEnabled: z.boolean(),
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * POST /api/notifications/register-token
 * Register or update the Expo push token for the authenticated user.
 */
export async function registerToken(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    await notificationService.registerPushToken(req.userId!, parsed.data.token);
    res.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Invalid Expo push token') {
      res.status(400).json({ error: 'Invalid Expo push token' });
      return;
    }
    logger.error({ error }, 'Failed to register push token');
    res.status(500).json({ error: 'Failed to register push token' });
  }
}

/**
 * DELETE /api/notifications/token
 * Remove the push token (e.g. on logout).
 */
export async function removeToken(req: Request, res: Response): Promise<void> {
  try {
    await notificationService.removePushToken(req.userId!);
    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to remove push token');
    res.status(500).json({ error: 'Failed to remove push token' });
  }
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences.
 */
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  try {
    const parsed = preferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    await notificationService.setNotificationsEnabled(
      req.userId!,
      parsed.data.notificationsEnabled,
    );

    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to update notification preferences');
    res.status(500).json({ error: 'Failed to update preferences' });
  }
}

/**
 * GET /api/notifications/preferences
 * Get notification preferences.
 */
export async function getPreferences(req: Request, res: Response): Promise<void> {
  try {
    const prefs = await notificationService.getNotificationPreferences(req.userId!);
    res.json(prefs);
  } catch (error) {
    logger.error({ error }, 'Failed to get notification preferences');
    res.status(500).json({ error: 'Failed to get preferences' });
  }
}

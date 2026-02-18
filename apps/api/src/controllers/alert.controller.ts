import { Request, Response } from 'express';
import { z } from 'zod';
import * as alertService from '../services/alert.service';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const createAlertSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  alertType: z.enum(['price_drop', 'target_price', 'back_in_stock']),
  marketplace: z.string().optional(),
  targetPrice: z.number().positive().optional().nullable(),
  percentDrop: z.number().min(1).max(99).optional().nullable(),
});

const updateAlertSchema = z.object({
  alertType: z.enum(['price_drop', 'target_price', 'back_in_stock']).optional(),
  marketplace: z.string().optional(),
  targetPrice: z.number().positive().optional().nullable(),
  percentDrop: z.number().min(1).max(99).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/alerts?productId=xxx
 * List alerts for the authenticated user.
 */
export async function getAlerts(req: Request, res: Response): Promise<void> {
  try {
    const productId = req.query.productId as string | undefined;
    const alerts = await alertService.getAlerts(req.userId!, productId);
    res.json({ alerts });
  } catch (error) {
    logger.error({ error }, 'Failed to get alerts');
    res.status(500).json({ error: 'Failed to get alerts' });
  }
}

/**
 * POST /api/alerts
 * Create a new price alert.
 */
export async function createAlert(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const alert = await alertService.createAlert(req.userId!, parsed.data);
    res.status(201).json({ alert });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    logger.error({ error }, 'Failed to create alert');
    res.status(500).json({ error: 'Failed to create alert' });
  }
}

/**
 * PUT /api/alerts/:alertId
 * Update an alert.
 */
export async function updateAlert(req: Request, res: Response): Promise<void> {
  try {
    const alertId = req.params.alertId as string;
    const parsed = updateAlertSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const alert = await alertService.updateAlert(req.userId!, alertId, parsed.data);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json({ alert });
  } catch (error) {
    logger.error({ error }, 'Failed to update alert');
    res.status(500).json({ error: 'Failed to update alert' });
  }
}

/**
 * DELETE /api/alerts/:alertId
 * Delete an alert.
 */
export async function deleteAlert(req: Request, res: Response): Promise<void> {
  try {
    const alertId = req.params.alertId as string;
    const deleted = await alertService.deleteAlert(req.userId!, alertId);

    if (!deleted) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to delete alert');
    res.status(500).json({ error: 'Failed to delete alert' });
  }
}

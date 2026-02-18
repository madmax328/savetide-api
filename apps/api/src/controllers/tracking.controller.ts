import { Request, Response } from 'express';
import { z } from 'zod';
import * as trackingService from '../services/tracking.service';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const trackBodySchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  targetPrice: z.number().positive().optional().nullable(),
});

const updateTargetPriceSchema = z.object({
  targetPrice: z.number().positive().nullable(),
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/tracked
 * List all tracked products for the authenticated user.
 */
export async function getTrackedProducts(req: Request, res: Response): Promise<void> {
  try {
    const tracked = await trackingService.getTrackedProducts(req.userId!);
    res.json({ tracked });
  } catch (error) {
    logger.error({ error }, 'Failed to get tracked products');
    res.status(500).json({ error: 'Failed to get tracked products' });
  }
}

/**
 * POST /api/tracked
 * Start tracking a product.
 */
export async function trackProduct(req: Request, res: Response): Promise<void> {
  try {
    const parsed = trackBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { productId, targetPrice } = parsed.data;
    const tracked = await trackingService.trackProduct(req.userId!, productId, targetPrice);

    res.status(201).json({ tracked });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    logger.error({ error }, 'Failed to track product');
    res.status(500).json({ error: 'Failed to track product' });
  }
}

/**
 * DELETE /api/tracked/:productId
 * Stop tracking a product.
 */
export async function untrackProduct(req: Request, res: Response): Promise<void> {
  try {
    const productId = req.params.productId as string;
    const deleted = await trackingService.untrackProduct(req.userId!, productId);

    if (!deleted) {
      res.status(404).json({ error: 'Tracked product not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to untrack product');
    res.status(500).json({ error: 'Failed to untrack product' });
  }
}

/**
 * GET /api/tracked/check/:productId
 * Check if the user is tracking a specific product.
 */
export async function checkTracking(req: Request, res: Response): Promise<void> {
  try {
    const productId = req.params.productId as string;
    const tracking = await trackingService.isTracking(req.userId!, productId);
    res.json({ tracking });
  } catch (error) {
    logger.error({ error }, 'Failed to check tracking status');
    res.status(500).json({ error: 'Failed to check tracking status' });
  }
}

/**
 * PUT /api/tracked/:productId/target-price
 * Update the target price for a tracked product.
 */
export async function updateTargetPrice(req: Request, res: Response): Promise<void> {
  try {
    const productId = req.params.productId as string;
    const parsed = updateTargetPriceSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const updated = await trackingService.updateTargetPrice(
      req.userId!,
      productId,
      parsed.data.targetPrice,
    );

    if (!updated) {
      res.status(404).json({ error: 'Tracked product not found' });
      return;
    }

    res.json({ tracked: updated });
  } catch (error) {
    logger.error({ error }, 'Failed to update target price');
    res.status(500).json({ error: 'Failed to update target price' });
  }
}

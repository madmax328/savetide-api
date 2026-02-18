import { Request, Response } from 'express';
import { z } from 'zod';
import * as dealService from '../services/deal.service';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Zod validation schemas
// ---------------------------------------------------------------------------

const getDealsQuerySchema = z.object({
  country: z.enum(['FR', 'US']).optional().default('FR'),
  category: z.string().optional(),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(50)),
});

const dealIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid deal ID'),
});

// ---------------------------------------------------------------------------
// Controller handlers
// ---------------------------------------------------------------------------

/**
 * GET /deals?country=FR&category=electronics&page=1&limit=20
 */
export async function getDeals(req: Request, res: Response): Promise<void> {
  try {
    const { country, category, page, limit } = getDealsQuerySchema.parse(req.query);

    const result = await dealService.getDeals({ country, category, page, limit });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }

    logger.error({ error }, 'Get deals failed');
    res.status(500).json({ error: 'Failed to get deals' });
  }
}

/**
 * GET /deals/:id
 */
export async function getDealById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = dealIdParamSchema.parse(req.params);

    const deal = await dealService.getDealById(id);

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    res.json({ deal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }

    logger.error({ error }, 'Get deal by ID failed');
    res.status(500).json({ error: 'Failed to get deal' });
  }
}

/**
 * POST /deals/detect
 * Manually trigger deal detection (admin / cron use).
 */
export async function triggerDetection(_req: Request, res: Response): Promise<void> {
  try {
    const dealsCreated = await dealService.detectDeals();
    res.json({ message: 'Deal detection completed', dealsCreated });
  } catch (error) {
    logger.error({ error }, 'Deal detection failed');
    res.status(500).json({ error: 'Deal detection failed' });
  }
}

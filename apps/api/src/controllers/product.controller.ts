import { Request, Response } from 'express';
import { z } from 'zod';
import * as productService from '../services/product.service';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Zod validation schemas
// ---------------------------------------------------------------------------

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  country: z
    .enum(['FR', 'US'])
    .optional()
    .default('FR'),
});

const barcodeParamSchema = z.object({
  code: z
    .string()
    .min(4, 'Barcode must be at least 4 characters')
    .max(50, 'Barcode must be at most 50 characters')
    .regex(/^[a-zA-Z0-9\-]+$/, 'Invalid barcode format'),
});

const barcodeQuerySchema = z.object({
  country: z
    .enum(['FR', 'US'])
    .optional()
    .default('FR'),
});

const productIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
});

const historyQuerySchema = z.object({
  marketplace: z.string().optional(),
  days: z
    .string()
    .optional()
    .default('30')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(365)),
});

// ---------------------------------------------------------------------------
// Controller handlers
// ---------------------------------------------------------------------------

/**
 * GET /products/search?q=keyword&country=FR
 */
export async function search(req: Request, res: Response): Promise<void> {
  try {
    const { q, country } = searchQuerySchema.parse(req.query);

    const product = await productService.searchProducts(q, country);

    res.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }

    logger.error({ error }, 'Product search failed');
    res.status(500).json({ error: 'Product search failed' });
  }
}

/**
 * GET /products/barcode/:code?country=FR
 */
export async function searchByBarcode(req: Request, res: Response): Promise<void> {
  try {
    const { code } = barcodeParamSchema.parse(req.params);
    const { country } = barcodeQuerySchema.parse(req.query);

    const product = await productService.searchByBarcode(code, country);

    res.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }

    logger.error({ error }, 'Barcode search failed');
    res.status(500).json({ error: 'Barcode search failed' });
  }
}

/**
 * GET /products/:id
 */
export async function getProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = productIdParamSchema.parse(req.params);

    const product = await productService.getProductById(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }

    logger.error({ error }, 'Get product failed');
    res.status(500).json({ error: 'Failed to get product' });
  }
}

/**
 * GET /products/:id/prices
 */
export async function getProductPrices(req: Request, res: Response): Promise<void> {
  try {
    const { id } = productIdParamSchema.parse(req.params);

    const prices = await productService.getProductPrices(id);

    if (!prices) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ prices });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }

    logger.error({ error }, 'Get product prices failed');
    res.status(500).json({ error: 'Failed to get product prices' });
  }
}

/**
 * POST /products/image-search
 * Body: { imageBase64: "data:image/jpeg;base64,...", country?: "FR"|"US" }
 *    OR { imageUrl: "https://...", country?: "FR"|"US" }
 */
export async function imageSearch(req: Request, res: Response): Promise<void> {
  try {
    const imageSearchSchema = z.object({
      imageBase64: z.string().optional(),
      imageUrl: z.string().url().optional(),
      country: z.enum(['FR', 'US']).optional().default('FR'),
    }).refine(
      (data) => data.imageBase64 || data.imageUrl,
      { message: 'Either imageBase64 or imageUrl is required' },
    );

    const { imageBase64, imageUrl, country } = imageSearchSchema.parse(req.body);

    // Prefer direct URL, fallback to base64 data URI
    const url = imageUrl || imageBase64!;

    const { product, identifiedName } = await productService.searchByImage(url, country);

    res.json({ product, identifiedName });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }

    logger.error({ error }, 'Image search failed');
    res.status(500).json({ error: 'Image search failed' });
  }
}

/**
 * GET /products/:id/history?marketplace=amazon_fr&days=30
 * Requires premium subscription (enforced at route level).
 */
export async function getProductHistory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    const { marketplace, days } = historyQuerySchema.parse(req.query);

    const history = await productService.getProductHistory(id, marketplace, days);

    res.json({ history });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }

    logger.error({ error }, 'Get product history failed');
    res.status(500).json({ error: 'Failed to get product history' });
  }
}

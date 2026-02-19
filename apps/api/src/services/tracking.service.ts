import { TrackedProduct } from '../models/TrackedProduct';
import { Product, IProduct } from '../models/Product';
import { buildAffiliateUrl } from '../utils/affiliateUrlBuilder';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Lean types (plain objects returned from .lean())
// ---------------------------------------------------------------------------

export interface TrackedProductLean {
  _id: string;
  userId: string;
  productId: string;
  targetPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackedProductWithProduct extends TrackedProductLean {
  product: {
    _id: string;
    name: string;
    brand: string;
    imageUrl: string;
    country: string;
    lowestPrice: number;
    lowestPriceStore: string;
    prices: Array<{
      marketplace: string;
      storeName: string;
      price: number;
      currency: 'EUR' | 'USD';
      productUrl: string;
      inStock: boolean;
      lastChecked: string;
    }>;
  } | null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get all tracked products for a user, with populated product data.
 */
export async function getTrackedProducts(
  userId: string,
): Promise<TrackedProductWithProduct[]> {
  const tracked = await TrackedProduct.find({ userId })
    .populate({
      path: 'productId',
      select: 'name brand imageUrl country lowestPrice lowestPriceStore prices',
    })
    .sort({ createdAt: -1 })
    .lean<TrackedProductWithProduct[]>();

  // Apply affiliate URLs to each product's prices.
  // After .populate().lean(), `t.productId` is the full product object.
  // We must restore `productId` to a plain string ID and put the product data in `product`.
  return tracked.map((t) => {
    if (t.productId && typeof t.productId === 'object') {
      const prod = t.productId as unknown as TrackedProductWithProduct['product'];
      // Extract the real ObjectId string from the populated object
      const productIdStr = (prod as any)?._id?.toString() || '';

      if (prod && prod.prices) {
        prod.prices = prod.prices.map((p) => ({
          ...p,
          productUrl: buildAffiliateUrl(p.productUrl, p.marketplace),
        }));
      }

      return {
        _id: (t._id as any).toString(),
        userId: t.userId.toString(),
        productId: productIdStr,
        targetPrice: t.targetPrice,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        product: prod,
      } as TrackedProductWithProduct;
    }
    return {
      ...t,
      productId: (t.productId as any)?.toString?.() || t.productId,
      product: null,
    } as TrackedProductWithProduct;
  });
}

/**
 * Track a product for a user (idempotent — won't duplicate).
 */
export async function trackProduct(
  userId: string,
  productId: string,
  targetPrice?: number | null,
): Promise<TrackedProductLean> {
  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const tracked = await TrackedProduct.findOneAndUpdate(
    { userId, productId },
    {
      $setOnInsert: { userId, productId },
      $set: { targetPrice: targetPrice ?? null },
    },
    { new: true, upsert: true },
  ).lean<TrackedProductLean>();

  logger.info({ userId, productId }, 'Product tracked');
  return tracked;
}

/**
 * Remove tracking for a product.
 */
export async function untrackProduct(
  userId: string,
  productId: string,
): Promise<boolean> {
  const result = await TrackedProduct.deleteOne({ userId, productId });

  if (result.deletedCount === 0) {
    return false;
  }

  logger.info({ userId, productId }, 'Product untracked');
  return true;
}

/**
 * Check if a user is tracking a specific product.
 */
export async function isTracking(
  userId: string,
  productId: string,
): Promise<boolean> {
  const exists = await TrackedProduct.exists({ userId, productId });
  return !!exists;
}

/**
 * Get a single tracked product entry (for detail view).
 */
export async function getTrackedProduct(
  userId: string,
  productId: string,
): Promise<TrackedProductLean | null> {
  return TrackedProduct.findOne({ userId, productId }).lean<TrackedProductLean>();
}

/**
 * Update the target price for a tracked product.
 */
export async function updateTargetPrice(
  userId: string,
  productId: string,
  targetPrice: number | null,
): Promise<TrackedProductLean | null> {
  const updated = await TrackedProduct.findOneAndUpdate(
    { userId, productId },
    { $set: { targetPrice } },
    { new: true },
  ).lean<TrackedProductLean>();

  if (updated) {
    logger.info({ userId, productId, targetPrice }, 'Target price updated');
  }

  return updated;
}

/**
 * Get all product IDs tracked by a given user (lightweight query for batch ops).
 */
export async function getTrackedProductIds(userId: string): Promise<string[]> {
  const tracked = await TrackedProduct.find({ userId })
    .select('productId')
    .lean<Array<{ productId: string }>>();

  return tracked.map((t) => t.productId.toString());
}

/**
 * Count total tracked products for a user.
 */
export async function countTracked(userId: string): Promise<number> {
  return TrackedProduct.countDocuments({ userId });
}

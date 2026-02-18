import { Deal } from '../models/Deal';
import { Product } from '../models/Product';
import { PriceHistory } from '../models/PriceHistory';
import { buildAffiliateUrl } from '../utils/affiliateUrlBuilder';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Lean (plain-object) representation of a Deal — no Mongoose Document overhead. */
export interface DealLean {
  _id: string;
  productId: string | null;
  title: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  currency: 'EUR' | 'USD';
  discountPercent: number;
  marketplace: string;
  productUrl: string;
  externalId?: string;
  source: 'manual' | 'automated' | 'curated';
  category: string;
  country: 'FR' | 'US';
  isActive: boolean;
  expiresAt: Date | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetDealsOptions {
  country: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface DealsPage {
  deals: DealLean[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Get paginated, active deals filtered by country and (optionally) category.
 */
export async function getDeals(options: GetDealsOptions): Promise<DealsPage> {
  const { country = 'FR', category, page = 1, limit = 20 } = options;

  const filter: Record<string, unknown> = {
    isActive: true,
    country,
  };

  if (category && category !== 'all') {
    filter.category = category;
  }

  // Also hide expired deals that the TTL index hasn't cleaned up yet
  filter.$or = [
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } },
  ];

  const [deals, total] = await Promise.all([
    Deal.find(filter)
      .sort({ priority: -1, discountPercent: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<DealLean[]>(),
    Deal.countDocuments(filter),
  ]);

  // Apply affiliate URLs
  const enrichedDeals = deals.map((deal) => ({
    ...deal,
    productUrl: buildAffiliateUrl(deal.productUrl, deal.marketplace),
  }));

  return {
    deals: enrichedDeals,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single deal by ID.
 */
export async function getDealById(dealId: string): Promise<DealLean | null> {
  const deal = await Deal.findById(dealId).lean<DealLean>();
  if (!deal) return null;

  return {
    ...deal,
    productUrl: buildAffiliateUrl(deal.productUrl, deal.marketplace),
  };
}

// ---------------------------------------------------------------------------
// Auto-detection: find products with significant price drops
// ---------------------------------------------------------------------------

const MIN_DISCOUNT_PERCENT = 15;
const DEAL_EXPIRY_HOURS = 48;

/**
 * Scan recent price history to detect significant price drops and
 * automatically create Deal entries.
 *
 * Logic:
 * 1. Find products updated in the last 6 hours.
 * 2. For each product, compare current lowest price to the average of the
 *    last 30 days of price history.
 * 3. If the drop exceeds MIN_DISCOUNT_PERCENT, create (or update) a Deal.
 */
export async function detectDeals(): Promise<number> {
  logger.info('Starting automated deal detection');

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Find recently updated products
  const recentProducts = await Product.find({
    updatedAt: { $gte: sixHoursAgo },
    'prices.0': { $exists: true }, // has at least one price
  })
    .select('_id name imageUrl country prices lowestPrice lowestPriceStore')
    .lean();

  let dealsCreated = 0;

  for (const product of recentProducts) {
    try {
      // Get historical prices for this product
      const history = await PriceHistory.find({
        productId: product._id,
        recordedAt: { $gte: thirtyDaysAgo },
      })
        .select('price')
        .lean();

      if (history.length < 3) continue; // Not enough data

      // Calculate average historical price
      const avgPrice =
        history.reduce((sum, h) => sum + h.price, 0) / history.length;

      // Current lowest price
      const currentLowest = product.lowestPrice;

      if (currentLowest <= 0 || avgPrice <= 0) continue;

      // Calculate discount
      const discountPercent = ((avgPrice - currentLowest) / avgPrice) * 100;

      if (discountPercent < MIN_DISCOUNT_PERCENT) continue;

      // Find the best-price store entry
      const bestPriceEntry = product.prices
        .filter((p) => p.price === currentLowest)
        .sort((a, b) => a.price - b.price)[0];

      if (!bestPriceEntry) continue;

      // Upsert a deal
      const expiresAt = new Date(Date.now() + DEAL_EXPIRY_HOURS * 60 * 60 * 1000);

      await Deal.findOneAndUpdate(
        { productId: product._id, marketplace: bestPriceEntry.marketplace, isActive: true },
        {
          $set: {
            title: product.name,
            imageUrl: product.imageUrl || '',
            originalPrice: Math.round(avgPrice * 100) / 100,
            dealPrice: currentLowest,
            currency: bestPriceEntry.currency,
            discountPercent: Math.round(discountPercent),
            marketplace: bestPriceEntry.marketplace,
            productUrl: bestPriceEntry.productUrl,
            country: product.country,
            source: 'automated' as const,
            category: 'general', // Could be improved with product categorization
            isActive: true,
            expiresAt,
            priority: Math.round(discountPercent), // Higher discount = higher priority
          },
          $setOnInsert: {
            productId: product._id,
          },
        },
        { upsert: true, new: true },
      );

      dealsCreated++;
    } catch (error) {
      logger.error({ error, productId: product._id }, 'Error detecting deal for product');
    }
  }

  logger.info({ dealsCreated, productsScanned: recentProducts.length }, 'Deal detection completed');
  return dealsCreated;
}

/**
 * Deactivate expired deals (belt-and-suspenders — TTL index should handle
 * most of these, but this catches deals without an expiresAt).
 */
export async function cleanupDeals(): Promise<number> {
  const result = await Deal.updateMany(
    {
      isActive: true,
      expiresAt: { $ne: null, $lt: new Date() },
    },
    { $set: { isActive: false } },
  );

  if (result.modifiedCount > 0) {
    logger.info({ deactivated: result.modifiedCount }, 'Expired deals deactivated');
  }

  return result.modifiedCount;
}

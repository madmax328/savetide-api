import { Product, IProduct, IStorePrice } from '../models/Product';
import { PriceHistory, IPriceHistory } from '../models/PriceHistory';
import { buildAffiliateUrl } from '../utils/affiliateUrlBuilder';
import { logger } from '../utils/logger';
import * as serpapiService from './serpapi.service';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Cache freshness threshold — 24 hours.
 * Each unique product is fetched from SerpApi ONCE per day max,
 * regardless of how many users search for it.
 */
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Apply affiliate URLs to every store price entry in-place and return the
 * modified array.  A new array is returned so the original DB document is
 * not mutated if callers hold a reference.
 *
 * We explicitly pick every field to ensure Mongoose subdocument properties
 * survive the spread (toObject sometimes nests prototype-only getters).
 */
function applyAffiliateUrls(prices: IStorePrice[]): IStorePrice[] {
  return prices.map((p) => {
    // Ensure we have a plain object — guard against Mongoose sub-docs
    const plain = typeof (p as any).toObject === 'function'
      ? (p as any).toObject()
      : p;

    return {
      marketplace: plain.marketplace,
      storeName: plain.storeName,
      storeLogo: plain.storeLogo || '',
      price: plain.price,
      currency: plain.currency,
      productUrl: buildAffiliateUrl(plain.productUrl || '', plain.marketplace),
      inStock: plain.inStock ?? true,
      lastChecked: plain.lastChecked,
      externalId: plain.externalId,
    };
  });
}

/**
 * Compute the lowest-price metadata fields from a prices array.
 */
function computeLowest(prices: IStorePrice[]): { lowestPrice: number; lowestPriceStore: string } {
  if (prices.length === 0) return { lowestPrice: 0, lowestPriceStore: '' };

  const sorted = [...prices].sort((a, b) => a.price - b.price);
  return {
    lowestPrice: sorted[0].price,
    lowestPriceStore: sorted[0].marketplace,
  };
}

/**
 * Determine whether the cached prices are still fresh enough to serve
 * without hitting SerpApi again.
 */
function isCacheFresh(product: IProduct): boolean {
  if (!product.prices || product.prices.length === 0) return false;

  // Use the most recent lastChecked among all prices
  const mostRecent = product.prices.reduce(
    (latest, p) => (p.lastChecked > latest ? p.lastChecked : latest),
    new Date(0),
  );

  return Date.now() - mostRecent.getTime() < CACHE_MAX_AGE_MS;
}

/**
 * Insert PriceHistory records for every store price on a product.
 * This is fire-and-forget — we log errors but do not throw.
 */
async function recordPriceHistory(product: IProduct): Promise<void> {
  try {
    const records = product.prices.map((p) => ({
      productId: product._id,
      marketplace: p.marketplace,
      price: p.price,
      currency: p.currency,
      inStock: p.inStock,
      recordedAt: new Date(),
    }));

    if (records.length > 0) {
      await PriceHistory.insertMany(records, { ordered: false });
      logger.debug({ productId: product._id, count: records.length }, 'Price history recorded');
    }
  } catch (error) {
    logger.error({ error, productId: product._id }, 'Failed to record price history');
  }
}

/**
 * Upsert a product in the database from SerpApi results.
 * If a product matching the query (or barcode) already exists it is updated;
 * otherwise a new document is created.
 */
async function upsertProduct(
  query: string,
  country: string,
  prices: IStorePrice[],
  rawTitle: string,
  rawThumbnail: string,
  barcode?: string,
): Promise<IProduct> {
  const { lowestPrice, lowestPriceStore } = computeLowest(prices);

  // Build the filter — prefer barcode if available, otherwise text search is
  // unreliable so match by exact name + country.
  const filter = barcode
    ? { barcode, country }
    : { name: rawTitle || query, country };

  const update = {
    $set: {
      name: rawTitle || query,
      imageUrl: rawThumbnail,
      country,
      prices,
      lowestPrice,
      lowestPriceStore,
      ...(barcode ? { barcode } : {}),
    },
  };

  const product = await Product.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

  return product;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search for products by keyword.
 * Returns a cached result when fresh, otherwise fetches live from SerpApi.
 */
export async function searchProducts(
  query: string,
  country: string = 'FR',
): Promise<IProduct> {
  logger.info({ query, country }, 'Product search requested');

  // 1. Check DB cache
  const existing = await Product.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(query)}$`, 'i') },
    country,
  });

  if (existing && isCacheFresh(existing)) {
    // Verify cached data has valid URLs that are NOT Google redirect URLs
    const hasDirectUrls = existing.prices.some((p) => {
      if (!p.productUrl || !p.productUrl.startsWith('http')) return false;
      try {
        const host = new URL(p.productUrl).hostname;
        return !host.includes('google.');
      } catch {
        return false;
      }
    });
    if (hasDirectUrls) {
      logger.info({ productId: existing._id }, 'Serving product from cache');
      const doc = existing.toObject() as IProduct;
      doc.prices = applyAffiliateUrls(doc.prices);
      return doc;
    }
    logger.info({ productId: existing._id }, 'Cache has Google redirect URLs, re-fetching');
  }

  // 2. Fetch from SerpApi
  const { prices, rawTitle, rawThumbnail } = await serpapiService.searchGoogleShopping(
    query,
    country,
  );

  if (prices.length === 0) {
    logger.info({ query }, 'No prices found — returning empty product');
    // Return a lean object rather than null so callers can always read .prices
    const emptyProduct = await upsertProduct(query, country, [], rawTitle, rawThumbnail);
    return emptyProduct;
  }

  // 3. Persist / update
  const product = await upsertProduct(query, country, prices, rawTitle, rawThumbnail);

  // 4. Record history (non-blocking)
  recordPriceHistory(product);

  // 5. Return with affiliate URLs
  const result = product.toObject() as IProduct;
  result.prices = applyAffiliateUrls(result.prices);

  // Debug: log first price to verify productUrl is present
  if (result.prices.length > 0) {
    logger.info({
      firstPriceUrl: result.prices[0].productUrl,
      firstPriceStore: result.prices[0].storeName,
      totalPrices: result.prices.length,
    }, 'Product search — returning prices');
  }

  return result;
}

/**
 * Search by barcode / EAN / UPC.
 */
export async function searchByBarcode(
  barcode: string,
  country: string = 'FR',
): Promise<IProduct> {
  logger.info({ barcode, country }, 'Barcode search requested');

  // 1. Check DB cache by barcode
  const existing = await Product.findOne({ barcode, country });

  if (existing && isCacheFresh(existing)) {
    logger.info({ productId: existing._id, barcode }, 'Serving barcode product from cache');
    const doc = existing.toObject() as IProduct;
    doc.prices = applyAffiliateUrls(doc.prices);
    return doc;
  }

  // 2. Fetch from SerpApi
  const { prices, rawTitle, rawThumbnail } = await serpapiService.searchByBarcode(
    barcode,
    country,
  );

  // 3. Persist with barcode field
  const product = await upsertProduct(barcode, country, prices, rawTitle, rawThumbnail, barcode);

  // 4. Record history
  recordPriceHistory(product);

  // 5. Return with affiliate URLs
  const result = product.toObject() as IProduct;
  result.prices = applyAffiliateUrls(result.prices);
  return result;
}

/**
 * Get a single product by its MongoDB _id.
 */
export async function getProductById(productId: string): Promise<IProduct | null> {
  const product = await Product.findById(productId);

  if (!product) return null;

  const result = product.toObject() as IProduct;
  result.prices = applyAffiliateUrls(result.prices);
  return result;
}

/**
 * Get only the prices array for a product, sorted ascending.
 */
export async function getProductPrices(
  productId: string,
): Promise<IStorePrice[] | null> {
  const product = await Product.findById(productId).select('prices');

  if (!product) return null;

  const sorted = [...product.prices].sort((a, b) => a.price - b.price);
  return applyAffiliateUrls(sorted);
}

/**
 * Get price history entries for a product, optionally filtered by
 * marketplace and limited to a number of past days.
 */
export async function getProductHistory(
  productId: string,
  marketplace?: string,
  days: number = 30,
): Promise<IPriceHistory[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const filter: Record<string, unknown> = {
    productId,
    recordedAt: { $gte: since },
  };

  if (marketplace) {
    filter.marketplace = marketplace;
  }

  const history = await PriceHistory.find(filter)
    .sort({ recordedAt: 1 })
    .lean<IPriceHistory[]>();

  return history;
}

// Image search removed — feature deprecated to reduce SerpApi costs.

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Escape special regex characters in a user-supplied string. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

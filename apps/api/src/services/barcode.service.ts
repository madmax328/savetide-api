import { logger } from '../utils/logger';

/**
 * Barcode resolution service.
 *
 * Uses free APIs to convert a barcode (EAN/UPC) into a product name,
 * avoiding a costly SerpApi Google Search request.
 *
 * Sources (tried in order):
 *   1. UPCitemdb.com — free tier: 100 req/day (no API key needed)
 *   2. Open Food Facts — free, unlimited, food/cosmetics only
 *   3. Fallback: return empty string → caller will use SerpApi
 */

interface BarcodeResult {
  productName: string;
  brand: string;
  imageUrl: string;
}

/**
 * Try to resolve a barcode to a product name using free APIs.
 * Returns null if the barcode could not be resolved.
 */
export async function resolveBarcode(barcode: string): Promise<BarcodeResult | null> {
  // Try UPCitemdb first (covers most product types)
  const upcResult = await tryUPCitemdb(barcode);
  if (upcResult) return upcResult;

  // Try Open Food Facts (food, beverages, cosmetics)
  const offResult = await tryOpenFoodFacts(barcode);
  if (offResult) return offResult;

  logger.info({ barcode }, 'Could not resolve barcode via free APIs');
  return null;
}

/**
 * UPCitemdb.com — free API, no key required.
 * Limit: 100 requests/day on the free tier.
 * Covers: electronics, household, food, beauty, etc.
 */
async function tryUPCitemdb(barcode: string): Promise<BarcodeResult | null> {
  try {
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      logger.debug({ barcode, status: response.status }, 'UPCitemdb request failed');
      return null;
    }

    const data = await response.json() as any;

    if (data.code === 'OK' && data.items && data.items.length > 0) {
      const item = data.items[0];
      const productName = item.title || '';
      const brand = item.brand || '';
      const imageUrl = (item.images && item.images.length > 0) ? item.images[0] : '';

      if (productName) {
        logger.info({ barcode, productName, brand, source: 'upcitemdb' }, 'Barcode resolved');
        return { productName, brand, imageUrl };
      }
    }

    return null;
  } catch (error) {
    logger.debug({ barcode, error }, 'UPCitemdb lookup error');
    return null;
  }
}

/**
 * Open Food Facts — completely free, unlimited, open-source.
 * Covers: food, beverages, cosmetics, pet food.
 */
async function tryOpenFoodFacts(barcode: string): Promise<BarcodeResult | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SaveTide/1.0 (contact@savetide.com)',
      },
    });

    if (!response.ok) return null;

    const data = await response.json() as any;

    if (data.status === 1 && data.product) {
      const product = data.product;
      const productName = product.product_name || product.product_name_fr || product.product_name_en || '';
      const brand = product.brands || '';
      const imageUrl = product.image_front_url || product.image_url || '';

      if (productName) {
        const fullName = brand ? `${brand} ${productName}` : productName;
        logger.info({ barcode, productName: fullName, source: 'openfoodfacts' }, 'Barcode resolved');
        return { productName: fullName, brand, imageUrl };
      }
    }

    return null;
  } catch (error) {
    logger.debug({ barcode, error }, 'Open Food Facts lookup error');
    return null;
  }
}

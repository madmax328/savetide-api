import { TrackedProduct } from '../models/TrackedProduct';
import { Product, IProduct } from '../models/Product';
import { PriceHistory } from '../models/PriceHistory';
import * as serpapiService from '../services/serpapi.service';
import { logger } from '../utils/logger';

/**
 * Price update job — refreshes prices for all tracked products.
 *
 * Strategy:
 * 1. Get all unique productIds from TrackedProduct collection
 * 2. For each product, re-fetch prices from SerpApi
 * 3. Update the Product document with new prices
 * 4. Record PriceHistory entries
 *
 * To avoid SerpApi rate limits, we add a small delay between requests.
 */
export async function runPriceUpdate(): Promise<number> {
  try {
    logger.info('Price update job started');

    // Get all unique product IDs that are being tracked
    const trackedDocs = await TrackedProduct.aggregate<{ _id: string }>([
      { $group: { _id: '$productId' } },
    ]);

    const productIds = trackedDocs.map((d) => d._id.toString());

    if (productIds.length === 0) {
      logger.info('No tracked products — skipping price update');
      return 0;
    }

    logger.info({ count: productIds.length }, 'Updating prices for tracked products');

    let updatedCount = 0;

    for (const productId of productIds) {
      try {
        const product = await Product.findById(productId);
        if (!product) continue;

        // Use product name + country to search SerpApi
        const { prices } = await serpapiService.searchGoogleShopping(
          product.name,
          product.country,
        );

        if (prices.length === 0) {
          logger.debug({ productId, name: product.name }, 'No prices returned — keeping old data');
          continue;
        }

        // Compute new lowest price
        const sorted = [...prices].sort((a, b) => a.price - b.price);
        const lowestPrice = sorted[0].price;
        const lowestPriceStore = sorted[0].marketplace;

        // Update product
        product.prices = prices as any;
        product.lowestPrice = lowestPrice;
        product.lowestPriceStore = lowestPriceStore;
        await product.save();

        // Record price history
        const historyRecords = prices.map((p) => ({
          productId: product._id,
          marketplace: p.marketplace,
          price: p.price,
          currency: p.currency,
          inStock: p.inStock,
          recordedAt: new Date(),
        }));

        await PriceHistory.insertMany(historyRecords, { ordered: false }).catch((err) => {
          logger.error({ err, productId }, 'Failed to insert price history');
        });

        updatedCount++;
        logger.debug({ productId, name: product.name, lowestPrice }, 'Product prices updated');

        // Rate limit: wait 1s between SerpApi calls to avoid hitting limits
        await sleep(1000);
      } catch (error) {
        logger.error({ error, productId }, 'Failed to update price for product');
        // Continue with next product
      }
    }

    logger.info({ updatedCount, total: productIds.length }, 'Price update job completed');
    return updatedCount;
  } catch (error) {
    logger.error({ error }, 'Price update job failed');
    return 0;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

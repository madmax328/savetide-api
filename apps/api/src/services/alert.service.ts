import { PriceAlert } from '../models/PriceAlert';
import { Product } from '../models/Product';
import { PriceHistory } from '../models/PriceHistory';
import { User } from '../models/User';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Lean types
// ---------------------------------------------------------------------------

export interface PriceAlertLean {
  _id: string;
  userId: string;
  productId: string;
  marketplace: string;
  alertType: 'price_drop' | 'target_price' | 'back_in_stock';
  targetPrice: number | null;
  percentDrop: number | null;
  isActive: boolean;
  lastTriggered: string | null;
  triggeredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TriggeredAlert {
  alert: PriceAlertLean;
  productName: string;
  productImage: string;
  marketplace: string;
  oldPrice: number;
  newPrice: number;
  currency: 'EUR' | 'USD';
  userId: string;
  expoPushToken?: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get all alerts for a user, optionally filtered by productId.
 */
export async function getAlerts(
  userId: string,
  productId?: string,
): Promise<PriceAlertLean[]> {
  const filter: Record<string, unknown> = { userId };
  if (productId) {
    filter.productId = productId;
  }

  return PriceAlert.find(filter)
    .sort({ createdAt: -1 })
    .lean<PriceAlertLean[]>();
}

/**
 * Create a new price alert.
 */
export async function createAlert(
  userId: string,
  data: {
    productId: string;
    alertType: 'price_drop' | 'target_price' | 'back_in_stock';
    marketplace?: string;
    targetPrice?: number | null;
    percentDrop?: number | null;
  },
): Promise<PriceAlertLean> {
  // Verify product exists
  const product = await Product.findById(data.productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const alert = await PriceAlert.create({
    userId,
    productId: data.productId,
    alertType: data.alertType,
    marketplace: data.marketplace || 'any',
    targetPrice: data.targetPrice ?? null,
    percentDrop: data.percentDrop ?? null,
    isActive: true,
  });

  logger.info({ userId, alertId: alert._id, alertType: data.alertType }, 'Price alert created');
  return alert.toObject() as unknown as PriceAlertLean;
}

/**
 * Update an existing alert.
 */
export async function updateAlert(
  userId: string,
  alertId: string,
  data: {
    alertType?: 'price_drop' | 'target_price' | 'back_in_stock';
    marketplace?: string;
    targetPrice?: number | null;
    percentDrop?: number | null;
    isActive?: boolean;
  },
): Promise<PriceAlertLean | null> {
  const updated = await PriceAlert.findOneAndUpdate(
    { _id: alertId, userId },
    { $set: data },
    { new: true },
  ).lean<PriceAlertLean>();

  if (updated) {
    logger.info({ userId, alertId }, 'Price alert updated');
  }

  return updated;
}

/**
 * Delete an alert.
 */
export async function deleteAlert(
  userId: string,
  alertId: string,
): Promise<boolean> {
  const result = await PriceAlert.deleteOne({ _id: alertId, userId });
  if (result.deletedCount > 0) {
    logger.info({ userId, alertId }, 'Price alert deleted');
    return true;
  }
  return false;
}

/**
 * Check all active alerts and return the ones that should be triggered.
 * This is called by the price alert job after prices have been updated.
 *
 * Logic:
 * - price_drop: current lowest price is X% lower than 7-day average
 * - target_price: current lowest price <= alert.targetPrice
 * - back_in_stock: product was out of stock, now in stock
 */
export async function checkAlerts(): Promise<TriggeredAlert[]> {
  const activeAlerts = await PriceAlert.find({ isActive: true })
    .lean<PriceAlertLean[]>();

  if (activeAlerts.length === 0) return [];

  const triggered: TriggeredAlert[] = [];

  // Group alerts by productId for efficiency
  const alertsByProduct = new Map<string, PriceAlertLean[]>();
  for (const alert of activeAlerts) {
    const pid = alert.productId.toString();
    const existing = alertsByProduct.get(pid) || [];
    existing.push(alert);
    alertsByProduct.set(pid, existing);
  }

  for (const [productId, alerts] of alertsByProduct) {
    try {
      const product = await Product.findById(productId);
      if (!product || product.prices.length === 0) continue;

      // Get 7-day price average for comparison
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const history = await PriceHistory.find({
        productId,
        recordedAt: { $gte: sevenDaysAgo },
      }).lean();

      const avgPrice =
        history.length > 0
          ? history.reduce((sum, h) => sum + h.price, 0) / history.length
          : product.lowestPrice;

      const currentLowest = product.lowestPrice;
      const currency = product.prices[0]?.currency || 'EUR';

      for (const alert of alerts) {
        let shouldTrigger = false;

        switch (alert.alertType) {
          case 'price_drop': {
            const dropPercent = alert.percentDrop || 10;
            const threshold = avgPrice * (1 - dropPercent / 100);
            if (currentLowest <= threshold && currentLowest > 0) {
              shouldTrigger = true;
            }
            break;
          }
          case 'target_price': {
            if (alert.targetPrice && currentLowest <= alert.targetPrice && currentLowest > 0) {
              shouldTrigger = true;
            }
            break;
          }
          case 'back_in_stock': {
            const marketplace = alert.marketplace === 'any' ? null : alert.marketplace;
            const relevantPrices = marketplace
              ? product.prices.filter((p) => p.marketplace === marketplace)
              : product.prices;
            const anyInStock = relevantPrices.some((p) => p.inStock);
            // Only trigger if we had no stock before (check history)
            if (anyInStock) {
              shouldTrigger = true;
            }
            break;
          }
        }

        if (shouldTrigger) {
          // Load user for push token
          const user = await User.findById(alert.userId).select('expoPushToken').lean();

          triggered.push({
            alert,
            productName: product.name,
            productImage: product.imageUrl,
            marketplace: product.lowestPriceStore,
            oldPrice: avgPrice,
            newPrice: currentLowest,
            currency,
            userId: alert.userId.toString(),
            expoPushToken: (user as any)?.expoPushToken,
          });

          // Update alert: mark as triggered
          await PriceAlert.updateOne(
            { _id: alert._id },
            {
              $set: { lastTriggered: new Date() },
              $inc: { triggeredCount: 1 },
            },
          );
        }
      }
    } catch (error) {
      logger.error({ error, productId }, 'Error checking alerts for product');
    }
  }

  logger.info({ triggeredCount: triggered.length }, 'Alert check completed');
  return triggered;
}

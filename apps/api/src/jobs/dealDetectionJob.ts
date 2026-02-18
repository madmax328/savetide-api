import { detectDeals, cleanupDeals } from '../services/deal.service';
import { logger } from '../utils/logger';

/**
 * Run deal detection — scans recently updated products for significant
 * price drops (>15%) and creates Deal entries automatically.
 *
 * Also cleans up expired deals.
 */
export async function runDealDetection(): Promise<void> {
  try {
    logger.info('Deal detection job started');

    // 1. Clean up expired deals first
    const deactivated = await cleanupDeals();

    // 2. Detect new deals
    const dealsCreated = await detectDeals();

    logger.info(
      { dealsCreated, deactivated },
      'Deal detection job completed',
    );
  } catch (error) {
    logger.error({ error }, 'Deal detection job failed');
  }
}

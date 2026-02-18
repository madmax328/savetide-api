import cron from 'node-cron';
import { runDealDetection } from './dealDetectionJob';
import { runPriceUpdate } from './priceUpdateJob';
import { runPriceAlertCheck } from './priceAlertJob';
import { logger } from '../utils/logger';

/**
 * Start all scheduled background jobs.
 * Call this once after the database connection is established.
 */
export function startScheduler(): void {
  logger.info('Starting job scheduler');

  // Deal detection — every 6 hours at minute 0
  // Runs at hours 0, 6, 12, 18
  cron.schedule('0 */6 * * *', async () => {
    await runDealDetection();
  });

  // Price update — every 6 hours at minute 30
  // Runs at hours 0:30, 6:30, 12:30, 18:30
  // Offset by 30 min from deal detection to spread load
  cron.schedule('30 */6 * * *', async () => {
    await runPriceUpdate();

    // After prices are updated, check alerts
    await runPriceAlertCheck();
  });

  logger.info('Scheduled jobs: deal detection (every 6h), price update + alerts + push notifications (every 6h, offset 30min)');
}

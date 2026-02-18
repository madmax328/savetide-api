import { checkAlerts, TriggeredAlert } from '../services/alert.service';
import { sendBatchAlertNotifications } from '../services/notification.service';
import { logger } from '../utils/logger';

/**
 * Price alert job — checks all active alerts against current prices,
 * then sends push notifications for triggered alerts.
 *
 * Should run AFTER the price update job.
 */
export async function runPriceAlertCheck(): Promise<TriggeredAlert[]> {
  try {
    logger.info('Price alert check job started');

    const triggered = await checkAlerts();

    if (triggered.length > 0) {
      logger.info(
        { count: triggered.length },
        'Price alerts triggered — sending notifications',
      );

      // Log each triggered alert
      for (const t of triggered) {
        logger.info(
          {
            userId: t.userId,
            productName: t.productName,
            alertType: t.alert.alertType,
            oldPrice: t.oldPrice,
            newPrice: t.newPrice,
            hasPushToken: !!t.expoPushToken,
          },
          'Alert triggered',
        );
      }

      // Send push notifications in batch
      const sentCount = await sendBatchAlertNotifications(triggered);
      logger.info({ sentCount, total: triggered.length }, 'Push notifications sent');
    } else {
      logger.info('No alerts triggered');
    }

    logger.info('Price alert check job completed');
    return triggered;
  } catch (error) {
    logger.error({ error }, 'Price alert check job failed');
    return [];
  }
}

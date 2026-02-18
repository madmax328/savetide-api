import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { User } from '../models/User';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { TriggeredAlert } from './alert.service';

// ---------------------------------------------------------------------------
// Expo Push client
// ---------------------------------------------------------------------------

const expo = new Expo({
  accessToken: env.EXPO_ACCESS_TOKEN || undefined,
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register (or update) an Expo push token for a user.
 */
export async function registerPushToken(
  userId: string,
  token: string,
): Promise<void> {
  if (!Expo.isExpoPushToken(token)) {
    throw new Error('Invalid Expo push token');
  }

  await User.findByIdAndUpdate(userId, {
    $set: { expoPushToken: token },
  });

  logger.info({ userId, token: token.slice(0, 20) + '...' }, 'Push token registered');
}

/**
 * Remove the push token for a user (e.g. on logout).
 */
export async function removePushToken(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $set: { expoPushToken: null },
  });

  logger.info({ userId }, 'Push token removed');
}

/**
 * Toggle notifications enabled/disabled for a user.
 */
export async function setNotificationsEnabled(
  userId: string,
  enabled: boolean,
): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $set: { notificationsEnabled: enabled },
  });

  logger.info({ userId, enabled }, 'Notifications preference updated');
}

/**
 * Get notification preferences for a user.
 */
export async function getNotificationPreferences(
  userId: string,
): Promise<{ notificationsEnabled: boolean; hasPushToken: boolean }> {
  const user = await User.findById(userId)
    .select('notificationsEnabled expoPushToken')
    .lean();

  return {
    notificationsEnabled: user?.notificationsEnabled ?? true,
    hasPushToken: !!user?.expoPushToken,
  };
}

// ---------------------------------------------------------------------------
// Push sending
// ---------------------------------------------------------------------------

/**
 * Send a push notification for a triggered price alert.
 */
export async function sendAlertNotification(
  triggered: TriggeredAlert,
): Promise<void> {
  if (!triggered.expoPushToken) {
    logger.debug({ userId: triggered.userId }, 'No push token — skipping notification');
    return;
  }

  if (!Expo.isExpoPushToken(triggered.expoPushToken)) {
    logger.warn(
      { userId: triggered.userId, token: triggered.expoPushToken },
      'Invalid push token — skipping',
    );
    return;
  }

  // Check if user has notifications enabled
  const user = await User.findById(triggered.userId)
    .select('notificationsEnabled language')
    .lean();

  if (!user?.notificationsEnabled) {
    logger.debug({ userId: triggered.userId }, 'Notifications disabled — skipping');
    return;
  }

  const isFrench = (user as any)?.language === 'fr';

  // Build notification message
  const { title, body } = buildAlertMessage(triggered, isFrench);

  const message: ExpoPushMessage = {
    to: triggered.expoPushToken,
    sound: 'default',
    title,
    body,
    data: {
      type: 'price_alert',
      productId: triggered.alert.productId,
      alertType: triggered.alert.alertType,
    },
    channelId: 'price-alerts',
  };

  try {
    const tickets = await expo.sendPushNotificationsAsync([message]);
    handleTickets(tickets, triggered.userId);
  } catch (error) {
    logger.error({ error, userId: triggered.userId }, 'Failed to send push notification');
  }
}

/**
 * Send push notifications for multiple triggered alerts (batch).
 * Groups messages into chunks of 100 (Expo limit).
 */
export async function sendBatchAlertNotifications(
  triggeredAlerts: TriggeredAlert[],
): Promise<number> {
  const validAlerts = triggeredAlerts.filter(
    (t) => t.expoPushToken && Expo.isExpoPushToken(t.expoPushToken),
  );

  if (validAlerts.length === 0) return 0;

  // Check notification preferences in bulk
  const userIds = [...new Set(validAlerts.map((t) => t.userId))];
  const users = await User.find({ _id: { $in: userIds } })
    .select('notificationsEnabled language')
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const messages: ExpoPushMessage[] = [];

  for (const triggered of validAlerts) {
    const user = userMap.get(triggered.userId);
    if (!user?.notificationsEnabled) continue;

    const isFrench = (user as any)?.language === 'fr';
    const { title, body } = buildAlertMessage(triggered, isFrench);

    messages.push({
      to: triggered.expoPushToken!,
      sound: 'default',
      title,
      body,
      data: {
        type: 'price_alert',
        productId: triggered.alert.productId,
        alertType: triggered.alert.alertType,
      },
      channelId: 'price-alerts',
    });
  }

  if (messages.length === 0) return 0;

  // Chunk and send
  const chunks = expo.chunkPushNotifications(messages);
  let sentCount = 0;

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      sentCount += tickets.length;
      handleTickets(tickets, 'batch');
    } catch (error) {
      logger.error({ error }, 'Failed to send push notification chunk');
    }
  }

  logger.info({ sentCount, total: messages.length }, 'Batch push notifications sent');
  return sentCount;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildAlertMessage(
  triggered: TriggeredAlert,
  isFrench: boolean,
): { title: string; body: string } {
  const productName =
    triggered.productName.length > 40
      ? triggered.productName.slice(0, 40) + '...'
      : triggered.productName;

  const currency = triggered.currency === 'EUR' ? '\u20AC' : '$';
  const newPrice = triggered.newPrice.toFixed(2);

  switch (triggered.alert.alertType) {
    case 'price_drop':
      return {
        title: isFrench ? 'Baisse de prix !' : 'Price Drop!',
        body: isFrench
          ? `${productName} est maintenant \u00E0 ${newPrice}${currency}`
          : `${productName} is now ${currency}${newPrice}`,
      };

    case 'target_price':
      return {
        title: isFrench ? 'Prix cible atteint !' : 'Target Price Reached!',
        body: isFrench
          ? `${productName} est descendu \u00E0 ${newPrice}${currency}`
          : `${productName} dropped to ${currency}${newPrice}`,
      };

    case 'back_in_stock':
      return {
        title: isFrench ? 'De retour en stock !' : 'Back in Stock!',
        body: isFrench
          ? `${productName} est de nouveau disponible`
          : `${productName} is available again`,
      };

    default:
      return {
        title: isFrench ? 'Alerte prix' : 'Price Alert',
        body: `${productName} — ${currency}${newPrice}`,
      };
  }
}

function handleTickets(tickets: ExpoPushTicket[], context: string): void {
  for (const ticket of tickets) {
    if (ticket.status === 'error') {
      logger.warn(
        { context, error: ticket.message, details: ticket.details },
        'Push notification error',
      );
    }
  }
}

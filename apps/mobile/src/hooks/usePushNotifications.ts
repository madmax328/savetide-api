import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type { EventSubscription } from 'expo-modules-core';
import * as notificationService from '../services/notificationService';

// ---------------------------------------------------------------------------
// Configure notification handler (show when app is foreground)
// ---------------------------------------------------------------------------

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook to register for push notifications and handle incoming notifications.
 *
 * Call this once in the root layout after the user is authenticated.
 * It will:
 * 1. Request permission (if not already granted)
 * 2. Get the Expo push token
 * 3. Register the token with the backend
 * 4. Set up notification listeners
 */
export function usePushNotifications(
  isAuthenticated: boolean,
  onNotificationReceived?: (notification: Notifications.Notification) => void,
) {
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        // Send token to backend
        notificationService.registerPushToken(token).catch(() => {
          // Silently fail — token will be retried on next app launch
        });
      }
    });

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('price-alerts', {
        name: 'Price Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0EA5E9',
        sound: 'default',
      });
    }

    // Listener: notification received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        onNotificationReceived?.(notification);
      });

    // Listener: user tapped on notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        // Data contains: { type: 'price_alert', productId, alertType }
        // Navigation can be handled here if needed
        if (data?.type === 'price_alert' && data?.productId) {
          // TODO: Navigate to product detail screen
          // router.push(`/(tabs)/tracked/${data.productId}`);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);
}

// ---------------------------------------------------------------------------
// Registration helper
// ---------------------------------------------------------------------------

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Get Expo push token
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });

    return tokenData.data;
  } catch {
    return null;
  }
}

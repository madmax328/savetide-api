import api from './api';

/**
 * Register the Expo push token with the backend.
 */
export async function registerPushToken(token: string): Promise<void> {
  await api.post('/notifications/register-token', { token });
}

/**
 * Remove the push token from the backend (e.g. on logout).
 */
export async function removePushToken(): Promise<void> {
  await api.delete('/notifications/token');
}

/**
 * Get notification preferences.
 */
export async function getPreferences(): Promise<{
  notificationsEnabled: boolean;
  hasPushToken: boolean;
}> {
  const { data } = await api.get('/notifications/preferences');
  return data;
}

/**
 * Update notification preferences.
 */
export async function updatePreferences(enabled: boolean): Promise<void> {
  await api.put('/notifications/preferences', {
    notificationsEnabled: enabled,
  });
}

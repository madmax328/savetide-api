import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { useSubscriptionStore } from '../../../src/store/subscriptionStore';
import { COLORS, SPACING, BORDER_RADIUS, SUBSCRIPTION_PRICE } from '../../../src/utils/constants';

const PREMIUM_FEATURES = [
  { icon: 'heart' as const, key: 'feature1' },
  { icon: 'bell' as const, key: 'feature2' },
  { icon: 'line-chart' as const, key: 'feature3' },
];

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const { user, isPremium, loadUser } = useAuthStore();
  const {
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    isLoading,
    fetchStatus,
    subscribe,
    cancel,
    reactivate,
  } = useSubscriptionStore();

  const premium = isPremium();
  const country = user?.country || 'FR';
  const currency = country === 'US' ? 'USD' : 'EUR';
  const price = currency === 'USD' ? SUBSCRIPTION_PRICE.USD : SUBSCRIPTION_PRICE.EUR;
  const priceFormatted = currency === 'USD' ? `$${price}` : `${price}\u00A0\u20AC`;

  // Fetch fresh subscription status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubscribe = useCallback(async () => {
    // Opens Stripe Checkout in the browser (Expo Go compatible)
    // When using a dev build, this can be replaced with PaymentSheet
    const url = await subscribe(country);
    if (url) {
      await Linking.openURL(url);
      // After returning from browser, refresh status
      setTimeout(() => {
        fetchStatus();
        loadUser();
      }, 3000);
    } else {
      // Show error if no URL returned (Stripe not configured, etc.)
      const { error } = useSubscriptionStore.getState();
      if (error) {
        Alert.alert(t('common.error'), error);
      }
    }
  }, [country]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      t('profile.cancelSubscription'),
      t('profile.cancelConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            await cancel();
            loadUser();
          },
        },
      ],
    );
  }, []);

  const handleReactivate = useCallback(async () => {
    await reactivate();
    loadUser();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: t('profile.subscription'), headerShown: true }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {isLoading && !premium ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : premium ? (
            // Premium user view
            <View style={styles.premiumCard}>
              <FontAwesome name="star" size={40} color={COLORS.accent} />
              <Text style={styles.premiumTitle}>SaveTide {t('profile.premium')}</Text>
              <Text style={styles.premiumSubtitle}>
                {t('profile.expiresOn')}:{' '}
                {currentPeriodEnd
                  ? new Date(currentPeriodEnd).toLocaleDateString()
                  : user?.subscription.currentPeriodEnd
                    ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString()
                    : '—'}
              </Text>

              {cancelAtPeriodEnd ? (
                // Already canceled — show reactivate
                <TouchableOpacity
                  style={styles.reactivateButton}
                  onPress={handleReactivate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.reactivateButtonText}>{t('profile.reactivate')}</Text>
                  )}
                </TouchableOpacity>
              ) : (
                // Active — show cancel
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>{t('profile.cancelSubscription')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Free user view
            <View style={styles.pricingCard}>
              <Text style={styles.pricingTitle}>SaveTide {t('profile.premium')}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>{priceFormatted}</Text>
                <Text style={styles.pricePeriod}>{t('profile.perMonth')}</Text>
              </View>

              {PREMIUM_FEATURES.map((feature) => (
                <View key={feature.key} style={styles.featureRow}>
                  <FontAwesome name={feature.icon} size={18} color={COLORS.success} />
                  <Text style={styles.featureText}>{t(`profile.${feature.key}`)}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.subscribeButtonText}>
                    {t('profile.subscribeFor')} {priceFormatted}{t('profile.perMonth')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  centered: {
    paddingTop: SPACING.xxl * 2,
    alignItems: 'center',
  },
  premiumCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  cancelButtonText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  reactivateButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.success,
  },
  reactivateButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  pricingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pricePeriod: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  subscribeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { useTrackingStore } from '../../../src/store/trackingStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';
import { formatPrice } from '../../../src/utils/formatPrice';
import { getStoreConfig } from '../../../src/utils/storeConfig';
import type { TrackedProduct } from '../../../src/services/trackingService';

export default function TrackedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isPremium = useAuthStore((state) => state.isPremium());
  const {
    trackedProducts,
    isLoading,
    error,
    fetchTracked,
    untrack,
  } = useTrackingStore();

  // Load tracked products on mount (premium only)
  useEffect(() => {
    if (isPremium) {
      fetchTracked();
    }
  }, [isPremium]);

  const handleRefresh = useCallback(() => {
    fetchTracked();
  }, []);

  const handleUntrack = useCallback((productId: string, productName: string) => {
    Alert.alert(
      t('tracked.removeTracking'),
      productName,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => untrack(productId),
        },
      ],
    );
  }, [t]);

  const handleProductPress = useCallback((productId: string) => {
    router.push(`/(tabs)/tracked/${productId}` as any);
  }, []);

  // Non-premium gate
  if (!isPremium) {
    return (
      <>
        <Stack.Screen options={{ title: t('tracked.title'), headerShown: true }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.premiumGate}>
            <FontAwesome name="lock" size={48} color={COLORS.accent} />
            <Text style={styles.premiumTitle}>{t('tracked.premiumRequired')}</Text>
            <Text style={styles.premiumDescription}>{t('tracked.premiumDescription')}</Text>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => router.push('/(tabs)/profile/subscription')}
            >
              <Text style={styles.subscribeButtonText}>{t('tracked.subscribe')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const renderTrackedItem = ({ item }: { item: TrackedProduct }) => {
    const product = item.product;
    if (!product) return null;

    const storeConfig = getStoreConfig(product.lowestPriceStore);
    const currency = product.prices[0]?.currency || 'EUR';

    return (
      <TouchableOpacity
        style={styles.trackedCard}
        onPress={() => handleProductPress(item.productId)}
        activeOpacity={0.7}
      >
        {/* Product image */}
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="contain" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <FontAwesome name="cube" size={24} color={COLORS.textMuted} />
          </View>
        )}

        {/* Product info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Store chip */}
          <View style={styles.storeChip}>
            <View style={[styles.storeChipDot, { backgroundColor: storeConfig.color }]} />
            <Text style={styles.storeChipText}>
              {storeConfig.displayName}
            </Text>
          </View>

          {/* Price */}
          <Text style={styles.productPrice}>
            {formatPrice(product.lowestPrice, currency)}
          </Text>

          {/* Target price */}
          {item.targetPrice && (
            <View style={styles.targetRow}>
              <FontAwesome name="bell" size={11} color={COLORS.accent} />
              <Text style={styles.targetText}>
                {t('tracked.targetPrice')}: {formatPrice(item.targetPrice, currency)}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleUntrack(item.productId, product.name)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="trash-o" size={18} color={COLORS.danger} />
          </TouchableOpacity>
          <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('tracked.title'), headerShown: true }} />
      <SafeAreaView style={styles.container}>
        {/* Loading state */}
        {isLoading && trackedProducts.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : (
          <FlatList
            data={trackedProducts}
            renderItem={renderTrackedItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={
              trackedProducts.length === 0 ? styles.emptyContainer : styles.list
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && trackedProducts.length > 0}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <FontAwesome name="heart-o" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>{t('tracked.empty')}</Text>
                <Text style={styles.emptyDescription}>
                  {t('tracked.emptyDescription')}
                </Text>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => router.push('/(tabs)/scan')}
                >
                  <FontAwesome name="barcode" size={18} color={COLORS.white} />
                  <Text style={styles.scanButtonText}>{t('tabs.scan')}</Text>
                </TouchableOpacity>
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  trackedCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  storeChipDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  storeChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.success,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  targetText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  actions: {
    alignItems: 'center',
    gap: SPACING.md,
    marginLeft: SPACING.sm,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  // Premium gate
  premiumGate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  premiumDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  subscribeButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  subscribeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptyDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

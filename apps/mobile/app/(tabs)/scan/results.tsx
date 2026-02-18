import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Linking,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useScanStore } from '../../../src/store/scanStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useTrackingStore } from '../../../src/store/trackingStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';
import { formatPrice } from '../../../src/utils/formatPrice';
import { getStoreConfig } from '../../../src/utils/storeConfig';
import type { StorePrice } from '../../../src/services/productService';

export default function ResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query, type } = useLocalSearchParams<{ query: string; type: string }>();
  const { product, isSearching, error } = useScanStore();
  const isPremium = useAuthStore((state) => state.isPremium());
  const { trackingStatus, track, untrack, checkTracking } = useTrackingStore();
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  // Check tracking status when product loads
  useEffect(() => {
    if (product?._id && isPremium) {
      checkTracking(product._id);
    }
  }, [product?._id, isPremium]);

  const isTracked = product?._id ? trackingStatus[product._id] === true : false;

  const handleTrackToggle = useCallback(async () => {
    if (!product?._id) return;

    // Premium gate
    if (!isPremium) {
      Alert.alert(
        t('tracked.premiumRequired'),
        t('tracked.premiumDescription'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('tracked.subscribe'),
            onPress: () => router.push('/(tabs)/profile/subscription'),
          },
        ],
      );
      return;
    }

    setIsTrackLoading(true);
    try {
      if (isTracked) {
        await untrack(product._id);
      } else {
        await track(product._id);
      }
    } catch {
      // Error already handled in store
    } finally {
      setIsTrackLoading(false);
    }
  }, [product?._id, isPremium, isTracked, t]);

  const handleViewDeal = (url?: string) => {
    if (!url) {
      Alert.alert(t('common.error'), 'No URL available for this deal.');
      return;
    }
    Linking.openURL(url);
  };

  if (isSearching) {
    return (
      <>
        <Stack.Screen options={{ title: t('results.title'), headerShown: true }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Stack.Screen options={{ title: t('results.title'), headerShown: true }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <FontAwesome name="search" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>{t('results.noResults')}</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </SafeAreaView>
      </>
    );
  }

  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price).slice(0, 10);

  const renderPriceItem = ({ item, index }: { item: StorePrice; index: number }) => {
    const isBestPrice = index === 0;
    const storeConfig = getStoreConfig(item.marketplace);

    return (
      <View style={[styles.priceCard, isBestPrice && styles.bestPriceCard]}>
        {isBestPrice && (
          <View style={styles.bestBadge}>
            <FontAwesome name="trophy" size={12} color={COLORS.white} />
            <Text style={styles.bestBadgeText}>{t('results.bestPrice')}</Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <View style={styles.storeInfo}>
            <View style={[styles.storeIcon, { backgroundColor: storeConfig.color + '20' }]}>
              <FontAwesome
                name={storeConfig.icon as any}
                size={20}
                color={storeConfig.color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{storeConfig.displayName}</Text>
              <Text style={[styles.stockStatus, !item.inStock && styles.outOfStock]}>
                {item.inStock ? t('results.inStock') : t('results.outOfStock')}
              </Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={[styles.price, isBestPrice && styles.bestPrice]}>
              {formatPrice(item.price, item.currency)}
            </Text>
            <TouchableOpacity
              style={[styles.viewButton, !item.inStock && styles.viewButtonDisabled]}
              onPress={() => handleViewDeal(item.productUrl)}
              disabled={!item.inStock}
            >
              <Text style={styles.viewButtonText}>{t('results.viewDeal')}</Text>
              <FontAwesome name="external-link" size={12} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('results.title'), headerShown: true }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.productHeader}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <FontAwesome name="cube" size={40} color={COLORS.textMuted} />
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name || query}
            </Text>
            {product.brand ? (
              <Text style={styles.productBrand}>{product.brand}</Text>
            ) : null}
            <Text style={styles.resultCount}>
              {sortedPrices.length} {t('results.prices')}
            </Text>
          </View>
        </View>

        <FlatList
          data={sortedPrices}
          renderItem={renderPriceItem}
          keyExtractor={(item, index) => `${item.marketplace}-${index}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Track button */}
        <TouchableOpacity
          style={[styles.trackButton, isTracked && styles.trackButtonTracked]}
          onPress={handleTrackToggle}
          disabled={isTrackLoading}
        >
          {isTrackLoading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <FontAwesome
              name={isTracked ? 'heart' : 'heart-o'}
              size={18}
              color={COLORS.white}
            />
          )}
          <Text style={styles.trackButtonText}>
            {isTracked ? t('tracked.removeTracking') : t('results.trackProduct')}
          </Text>
        </TouchableOpacity>
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
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    textAlign: 'center',
  },
  productHeader: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  productBrand: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resultCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  priceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bestPriceCard: {
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
    marginBottom: SPACING.sm,
  },
  bestBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  stockStatus: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
  },
  outOfStock: {
    color: COLORS.danger,
  },
  priceSection: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  bestPrice: {
    color: COLORS.success,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    gap: 6,
  },
  viewButtonDisabled: {
    opacity: 0.4,
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  trackButton: {
    position: 'absolute',
    bottom: 20,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  trackButtonTracked: {
    backgroundColor: COLORS.success,
  },
  trackButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

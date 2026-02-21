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
  const { isAuthenticated } = useAuthStore();
  const { trackingStatus, track, untrack, checkTracking } = useTrackingStore();
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  // Check tracking status when product loads
  useEffect(() => {
    if (product?._id && isAuthenticated) {
      checkTracking(product._id);
    }
  }, [product?._id, isAuthenticated]);

  const isTracked = product?._id ? trackingStatus[product._id] === true : false;

  const handleTrackToggle = useCallback(async () => {
    if (!product?._id) return;

    // Auth gate — require login to track products
    if (!isAuthenticated) {
      Alert.alert(
        t('tracked.loginRequired'),
        t('tracked.loginDescription'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('auth.signIn'),
            onPress: () => router.push('/(auth)/login'),
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
  }, [product?._id, isAuthenticated, isTracked, t]);

  const handleViewDeal = (url?: string) => {
    if (!url) {
      Alert.alert(t('common.error'), t('results.noUrl'));
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), t('results.noUrl'));
    });
  };

  if (isSearching) {
    return (
      <>
        <Stack.Screen options={{ title: t('results.title'), headerShown: true }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('results.searching')}</Text>
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
            <View style={styles.emptyIconCircle}>
              <FontAwesome name="search" size={40} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>{t('results.noResults')}</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>{t('results.newSearch')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price).slice(0, 10);
  const bestPrice = sortedPrices.length > 0 ? sortedPrices[0].price : 0;
  const worstPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1].price : 0;
  const maxSaving = worstPrice - bestPrice;
  const currency = sortedPrices.length > 0 ? sortedPrices[0].currency : 'EUR';

  const renderStatsBar = () => (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{sortedPrices.length}</Text>
        <Text style={styles.statLabel}>{t('results.offersFound')}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: COLORS.success }]}>
          {formatPrice(bestPrice, currency)}
        </Text>
        <Text style={styles.statLabel}>{t('results.bestPrice')}</Text>
      </View>
      {maxSaving > 0 && (
        <>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>
              {formatPrice(maxSaving, currency)}
            </Text>
            <Text style={styles.statLabel}>{t('results.maxSaving')}</Text>
          </View>
        </>
      )}
    </View>
  );

  const renderPriceItem = ({ item, index }: { item: StorePrice; index: number }) => {
    const isBestPrice = index === 0;
    const storeConfig = getStoreConfig(item.marketplace);

    return (
      <View style={[styles.priceCard, isBestPrice && styles.bestPriceCard]}>
        {isBestPrice && (
          <View style={styles.bestBadge}>
            <FontAwesome name="trophy" size={11} color={COLORS.white} />
            <Text style={styles.bestBadgeText}>{t('results.bestPrice').toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          {/* Product thumbnail */}
          <View style={styles.thumbnailContainer}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <FontAwesome name="cube" size={24} color={COLORS.textMuted} />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {product.name || query}
            </Text>
            <View style={styles.storeRow}>
              <View style={[styles.storeChip, { backgroundColor: storeConfig.color + '15' }]}>
                <FontAwesome name={storeConfig.icon as any} size={12} color={storeConfig.color} />
                <Text style={[styles.storeChipText, { color: storeConfig.color }]}>
                  {storeConfig.displayName}
                </Text>
              </View>
              {!item.inStock && (
                <Text style={styles.outOfStockText}>{t('results.outOfStock')}</Text>
              )}
            </View>
          </View>

          {/* Price + Button */}
          <View style={styles.cardRight}>
            <Text style={[styles.cardPrice, isBestPrice && styles.cardPriceBest]}>
              {formatPrice(item.price, item.currency)}
            </Text>
            <TouchableOpacity
              style={[
                styles.viewButton,
                isBestPrice && styles.viewButtonBest,
                !item.inStock && styles.viewButtonDisabled,
              ]}
              onPress={() => handleViewDeal(item.productUrl)}
              disabled={!item.inStock}
            >
              <Text style={[
                styles.viewButtonText,
                isBestPrice && styles.viewButtonTextBest,
              ]}>
                {t('results.viewDeal')}
              </Text>
              <FontAwesome
                name="external-link"
                size={10}
                color={isBestPrice ? COLORS.white : COLORS.primary}
              />
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
        {/* Stats bar */}
        {renderStatsBar()}

        {/* Product header */}
        <View style={styles.productHeader}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <FontAwesome name="cube" size={28} color={COLORS.textMuted} />
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name || query}
            </Text>
            {product.brand ? (
              <Text style={styles.productBrand}>{product.brand}</Text>
            ) : null}
          </View>
        </View>

        {/* Price list */}
        <FlatList
          data={sortedPrices}
          renderItem={renderPriceItem}
          keyExtractor={(item, index) => `${item.marketplace}-${index}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Track button */}
        <View style={styles.bottomBar}>
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
                size={16}
                color={COLORS.white}
              />
            )}
            <Text style={styles.trackButtonText}>
              {isTracked ? t('tracked.removeTracking') : t('results.trackProduct')}
            </Text>
          </TouchableOpacity>
        </View>
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
    marginTop: SPACING.sm,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },

  // Product header
  productHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  productImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
  },
  productBrand: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Price list
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 90,
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
    backgroundColor: COLORS.success + '08',
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: SPACING.sm,
  },
  bestBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Card content
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  thumbnailContainer: {
    width: 52,
    height: 52,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  thumbnailPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 17,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  storeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  outOfStockText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 90,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardPriceBest: {
    color: COLORS.success,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  viewButtonBest: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  viewButtonDisabled: {
    opacity: 0.35,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  viewButtonTextBest: {
    color: COLORS.white,
  },

  // Bottom track button
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  trackButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
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
    fontSize: 15,
    fontWeight: '700',
  },
});

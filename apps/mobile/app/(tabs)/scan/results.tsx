import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { useScanStore } from '../../../src/store/scanStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useTrackingStore } from '../../../src/store/trackingStore';
import * as productService from '../../../src/services/productService';
import type { PriceHistoryEntry } from '../../../src/services/productService';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';
import { formatPrice } from '../../../src/utils/formatPrice';
import { getStoreConfig } from '../../../src/utils/storeConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ResultsTab = 'offers' | 'chart' | 'details';

export default function ResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query: string; type: string }>();
  const { product, isSearching, error } = useScanStore();
  const { isAuthenticated } = useAuthStore();
  const { trackingStatus, track, untrack, checkTracking } = useTrackingStore();

  const [activeTab, setActiveTab] = useState<ResultsTab>('offers');
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [chartPeriod, setChartPeriod] = useState(30);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Check tracking status when product loads
  useEffect(() => {
    if (product?._id && isAuthenticated) {
      checkTracking(product._id);
    }
  }, [product?._id, isAuthenticated]);

  // Fetch price history when chart tab is selected
  useEffect(() => {
    if (activeTab === 'chart' && product?._id) {
      setIsLoadingHistory(true);
      productService.getProductHistory(product._id, chartPeriod)
        .then((data) => setPriceHistory(data))
        .catch(() => setPriceHistory([]))
        .finally(() => setIsLoadingHistory(false));
    }
  }, [activeTab, product?._id, chartPeriod]);

  const isTracked = product?._id ? trackingStatus[product._id] === true : false;

  const handleTrackToggle = useCallback(async () => {
    if (!product?._id) return;
    if (!isAuthenticated) {
      Alert.alert(
        t('tracked.loginRequired'),
        t('tracked.loginDescription'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('auth.signIn'), onPress: () => router.push('/(auth)/login') },
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
      // Error handled in store
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

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------
  const sortedPrices = useMemo(() => {
    if (!product?.prices) return [];
    return [...product.prices].sort((a, b) => a.price - b.price).slice(0, 15);
  }, [product?.prices]);

  const bestPrice = sortedPrices.length > 0 ? sortedPrices[0].price : 0;
  const currency = sortedPrices.length > 0 ? sortedPrices[0].currency : 'EUR';

  // Chart data preparation (same pattern as tracked/[productId].tsx)
  const chartData = useMemo(() => {
    if (priceHistory.length === 0) return null;

    // Group by date, take lowest price per day
    const byDate = new Map<string, number>();
    priceHistory.forEach((h) => {
      const dateKey = new Date(h.recordedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const existing = byDate.get(dateKey);
      if (!existing || h.price < existing) {
        byDate.set(dateKey, h.price);
      }
    });

    const entries = Array.from(byDate.entries());
    if (entries.length === 0) return null;

    // Limit labels to avoid overcrowding
    const maxLabels = 6;
    const step = Math.max(1, Math.floor(entries.length / maxLabels));
    const labels = entries.map(([label], i) => (i % step === 0 ? label : ''));
    const data = entries.map(([, price]) => price);

    return { labels, datasets: [{ data, strokeWidth: 2 }] };
  }, [priceHistory]);

  // ---------------------------------------------------------------------------
  // Loading / Error states
  // ---------------------------------------------------------------------------
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
            <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>{t('results.newSearch')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Tab Content Renderers
  // ---------------------------------------------------------------------------
  const renderOffersTab = () => (
    <View style={styles.tabContent}>
      {sortedPrices.map((item, index) => {
        const isBest = index === 0;
        const storeConfig = getStoreConfig(item.marketplace);
        return (
          <View key={`${item.marketplace}-${index}`} style={[styles.offerRow, isBest && styles.offerRowBest]}>
            {isBest && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>{t('results.bestPrice')}</Text>
              </View>
            )}
            <View style={styles.offerContent}>
              <View style={[styles.storeIconCircle, { backgroundColor: storeConfig.color + '15' }]}>
                <FontAwesome name={storeConfig.icon as any} size={16} color={storeConfig.color} />
              </View>
              <View style={styles.offerInfo}>
                <Text style={styles.offerStoreName}>{storeConfig.displayName}</Text>
                {item.inStock ? (
                  <Text style={styles.offerInStock}>{t('results.inStock')}</Text>
                ) : (
                  <Text style={styles.offerOutOfStock}>{t('results.outOfStock')}</Text>
                )}
              </View>
              <Text style={[styles.offerPrice, isBest && styles.offerPriceBest]}>
                {formatPrice(item.price, item.currency)}
              </Text>
              <TouchableOpacity
                style={[styles.offerButton, isBest && styles.offerButtonBest]}
                onPress={() => handleViewDeal(item.productUrl)}
              >
                <Text style={[styles.offerButtonText, isBest && styles.offerButtonTextBest]}>
                  {t('results.viewDeal')}
                </Text>
                <FontAwesome name="external-link" size={10} color={isBest ? COLORS.white : COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderChartTab = () => (
    <View style={styles.tabContent}>
      {/* Period selector */}
      <View style={styles.periodRow}>
        {[30, 60, 90].map((days) => (
          <TouchableOpacity
            key={days}
            style={[styles.periodChip, chartPeriod === days && styles.periodChipActive]}
            onPress={() => setChartPeriod(days)}
          >
            <Text style={[styles.periodChipText, chartPeriod === days && styles.periodChipTextActive]}>
              {t(`tracked.last${days}days`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoadingHistory ? (
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : chartData ? (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md * 2}
            height={200}
            yAxisSuffix={currency === 'EUR' ? '€' : '$'}
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
              labelColor: () => COLORS.textMuted,
              propsForDots: { r: '3', strokeWidth: '1', stroke: COLORS.primary },
              propsForBackgroundLines: { strokeDasharray: '', stroke: COLORS.border },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      ) : (
        <View style={styles.chartPlaceholder}>
          <FontAwesome name="line-chart" size={32} color={COLORS.textMuted} />
          <Text style={styles.chartPlaceholderText}>{t('results.noHistory')}</Text>
        </View>
      )}
    </View>
  );

  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.detailsCard}>
        {product.brand ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('results.brand')}</Text>
            <Text style={styles.detailValue}>{product.brand}</Text>
          </View>
        ) : null}
        {product.category ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('results.category')}</Text>
            <Text style={styles.detailValue}>{product.category}</Text>
          </View>
        ) : null}
        {product.barcode ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('results.barcode')}</Text>
            <Text style={styles.detailValue}>{product.barcode}</Text>
          </View>
        ) : null}
        {!product.brand && !product.category && !product.barcode && (
          <Text style={styles.detailsEmpty}>{t('results.limitedInfo')}</Text>
        )}
      </View>
    </View>
  );

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <Stack.Screen options={{ title: '', headerShown: true }} />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* ─── Product Hero ─────────────────────────── */}
          <View style={styles.heroSection}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.heroImage} resizeMode="contain" />
            ) : (
              <View style={[styles.heroImage, styles.heroImagePlaceholder]}>
                <FontAwesome name="cube" size={48} color={COLORS.textMuted} />
              </View>
            )}
            {product.brand ? <Text style={styles.heroBrand}>{product.brand}</Text> : null}
            <Text style={styles.heroName} numberOfLines={3}>{product.name || query}</Text>
            {bestPrice > 0 && (
              <Text style={styles.heroPrice}>
                {t('results.fromPrice', { price: formatPrice(bestPrice, currency) })}
              </Text>
            )}
            <Text style={styles.heroOfferCount}>
              {sortedPrices.length} {t('results.offersFound')}
            </Text>
          </View>

          {/* ─── Tab Switcher ─────────────────────────── */}
          <View style={styles.tabSwitcher}>
            {(['offers', 'chart', 'details'] as ResultsTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <FontAwesome
                  name={tab === 'offers' ? 'tag' : tab === 'chart' ? 'line-chart' : 'file-text-o'}
                  size={14}
                  color={activeTab === tab ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {t(`results.tabs.${tab}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ─── Tab Content ──────────────────────────── */}
          {activeTab === 'offers' && renderOffersTab()}
          {activeTab === 'chart' && renderChartTab()}
          {activeTab === 'details' && renderDetailsTab()}
        </ScrollView>

        {/* ─── Bottom Track Button ────────────────────── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.trackButton, isTracked && styles.trackButtonTracked]}
            onPress={handleTrackToggle}
            disabled={isTrackLoading}
          >
            {isTrackLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <FontAwesome name={isTracked ? 'heart' : 'heart-o'} size={16} color={COLORS.white} />
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
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

  // ─── Hero ────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  heroImage: {
    width: 180,
    height: 180,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: SPACING.md,
  },
  heroImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBrand: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  heroPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.success,
    marginBottom: 4,
  },
  heroOfferCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // ─── Tab Switcher ────────────────────────────────
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },

  // ─── Tab Content ─────────────────────────────────
  tabContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  // ─── Offers Tab ──────────────────────────────────
  offerRow: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  offerRowBest: {
    borderColor: COLORS.success,
    borderWidth: 2,
    backgroundColor: COLORS.success + '06',
  },
  bestBadge: {
    backgroundColor: COLORS.success,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  bestBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  storeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerInfo: {
    flex: 1,
    gap: 2,
  },
  offerStoreName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  offerInStock: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  offerOutOfStock: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
  },
  offerPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  offerPriceBest: {
    color: COLORS.success,
  },
  offerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  offerButtonBest: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  offerButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  offerButtonTextBest: {
    color: COLORS.white,
  },

  // ─── Chart Tab ───────────────────────────────────
  periodRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  periodChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodChipTextActive: {
    color: COLORS.white,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chart: {
    borderRadius: BORDER_RADIUS.md,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // ─── Details Tab ─────────────────────────────────
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailsEmpty: {
    padding: SPACING.xl,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // ─── Bottom Bar ──────────────────────────────────
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

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { useTrackingStore } from '../../../src/store/trackingStore';
import { useAlertStore } from '../../../src/store/alertStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';
import { formatPrice } from '../../../src/utils/formatPrice';
import { getStoreConfig } from '../../../src/utils/storeConfig';
import type { PriceHistoryEntry } from '../../../src/services/trackingService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

const PERIOD_OPTIONS = [
  { key: '30', label: 'last30days', days: 30 },
  { key: '60', label: 'last60days', days: 60 },
  { key: '90', label: 'last90days', days: 90 },
];

export default function ProductDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const {
    trackedProducts,
    priceHistory,
    isLoadingHistory,
    fetchHistory,
    untrack,
    updateTargetPrice,
    clearHistory,
  } = useTrackingStore();

  const { alerts, fetchAlerts, createAlert, deleteAlert } = useAlertStore();

  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [showAlertConfig, setShowAlertConfig] = useState(false);

  // Find the tracked product from the store
  const trackedProduct = trackedProducts.find((tp) => tp.productId === productId);
  const product = trackedProduct?.product;

  // Load history and alerts on mount
  useEffect(() => {
    if (productId) {
      fetchHistory(productId, 30);
      fetchAlerts(productId);
    }
    return () => clearHistory();
  }, [productId]);

  // Update target price input when tracked product loads
  useEffect(() => {
    if (trackedProduct?.targetPrice) {
      setTargetPriceInput(trackedProduct.targetPrice.toString());
    }
  }, [trackedProduct?.targetPrice]);

  const handlePeriodChange = useCallback(
    (period: string) => {
      setSelectedPeriod(period);
      const days = PERIOD_OPTIONS.find((p) => p.key === period)?.days || 30;
      if (productId) fetchHistory(productId, days);
    },
    [productId],
  );

  const handleUntrack = useCallback(() => {
    if (!productId || !product) return;
    Alert.alert(t('tracked.removeTracking'), product.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: async () => {
          await untrack(productId);
          router.back();
        },
      },
    ]);
  }, [productId, product, t]);

  const handleSaveTargetPrice = useCallback(async () => {
    if (!productId) return;
    const price = targetPriceInput ? parseFloat(targetPriceInput) : null;
    if (targetPriceInput && (isNaN(price!) || price! <= 0)) return;

    await updateTargetPrice(productId, price);

    // Create or update a target_price alert
    const existingAlert = alerts.find(
      (a) => a.productId === productId && a.alertType === 'target_price',
    );
    if (price) {
      if (!existingAlert) {
        await createAlert({
          productId,
          alertType: 'target_price',
          targetPrice: price,
        });
      }
    } else if (existingAlert) {
      await deleteAlert(existingAlert._id);
    }

    setShowAlertConfig(false);
  }, [productId, targetPriceInput, alerts]);

  const handleCreatePriceDropAlert = useCallback(async () => {
    if (!productId) return;
    const existing = alerts.find(
      (a) => a.productId === productId && a.alertType === 'price_drop',
    );
    if (existing) {
      await deleteAlert(existing._id);
    } else {
      await createAlert({
        productId,
        alertType: 'price_drop',
        percentDrop: 10,
      });
    }
  }, [productId, alerts]);

  if (!product) {
    return (
      <>
        <Stack.Screen options={{ title: t('tracked.priceHistory'), headerShown: true }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Prepare chart data from price history
  const chartData = prepareChartData(priceHistory);
  const currency = product.prices[0]?.currency || 'EUR';
  const hasPriceDropAlert = alerts.some(
    (a) => a.productId === productId && a.alertType === 'price_drop' && a.isActive,
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name.length > 25 ? product.name.slice(0, 25) + '...' : product.name,
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product header */}
          <View style={styles.productHeader}>
            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <FontAwesome name="cube" size={40} color={COLORS.textMuted} />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              {product.brand ? (
                <Text style={styles.productBrand}>{product.brand}</Text>
              ) : null}
              <Text style={styles.currentPrice}>
                {formatPrice(product.lowestPrice, currency)}
              </Text>
              <View style={styles.storeChip}>
                <View
                  style={[
                    styles.storeChipDot,
                    { backgroundColor: getStoreConfig(product.lowestPriceStore).color },
                  ]}
                />
                <Text style={styles.storeChipText}>
                  {getStoreConfig(product.lowestPriceStore).displayName}
                </Text>
              </View>
            </View>
          </View>

          {/* Price History Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tracked.priceHistory')}</Text>

            {/* Period selector */}
            <View style={styles.periodSelector}>
              {PERIOD_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.periodChip,
                    selectedPeriod === opt.key && styles.periodChipActive,
                  ]}
                  onPress={() => handlePeriodChange(opt.key)}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === opt.key && styles.periodTextActive,
                    ]}
                  >
                    {t(`tracked.${opt.label}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isLoadingHistory ? (
              <View style={styles.chartPlaceholder}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : chartData.labels.length >= 2 ? (
              <LineChart
                data={{
                  labels: chartData.labels,
                  datasets: [{ data: chartData.prices }],
                }}
                width={CHART_WIDTH}
                height={200}
                yAxisSuffix={currency === 'EUR' ? ' \u20AC' : ' $'}
                chartConfig={{
                  backgroundColor: COLORS.surface,
                  backgroundGradientFrom: COLORS.surface,
                  backgroundGradientTo: COLORS.surface,
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
                  labelColor: () => COLORS.textSecondary,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: COLORS.primary,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: COLORS.border,
                  },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.chartPlaceholder}>
                <FontAwesome name="line-chart" size={32} color={COLORS.textMuted} />
                <Text style={styles.chartPlaceholderText}>
                  {t('tracked.priceHistory')}
                </Text>
              </View>
            )}
          </View>

          {/* Alert Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tracked.setAlert')}</Text>

            {/* Price drop alert toggle */}
            <TouchableOpacity
              style={styles.alertRow}
              onPress={handleCreatePriceDropAlert}
            >
              <View style={styles.alertInfo}>
                <FontAwesome
                  name={hasPriceDropAlert ? 'bell' : 'bell-o'}
                  size={18}
                  color={hasPriceDropAlert ? COLORS.accent : COLORS.textMuted}
                />
                <View>
                  <Text style={styles.alertLabel}>
                    {t('tracked.alertActive')}
                  </Text>
                  <Text style={styles.alertDesc}>-10%</Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggleDot,
                  hasPriceDropAlert && styles.toggleDotActive,
                ]}
              />
            </TouchableOpacity>

            {/* Target price */}
            <TouchableOpacity
              style={styles.alertRow}
              onPress={() => setShowAlertConfig(!showAlertConfig)}
            >
              <View style={styles.alertInfo}>
                <FontAwesome name="crosshairs" size={18} color={COLORS.primary} />
                <View>
                  <Text style={styles.alertLabel}>{t('tracked.targetPrice')}</Text>
                  {trackedProduct?.targetPrice ? (
                    <Text style={styles.alertDesc}>
                      {formatPrice(trackedProduct.targetPrice, currency)}
                    </Text>
                  ) : null}
                </View>
              </View>
              <FontAwesome
                name={showAlertConfig ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>

            {showAlertConfig && (
              <View style={styles.targetPriceConfig}>
                <TextInput
                  style={styles.targetPriceInput}
                  placeholder={t('tracked.targetPrice')}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                  value={targetPriceInput}
                  onChangeText={setTargetPriceInput}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveTargetPrice}
                >
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Store prices list */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {product.prices.length} {t('results.prices')}
            </Text>

            {product.prices
              .sort((a, b) => a.price - b.price)
              .map((price, index) => {
                const storeConfig = getStoreConfig(price.marketplace);
                return (
                  <TouchableOpacity
                    key={`${price.marketplace}-${index}`}
                    style={styles.priceRow}
                    onPress={() => Linking.openURL(price.productUrl)}
                  >
                    <View style={[styles.storeIcon, { backgroundColor: storeConfig.color + '20' }]}>
                      <FontAwesome
                        name={storeConfig.icon as any}
                        size={16}
                        color={storeConfig.color}
                      />
                    </View>
                    <Text style={styles.priceStoreName}>{storeConfig.displayName}</Text>
                    <Text style={[styles.priceValue, index === 0 && styles.bestPriceValue]}>
                      {formatPrice(price.price, price.currency)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>

          {/* Untrack button */}
          <TouchableOpacity style={styles.untrackButton} onPress={handleUntrack}>
            <FontAwesome name="trash-o" size={16} color={COLORS.danger} />
            <Text style={styles.untrackButtonText}>{t('tracked.removeTracking')}</Text>
          </TouchableOpacity>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function prepareChartData(history: PriceHistoryEntry[]): {
  labels: string[];
  prices: number[];
} {
  if (history.length === 0) return { labels: [], prices: [] };

  // Group by date, take the lowest price per day
  const byDate = new Map<string, number>();

  for (const entry of history) {
    const date = new Date(entry.recordedAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
    const existing = byDate.get(date);
    if (!existing || entry.price < existing) {
      byDate.set(date, entry.price);
    }
  }

  const entries = Array.from(byDate.entries());

  // Limit labels to avoid overcrowding (show max 6 labels)
  const maxLabels = 6;
  const step = Math.max(1, Math.floor(entries.length / maxLabels));

  const labels: string[] = [];
  const prices: number[] = [];

  for (let i = 0; i < entries.length; i++) {
    prices.push(entries[i][1]);
    labels.push(i % step === 0 ? entries[i][0] : '');
  }

  return { labels, prices };
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
  },
  productHeader: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  productImagePlaceholder: {
    width: 90,
    height: 90,
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
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  productBrand: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  storeChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storeChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  // Period selector
  periodSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  periodChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  periodTextActive: {
    color: COLORS.white,
  },
  // Chart
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
  },
  chartPlaceholderText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  // Alerts
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  alertLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  alertDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  toggleDotActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  // Target price config
  targetPriceConfig: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  targetPriceInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  // Store prices
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  storeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceStoreName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  bestPriceValue: {
    color: COLORS.success,
  },
  // Untrack button
  untrackButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  untrackButtonText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});

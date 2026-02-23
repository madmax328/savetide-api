import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  FlatList,
  Linking,
  Dimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { useScanStore } from '../../../src/store/scanStore';
import { useSearchHistoryStore } from '../../../src/store/searchHistoryStore';
import { useHomeStore } from '../../../src/store/homeStore';
import type { SearchHistoryItem } from '../../../src/store/searchHistoryStore';
import type { Product, CategoryDef } from '../../../src/services/productService';
import type { Deal } from '../../../src/services/dealService';
import BarcodeScanner from '../../../src/components/scan/BarcodeScanner';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';
import { formatPrice, formatDiscount } from '../../../src/utils/formatPrice';
import { getStoreConfig } from '../../../src/utils/storeConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Section Header component
// ---------------------------------------------------------------------------
function SectionHeader({
  title,
  onSeeAll,
  seeAllLabel,
}: {
  title: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>{seeAllLabel || 'Voir tout'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export default function ScanScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { searchByText, searchByBarcode, isSearching } = useScanStore();
  const { history, loadHistory, clearHistory } = useSearchHistoryStore();
  const {
    popularProducts,
    categories,
    topDeals,
    isLoadingPopular,
    loadAll,
  } = useHomeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const isNavigatingRef = useRef(false);

  const country = user?.country || 'FR';

  // Load all home data on mount
  useEffect(() => {
    loadHistory();
    loadAll(country);
  }, [country]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    try {
      await searchByText(searchQuery.trim(), country);
      router.push({
        pathname: '/(tabs)/scan/results',
        params: { query: searchQuery.trim(), type: 'text' },
      });
    } finally {
      setTimeout(() => { isNavigatingRef.current = false; }, 1000);
    }
  }, [searchQuery, country]);

  const handleBarcodeScanned = useCallback(async (barcode: string, _barcodeType: string) => {
    if (isNavigatingRef.current) return;
    setShowScanner(false);
    const cleanBarcode = barcode.replace(/[^a-zA-Z0-9]/g, '').trim();
    if (!cleanBarcode) {
      Alert.alert(t('common.error'), t('results.noResults'));
      return;
    }
    isNavigatingRef.current = true;
    try {
      await searchByBarcode(cleanBarcode, country);
      router.push({
        pathname: '/(tabs)/scan/results',
        params: { query: cleanBarcode, type: 'barcode' },
      });
    } finally {
      setTimeout(() => { isNavigatingRef.current = false; }, 1000);
    }
  }, [country]);

  const handleHistoryTap = useCallback(async (item: SearchHistoryItem) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    try {
      if (item.type === 'barcode') {
        await searchByBarcode(item.query, country);
        router.push({
          pathname: '/(tabs)/scan/results',
          params: { query: item.query, type: 'barcode' },
        });
      } else {
        const query = item.productName || item.query;
        await searchByText(query, country);
        router.push({
          pathname: '/(tabs)/scan/results',
          params: { query, type: 'text' },
        });
      }
    } finally {
      setTimeout(() => { isNavigatingRef.current = false; }, 1000);
    }
  }, [country]);

  const handleCategoryTap = useCallback(async (cat: CategoryDef) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    try {
      await searchByText(cat.searchQuery, country);
      router.push({
        pathname: '/(tabs)/scan/results',
        params: { query: cat.searchQuery, type: 'text' },
      });
    } finally {
      setTimeout(() => { isNavigatingRef.current = false; }, 1000);
    }
  }, [country]);

  const handlePopularTap = useCallback(async (product: Product) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    try {
      await searchByText(product.name, country);
      router.push({
        pathname: '/(tabs)/scan/results',
        params: { query: product.name, type: 'text' },
      });
    } finally {
      setTimeout(() => { isNavigatingRef.current = false; }, 1000);
    }
  }, [country]);

  const handleDealTap = useCallback((deal: Deal) => {
    if (deal.productUrl) {
      Linking.openURL(deal.productUrl);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (showScanner) {
    return (
      <BarcodeScanner
        onBarcodeScanned={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  if (isSearching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('results.searching')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
      >
        {/* ─── Search Bar ─────────────────────────────── */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('scan.searchPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <FontAwesome name="times-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.barcodeButton} onPress={() => setShowScanner(true)}>
            <FontAwesome name="barcode" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* ─── Recently Viewed ────────────────────────── */}
        {history.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('home.recentlyViewed')}
              onSeeAll={clearHistory}
              seeAllLabel={t('common.delete')}
            />
            <FlatList
              horizontal
              data={history.slice(0, 10)}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recentCard} onPress={() => handleHistoryTap(item)}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.recentImage} />
                  ) : (
                    <View style={[styles.recentImage, styles.recentImagePlaceholder]}>
                      <FontAwesome
                        name={item.type === 'barcode' ? 'barcode' : 'search'}
                        size={18}
                        color={COLORS.textMuted}
                      />
                    </View>
                  )}
                  <Text style={styles.recentName} numberOfLines={2}>
                    {item.productName || item.query}
                  </Text>
                  {item.lowestPrice ? (
                    <Text style={styles.recentPrice}>
                      {formatPrice(item.lowestPrice, item.currency || 'EUR')}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* ─── Categories ─────────────────────────────── */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={t('home.topCategories')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={styles.categoryItem}
                  onPress={() => handleCategoryTap(cat)}
                >
                  <View style={styles.categoryCircle}>
                    <FontAwesome name={cat.icon as any} size={22} color={COLORS.primary} />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={1}>
                    {t(cat.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Popular Products ────────────────────────── */}
        {popularProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={t('home.popularProducts')} />
            <FlatList
              horizontal
              data={popularProducts}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.popularCard} onPress={() => handlePopularTap(item)}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.popularImage} />
                  ) : (
                    <View style={[styles.popularImage, styles.popularImagePlaceholder]}>
                      <FontAwesome name="cube" size={28} color={COLORS.textMuted} />
                    </View>
                  )}
                  <Text style={styles.popularName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.lowestPrice > 0 && (
                    <Text style={styles.popularPrice}>
                      {t('results.fromPrice', { price: formatPrice(item.lowestPrice, item.prices?.[0]?.currency || 'EUR') })}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* ─── Top Deals ──────────────────────────────── */}
        {topDeals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('home.topDeals')}
              onSeeAll={() => router.push('/(tabs)/deals')}
              seeAllLabel={t('common.seeAll')}
            />
            {topDeals.slice(0, 4).map((deal) => {
              const storeConfig = getStoreConfig(deal.marketplace);
              return (
                <TouchableOpacity
                  key={deal._id}
                  style={styles.dealCard}
                  onPress={() => handleDealTap(deal)}
                >
                  {deal.imageUrl ? (
                    <Image source={{ uri: deal.imageUrl }} style={styles.dealImage} />
                  ) : (
                    <View style={[styles.dealImage, styles.dealImagePlaceholder]}>
                      <FontAwesome name="tag" size={20} color={COLORS.textMuted} />
                    </View>
                  )}
                  <View style={styles.dealInfo}>
                    <Text style={styles.dealTitle} numberOfLines={2}>{deal.title}</Text>
                    <View style={styles.dealStoreRow}>
                      <View style={[styles.dealStoreDot, { backgroundColor: storeConfig.color }]} />
                      <Text style={styles.dealStoreName}>{storeConfig.displayName}</Text>
                    </View>
                    <View style={styles.dealPriceRow}>
                      <Text style={styles.dealPrice}>
                        {formatPrice(deal.dealPrice, deal.currency)}
                      </Text>
                      {deal.originalPrice > deal.dealPrice && (
                        <Text style={styles.dealOriginalPrice}>
                          {formatPrice(deal.originalPrice, deal.currency)}
                        </Text>
                      )}
                    </View>
                  </View>
                  {deal.discountPercent > 0 && (
                    <View style={styles.dealBadge}>
                      <Text style={styles.dealBadgeText}>{formatDiscount(deal.discountPercent)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ─── Loading indicator for home data ────────── */}
        {isLoadingPopular && popularProducts.length === 0 && categories.length === 0 && (
          <View style={styles.homeLoading}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        {/* ─── Sign-in prompt for guests ──────────────── */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.signInBanner}
            onPress={() => router.push('/(auth)/login')}
          >
            <FontAwesome name="user-circle" size={18} color={COLORS.primary} />
            <Text style={styles.signInBannerText}>{t('auth.signIn')}</Text>
            <FontAwesome name="chevron-right" size={12} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },

  // ─── Search Bar ──────────────────────────────────
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  barcodeButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Sections ────────────────────────────────────
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },

  // ─── Recently Viewed ─────────────────────────────
  recentCard: {
    width: 110,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentImage: {
    width: '100%',
    height: 70,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  recentImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
  recentPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
    marginTop: 2,
  },

  // ─── Categories ──────────────────────────────────
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // ─── Popular Products ────────────────────────────
  popularCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  popularImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.surfaceLight,
  },
  popularImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    lineHeight: 17,
  },
  popularPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingTop: 2,
    paddingBottom: SPACING.sm,
  },

  // ─── Top Deals ───────────────────────────────────
  dealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  dealImage: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  dealImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealInfo: {
    flex: 1,
    gap: 3,
  },
  dealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  dealStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dealStoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dealStoreName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dealPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.success,
  },
  dealOriginalPrice: {
    fontSize: 13,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  dealBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  dealBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ─── Home Loading ────────────────────────────────
  homeLoading: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },

  // ─── Sign-in Banner ──────────────────────────────
  signInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  signInBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

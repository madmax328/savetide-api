import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Linking,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { useDealsStore } from '../../../src/store/dealsStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';
import { formatPrice, formatDiscount } from '../../../src/utils/formatPrice';
import { getStoreConfig } from '../../../src/utils/storeConfig';
import type { Deal } from '../../../src/services/dealService';

const CATEGORIES = ['all', 'electronics', 'home', 'fashion', 'sports', 'beauty', 'toys', 'general'];

export default function DealsScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    deals,
    isLoading,
    error,
    selectedCategory,
    hasMore,
    fetchDeals,
    loadMore,
    setCategory,
    refresh,
  } = useDealsStore();

  const country = user?.country || 'FR';

  // Initial load
  useEffect(() => {
    fetchDeals(country);
  }, [country]);

  const handleCategoryPress = useCallback(
    (cat: string) => {
      setCategory(cat);
      fetchDeals(country, cat);
    },
    [country],
  );

  const handleRefresh = useCallback(() => {
    refresh(country);
  }, [country]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore(country);
    }
  }, [country, hasMore, isLoading]);

  const renderDealCard = ({ item }: { item: Deal }) => {
    const storeConfig = getStoreConfig(item.marketplace);

    return (
      <View style={styles.dealCard}>
        {/* Image area */}
        {item.imageUrl ? (
          <View style={styles.dealImageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.dealImage} resizeMode="contain" />
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{formatDiscount(item.discountPercent)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.dealImagePlaceholder}>
            <FontAwesome name="tag" size={30} color={COLORS.textMuted} />
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{formatDiscount(item.discountPercent)}</Text>
            </View>
          </View>
        )}

        <View style={styles.dealInfo}>
          <Text style={styles.dealTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Store chip */}
          <View style={styles.storeChip}>
            <View style={[styles.storeChipDot, { backgroundColor: storeConfig.color }]} />
            <Text style={styles.storeChipText}>{storeConfig.displayName}</Text>
          </View>

          {/* Prices */}
          <View style={styles.priceRow}>
            {item.originalPrice > 0 && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice, item.currency)}
              </Text>
            )}
            <Text style={styles.dealPrice}>
              {formatPrice(item.dealPrice, item.currency)}
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => Linking.openURL(item.productUrl)}
          >
            <Text style={styles.viewButtonText}>{t('deals.viewDeal')}</Text>
            <FontAwesome name="external-link" size={12} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || deals.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('deals.title'), headerShown: true }} />
      <SafeAreaView style={styles.container}>
        {/* Category filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {t(`deals.categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* First load spinner */}
        {isLoading && deals.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : (
          <FlatList
            data={deals}
            renderItem={renderDealCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && deals.length > 0}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <FontAwesome name="tag" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>{t('deals.noDeals')}</Text>
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
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  dealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dealImageContainer: {
    height: 160,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealImage: {
    width: '100%',
    height: '100%',
  },
  dealImagePlaceholder: {
    height: 160,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  dealInfo: {
    padding: SPACING.md,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.success,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl * 2,
    gap: SPACING.md,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
  },
});

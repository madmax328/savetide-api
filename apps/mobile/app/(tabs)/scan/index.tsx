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
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { useScanStore } from '../../../src/store/scanStore';
import { useSearchHistoryStore } from '../../../src/store/searchHistoryStore';
import type { SearchHistoryItem } from '../../../src/store/searchHistoryStore';
import BarcodeScanner from '../../../src/components/scan/BarcodeScanner';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';
import { formatPrice } from '../../../src/utils/formatPrice';

export default function ScanScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { searchByText, searchByBarcode, isSearching } = useScanStore();
  const { history, loadHistory, clearHistory } = useSearchHistoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const isNavigatingRef = useRef(false);

  const country = user?.country || 'FR';

  // Load search history on mount
  useEffect(() => {
    loadHistory();
  }, []);

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

  const handleBarcodeScanned = useCallback(async (barcode: string, barcodeType: string) => {
    if (isNavigatingRef.current) return;
    setShowScanner(false);

    // Clean barcode — strip any non-alphanumeric chars
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
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar with sign-in button for guests */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <FontAwesome name="sign-in" size={14} color={COLORS.white} />
            <Text style={styles.topButtonText}>{t('auth.signIn')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.logo}>SaveTide</Text>
          <Text style={styles.subtitle}>{t('app.tagline')}</Text>

          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
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
                <FontAwesome name="times-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.orText}>{t('scan.orSearch')}</Text>

          <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}>
            <View style={styles.iconCircle}>
              <FontAwesome name="barcode" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>{t('scan.scanBarcode')}</Text>
          </TouchableOpacity>
        </View>

        {/* Search History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historySectionTitle}>{t('scan.recentSearches')}</Text>
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.historyClearText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>

            {history.slice(0, 8).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => handleHistoryTap(item)}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.historyImage} />
                ) : (
                  <View style={styles.historyImagePlaceholder}>
                    <FontAwesome
                      name={item.type === 'barcode' ? 'barcode' : 'search'}
                      size={16}
                      color={COLORS.textMuted}
                    />
                  </View>
                )}
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName} numberOfLines={1}>
                    {item.productName || item.query}
                  </Text>
                  <View style={styles.historyMeta}>
                    <FontAwesome
                      name={item.type === 'barcode' ? 'barcode' : 'search'}
                      size={10}
                      color={COLORS.textMuted}
                    />
                    <Text style={styles.historyQuery} numberOfLines={1}>
                      {item.query.length > 30 ? item.query.substring(0, 30) + '...' : item.query}
                    </Text>
                  </View>
                </View>
                {item.lowestPrice ? (
                  <Text style={styles.historyPrice}>
                    {formatPrice(item.lowestPrice, item.currency || 'EUR')}
                  </Text>
                ) : null}
                <FontAwesome name="chevron-right" size={12} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  topButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  topButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  orText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginVertical: SPACING.lg,
  },
  scanButton: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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

  // Search History
  historySection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  historySectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  historyClearText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  historyImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    gap: 2,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyQuery: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  historyPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
    marginRight: SPACING.xs,
  },
});

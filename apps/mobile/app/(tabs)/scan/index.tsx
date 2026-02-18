import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../src/store/authStore';
import { useScanStore } from '../../../src/store/scanStore';
import { useFreeUsageStore } from '../../../src/store/freeUsageStore';
import BarcodeScanner from '../../../src/components/scan/BarcodeScanner';
import SignupWall from '../../../src/components/SignupWall';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';

export default function ScanScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { searchByText, searchByBarcode, searchByImage, isSearching } = useScanStore();
  const { isLimitReached, incrementSearch, loadCount } = useFreeUsageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const country = user?.country || 'FR';

  // Load free usage count on mount
  useEffect(() => {
    if (!isAuthenticated) {
      loadCount();
    }
  }, [isAuthenticated]);

  /**
   * Check if the user can search (authenticated = unlimited, guest = 3 free).
   * Returns true if allowed, shows wall if not.
   */
  const canSearch = useCallback(async (): Promise<boolean> => {
    if (isAuthenticated) return true;
    if (isLimitReached) {
      useFreeUsageStore.setState({ showSignupWall: true });
      return false;
    }
    const allowed = await incrementSearch();
    return allowed;
  }, [isAuthenticated, isLimitReached]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    if (!(await canSearch())) return;
    try {
      await searchByText(searchQuery.trim(), country);
      router.push({
        pathname: '/(tabs)/scan/results',
        params: { query: searchQuery.trim(), type: 'text' },
      });
    } catch {
      Alert.alert(t('common.error'), t('results.noResults'));
    }
  }, [searchQuery, country, canSearch]);

  const handleBarcodeScanned = useCallback(async (barcode: string, _type: string) => {
    setShowScanner(false);
    if (!(await canSearch())) return;
    try {
      await searchByBarcode(barcode, country);
      router.push({
        pathname: '/(tabs)/scan/results',
        params: { query: barcode, type: 'barcode' },
      });
    } catch {
      Alert.alert(t('common.error'), t('results.noResults'));
    }
  }, [country, canSearch]);

  const handlePhotoSearch = useCallback(async () => {
    if (!(await canSearch())) return;
    try {
      // Ask user: camera or gallery?
      const choice = await new Promise<'camera' | 'gallery' | null>((resolve) => {
        Alert.alert(
          t('scan.takePhoto'),
          undefined,
          [
            { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(null) },
            { text: t('scan.fromGallery'), onPress: () => resolve('gallery') },
            { text: t('scan.fromCamera'), onPress: () => resolve('camera') },
          ],
        );
      });

      if (!choice) return;

      let result: ImagePicker.ImagePickerResult;

      if (choice === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('common.error'), t('scan.cameraPermissionMessage'));
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('common.error'), t('scan.cameraPermissionMessage'));
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
        });
      }

      if (result.canceled || !result.assets?.[0]?.base64) return;

      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;

      await searchByImage(base64, country);
      router.push({
        pathname: '/(tabs)/scan/results',
        params: { query: 'photo', type: 'image' },
      });
    } catch {
      Alert.alert(t('common.error'), t('results.noResults'));
    }
  }, [country, canSearch]);

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

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowScanner(true)}>
            <View style={styles.iconCircle}>
              <FontAwesome name="barcode" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>{t('scan.scanBarcode')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handlePhotoSearch}>
            <View style={styles.iconCircle}>
              <FontAwesome name="camera" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>{t('scan.takePhoto')}</Text>
          </TouchableOpacity>
        </View>

        {/* Guest mode: show remaining searches */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.guestBanner}
            onPress={() => router.push('/(auth)/register')}
          >
            <FontAwesome name="user-plus" size={14} color={COLORS.primary} />
            <Text style={styles.guestBannerText}>{t('freeLimit.banner')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Signup wall modal */}
      <SignupWall />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
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
  actions: {
    flexDirection: 'row',
    gap: SPACING.lg,
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 160,
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
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  guestBannerText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/utils/constants';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
      <Stack.Screen options={{ title: t('profile.settings'), headerShown: true }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            {/* Language */}
            <TouchableOpacity style={styles.settingItem} onPress={toggleLanguage}>
              <FontAwesome name="language" size={18} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>{t('profile.language')}</Text>
              <Text style={styles.settingValue}>
                {i18n.language === 'fr' ? t('profile.french') : t('profile.english')}
              </Text>
              <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Notifications */}
            <View style={styles.settingItem}>
              <FontAwesome name="bell" size={18} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>{t('profile.notifications')}</Text>
              <Switch
                value={user?.notificationsEnabled ?? true}
                trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.settingItem}>
              <FontAwesome name="info-circle" size={18} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>{t('profile.about')}</Text>
              <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <FontAwesome name="file-text-o" size={18} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>{t('profile.terms')}</Text>
              <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <FontAwesome name="shield" size={18} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>{t('profile.privacy')}</Text>
              <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
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
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

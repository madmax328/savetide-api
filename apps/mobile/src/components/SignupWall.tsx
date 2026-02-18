import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/constants';
import { useFreeUsageStore } from '../store/freeUsageStore';

export default function SignupWall() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showSignupWall, dismissWall } = useFreeUsageStore();

  if (!showSignupWall) return null;

  return (
    <Modal
      visible={showSignupWall}
      transparent
      animationType="fade"
      onRequestClose={dismissWall}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconCircle}>
            <FontAwesome name="lock" size={32} color={COLORS.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('freeLimit.title')}</Text>

          {/* Description */}
          <Text style={styles.description}>{t('freeLimit.description')}</Text>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <FontAwesome name="check" size={14} color={COLORS.success} />
              <Text style={styles.featureText}>{t('freeLimit.feature1')}</Text>
            </View>
            <View style={styles.featureRow}>
              <FontAwesome name="check" size={14} color={COLORS.success} />
              <Text style={styles.featureText}>{t('freeLimit.feature2')}</Text>
            </View>
            <View style={styles.featureRow}>
              <FontAwesome name="check" size={14} color={COLORS.success} />
              <Text style={styles.featureText}>{t('freeLimit.feature3')}</Text>
            </View>
          </View>

          {/* Sign up button */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => {
              dismissWall();
              router.push('/(auth)/register');
            }}
          >
            <Text style={styles.signupButtonText}>{t('freeLimit.signup')}</Text>
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => {
              dismissWall();
              router.push('/(auth)/login');
            }}
          >
            <Text style={styles.loginLinkText}>{t('freeLimit.hasAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  features: {
    alignSelf: 'stretch',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    width: '100%',
    alignItems: 'center',
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: SPACING.md,
  },
  loginLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

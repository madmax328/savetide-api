import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

interface SplashAnimationProps {
  onAnimationComplete: () => void;
}

export default function SplashAnimation({ onAnimationComplete }: SplashAnimationProps) {
  // Animation values
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const waveScale = useSharedValue(0);
  const waveOpacity = useSharedValue(0.6);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Step 1: Logo appears with spring (0ms -> 600ms)
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
      mass: 1,
    });

    // Step 2: Wave pulse behind logo (200ms -> 800ms)
    waveScale.value = withDelay(
      200,
      withTiming(3, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
    waveOpacity.value = withDelay(
      200,
      withTiming(0, { duration: 800 }),
    );

    // Step 3: Subtitle slides up and fades in (500ms -> 900ms)
    subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    subtitleTranslateY.value = withDelay(
      500,
      withSpring(0, { damping: 15, stiffness: 120 }),
    );

    // Step 4: Fade out everything (2000ms -> 2500ms)
    containerOpacity.value = withDelay(
      2000,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      }),
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const waveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
    transform: [{ scale: waveScale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <LinearGradient
        colors={['#0F172A', '#0c2d5e', '#0F172A']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Wave pulse */}
        <Animated.View style={[styles.wave, waveAnimatedStyle]} />

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Text style={styles.logo}>Save</Text>
          <Text style={styles.logoAccent}>Tide</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={subtitleAnimatedStyle}>
          <Text style={styles.subtitle}>Comparateur de Prix Intelligent</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -2,
  },
  logoAccent: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

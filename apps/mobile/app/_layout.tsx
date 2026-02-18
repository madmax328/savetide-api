import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import '../src/i18n';
import { useAuthStore } from '../src/store/authStore';
import { usePushNotifications } from '../src/hooks/usePushNotifications';
import SplashAnimation from '../src/components/SplashAnimation';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Hide the native splash — our custom animation takes over
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <RootLayoutNav />
      {showSplash && <SplashAnimation onAnimationComplete={handleSplashComplete} />}
    </>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Register for push notifications when authenticated
  usePushNotifications(isAuthenticated);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Authenticated users in auth pages → go to scan
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/scan');
      hasNavigated.current = true;
    }
    // Non-authenticated users not yet in tabs → redirect to scan (only once)
    else if (!isAuthenticated && !inAuthGroup && segments[0] !== '(tabs)' && !hasNavigated.current) {
      router.replace('/(tabs)/scan');
      hasNavigated.current = true;
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

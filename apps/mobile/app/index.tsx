import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../src/utils/constants';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/scan" />;
  }

  // Guest users go to scan (free mode) — not login
  return <Redirect href="/(tabs)/scan" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

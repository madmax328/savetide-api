import { Stack } from 'expo-router';
import { COLORS } from '../../../src/utils/constants';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ title: '' }} />
      <Stack.Screen name="settings" options={{ title: '' }} />
    </Stack>
  );
}

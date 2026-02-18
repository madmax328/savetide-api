import { Stack } from 'expo-router';
import { COLORS } from '../../../src/utils/constants';

export default function ScanLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    />
  );
}

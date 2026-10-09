import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { UpdateButton } from '@/components/UpdateButton';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.backgroundElevated },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
          headerRight: () => <UpdateButton />,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'BOEE' }} />
        <Stack.Screen name="new" options={{ title: 'New estimate' }} />
        <Stack.Screen name="scenario/[id]" options={{ title: 'Estimate' }} />
        <Stack.Screen name="compare" options={{ title: 'Compare' }} />
        <Stack.Screen name="settings" options={{ title: 'Constants' }} />
      </Stack>
    </>
  );
}

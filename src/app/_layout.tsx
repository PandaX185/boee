import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'BOEE' }} />
        <Stack.Screen name="new" options={{ title: 'New estimate' }} />
        <Stack.Screen name="scenario/[id]" options={{ title: 'Estimate' }} />
        <Stack.Screen name="compare" options={{ title: 'Compare' }} />
        <Stack.Screen name="settings" options={{ title: 'Constants' }} />
      </Stack>
    </>
  );
}

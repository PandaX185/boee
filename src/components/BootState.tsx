import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { colors, motion, radius, spacing, typography } from '@/constants/theme';

export function BootLoading() {
  const reduced = usePrefersReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      return;
    }
    pulse.set(withRepeat(withTiming(0.45, { duration: motion.duration.slow }), -1, true));
    return () => cancelAnimation(pulse);
  }, [reduced, pulse]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>BOEE</Text>
        <Text style={styles.subtitle}>Loading your estimates…</Text>
        <Animated.View style={[styles.bars, shimmerStyle]}>
          <View style={styles.bar} />
          <View style={[styles.bar, styles.barShort]} />
          <View style={styles.bar} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

interface ErrorProps {
  onRetry: () => void;
  onReset: () => void;
}

export function BootError({ onRetry, onReset }: ErrorProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Couldn’t load saved data</Text>
        <Text style={styles.subtitle}>
          Your estimates are still on this device. Check the connection-free storage by retrying, or
          reset the local cache if loading keeps failing.
        </Text>
        <View style={styles.actions}>
          <Button label="Retry" onPress={onRetry} />
          <Button label="Reset saved data" variant="secondary" onPress={onReset} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bars: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  bar: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  barShort: {
    width: '72%',
  },
  actions: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});

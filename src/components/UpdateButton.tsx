import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/motion/PressableScale';
import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { colors, motion, radius, spacing } from '@/constants/theme';
import {
  checkForUpdate,
  openUpdateUrl,
  releasesPageUrl,
  type UpdateStatus,
} from '@/services/appUpdate';

let autoChecked = false;
let inflight: Promise<UpdateStatus> | null = null;

export function UpdateButton() {
  const [checking, setChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const mounted = useRef(true);
  const reduced = usePrefersReducedMotion();
  const badgePulse = useSharedValue(1);

  useEffect(() => {
    mounted.current = true;
    if (!autoChecked) {
      autoChecked = true;
      inflight = checkForUpdate();
      inflight
        .then((status) => {
          if (mounted.current && status.updateAvailable) {
            setHasUpdate(true);
          }
        })
        .catch(() => undefined)
        .finally(() => {
          inflight = null;
        });
    }
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hasUpdate || reduced) {
      return;
    }
    badgePulse.set(withRepeat(withTiming(1.5, { duration: motion.duration.slow }), -1, true));
    return () => cancelAnimation(badgePulse);
  }, [hasUpdate, reduced, badgePulse]);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgePulse.value }] }));

  const checkingRef = useRef(false);
  const handlePress = async () => {
    if (checkingRef.current) {
      return;
    }
    checkingRef.current = true;
    setChecking(true);
    try {
      const status = await checkForUpdate();
      if (mounted.current) {
        setHasUpdate(status.updateAvailable);
      }
      showUpdateDialog(status, () => void handlePress());
    } finally {
      checkingRef.current = false;
      if (mounted.current) {
        setChecking(false);
      }
    }
  };

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={hasUpdate ? 'Update available. Check for updates.' : 'Check for updates'}
      onPress={() => void handlePress()}
      hitSlop={8}
      style={styles.button}
    >
      {checking ? (
        <ActivityIndicator size="small" color={colors.text} testID="update-checking" />
      ) : (
        <View>
          <Text style={styles.icon}>↓</Text>
          {hasUpdate ? (
            <Animated.View style={[styles.badge, badgeStyle]} testID="update-badge" />
          ) : null}
        </View>
      )}
    </PressableScale>
  );
}

function showUpdateDialog(status: UpdateStatus, retry: () => void) {
  if (status.error) {
    Alert.alert('Couldn’t check for updates', 'You appear to be offline. Try again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'View releases', onPress: () => void openUpdateUrl(releasesPageUrl()) },
      { text: 'Retry', onPress: retry },
    ]);
    return;
  }
  if (status.updateAvailable && status.latest) {
    const latest = status.latest;
    const directApk =
      Platform.OS === 'android' &&
      typeof status.downloadUrl === 'string' &&
      status.downloadUrl.toLowerCase().endsWith('.apk');
    Alert.alert(
      'Update available',
      `${latest.name} is ready. Installed v${status.current ?? 'unknown'}.`,
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Release notes', onPress: () => void openUpdateUrl(latest.htmlUrl) },
        {
          text: directApk ? 'Download APK' : 'View release',
          onPress: () => {
            if (status.downloadUrl) {
              void openUpdateUrl(status.downloadUrl);
            }
          },
        },
      ],
    );
    return;
  }
  Alert.alert(
    'You’re up to date',
    status.current
      ? `Installed v${status.current} is the latest.`
      : 'Installed version matches latest.',
    [
      { text: 'OK', style: 'cancel' },
      { text: 'View releases', onPress: () => void openUpdateUrl(releasesPageUrl()) },
    ],
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});

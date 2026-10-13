import { MaterialIcons } from '@expo/vector-icons';
import type { DownloadTask, File } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/motion/PressableScale';
import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { UpdateModal, type UpdateModalAction, type UpdatePhase } from '@/components/UpdateModal';
import { colors, motion, radius, spacing } from '@/constants/theme';
import {
  canInstallInPlace,
  checkForUpdate,
  getInstallContentUri,
  installUpdateApk,
  openUpdateUrl,
  releasesPageUrl,
  startUpdateDownload,
  type LatestRelease,
  type UpdateStatus,
} from '@/services/appUpdate';

let autoChecked = false;
let inflight: Promise<UpdateStatus> | null = null;

export function UpdateButton() {
  const [checking, setChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [phase, setPhase] = useState<UpdatePhase>({ kind: 'checking' });
  const mounted = useRef(true);
  const reduced = usePrefersReducedMotion();
  const badgePulse = useSharedValue(1);
  const downloadRef = useRef<DownloadTask | null>(null);
  const fileRef = useRef<File | null>(null);
  const latestRef = useRef<LatestRelease | null>(null);
  const urlRef = useRef<string | null>(null);

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

  const closeModal = () => {
    downloadRef.current?.cancel();
    downloadRef.current = null;
    if (mounted.current) {
      setModalVisible(false);
    }
  };

  const runCheck = async () => {
    setPhase({ kind: 'checking' });
    const status = await checkForUpdate();
    if (!mounted.current) {
      return;
    }
    setHasUpdate(status.updateAvailable);
    if (status.error) {
      setPhase({ kind: 'error', message: 'You appear to be offline. Try again.', retry: 'check' });
    } else if (status.updateAvailable && status.latest) {
      latestRef.current = status.latest;
      const canInstall = canInstallInPlace(status.downloadUrl);
      urlRef.current = canInstall ? status.downloadUrl : null;
      setPhase({ kind: 'update', current: status.current, latest: status.latest, canInstall });
    } else {
      setPhase({ kind: 'current', version: status.current });
    }
  };

  const checkingRef = useRef(false);
  const handlePress = async () => {
    if (checkingRef.current) {
      return;
    }
    checkingRef.current = true;
    setChecking(true);
    try {
      setModalVisible(true);
      await runCheck();
    } finally {
      checkingRef.current = false;
      if (mounted.current) {
        setChecking(false);
      }
    }
  };

  const startDownload = async () => {
    const url = urlRef.current;
    const latest = latestRef.current;
    if (!url || !latest) {
      return;
    }
    setPhase({ kind: 'downloading', latest, progress: null });
    const { task, done } = startUpdateDownload(url, (bytesWritten, totalBytes) => {
      if (!mounted.current) {
        return;
      }
      setPhase((current) =>
        current.kind === 'downloading'
          ? { ...current, progress: totalBytes > 0 ? bytesWritten / totalBytes : null }
          : current,
      );
    });
    downloadRef.current = task;
    try {
      const file = await done;
      if (downloadRef.current !== task) {
        return;
      }
      downloadRef.current = null;
      if (!mounted.current) {
        return;
      }
      if (!file) {
        setModalVisible(false);
        return;
      }
      fileRef.current = file;
      setPhase({ kind: 'ready', latest });
    } catch {
      downloadRef.current = null;
      if (mounted.current) {
        setPhase({ kind: 'error', message: 'Download failed. Try again.', retry: 'check' });
      }
    }
  };

  const runInstall = async () => {
    const file = fileRef.current;
    const latest = latestRef.current;
    if (!file || !latest) {
      return;
    }
    setPhase({ kind: 'installing' });
    try {
      const contentUri = await getInstallContentUri(file);
      await installUpdateApk(contentUri);
      if (mounted.current) {
        setModalVisible(false);
      }
    } catch {
      if (mounted.current) {
        setPhase({
          kind: 'error',
          message:
            'Could not open the installer. Allow installs from BOEE in the system settings, then try again.',
          retry: 'install',
        });
      }
    }
  };

  const handleAction = (action: UpdateModalAction) => {
    if (action === 'close') {
      closeModal();
    } else if (action === 'retry') {
      if (phase.kind === 'error' && phase.retry === 'install') {
        void runInstall();
      } else {
        void runCheck();
      }
    } else if (action === 'download') {
      void startDownload();
    } else if (action === 'install') {
      void runInstall();
    } else if (action === 'open-release') {
      const url = latestRef.current?.htmlUrl;
      if (url) {
        void openUpdateUrl(url);
      }
    } else if (action === 'open-releases') {
      void openUpdateUrl(releasesPageUrl());
    }
  };

  return (
    <>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={
          hasUpdate ? 'Update available. Check for updates.' : 'Check for updates'
        }
        onPress={() => void handlePress()}
        hitSlop={8}
        style={styles.button}
        testID="update-header-button"
      >
        {checking ? (
          <ActivityIndicator size="small" color={colors.text} testID="update-checking" />
        ) : (
          <View>
            <MaterialIcons name="system-update" size={22} color={colors.text} />
            {hasUpdate ? (
              <Animated.View style={[styles.badge, badgeStyle]} testID="update-badge" />
            ) : null}
          </View>
        )}
      </PressableScale>
      <UpdateModal visible={modalVisible} phase={phase} onAction={handleAction} />
    </>
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

import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { colors, motion, radius, spacing, typography } from '@/constants/theme';
import { formatBytes } from '@/core/format';
import type { LatestRelease } from '@/services/appUpdate';

export type UpdateModalAction =
  'close' | 'retry' | 'download' | 'install' | 'open-release' | 'open-releases';

export type UpdatePhase =
  | { kind: 'checking' }
  | { kind: 'current'; version: string | null }
  | { kind: 'error'; message: string; retry: 'check' | 'install' }
  | { kind: 'update'; current: string | null; latest: LatestRelease; canInstall: boolean }
  | { kind: 'downloading'; latest: LatestRelease; progress: number | null }
  | { kind: 'ready'; latest: LatestRelease }
  | { kind: 'installing' };

interface Props {
  visible: boolean;
  phase: UpdatePhase;
  onAction: (action: UpdateModalAction) => void;
}

export function UpdateModal({ visible, phase, onAction }: Props) {
  const reduced = usePrefersReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onAction('close')}
    >
      <Pressable style={styles.overlay} onPress={() => onAction('close')}>
        <Pressable onPress={() => undefined}>
          <Animated.View
            entering={reduced ? undefined : FadeInDown.duration(motion.duration.base)}
            style={styles.card}
          >
            {phase.kind === 'checking' ? (
              <CheckingBody onCancel={() => onAction('close')} />
            ) : phase.kind === 'current' ? (
              <CurrentBody
                version={phase.version}
                onReleases={() => onAction('open-releases')}
                onDone={() => onAction('close')}
              />
            ) : phase.kind === 'error' ? (
              <ErrorBody
                message={phase.message}
                retryLabel={phase.retry === 'install' ? 'Try installing again' : 'Retry'}
                onRetry={() => onAction('retry')}
                onReleases={phase.retry === 'check' ? () => onAction('open-releases') : undefined}
                onClose={() => onAction('close')}
              />
            ) : phase.kind === 'update' ? (
              <UpdateBody
                current={phase.current}
                latest={phase.latest}
                canInstall={phase.canInstall}
                onDownload={() => onAction('download')}
                onViewRelease={() => onAction('open-release')}
                onNotes={() => onAction('open-release')}
                onLater={() => onAction('close')}
              />
            ) : phase.kind === 'downloading' ? (
              <DownloadingBody
                latest={phase.latest}
                progress={phase.progress}
                onCancel={() => onAction('close')}
              />
            ) : phase.kind === 'ready' ? (
              <ReadyBody
                latest={phase.latest}
                onInstall={() => onAction('install')}
                onLater={() => onAction('close')}
              />
            ) : (
              <InstallingBody onCancel={() => onAction('close')} />
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CheckingBody({ onCancel }: { onCancel: () => void }) {
  return (
    <View style={styles.body}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.title}>Checking for updates…</Text>
      <View style={styles.actions}>
        <Button label="Cancel" variant="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}

function CurrentBody({
  version,
  onReleases,
  onDone,
}: {
  version: string | null;
  onReleases: () => void;
  onDone: () => void;
}) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>You’re up to date</Text>
      <Text style={styles.message}>
        {version ? `Installed v${version} is the latest.` : 'Installed version matches latest.'}
      </Text>
      <View style={styles.actions}>
        <Button label="View releases" variant="secondary" onPress={onReleases} />
        <Button label="Done" onPress={onDone} />
      </View>
    </View>
  );
}

function ErrorBody({
  message,
  retryLabel,
  onRetry,
  onReleases,
  onClose,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  onReleases?: () => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <Button label={retryLabel} onPress={onRetry} />
        {onReleases ? (
          <Button label="View releases" variant="secondary" onPress={onReleases} />
        ) : null}
        <Button label="Cancel" variant="secondary" onPress={onClose} />
      </View>
    </View>
  );
}

function UpdateBody({
  current,
  latest,
  canInstall,
  onDownload,
  onViewRelease,
  onNotes,
  onLater,
}: {
  current: string | null;
  latest: LatestRelease;
  canInstall: boolean;
  onDownload: () => void;
  onViewRelease: () => void;
  onNotes: () => void;
  onLater: () => void;
}) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>Update available</Text>
      <Text style={styles.message}>
        {`${latest.name} is ready. Installed v${current ?? 'unknown'}.`}
        {latest.apkSize ? ` ${formatBytes(latest.apkSize)} download.` : ''}
      </Text>
      <View style={styles.actions}>
        {canInstall ? (
          <Button label="Download & install" onPress={onDownload} />
        ) : (
          <Button label="View release" onPress={onViewRelease} />
        )}
        {canInstall ? <Button label="Release notes" variant="secondary" onPress={onNotes} /> : null}
        <Button label="Later" variant="secondary" onPress={onLater} />
      </View>
    </View>
  );
}

function DownloadingBody({
  latest,
  progress,
  onCancel,
}: {
  latest: LatestRelease;
  progress: number | null;
  onCancel: () => void;
}) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>Downloading update</Text>
      <Text style={styles.message}>{latest.name}</Text>
      {progress !== null ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{`${Math.round(progress * 100)}%`}</Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
      <View style={styles.actions}>
        <Button label="Cancel" variant="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}

function ReadyBody({
  latest,
  onInstall,
  onLater,
}: {
  latest: LatestRelease;
  onInstall: () => void;
  onLater: () => void;
}) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>Download complete</Text>
      <Text style={styles.message}>
        {`${latest.name} is ready to install. The previous download is replaced, so old versions do not pile up.`}
      </Text>
      <View style={styles.actions}>
        <Button label="Install update" onPress={onInstall} />
        <Button label="Later" variant="secondary" onPress={onLater} />
      </View>
    </View>
  );
}

function InstallingBody({ onCancel }: { onCancel: () => void }) {
  return (
    <View style={styles.body}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.title}>Opening installer…</Text>
      <Text style={styles.message}>
        If nothing happens, allow installs from BOEE in the system settings, then try again.
      </Text>
      <View style={styles.actions}>
        <Button label="Cancel" variant="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  body: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  progressWrap: {
    width: '100%',
    gap: spacing.xs,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  progressText: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});

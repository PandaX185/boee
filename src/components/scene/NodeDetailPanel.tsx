import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PRESSURE_COLOR } from '@/components/scene/sceneLayout';
import { CATEGORY_LABELS } from '@/core/categories';
import { useBreakpoint } from '@/components/useBreakpoint';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { SceneNode } from '@/core/scene';
import type { Implication } from '@/domain/types';

interface Props {
  node: SceneNode;
  implications: Implication[];
  onClose: () => void;
}

export function NodeDetailPanel({ node, implications, onClose }: Props) {
  const color = PRESSURE_COLOR[node.pressure];
  const breakpoint = useBreakpoint();

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      style={[styles.panel, { borderColor: color }]}
    >
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>{node.label}</Text>
          <Text style={styles.role}>{node.role}</Text>
        </View>
        <Text style={[styles.pressure, { color }]}>{node.pressure}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close component details"
          onPress={onClose}
          hitSlop={8}
          style={styles.close}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.metrics}>
        {node.metrics.map((metric) => (
          <View
            key={metric.key}
            style={[styles.metric, breakpoint === 'compact' && styles.metricFull]}
          >
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      {implications.length > 0 ? (
        implications.map((implication) => (
          <View key={implication.id} style={styles.implication}>
            <Text style={styles.implicationMeta}>
              {implication.severity.toUpperCase()} · {CATEGORY_LABELS[implication.category]}
            </Text>
            <Text style={styles.implicationMessage}>{implication.message}</Text>
            <Text style={styles.implicationTrigger}>trigger: {implication.trigger}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.none}>No implications on this component.</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heading: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.heading,
    color: colors.text,
  },
  role: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pressure: {
    ...typography.label,
  },
  close: {
    paddingHorizontal: spacing.xs,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 2,
  },
  metricFull: {
    flexBasis: '100%',
  },
  metricValue: {
    ...typography.bodyStrong,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  implication: {
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  implicationMeta: {
    ...typography.label,
    color: colors.textMuted,
  },
  implicationMessage: {
    ...typography.body,
    color: colors.text,
  },
  implicationTrigger: {
    ...typography.caption,
    color: colors.textFaint,
    fontStyle: 'italic',
  },
  none: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { colors, elevation, radius, spacing, typography } from '@/constants/theme';
import type { MetricDescriptor } from '@/core/metrics';

interface Props {
  metrics: MetricDescriptor[];
}

export function MetricGrid({ metrics }: Props) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <View key={metric.key} style={styles.card}>
          <AnimatedNumber
            style={styles.value}
            value={metric.raw}
            format={metric.format}
            interpolate={metric.interpolate}
          />
          <Text style={styles.label}>{metric.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    ...elevation.card,
  },
  value: {
    ...typography.metric,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

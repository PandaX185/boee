import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import type { MetricDescriptor } from '@/core/metrics';

interface Props {
  metrics: MetricDescriptor[];
}

export function MetricGrid({ metrics }: Props) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <View key={metric.key} style={styles.card}>
          <Text style={styles.value}>{metric.value}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_LABELS, groupByCategory } from '@/core/categories';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { useBreakpoint } from '@/components/useBreakpoint';
import { colors, elevation, radius, spacing, typography } from '@/constants/theme';
import type { MetricDescriptor } from '@/core/metrics';

interface Props {
  metrics: MetricDescriptor[];
}

export function MetricGrid({ metrics }: Props) {
  const breakpoint = useBreakpoint();
  const groups = groupByCategory(metrics);

  return (
    <View style={styles.groups}>
      {groups.map((group) => (
        <View key={group.category}>
          <Text style={styles.groupTitle}>{CATEGORY_LABELS[group.category]}</Text>
          <View style={styles.grid}>
            {group.items.map((metric) => (
              <View
                key={metric.key}
                style={[styles.card, breakpoint === 'wide' && styles.cardWide]}
              >
                <AnimatedNumber
                  style={styles.value}
                  value={metric.raw}
                  format={metric.format}
                  interpolate
                />
                <Text style={styles.label}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groups: {
    gap: spacing.md,
  },
  groupTitle: {
    ...typography.label,
    color: colors.textFaint,
    marginBottom: spacing.xs,
  },
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
  cardWide: {
    flexBasis: '23%',
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

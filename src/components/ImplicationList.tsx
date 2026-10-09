import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import type { Implication, ImplicationSeverity } from '@/domain/types';

const severityRank: Record<ImplicationSeverity, number> = {
  warning: 1,
  info: 0,
};

interface Props {
  implications: Implication[];
}

export function ImplicationList({ implications }: Props) {
  if (implications.length === 0) {
    return (
      <Text style={styles.empty}>No implications triggered with the current assumptions.</Text>
    );
  }

  const ordered = [...implications].sort(
    (a, b) => severityRank[b.severity] - severityRank[a.severity],
  );

  return (
    <View style={styles.list}>
      {ordered.map((item) => (
        <View
          key={item.id}
          style={[styles.item, item.severity === 'warning' ? styles.warning : styles.info]}
        >
          <Text style={styles.meta}>
            {item.severity.toUpperCase()} · {item.category}
          </Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.trigger}>trigger: {item.trigger}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  item: {
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  warning: {
    borderLeftColor: colors.warning,
  },
  info: {
    borderLeftColor: colors.info,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  message: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  trigger: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

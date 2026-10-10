import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_LABELS, groupByCategory } from '@/core/categories';
import { Stagger } from '@/components/motion/Stagger';
import { colors, radius, spacing, typography } from '@/constants/theme';
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

  const groups = groupByCategory(implications).map((group) => ({
    ...group,
    items: [...group.items].sort((a, b) => severityRank[b.severity] - severityRank[a.severity]),
  }));

  return (
    <View style={styles.groups}>
      {groups.map((group) => (
        <View key={group.category}>
          <Text style={styles.groupTitle}>{CATEGORY_LABELS[group.category]}</Text>
          <Stagger style={styles.list}>
            {group.items.map((item) => (
              <View
                key={item.id}
                style={[styles.item, item.severity === 'warning' ? styles.warning : styles.info]}
              >
                <Text style={styles.meta}>{item.severity.toUpperCase()}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.trigger}>trigger: {item.trigger}</Text>
              </View>
            ))}
          </Stagger>
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
  list: {
    gap: spacing.sm,
  },
  item: {
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
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
    ...typography.label,
    color: colors.textMuted,
  },
  message: {
    ...typography.body,
    color: colors.text,
  },
  trigger: {
    ...typography.caption,
    color: colors.textFaint,
    fontStyle: 'italic',
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
  },
});

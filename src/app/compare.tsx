import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BootError, BootLoading } from '@/components/BootState';
import { Stagger } from '@/components/motion/Stagger';
import { colors, layout, radius, spacing } from '@/constants/theme';
import { evaluate } from '@/core/evaluate';
import { describeMetrics } from '@/core/metrics';
import type { Scenario } from '@/domain/types';
import { confirmDestructive } from '@/services/confirm';
import { useBoot } from '@/store/hydration';
import { useScenarioStore } from '@/store/scenarioStore';
import { useSettingsStore } from '@/store/settingsStore';

export default function CompareScreen() {
  const boot = useBoot();
  const scenarios = useScenarioStore((state) => state.scenarios);
  const constants = useSettingsStore((state) => state.constants);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return [prev[1], id];
    });

  const picked = selected
    .map((id) => scenarios.find((scenario) => scenario.id === id))
    .filter((scenario): scenario is Scenario => Boolean(scenario));

  const rows = useMemo(() => {
    if (picked.length !== 2) {
      return null;
    }
    const left = describeMetrics(evaluate(picked[0].inputs, constants).derived);
    const right = describeMetrics(evaluate(picked[1].inputs, constants).derived);
    return left.map((metric, index) => ({
      label: metric.label,
      left: metric.value,
      right: right[index]?.value ?? '—',
    }));
  }, [picked, constants]);

  if (boot.status === 'loading') {
    return <BootLoading />;
  }
  if (boot.status === 'failed') {
    return (
      <BootError
        onRetry={boot.retry}
        onReset={() =>
          confirmDestructive(
            'Reset saved data',
            'Delete all saved estimates and constants on this device?',
            boot.resetSavedData,
          )
        }
      />
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>Pick two estimates to compare their derived metrics.</Text>

      <Stagger>
        {scenarios.map((scenario) => {
          const order = selected.indexOf(scenario.id);
          const isSelected = order >= 0;
          return (
            <Pressable
              key={scenario.id}
              onPress={() => toggle(scenario.id)}
              style={[styles.row, isSelected && styles.rowSelected]}
            >
              <Text style={styles.rowTitle}>{scenario.name}</Text>
              {isSelected ? <Text style={styles.badge}>{order === 0 ? 'A' : 'B'}</Text> : null}
            </Pressable>
          );
        })}
      </Stagger>

      {scenarios.length === 0 ? (
        <Text style={styles.message}>No scenarios to compare yet.</Text>
      ) : null}

      {rows ? (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, styles.cellLabel, styles.headerText]}>Metric</Text>
            <Text style={[styles.cell, styles.headerText]} numberOfLines={2}>
              {picked[0].name}
            </Text>
            <Text style={[styles.cell, styles.headerText]} numberOfLines={2}>
              {picked[1].name}
            </Text>
          </View>
          {rows.map((row) => (
            <View key={row.label} style={styles.tableRow}>
              <Text style={[styles.cell, styles.cellLabel]}>{row.label}</Text>
              <Text style={styles.cell}>{row.left}</Text>
              <Text style={styles.cell}>{row.right}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.message}>Select two scenarios to see the comparison.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  lead: {
    color: colors.textMuted,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowSelected: {
    borderColor: colors.primary,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  badge: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  table: {
    marginTop: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  tableHeader: {
    borderTopWidth: 0,
    backgroundColor: colors.surface,
  },
  cell: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: 13,
  },
  cellLabel: {
    flex: 1.4,
    color: colors.textMuted,
  },
  headerText: {
    fontWeight: '700',
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
  },
});

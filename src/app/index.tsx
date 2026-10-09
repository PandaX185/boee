import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/BrandHeader';
import { Button } from '@/components/Button';
import { colors, radius, spacing } from '@/constants/theme';
import type { Scenario } from '@/domain/types';
import { confirmDestructive } from '@/services/confirm';
import { useScenarioHydrated } from '@/store/hydration';
import { useScenarioStore } from '@/store/scenarioStore';

export default function HomeScreen() {
  const hydrated = useScenarioHydrated();
  const scenarios = useScenarioStore((state) => state.scenarios);
  const removeScenario = useScenarioStore((state) => state.removeScenario);
  const duplicateScenario = useScenarioStore((state) => state.duplicateScenario);

  const openScenario = (id: string) => router.push({ pathname: '/scenario/[id]', params: { id } });

  const renderScenario = ({ item }: { item: Scenario }) => (
    <View style={styles.card}>
      <Pressable style={styles.cardBody} onPress={() => openScenario(item.id)}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardMeta}>Updated {new Date(item.updatedAt).toLocaleDateString()}</Text>
      </Pressable>
      <View style={styles.cardActions}>
        <Pressable onPress={() => duplicateScenario(item.id)}>
          <Text style={styles.cardAction}>Copy</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            confirmDestructive('Delete estimate', `Delete "${item.name}"?`, () =>
              removeScenario(item.id),
            )
          }
        >
          <Text style={[styles.cardAction, styles.cardDelete]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.header}>
        <BrandHeader />
      </View>
      <View style={styles.actions}>
        <Button label="New estimate" onPress={() => router.push('/new')} />
        <View style={styles.secondaryRow}>
          <View style={styles.secondaryItem}>
            <Button label="Compare" variant="secondary" onPress={() => router.push('/compare')} />
          </View>
          <View style={styles.secondaryItem}>
            <Button
              label="Constants"
              variant="secondary"
              onPress={() => router.push('/settings')}
            />
          </View>
        </View>
      </View>

      {!hydrated ? (
        <Text style={styles.empty}>Loading…</Text>
      ) : (
        <FlatList
          data={scenarios}
          keyExtractor={(item) => item.id}
          renderItem={renderScenario}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No scenarios yet. Create your first estimate.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  actions: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryItem: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardAction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  cardDelete: {
    color: colors.danger,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
  },
});

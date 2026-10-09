import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';
import { useScenarioStore } from '@/store/scenarioStore';
import type { Scenario } from '@/domain/types';

export default function HomeScreen() {
  const scenarios = useScenarioStore((state) => state.scenarios);
  const removeScenario = useScenarioStore((state) => state.removeScenario);

  const renderScenario = ({ item }: { item: Scenario }) => (
    <View style={styles.card}>
      <Pressable
        style={styles.cardBody}
        onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: item.id } })}
      >
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardMeta}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
      </Pressable>
      <Pressable onPress={() => removeScenario(item.id)}>
        <Text style={styles.cardDelete}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: 'new' } })}
        >
          <Text style={styles.primaryButtonText}>New estimate</Text>
        </Pressable>
        <View style={styles.secondaryRow}>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/compare')}>
            <Text style={styles.secondaryButtonText}>Compare</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/settings')}>
            <Text style={styles.secondaryButtonText}>Constants</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={scenarios}
        keyExtractor={(item) => item.id}
        renderItem={renderScenario}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No scenarios yet. Create your first estimate.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actions: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: spacing.md,
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
  cardDelete: {
    color: colors.danger,
    fontSize: 14,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

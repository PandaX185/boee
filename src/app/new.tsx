import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Reveal } from '@/components/motion/Reveal';
import { colors, layout, radius, spacing } from '@/constants/theme';
import { PRESETS, type Preset } from '@/core/presets';
import { createScenario } from '@/core/scenarios';
import { useScenarioStore } from '@/store/scenarioStore';

export default function NewScenarioScreen() {
  const addScenario = useScenarioStore((state) => state.addScenario);

  const start = (preset: Preset) => {
    const scenario = createScenario(preset.name, preset.inputs);
    addScenario(scenario);
    router.replace({ pathname: '/scenario/[id]', params: { id: scenario.id } });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.lead}>Start from a preset, then tune the assumptions.</Text>
      {PRESETS.map((preset, index) => (
        <Reveal key={preset.id} delay={index * 60}>
          <Pressable
            accessibilityRole="button"
            onPress={() => start(preset)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <Text style={styles.cardTitle}>{preset.name}</Text>
            <Text style={styles.cardMeta}>
              {preset.inputs.traffic.dailyActiveUsers.toLocaleString()} DAU ·{' '}
              {preset.inputs.traffic.actionsPerUserPerDay} actions/user/day ·{' '}
              {preset.inputs.traffic.readWriteRatio}:1 read:write
            </Text>
          </Pressable>
        </Reveal>
      ))}
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
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
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
});

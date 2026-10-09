import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { useScenarioStore } from '@/store/scenarioStore';

export default function ScenarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = useScenarioStore((state) => state.scenarios.find((item) => item.id === id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{scenario ? scenario.name : 'New estimate'}</Text>
      <Text style={styles.body}>
        Grouped inputs, live derived metrics, and rule-based implications render here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

export default function CompareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compare scenarios</Text>
      <Text style={styles.body}>
        Pick two saved estimates to diff their derived metrics side by side.
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

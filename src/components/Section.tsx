import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Reveal } from '@/components/motion/Reveal';
import { colors, elevation, radius, spacing, typography } from '@/constants/theme';

interface Props {
  title: string;
  children: ReactNode;
  delay?: number;
}

export function Section({ title, children, delay = 0 }: Props) {
  return (
    <Reveal delay={delay} style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...elevation.card,
  },
  title: {
    ...typography.label,
    color: colors.textFaint,
  },
  body: {
    gap: spacing.sm,
  },
});

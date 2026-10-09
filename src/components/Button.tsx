import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
});

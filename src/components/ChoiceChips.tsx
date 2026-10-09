import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

interface Option<T> {
  label: string;
  value: T;
}

interface Props<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function ChoiceChips<T>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.primaryText,
    fontWeight: '600',
  },
});

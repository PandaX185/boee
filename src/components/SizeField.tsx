import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ChoiceChips } from '@/components/ChoiceChips';
import { colors, radius, spacing, typography } from '@/constants/theme';

const UNITS = [
  { label: 'B', factor: 1 },
  { label: 'KB', factor: 1024 },
  { label: 'MB', factor: 1024 ** 2 },
  { label: 'GB', factor: 1024 ** 3 },
];

const UNIT_OPTIONS = UNITS.map((unit) => ({ label: unit.label, value: unit.label }));

function pickUnit(bytes: number) {
  for (let index = UNITS.length - 1; index >= 0; index -= 1) {
    if (bytes >= UNITS[index].factor) {
      return UNITS[index];
    }
  }
  return UNITS[0];
}

function formatAmount(bytes: number, factor: number): string {
  return String(Number((bytes / factor).toFixed(2)));
}

interface Props {
  label: string;
  value: number;
  onChange: (bytes: number) => void;
  hint?: string;
}

export function SizeField({ label, value, onChange, hint }: Props) {
  const initialUnit = pickUnit(value);
  const [unit, setUnit] = useState(initialUnit.label);
  const [text, setText] = useState(() => formatAmount(value, initialUnit.factor));
  const [focused, setFocused] = useState(false);

  const emit = (nextText: string, nextUnit: string) => {
    setText(nextText);
    setUnit(nextUnit);
    const factor = UNITS.find((item) => item.label === nextUnit)?.factor ?? 1;
    const parsed = Number(nextText.replace(',', '.'));
    if (nextText.trim() !== '' && Number.isFinite(parsed)) {
      onChange(parsed * factor);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, focused && styles.inputFocused]}
          value={text}
          onChangeText={(next) => emit(next, unit)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="decimal-pad"
          inputMode="decimal"
          selectTextOnFocus
        />
        <ChoiceChips options={UNIT_OPTIONS} value={unit} onChange={(next) => emit(text, next)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.body,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textFaint,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    textAlign: 'right',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    minWidth: 90,
    fontVariant: ['tabular-nums'],
  },
  inputFocused: {
    borderColor: colors.primary,
  },
});

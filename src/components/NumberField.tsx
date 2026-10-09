import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
}

export function NumberField({ label, value, onChange, suffix, hint }: Props) {
  const [text, setText] = useState(() => String(value));
  const [focused, setFocused] = useState(false);

  const handleChange = (next: string) => {
    setText(next);
    const parsed = Number(next.replace(',', '.'));
    if (next.trim() !== '' && Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="decimal-pad"
          inputMode="decimal"
          selectTextOnFocus
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    ...typography.body,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textFaint,
    marginTop: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    minWidth: 124,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
  },
  input: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    paddingVertical: spacing.sm,
    flex: 1,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  suffix: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

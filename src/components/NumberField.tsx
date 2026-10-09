import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
}

export function NumberField({ label, value, onChange, suffix, hint }: Props) {
  const [text, setText] = useState(() => String(value));

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
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChange}
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
    color: colors.text,
    fontSize: 14,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    minWidth: 120,
  },
  input: {
    color: colors.text,
    fontSize: 15,
    paddingVertical: spacing.sm,
    flex: 1,
    textAlign: 'right',
  },
  suffix: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

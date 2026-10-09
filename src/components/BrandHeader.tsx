import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

const mark = require('../../assets/images/icon.png');

export function BrandHeader() {
  return (
    <View style={styles.container}>
      <Image source={mark} style={styles.mark} accessibilityIgnoresInvertColors />
      <View style={styles.text}>
        <Text style={styles.name}>BOEE</Text>
        <Text style={styles.tagline}>Back of Envelope Estimator</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
  },
  text: {
    gap: 2,
  },
  name: {
    ...typography.title,
    color: colors.text,
    letterSpacing: 1,
  },
  tagline: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

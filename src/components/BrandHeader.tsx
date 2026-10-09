import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

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
    width: 40,
    height: 40,
    borderRadius: radius.md,
  },
  text: {
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 12,
  },
});

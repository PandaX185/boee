import { Easing } from 'react-native';

export const palette = {
  void900: '#05080F',
  navy900: '#080D17',
  navy800: '#0C1322',
  navy700: '#111A2D',
  navy600: '#18233B',
  slate500: '#2A3A56',
  slate400: '#3E5273',
  slate300: '#6B7E9C',
  slate200: '#9AA9C2',
  mist100: '#E7EEF9',
  white: '#FFFFFF',
  electric: '#2E8BFF',
  blue600: '#1F6FE0',
  cyan: '#22D3EE',
  violet: '#8B5CF6',
  amber: '#F5A524',
  rose: '#FB7185',
  emerald: '#34D399',
} as const;

export const colors = {
  background: palette.void900,
  backgroundElevated: palette.navy900,
  surface: palette.navy800,
  card: palette.navy700,
  cardRaised: palette.navy600,
  overlay: 'rgba(5, 8, 15, 0.78)',
  text: palette.mist100,
  textMuted: palette.slate200,
  textFaint: palette.slate300,
  primary: palette.electric,
  primaryPressed: palette.blue600,
  primaryText: '#03101F',
  accent: palette.cyan,
  accentViolet: palette.violet,
  border: '#1C2940',
  borderStrong: '#2A3D5C',
  warning: palette.amber,
  info: palette.cyan,
  danger: palette.rose,
  success: palette.emerald,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 36, fontWeight: '800', letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2 },
  heading: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyStrong: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  caption: { fontSize: 12, fontWeight: '400' },
  metric: { fontSize: 20, fontWeight: '700' },
  metricLarge: { fontSize: 30, fontWeight: '800' },
} as const;

export const layout = {
  contentMaxWidth: 760,
} as const;

export const elevation = {
  none: {},
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  raised: {
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
} as const;

export const motion = {
  duration: {
    instant: 90,
    fast: 160,
    base: 260,
    slow: 420,
    cinematic: 720,
  },
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    decelerate: Easing.bezier(0.05, 0.7, 0.1, 1),
    accelerate: Easing.bezier(0.3, 0, 0.8, 0.15),
  },
  spring: {
    gentle: { damping: 18, stiffness: 160, mass: 1 },
    snappy: { damping: 24, stiffness: 260, mass: 0.9 },
    soft: { damping: 20, stiffness: 120, mass: 1 },
  },
} as const;

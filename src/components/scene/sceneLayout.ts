import { colors } from '@/constants/theme';
import type { Pressure } from '@/core/scene';

export const SCENE_HEIGHT = 288;

export const PRESSURE_COLOR: Record<Pressure, string> = {
  calm: colors.success,
  watch: colors.warning,
  critical: colors.danger,
};

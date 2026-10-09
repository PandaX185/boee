import { colors } from '@/constants/theme';
import type { Pressure, SceneNodeId } from '@/core/scene';

export interface Point {
  x: number;
  y: number;
}

export const SCENE_HEIGHT = 288;
export const NODE_WIDTH = 108;
export const NODE_HEIGHT = 86;

export const NODE_LAYOUT: Record<SceneNodeId, Point> = {
  traffic: { x: 0.1, y: 0.7 },
  loadBalancer: { x: 0.32, y: 0.7 },
  servers: { x: 0.54, y: 0.7 },
  cache: { x: 0.76, y: 0.24 },
  storage: { x: 0.76, y: 0.7 },
};

export const PRESSURE_COLOR: Record<Pressure, string> = {
  calm: colors.success,
  watch: colors.warning,
  critical: colors.danger,
};

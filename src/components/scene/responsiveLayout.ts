import type { SceneNodeId } from '@/core/scene';

export type SceneMode = 'stacked' | 'diagram';

export interface SceneRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResponsiveSceneLayout {
  mode: SceneMode;
  width: number;
  height: number;
  rects: Record<SceneNodeId, SceneRect>;
  showEdgeLabels: boolean;
}

const DIAGRAM_BREAKPOINT = 560;
const STAGE_PADDING = 12;
const STACKED_CARD_HEIGHT = 76;
const STACKED_GAP = 10;

const DIAGRAM_POSITIONS: Record<SceneNodeId, { x: number; y: number }> = {
  traffic: { x: 0.12, y: 0.62 },
  loadBalancer: { x: 0.36, y: 0.62 },
  servers: { x: 0.6, y: 0.62 },
  cache: { x: 0.84, y: 0.28 },
  storage: { x: 0.84, y: 0.8 },
};

export function layoutScene(
  stageWidth: number,
  nodeIds: SceneNodeId[],
  preferredHeight = 288,
): ResponsiveSceneLayout {
  const width = Math.max(Math.floor(stageWidth), 0);

  if (width < DIAGRAM_BREAKPOINT) {
    const cardWidth = Math.max(width - STAGE_PADDING * 2, 0);
    const height =
      STAGE_PADDING * 2 +
      nodeIds.length * STACKED_CARD_HEIGHT +
      Math.max(nodeIds.length - 1, 0) * STACKED_GAP;
    const rects = {} as Record<SceneNodeId, SceneRect>;
    nodeIds.forEach((id, index) => {
      rects[id] = {
        x: STAGE_PADDING,
        y: STAGE_PADDING + index * (STACKED_CARD_HEIGHT + STACKED_GAP),
        width: cardWidth,
        height: STACKED_CARD_HEIGHT,
      };
    });
    return { mode: 'stacked', width, height, rects, showEdgeLabels: false };
  }

  const nodeWidth = Math.min(132, Math.max(104, Math.floor(width * 0.18)));
  const nodeHeight = 86;
  const height = Math.max(preferredHeight, 300);
  const rects = {} as Record<SceneNodeId, SceneRect>;
  for (const id of nodeIds) {
    const position = DIAGRAM_POSITIONS[id];
    const centerX = position.x * width;
    const centerY = position.y * height;
    rects[id] = {
      x: centerX - nodeWidth / 2,
      y: centerY - nodeHeight / 2,
      width: nodeWidth,
      height: nodeHeight,
    };
  }
  return { mode: 'diagram', width, height, rects, showEdgeLabels: true };
}

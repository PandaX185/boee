import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/motion/PressableScale';
import { useAppActive } from '@/components/motion/useAppActive';
import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { layoutScene, type SceneRect } from '@/components/scene/responsiveLayout';
import { PRESSURE_COLOR, SCENE_HEIGHT } from '@/components/scene/sceneLayout';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { SceneEdge, SceneModel, SceneNode, SceneNodeId } from '@/core/scene';

const EDGE_THICKNESS = 2;
const FALLBACK_WIDTH = 360;

interface Point {
  x: number;
  y: number;
}

interface Props {
  model: SceneModel;
  selected: SceneNodeId | null;
  onSelect: (id: SceneNodeId | null) => void;
  animate?: boolean;
  height?: number;
}

export function IsometricScene({
  model,
  selected,
  onSelect,
  animate = true,
  height = SCENE_HEIGHT,
}: Props) {
  const [width, setWidth] = useState(0);
  const reduced = usePrefersReducedMotion();
  const appActive = useAppActive();
  const active = animate && appActive && !reduced;
  const layoutWidth = width || FALLBACK_WIDTH;

  const layout = useMemo(() => {
    const ids = model.nodes.map((node) => node.id);
    return layoutScene(layoutWidth, ids, height);
  }, [model.nodes, layoutWidth, height]);

  const points = useMemo(() => {
    const map = new Map<SceneNodeId, Point>();
    for (const node of model.nodes) {
      const rect = layout.rects[node.id];
      map.set(node.id, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
    }
    return map;
  }, [model.nodes, layout]);

  const pointOf = (id: SceneNodeId): Point => points.get(id) ?? { x: 0, y: 0 };

  return (
    <View
      style={[styles.stage, { height: layout.height }]}
      testID="system-scene-stage"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        accessibilityLabel="Clear component selection"
        onPress={() => onSelect(null)}
      />
      {model.edges.map((edge) => (
        <SceneEdgeView
          key={edge.id}
          edge={edge}
          from={pointOf(edge.from)}
          to={pointOf(edge.to)}
          active={active}
          showLabel={layout.showEdgeLabels}
        />
      ))}
      {model.nodes.map((node, index) => {
        const rect: SceneRect = layout.rects[node.id];
        return (
          <Animated.View
            key={node.id}
            entering={FadeInDown.delay(index * 70).duration(320)}
            style={[
              styles.nodeWrap,
              {
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
              },
            ]}
          >
            <SceneNodeCard node={node} selected={selected === node.id} onSelect={onSelect} />
          </Animated.View>
        );
      })}
    </View>
  );
}

interface EdgeProps {
  edge: SceneEdge;
  from: Point;
  to: Point;
  active: boolean;
  showLabel: boolean;
}

function SceneEdgeView({ edge, from, to, active, showLabel }: EdgeProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const centerX = (from.x + to.x) / 2;
  const centerY = (from.y + to.y) / 2;
  const color = PRESSURE_COLOR[edge.load];

  return (
    <>
      <View
        style={[
          styles.edgeLine,
          {
            left: centerX - length / 2,
            top: centerY - EDGE_THICKNESS / 2,
            width: length,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }],
          },
        ]}
      >
        {active ? <FlowDot length={length} color={color} /> : null}
      </View>
      {showLabel ? (
        <View style={[styles.edgeLabelWrap, { left: centerX, top: centerY }]}>
          <Text style={styles.edgeLabel}>
            {edge.direction === 'forward' ? edge.label : `↺ ${edge.label}`}
          </Text>
        </View>
      ) : null}
    </>
  );
}

function FlowDot({ length, color }: { length: number; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(0);
    progress.set(withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(progress);
  }, [length, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * length }],
  }));

  return <Animated.View style={[styles.flowDot, { backgroundColor: color }, animatedStyle]} />;
}

interface NodeProps {
  node: SceneNode;
  selected: boolean;
  onSelect: (id: SceneNodeId | null) => void;
}

function SceneNodeCard({ node, selected, onSelect }: NodeProps) {
  const color = PRESSURE_COLOR[node.pressure];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${node.label}. ${node.headline} ${node.headlineLabel}. Pressure ${node.pressure}.`}
      onPress={() => onSelect(node.id)}
      pressedScale={0.95}
      style={[
        styles.node,
        { borderColor: selected ? colors.primary : color },
        selected && styles.nodeSelected,
      ]}
    >
      <View style={[styles.pressureDot, { backgroundColor: color }]} />
      <Text style={styles.nodeHeadline} numberOfLines={1}>
        {node.headline}
      </Text>
      <Text style={styles.nodeHeadlineLabel} numberOfLines={1}>
        {node.headlineLabel}
      </Text>
      <Text style={styles.nodeLabel} numberOfLines={1}>
        {node.label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  stage: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  edgeLine: {
    position: 'absolute',
    height: EDGE_THICKNESS,
    borderRadius: radius.pill,
    opacity: 0.6,
  },
  flowDot: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  edgeLabelWrap: {
    position: 'absolute',
    transform: [{ translateX: -24 }, { translateY: -20 }],
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  edgeLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  nodeWrap: {
    position: 'absolute',
  },
  node: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  nodeSelected: {
    backgroundColor: colors.cardRaised,
    borderWidth: 2,
  },
  pressureDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    marginBottom: 3,
  },
  nodeHeadline: {
    ...typography.bodyStrong,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  nodeHeadlineLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  nodeLabel: {
    ...typography.caption,
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 2,
  },
});

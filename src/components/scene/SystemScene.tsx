import { Component, type ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IsometricScene } from '@/components/scene/IsometricScene';
import { NodeDetailPanel } from '@/components/scene/NodeDetailPanel';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { SceneModel, SceneNodeId } from '@/core/scene';
import type { Implication } from '@/domain/types';

interface Props {
  model: SceneModel;
  implications: Implication[];
  animate?: boolean;
}

export function SystemScene({ model, implications, animate = true }: Props) {
  const [requested, setRequested] = useState<SceneNodeId | null>(null);

  const selectedNode = model.nodes.find((node) => node.id === requested) ?? null;
  const selectedImplications = selectedNode
    ? implications.filter((implication) => selectedNode.implicationIds.includes(implication.id))
    : [];

  return (
    <View style={styles.container}>
      <SceneErrorBoundary fallback={<SceneFallback model={model} />}>
        <IsometricScene
          model={model}
          selected={selectedNode?.id ?? null}
          onSelect={setRequested}
          animate={animate}
        />
      </SceneErrorBoundary>
      {selectedNode ? (
        <NodeDetailPanel
          node={selectedNode}
          implications={selectedImplications}
          onClose={() => setRequested(null)}
        />
      ) : (
        <Text style={styles.hint}>Tap a component to inspect its numbers and implications.</Text>
      )}
    </View>
  );
}

export function SceneFallback({ model }: { model: SceneModel }) {
  return (
    <View style={styles.fallback}>
      {model.nodes.map((node) => (
        <View key={node.id} style={styles.fallbackRow}>
          <Text style={styles.fallbackLabel}>{node.label}</Text>
          <Text style={styles.fallbackValue}>
            {node.headline} {node.headlineLabel}
          </Text>
        </View>
      ))}
    </View>
  );
}

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface BoundaryState {
  failed: boolean;
}

class SceneErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    paddingTop: spacing.xs,
  },
  fallback: {
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
  },
  fallbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  fallbackLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  fallbackValue: {
    ...typography.bodyStrong,
    color: colors.text,
  },
});

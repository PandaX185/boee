import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { estimate } from '@/core/estimate';
import { describeMetrics } from '@/core/metrics';
import { PRESETS } from '@/core/presets';
import { buildScene, pressureFromRatio } from '@/core/scene';
import type { Inputs } from '@/domain/types';

const heavy: Inputs = {
  traffic: {
    dailyActiveUsers: 50_000_000,
    actionsPerUserPerDay: 100,
    readWriteRatio: 1,
    peakMultiplier: 4,
  },
  dataShape: {
    objectSizeBytes: 4096,
    objectsWrittenPerAction: 1,
    objectsReadPerAction: 1,
    retentionDays: 1825,
    replicationFactor: 3,
  },
  nonFunctional: {
    availabilityTarget: 0.9999,
    monthlyGrowthRate: 0.05,
  },
};

describe('pressureFromRatio', () => {
  it('maps ratios onto calm, watch and critical bands', () => {
    expect(pressureFromRatio(0)).toBe('calm');
    expect(pressureFromRatio(0.49)).toBe('calm');
    expect(pressureFromRatio(0.5)).toBe('watch');
    expect(pressureFromRatio(0.99)).toBe('watch');
    expect(pressureFromRatio(1)).toBe('critical');
    expect(pressureFromRatio(2.5)).toBe('critical');
  });
});

describe('buildScene', () => {
  const evaluation = evaluate(heavy, DEFAULT_CONSTANTS);
  const scene = buildScene(heavy, evaluation.derived, evaluation.implications, DEFAULT_CONSTANTS);

  it('models the five architecture nodes in flow order', () => {
    expect(scene.nodes.map((node) => node.id)).toEqual([
      'traffic',
      'loadBalancer',
      'servers',
      'cache',
      'storage',
    ]);
  });

  it('connects only nodes that exist', () => {
    const ids = new Set(scene.nodes.map((node) => node.id));
    expect(scene.edges.length).toBeGreaterThan(0);
    for (const edge of scene.edges) {
      expect(ids.has(edge.from)).toBe(true);
      expect(ids.has(edge.to)).toBe(true);
      expect(edge.label.length).toBeGreaterThan(0);
    }
  });

  it('attaches fired rule ids to the matching nodes', () => {
    const servers = scene.nodes.find((node) => node.id === 'servers');
    expect(servers?.implicationIds).toEqual(expect.arrayContaining(['read-scale', 'write-scale']));
    const storage = scene.nodes.find((node) => node.id === 'storage');
    expect(storage?.implicationIds).toContain('storage-exceeds-memory');
    const loadBalancer = scene.nodes.find((node) => node.id === 'loadBalancer');
    expect(loadBalancer?.implicationIds).toContain('availability-redundancy');
  });

  it('raises server pressure to critical under heavy load', () => {
    const servers = scene.nodes.find((node) => node.id === 'servers');
    expect(servers?.pressure).toBe('critical');
  });

  it('reuses metric descriptors from the text UI', () => {
    const globalKeys = new Set(describeMetrics(evaluation.derived).map((metric) => metric.key));
    for (const node of scene.nodes) {
      for (const metric of node.metrics) {
        expect(globalKeys.has(metric.key)).toBe(true);
      }
    }
  });

  it('keeps a light preset calm at the edge', () => {
    const light = PRESETS[0].inputs;
    const lightEvaluation = evaluate(light, DEFAULT_CONSTANTS);
    const lightScene = buildScene(
      light,
      lightEvaluation.derived,
      lightEvaluation.implications,
      DEFAULT_CONSTANTS,
    );
    expect(lightScene.nodes.find((node) => node.id === 'traffic')?.pressure).toBe('calm');
  });

  it('does not depend on inputs for its structure', () => {
    const other = estimate(PRESETS[1].inputs, DEFAULT_CONSTANTS);
    const otherScene = buildScene(PRESETS[1].inputs, other, [], DEFAULT_CONSTANTS);
    expect(otherScene.nodes.map((node) => node.id)).toEqual(scene.nodes.map((node) => node.id));
    expect(otherScene.nodes.every((node) => node.implicationIds.length === 0)).toBe(true);
  });
});

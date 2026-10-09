import { formatBytes, formatQps } from '@/core/format';
import { describeMetrics, type MetricDescriptor } from '@/core/metrics';
import type { Constants, DerivedMetrics, Implication, Inputs } from '@/domain/types';

export type SceneNodeId = 'traffic' | 'loadBalancer' | 'servers' | 'cache' | 'storage';

export type Pressure = 'calm' | 'watch' | 'critical';

export interface SceneNode {
  id: SceneNodeId;
  label: string;
  role: string;
  headline: string;
  headlineLabel: string;
  pressure: Pressure;
  metrics: MetricDescriptor[];
  implicationIds: string[];
}

export interface SceneEdge {
  id: string;
  from: SceneNodeId;
  to: SceneNodeId;
  label: string;
  direction: 'forward' | 'reverse';
  load: Pressure;
}

export interface SceneModel {
  nodes: SceneNode[];
  edges: SceneEdge[];
}

const NODE_META: Record<SceneNodeId, { label: string; role: string }> = {
  traffic: { label: 'Traffic', role: 'Clients at the edge' },
  loadBalancer: { label: 'Load balancer', role: 'Distributes requests' },
  servers: { label: 'App servers', role: 'Stateless compute' },
  cache: { label: 'Cache', role: 'Hot working set' },
  storage: { label: 'Storage', role: 'Durable retained data' },
};

const NODE_RULE_IDS: Record<SceneNodeId, string[]> = {
  traffic: ['network-ingress', 'network-egress', 'growth-outlook'],
  loadBalancer: ['availability-redundancy'],
  servers: ['read-scale', 'write-scale'],
  cache: ['cache-hot-set'],
  storage: ['storage-exceeds-memory', 'retention-tiering'],
};

function ratio(actual: number, capacity: number): number {
  if (!Number.isFinite(actual) || !Number.isFinite(capacity) || capacity <= 0) {
    return 0;
  }
  return actual / capacity;
}

export function pressureFromRatio(value: number): Pressure {
  if (value >= 1) {
    return 'critical';
  }
  if (value >= 0.5) {
    return 'watch';
  }
  return 'calm';
}

function attachRules(id: SceneNodeId, fired: Set<string>): string[] {
  return NODE_RULE_IDS[id].filter((ruleId) => fired.has(ruleId));
}

export function buildScene(
  _inputs: Inputs,
  derived: DerivedMetrics,
  implications: Implication[],
  constants: Constants,
): SceneModel {
  const metrics = describeMetrics(derived);
  const byKey = new Map(metrics.map((metric) => [metric.key, metric]));
  const pick = (keys: (keyof DerivedMetrics)[]): MetricDescriptor[] =>
    keys
      .map((key) => byKey.get(key))
      .filter((metric): metric is MetricDescriptor => metric !== undefined);

  const fired = new Set(implications.map((implication) => implication.id));

  const trafficRatio = ratio(
    Math.max(derived.ingressBytesPerSecond, derived.egressBytesPerSecond),
    constants.infrastructure.nicBytesPerSecond,
  );
  const serverRatio = Math.max(
    ratio(derived.peakReadQps, constants.infrastructure.singleNodeReadQps),
    ratio(derived.peakWriteQps, constants.infrastructure.singleNodeWriteQps),
  );
  const cacheRatio = ratio(derived.cacheHotSetBytes, constants.infrastructure.cacheRamBytes);
  const storageRatio = ratio(derived.totalStorageBytes, constants.infrastructure.cacheRamBytes);

  const peakLoad = derived.peakReadQps + derived.peakWriteQps;

  const nodes: SceneNode[] = [
    {
      id: 'traffic',
      ...NODE_META.traffic,
      headline: formatQps(peakLoad),
      headlineLabel: 'peak load',
      pressure: pressureFromRatio(trafficRatio),
      metrics: pick([
        'peakReadQps',
        'peakWriteQps',
        'ingressBytesPerSecond',
        'egressBytesPerSecond',
      ]),
      implicationIds: attachRules('traffic', fired),
    },
    {
      id: 'loadBalancer',
      ...NODE_META.loadBalancer,
      headline: formatQps(peakLoad),
      headlineLabel: 'routed',
      pressure: fired.has('availability-redundancy') ? 'watch' : 'calm',
      metrics: pick(['peakReadQps', 'peakWriteQps', 'allowedDowntimeSecondsPerYear']),
      implicationIds: attachRules('loadBalancer', fired),
    },
    {
      id: 'servers',
      ...NODE_META.servers,
      headline: `${Math.round(derived.serverCount)}`,
      headlineLabel: 'instances',
      pressure: pressureFromRatio(serverRatio),
      metrics: pick(['serverCount', 'peakReadQps', 'peakWriteQps']),
      implicationIds: attachRules('servers', fired),
    },
    {
      id: 'cache',
      ...NODE_META.cache,
      headline: formatBytes(derived.cacheHotSetBytes),
      headlineLabel: 'hot set',
      pressure: pressureFromRatio(cacheRatio),
      metrics: pick(['cacheHotSetBytes', 'avgReadQps']),
      implicationIds: attachRules('cache', fired),
    },
    {
      id: 'storage',
      ...NODE_META.storage,
      headline: formatBytes(derived.totalStorageBytes),
      headlineLabel: 'retained',
      pressure: pressureFromRatio(storageRatio),
      metrics: pick(['totalStorageBytes', 'storagePerDayBytes', 'projectedStorage12moBytes']),
      implicationIds: attachRules('storage', fired),
    },
  ];

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const load = (id: SceneNodeId): Pressure => nodeById.get(id)?.pressure ?? 'calm';

  const edges: SceneEdge[] = [
    {
      id: 'traffic-loadBalancer',
      from: 'traffic',
      to: 'loadBalancer',
      label: `${formatBytes(derived.ingressBytesPerSecond)}/s`,
      direction: 'forward',
      load: load('traffic'),
    },
    {
      id: 'loadBalancer-servers',
      from: 'loadBalancer',
      to: 'servers',
      label: formatQps(peakLoad),
      direction: 'forward',
      load: load('servers'),
    },
    {
      id: 'servers-cache',
      from: 'servers',
      to: 'cache',
      label: formatBytes(derived.cacheHotSetBytes),
      direction: 'forward',
      load: load('cache'),
    },
    {
      id: 'servers-storage',
      from: 'servers',
      to: 'storage',
      label: `${formatBytes(derived.storagePerDayBytes)}/day`,
      direction: 'forward',
      load: load('storage'),
    },
  ];

  return { nodes, edges };
}

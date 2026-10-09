export interface TrafficInputs {
  dailyActiveUsers: number;
  actionsPerUserPerDay: number;
  readWriteRatio: number;
  peakMultiplier: number;
}

export interface DataShapeInputs {
  objectSizeBytes: number;
  objectsWrittenPerAction: number;
  objectsReadPerAction: number;
  retentionDays: number;
  replicationFactor: number;
}

export interface NonFunctionalInputs {
  availabilityTarget: number;
  monthlyGrowthRate: number;
}

export interface Inputs {
  traffic: TrafficInputs;
  dataShape: DataShapeInputs;
  nonFunctional: NonFunctionalInputs;
}

export interface InfrastructureConstants {
  serverQpsCapacity: number;
  singleNodeReadQps: number;
  singleNodeWriteQps: number;
  cacheRamBytes: number;
  nicBytesPerSecond: number;
}

export interface Constants {
  infrastructure: InfrastructureConstants;
  hotWorkingSetFraction: number;
}

export interface DerivedMetrics {
  avgWriteQps: number;
  avgReadQps: number;
  peakWriteQps: number;
  peakReadQps: number;
  storagePerDayBytes: number;
  storagePerYearBytes: number;
  totalStorageBytes: number;
  ingressBytesPerSecond: number;
  egressBytesPerSecond: number;
  cacheHotSetBytes: number;
  serverCount: number;
  allowedDowntimeSecondsPerYear: number;
  projectedDailyActiveUsers6mo: number;
  projectedDailyActiveUsers12mo: number;
  projectedStorage12moBytes: number;
}

export type ImplicationSeverity = 'info' | 'warning';

export type ImplicationCategory =
  'storage' | 'scaling' | 'caching' | 'network' | 'redundancy' | 'growth';

export interface Implication {
  id: string;
  category: ImplicationCategory;
  severity: ImplicationSeverity;
  message: string;
  trigger: string;
}

export interface Evaluation {
  derived: DerivedMetrics;
  implications: Implication[];
}

export interface Scenario {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  inputs: Inputs;
}

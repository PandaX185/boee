import type { Constants } from '@/domain/types';

export const GB = 1024 ** 3;

export const DEFAULT_CONSTANTS: Constants = {
  infrastructure: {
    serverQpsCapacity: 1_000,
    singleNodeReadQps: 5_000,
    singleNodeWriteQps: 1_000,
    cacheRamBytes: 64 * GB,
    nicBytesPerSecond: 125_000_000,
  },
  hotWorkingSetFraction: 0.2,
};

export const CONSTANT_SOURCES: Record<string, string> = {
  serverQpsCapacity: 'Order-of-magnitude app-server throughput used for rough server counts.',
  singleNodeReadQps: 'Order-of-magnitude read throughput of a single relational node.',
  singleNodeWriteQps: 'Order-of-magnitude write throughput of a single relational primary.',
  cacheRamBytes: 'Assumed commodity server memory budget (64 GB).',
  nicBytesPerSecond: 'Commodity 1 Gbps network interface.',
  hotWorkingSetFraction:
    '80/20 heuristic: the hottest ~20% of the daily read volume fits in cache.',
};

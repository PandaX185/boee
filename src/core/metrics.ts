import { formatBytes, formatCount, formatDuration, formatQps } from '@/core/format';
import type { DerivedMetrics } from '@/domain/types';

export interface MetricDescriptor {
  key: keyof DerivedMetrics;
  label: string;
  value: string;
  raw: number;
  format: (value: number) => string;
  interpolate?: boolean;
}

function descriptor(
  key: keyof DerivedMetrics,
  label: string,
  raw: number,
  format: (value: number) => string,
  interpolate = false,
): MetricDescriptor {
  return { key, label, raw, format, interpolate, value: format(raw) };
}

export function describeMetrics(derived: DerivedMetrics): MetricDescriptor[] {
  return [
    descriptor('avgReadQps', 'Avg read QPS', derived.avgReadQps, formatQps),
    descriptor('peakReadQps', 'Peak read QPS', derived.peakReadQps, formatQps),
    descriptor('avgWriteQps', 'Avg write QPS', derived.avgWriteQps, formatQps),
    descriptor('peakWriteQps', 'Peak write QPS', derived.peakWriteQps, formatQps),
    descriptor('storagePerDayBytes', 'Storage / day', derived.storagePerDayBytes, formatBytes),
    descriptor('storagePerYearBytes', 'Storage / year', derived.storagePerYearBytes, formatBytes),
    descriptor('totalStorageBytes', 'Total retained', derived.totalStorageBytes, formatBytes),
    descriptor(
      'ingressBytesPerSecond',
      'Ingress',
      derived.ingressBytesPerSecond,
      (value) => `${formatBytes(value)}/s`,
    ),
    descriptor(
      'egressBytesPerSecond',
      'Egress',
      derived.egressBytesPerSecond,
      (value) => `${formatBytes(value)}/s`,
    ),
    descriptor('cacheHotSetBytes', 'Cache hot set', derived.cacheHotSetBytes, formatBytes),
    descriptor(
      'serverCount',
      'Server count',
      derived.serverCount,
      (value) => `${Math.round(value)}`,
      true,
    ),
    descriptor(
      'allowedDowntimeSecondsPerYear',
      'Allowed downtime / yr',
      derived.allowedDowntimeSecondsPerYear,
      formatDuration,
    ),
    descriptor(
      'projectedDailyActiveUsers6mo',
      'Projected DAU (6mo)',
      derived.projectedDailyActiveUsers6mo,
      formatCount,
      true,
    ),
    descriptor(
      'projectedDailyActiveUsers12mo',
      'Projected DAU (12mo)',
      derived.projectedDailyActiveUsers12mo,
      formatCount,
      true,
    ),
    descriptor(
      'projectedStorage12moBytes',
      'Projected storage (12mo)',
      derived.projectedStorage12moBytes,
      formatBytes,
    ),
  ];
}

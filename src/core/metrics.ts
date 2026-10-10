import { formatBytes, formatCount, formatDuration, formatQps } from '@/core/format';
import type { Category, DerivedMetrics } from '@/domain/types';

export interface MetricDescriptor {
  key: keyof DerivedMetrics;
  label: string;
  value: string;
  raw: number;
  format: (value: number) => string;
  category: Category;
  interpolate?: boolean;
}

function descriptor(
  key: keyof DerivedMetrics,
  label: string,
  raw: number,
  format: (value: number) => string,
  category: Category,
  interpolate = false,
): MetricDescriptor {
  return { key, label, raw, format, category, interpolate, value: format(raw) };
}

export function describeMetrics(derived: DerivedMetrics): MetricDescriptor[] {
  return [
    descriptor('avgReadQps', 'Avg read QPS', derived.avgReadQps, formatQps, 'throughput'),
    descriptor('peakReadQps', 'Peak read QPS', derived.peakReadQps, formatQps, 'throughput'),
    descriptor('avgWriteQps', 'Avg write QPS', derived.avgWriteQps, formatQps, 'throughput'),
    descriptor('peakWriteQps', 'Peak write QPS', derived.peakWriteQps, formatQps, 'throughput'),
    descriptor(
      'storagePerDayBytes',
      'Storage / day',
      derived.storagePerDayBytes,
      formatBytes,
      'storage',
    ),
    descriptor(
      'storagePerYearBytes',
      'Storage / year',
      derived.storagePerYearBytes,
      formatBytes,
      'storage',
    ),
    descriptor(
      'totalStorageBytes',
      'Total retained',
      derived.totalStorageBytes,
      formatBytes,
      'storage',
    ),
    descriptor(
      'ingressBytesPerSecond',
      'Ingress',
      derived.ingressBytesPerSecond,
      (value) => `${formatBytes(value)}/s`,
      'network',
    ),
    descriptor(
      'egressBytesPerSecond',
      'Egress',
      derived.egressBytesPerSecond,
      (value) => `${formatBytes(value)}/s`,
      'network',
    ),
    descriptor(
      'cacheHotSetBytes',
      'Cache hot set',
      derived.cacheHotSetBytes,
      formatBytes,
      'caching',
    ),
    descriptor(
      'serverCount',
      'Server count',
      derived.serverCount,
      (value) => `${Math.round(value)}`,
      'throughput',
      true,
    ),
    descriptor(
      'allowedDowntimeSecondsPerYear',
      'Allowed downtime / yr',
      derived.allowedDowntimeSecondsPerYear,
      formatDuration,
      'reliability',
    ),
    descriptor(
      'projectedDailyActiveUsers6mo',
      'Projected DAU (6mo)',
      derived.projectedDailyActiveUsers6mo,
      formatCount,
      'growth',
      true,
    ),
    descriptor(
      'projectedDailyActiveUsers12mo',
      'Projected DAU (12mo)',
      derived.projectedDailyActiveUsers12mo,
      formatCount,
      'growth',
      true,
    ),
    descriptor(
      'projectedStorage12moBytes',
      'Projected storage (12mo)',
      derived.projectedStorage12moBytes,
      formatBytes,
      'storage',
    ),
  ];
}

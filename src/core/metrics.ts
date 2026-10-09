import { formatBytes, formatCount, formatDuration, formatQps } from '@/core/format';
import type { DerivedMetrics } from '@/domain/types';

export interface MetricDescriptor {
  key: keyof DerivedMetrics;
  label: string;
  value: string;
}

export function describeMetrics(derived: DerivedMetrics): MetricDescriptor[] {
  return [
    { key: 'avgReadQps', label: 'Avg read QPS', value: formatQps(derived.avgReadQps) },
    { key: 'peakReadQps', label: 'Peak read QPS', value: formatQps(derived.peakReadQps) },
    { key: 'avgWriteQps', label: 'Avg write QPS', value: formatQps(derived.avgWriteQps) },
    { key: 'peakWriteQps', label: 'Peak write QPS', value: formatQps(derived.peakWriteQps) },
    { key: 'storagePerDayBytes', label: 'Storage / day', value: formatBytes(derived.storagePerDayBytes) },
    { key: 'storagePerYearBytes', label: 'Storage / year', value: formatBytes(derived.storagePerYearBytes) },
    {
      key: 'totalStorageBytes',
      label: 'Total retained',
      value: formatBytes(derived.totalStorageBytes),
    },
    {
      key: 'ingressBytesPerSecond',
      label: 'Ingress',
      value: `${formatBytes(derived.ingressBytesPerSecond)}/s`,
    },
    {
      key: 'egressBytesPerSecond',
      label: 'Egress',
      value: `${formatBytes(derived.egressBytesPerSecond)}/s`,
    },
    { key: 'cacheHotSetBytes', label: 'Cache hot set', value: formatBytes(derived.cacheHotSetBytes) },
    { key: 'serverCount', label: 'Server count', value: `${derived.serverCount}` },
    {
      key: 'allowedDowntimeSecondsPerYear',
      label: 'Allowed downtime / yr',
      value: formatDuration(derived.allowedDowntimeSecondsPerYear),
    },
    {
      key: 'projectedDailyActiveUsers6mo',
      label: 'Projected DAU (6mo)',
      value: formatCount(derived.projectedDailyActiveUsers6mo),
    },
    {
      key: 'projectedDailyActiveUsers12mo',
      label: 'Projected DAU (12mo)',
      value: formatCount(derived.projectedDailyActiveUsers12mo),
    },
    {
      key: 'projectedStorage12moBytes',
      label: 'Projected storage (12mo)',
      value: formatBytes(derived.projectedStorage12moBytes),
    },
  ];
}

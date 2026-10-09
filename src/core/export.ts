import { formatBytes, formatCount, formatDuration, formatPercent, formatQps } from '@/core/format';
import type { Evaluation, Scenario } from '@/domain/types';

export function toMarkdown(scenario: Scenario, evaluation: Evaluation): string {
  const { inputs, derived, implications } = {
    inputs: scenario.inputs,
    derived: evaluation.derived,
    implications: evaluation.implications,
  };

  const assumptions = [
    `- Daily active users: ${formatCount(inputs.traffic.dailyActiveUsers)}`,
    `- Actions per user / day: ${inputs.traffic.actionsPerUserPerDay}`,
    `- Read:write ratio: ${inputs.traffic.readWriteRatio}:1`,
    `- Peak multiplier: ${inputs.traffic.peakMultiplier}x`,
    `- Average object size: ${formatBytes(inputs.dataShape.objectSizeBytes)}`,
    `- Objects written per action: ${inputs.dataShape.objectsWrittenPerAction}`,
    `- Objects read per action: ${inputs.dataShape.objectsReadPerAction}`,
    `- Retention: ${inputs.dataShape.retentionDays} days`,
    `- Replication factor: ${inputs.dataShape.replicationFactor}`,
    `- Availability target: ${formatPercent(inputs.nonFunctional.availabilityTarget)}`,
    `- Monthly growth: ${formatPercent(inputs.nonFunctional.monthlyGrowthRate)}`,
  ];

  const derivedRows = [
    ['Avg read QPS', formatQps(derived.avgReadQps)],
    ['Peak read QPS', formatQps(derived.peakReadQps)],
    ['Avg write QPS', formatQps(derived.avgWriteQps)],
    ['Peak write QPS', formatQps(derived.peakWriteQps)],
    ['Storage / day', formatBytes(derived.storagePerDayBytes)],
    ['Storage / year', formatBytes(derived.storagePerYearBytes)],
    ['Total retained storage', formatBytes(derived.totalStorageBytes)],
    ['Ingress', `${formatBytes(derived.ingressBytesPerSecond)}/s`],
    ['Egress', `${formatBytes(derived.egressBytesPerSecond)}/s`],
    ['Cache hot set', formatBytes(derived.cacheHotSetBytes)],
    ['Server count', `${derived.serverCount}`],
    ['Allowed downtime / year', formatDuration(derived.allowedDowntimeSecondsPerYear)],
    ['Projected DAU (12mo)', formatCount(derived.projectedDailyActiveUsers12mo)],
    ['Projected storage (12mo)', formatBytes(derived.projectedStorage12moBytes)],
  ];

  const implicationLines =
    implications.length > 0
      ? implications.map((item) => `- **${item.severity}** [${item.category}] ${item.message}`)
      : ['- None triggered with the current assumptions.'];

  return [
    `# ${scenario.name}`,
    '',
    '## Assumptions',
    ...assumptions,
    '',
    '## Derived estimates',
    '| Metric | Value |',
    '| --- | --- |',
    ...derivedRows.map(([metric, value]) => `| ${metric} | ${value} |`),
    '',
    '## Implications',
    ...implicationLines,
    '',
    '## Open questions',
    '- ',
    '',
  ].join('\n');
}

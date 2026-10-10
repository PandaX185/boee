import { CATEGORY_LABELS } from '@/core/categories';
import { describeMetrics } from '@/core/metrics';
import type { Evaluation, Scenario } from '@/domain/types';

export function toMarkdown(scenario: Scenario, evaluation: Evaluation): string {
  const { inputs } = scenario;
  const { derived, implications } = evaluation;

  const assumptions = [
    `- Daily active users: ${inputs.traffic.dailyActiveUsers}`,
    `- Actions per user / day: ${inputs.traffic.actionsPerUserPerDay}`,
    `- Read:write ratio: ${inputs.traffic.readWriteRatio}:1`,
    `- Peak multiplier: ${inputs.traffic.peakMultiplier}x`,
    `- Average object size: ${inputs.dataShape.objectSizeBytes} bytes`,
    `- Objects written per action: ${inputs.dataShape.objectsWrittenPerAction}`,
    `- Objects read per action: ${inputs.dataShape.objectsReadPerAction}`,
    `- Retention: ${inputs.dataShape.retentionDays} days`,
    `- Replication factor: ${inputs.dataShape.replicationFactor}`,
    `- Availability target: ${inputs.nonFunctional.availabilityTarget}`,
    `- Monthly growth: ${inputs.nonFunctional.monthlyGrowthRate}`,
  ];

  const metricRows = describeMetrics(derived).map(
    (metric) => `| ${metric.label} | ${metric.value} |`,
  );

  const implicationLines =
    implications.length > 0
      ? implications.map(
          (item) => `- **${item.severity}** [${CATEGORY_LABELS[item.category]}] ${item.message}`,
        )
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
    ...metricRows,
    '',
    '## Implications',
    ...implicationLines,
    '',
    '## Open questions',
    '- ',
    '',
  ].join('\n');
}

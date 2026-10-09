import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { toMarkdown } from '@/core/export';
import { describeMetrics } from '@/core/metrics';
import { PRESETS } from '@/core/presets';
import { createScenario } from '@/core/scenarios';

describe('describeMetrics', () => {
  it('returns unique keys', () => {
    const metrics = describeMetrics(evaluate(PRESETS[1].inputs, DEFAULT_CONSTANTS).derived);
    const keys = metrics.map((metric) => metric.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('toMarkdown', () => {
  const scenario = createScenario('Twitter-like', PRESETS[1].inputs);
  const markdown = toMarkdown(scenario, evaluate(scenario.inputs, DEFAULT_CONSTANTS));

  it('includes every section', () => {
    expect(markdown).toContain('# Twitter-like');
    expect(markdown).toContain('## Assumptions');
    expect(markdown).toContain('## Derived estimates');
    expect(markdown).toContain('## Implications');
    expect(markdown).toContain('## Open questions');
  });
});

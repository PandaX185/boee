import { CATEGORY_ORDER, groupByCategory } from '@/core/categories';
import { describeMetrics } from '@/core/metrics';
import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { PRESETS } from '@/core/presets';

const metrics = describeMetrics(evaluate(PRESETS[0].inputs, DEFAULT_CONSTANTS).derived);

describe('describeMetrics', () => {
  it('tags every metric with a known category', () => {
    expect(metrics.length).toBeGreaterThan(0);
    for (const metric of metrics) {
      expect(CATEGORY_ORDER).toContain(metric.category);
    }
  });

  it('covers every display group', () => {
    const groups = groupByCategory(metrics);
    expect(groups.map((group) => group.category)).toEqual(CATEGORY_ORDER);
  });
});

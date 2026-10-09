import { render, screen } from '@testing-library/react-native';

import { MetricGrid } from '@/components/MetricGrid';
import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { describeMetrics } from '@/core/metrics';
import { PRESETS } from '@/core/presets';

describe('MetricGrid', () => {
  it('renders every metric label and value', async () => {
    const metrics = describeMetrics(evaluate(PRESETS[0].inputs, DEFAULT_CONSTANTS).derived);
    await render(<MetricGrid metrics={metrics} />);
    for (const metric of metrics) {
      expect(screen.getByText(metric.label)).toBeOnTheScreen();
      expect(screen.getAllByText(metric.value).length).toBeGreaterThanOrEqual(1);
    }
  });
});

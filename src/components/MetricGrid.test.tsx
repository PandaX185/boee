import { render, screen } from '@testing-library/react-native';

import { MetricGrid } from '@/components/MetricGrid';
import { useBreakpoint } from '@/components/useBreakpoint';
import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { describeMetrics } from '@/core/metrics';
import { PRESETS } from '@/core/presets';

jest.mock('@/components/useBreakpoint', () => ({ useBreakpoint: jest.fn() }));

const mockBreakpoint = useBreakpoint as jest.Mock;

const metrics = describeMetrics(evaluate(PRESETS[0].inputs, DEFAULT_CONSTANTS).derived);

describe('MetricGrid', () => {
  beforeEach(() => {
    mockBreakpoint.mockReturnValue('regular');
  });

  it('renders every metric', async () => {
    await render(<MetricGrid metrics={metrics} />);
    expect(screen.getByText('Avg read QPS')).toBeOnTheScreen();
    expect(screen.getByText('Total retained')).toBeOnTheScreen();
  });

  it('renders on wide screens', async () => {
    mockBreakpoint.mockReturnValue('wide');
    await render(<MetricGrid metrics={metrics} />);
    expect(screen.getByText('Avg read QPS')).toBeOnTheScreen();
  });
});

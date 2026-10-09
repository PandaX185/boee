import { fireEvent, render, screen } from '@testing-library/react-native';

import { NodeDetailPanel } from '@/components/scene/NodeDetailPanel';
import { useBreakpoint } from '@/components/useBreakpoint';
import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { PRESETS } from '@/core/presets';
import { buildScene } from '@/core/scene';

jest.mock('@/components/useBreakpoint', () => ({ useBreakpoint: jest.fn() }));

const mockBreakpoint = useBreakpoint as jest.Mock;

const inputs = PRESETS[0].inputs;
const { derived, implications } = evaluate(inputs, DEFAULT_CONSTANTS);
const model = buildScene(inputs, derived, implications, DEFAULT_CONSTANTS);
const node = model.nodes.find((item) => item.id === 'servers') ?? model.nodes[0];

describe('NodeDetailPanel', () => {
  beforeEach(() => {
    mockBreakpoint.mockReturnValue('regular');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders node metrics and closes', async () => {
    const onClose = jest.fn();
    await render(<NodeDetailPanel node={node} implications={[]} onClose={onClose} />);
    expect(screen.getByText('Stateless compute')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Close component details' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stacks metrics on compact screens', async () => {
    mockBreakpoint.mockReturnValue('compact');
    await render(<NodeDetailPanel node={node} implications={[]} onClose={jest.fn()} />);
    expect(screen.getByText('Server count')).toBeOnTheScreen();
  });
});

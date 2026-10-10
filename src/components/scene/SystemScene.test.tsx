import { fireEvent, render, screen } from '@testing-library/react-native';

import { SceneFallback, SystemScene } from '@/components/scene/SystemScene';
import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { PRESETS } from '@/core/presets';
import { buildScene } from '@/core/scene';

const inputs = PRESETS[0].inputs;
const { derived, implications } = evaluate(inputs, DEFAULT_CONSTANTS);
const model = buildScene(inputs, derived, implications, DEFAULT_CONSTANTS);

describe('SystemScene', () => {
  it('renders every architecture node', async () => {
    await render(<SystemScene model={model} implications={implications} animate={false} />);
    expect(screen.getByText('Traffic')).toBeOnTheScreen();
    expect(screen.getByText('Load balancer')).toBeOnTheScreen();
    expect(screen.getByText('App servers')).toBeOnTheScreen();
    expect(screen.getByText('Cache')).toBeOnTheScreen();
    expect(screen.getByText('Storage')).toBeOnTheScreen();
  });

  it('opens a detail panel when a node is selected', async () => {
    await render(<SystemScene model={model} implications={implications} animate={false} />);
    await fireEvent.press(screen.getByRole('button', { name: /App servers/ }));
    expect(screen.getByText('Stateless compute')).toBeOnTheScreen();
    expect(screen.getByText('Server capacity')).toBeOnTheScreen();
  });

  it('closes the detail panel again', async () => {
    await render(<SystemScene model={model} implications={implications} animate={false} />);
    await fireEvent.press(screen.getByRole('button', { name: /App servers/ }));
    await fireEvent.press(screen.getByRole('button', { name: 'Close component details' }));
    expect(screen.queryByText('Stateless compute')).toBeNull();
  });

  it('cites the implications attached to a node', async () => {
    await render(<SystemScene model={model} implications={implications} animate={false} />);
    await fireEvent.press(screen.getByRole('button', { name: /Storage/ }));
    const cited = implications.find((item) => item.id === 'storage-exceeds-memory');
    expect(cited).toBeDefined();
    expect(screen.getByText(cited?.message as string)).toBeOnTheScreen();
  });

  it('offers an accessible text fallback', async () => {
    await render(<SceneFallback model={model} />);
    expect(screen.getByText('Traffic')).toBeOnTheScreen();
    expect(screen.getByText('Storage')).toBeOnTheScreen();
  });
});

import { fireEvent, render, screen } from '@testing-library/react-native';

import CompareScreen from '@/app/compare';
import { PRESETS } from '@/core/presets';
import { createScenario } from '@/core/scenarios';
import { useScenarioStore } from '@/store/scenarioStore';

jest.mock('@/store/hydration', () => ({
  useScenarioHydrated: () => true,
  useSettingsHydrated: () => true,
}));

function seedTwo() {
  const alpha = { ...createScenario('Alpha', PRESETS[0].inputs), id: 'alpha' };
  const beta = { ...createScenario('Beta', PRESETS[1].inputs), id: 'beta' };
  useScenarioStore.setState({ scenarios: [alpha, beta] });
}

beforeEach(() => {
  useScenarioStore.setState({ scenarios: [] });
});

describe('CompareScreen', () => {
  it('shows an empty state with no scenarios', async () => {
    await render(<CompareScreen />);
    expect(screen.getByText('No scenarios to compare yet.')).toBeOnTheScreen();
  });

  it('prompts to select two scenarios', async () => {
    seedTwo();
    await render(<CompareScreen />);
    expect(screen.getByText('Select two scenarios to see the comparison.')).toBeOnTheScreen();
  });

  it('compares two selected scenarios', async () => {
    seedTwo();
    await render(<CompareScreen />);
    await fireEvent.press(screen.getByText('Alpha'));
    await fireEvent.press(screen.getByText('Beta'));
    expect(screen.getByText('A')).toBeOnTheScreen();
    expect(screen.getByText('B')).toBeOnTheScreen();
    expect(screen.getByText('Avg read QPS')).toBeOnTheScreen();
  });
});

import { fireEvent, render, screen } from '@testing-library/react-native';

import NewScenarioScreen from '@/app/new';
import { PRESETS } from '@/core/presets';
import { useScenarioStore } from '@/store/scenarioStore';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: (...args: [unknown]) => mockReplace(...args),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  useScenarioStore.setState({ scenarios: [] });
});

describe('NewScenarioScreen', () => {
  it('lists every preset', async () => {
    await render(<NewScenarioScreen />);
    for (const preset of PRESETS) {
      expect(screen.getByText(preset.name)).toBeOnTheScreen();
    }
  });

  it('creates a scenario from a preset and opens it', async () => {
    await render(<NewScenarioScreen />);
    await fireEvent.press(screen.getByText('Twitter-like feed'));
    const scenarios = useScenarioStore.getState().scenarios;
    expect(scenarios).toHaveLength(1);
    expect(scenarios[0].name).toBe('Twitter-like feed');
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scenario/[id]',
      params: { id: scenarios[0].id },
    });
  });
});

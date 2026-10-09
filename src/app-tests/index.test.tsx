import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import { PRESETS } from '@/core/presets';
import { createScenario } from '@/core/scenarios';
import { useScenarioStore } from '@/store/scenarioStore';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: [unknown]) => mockPush(...args),
    replace: jest.fn(),
  },
}));

jest.mock('@/services/confirm', () => ({
  confirmDestructive: (_title: string, _message: string, onConfirm: () => void) => onConfirm(),
}));

jest.mock('@/store/hydration', () => ({
  useScenarioHydrated: () => true,
  useSettingsHydrated: () => true,
  useBoot: () => ({ status: 'ready', retry: jest.fn(), resetSavedData: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useScenarioStore.setState({ scenarios: [] });
});

describe('HomeScreen', () => {
  it('shows an empty state with no scenarios', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('No scenarios yet. Create your first estimate.')).toBeOnTheScreen();
  });

  it('lists scenarios', async () => {
    useScenarioStore.getState().addScenario(createScenario('My estimate', PRESETS[0].inputs));
    await render(<HomeScreen />);
    expect(screen.getByText('My estimate')).toBeOnTheScreen();
  });

  it('navigates to the preset picker', async () => {
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'New estimate' }));
    expect(mockPush).toHaveBeenCalledWith('/new');
  });

  it('duplicates a scenario', async () => {
    const scenario = createScenario('Original', PRESETS[0].inputs);
    useScenarioStore.getState().addScenario(scenario);
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByText('Copy'));
    const scenarios = useScenarioStore.getState().scenarios;
    expect(scenarios).toHaveLength(2);
    expect(scenarios[1].name).toBe('Original copy');
  });

  it('deletes a scenario after confirmation', async () => {
    const scenario = createScenario('Doomed', PRESETS[0].inputs);
    useScenarioStore.getState().addScenario(scenario);
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByText('Delete'));
    expect(useScenarioStore.getState().scenarios).toHaveLength(0);
  });
});

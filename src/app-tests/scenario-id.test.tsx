import { fireEvent, render, screen } from '@testing-library/react-native';

import ScenarioScreen from '@/app/scenario/[id]';
import { DEFAULT_CONSTANTS } from '@/core/constants';
import { evaluate } from '@/core/evaluate';
import { describeMetrics } from '@/core/metrics';
import { PRESETS } from '@/core/presets';
import { createScenario } from '@/core/scenarios';
import { useScenarioStore } from '@/store/scenarioStore';

const mockSetStringAsync = jest.fn(async (_value: string) => true);

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'scenario-1' }),
}));

jest.mock('@/store/hydration', () => ({
  useScenarioHydrated: () => true,
  useSettingsHydrated: () => true,
  useBoot: () => ({ status: 'ready', retry: jest.fn(), resetSavedData: jest.fn() }),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: (value: string) => mockSetStringAsync(value),
  getStringAsync: jest.fn(async () => ''),
}));

function seed() {
  const scenario = { ...createScenario('Test', PRESETS[0].inputs), id: 'scenario-1' };
  useScenarioStore.setState({ scenarios: [scenario] });
  return scenario;
}

beforeEach(() => {
  jest.clearAllMocks();
  useScenarioStore.setState({ scenarios: [] });
});

describe('ScenarioScreen', () => {
  it('shows a message for a missing scenario', async () => {
    await render(<ScenarioScreen />);
    expect(screen.getByText('This estimate no longer exists.')).toBeOnTheScreen();
  });

  it('renders the editor with live metrics', async () => {
    seed();
    await render(<ScenarioScreen />);
    expect(screen.getByDisplayValue('Test')).toBeOnTheScreen();
    expect(screen.getByText('Avg read QPS')).toBeOnTheScreen();
    expect(screen.getByText('Implications')).toBeOnTheScreen();
  });

  it('recomputes metrics when inputs change', async () => {
    const scenario = seed();
    await render(<ScenarioScreen />);
    const metrics = describeMetrics(
      evaluate(
        { ...scenario.inputs, traffic: { ...scenario.inputs.traffic, dailyActiveUsers: 200000 } },
        DEFAULT_CONSTANTS,
      ).derived,
    );
    const expected = metrics.find((metric) => metric.key === 'avgWriteQps')?.value;
    expect(expected).toBeDefined();
    await fireEvent.changeText(screen.getByDisplayValue('100000'), '200000');
    expect(screen.getByText(expected as string)).toBeOnTheScreen();
  });

  it('copies markdown to the clipboard', async () => {
    seed();
    await render(<ScenarioScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Copy Markdown' }));
    expect(mockSetStringAsync).toHaveBeenCalledWith(expect.stringContaining('# Test'));
  });
});

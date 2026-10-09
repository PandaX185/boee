import { fireEvent, render, screen } from '@testing-library/react-native';

import SettingsScreen from '@/app/settings';
import { DEFAULT_CONSTANTS } from '@/core/constants';
import { useSettingsStore } from '@/store/settingsStore';

jest.mock('@/store/hydration', () => ({
  useScenarioHydrated: () => true,
  useSettingsHydrated: () => true,
  useBoot: () => ({ status: 'ready', retry: jest.fn(), resetSavedData: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useSettingsStore.setState({ constants: DEFAULT_CONSTANTS });
});

describe('SettingsScreen', () => {
  it('renders editable constants with sources', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('Server QPS capacity')).toBeOnTheScreen();
    expect(screen.getAllByDisplayValue('1000')[0]).toBeOnTheScreen();
  });

  it('persists constant edits', async () => {
    await render(<SettingsScreen />);
    await fireEvent.changeText(screen.getAllByDisplayValue('1000')[0], '2000');
    expect(useSettingsStore.getState().constants.infrastructure.serverQpsCapacity).toBe(2000);
  });

  it('persists slider edits', async () => {
    await render(<SettingsScreen />);
    await fireEvent(screen.getByTestId('mock-slider'), 'valueChange', 0.3);
    expect(useSettingsStore.getState().constants.hotWorkingSetFraction).toBe(0.3);
  });

  it('resets to defaults', async () => {
    await render(<SettingsScreen />);
    await fireEvent.changeText(screen.getAllByDisplayValue('1000')[0], '2000');
    await fireEvent.press(screen.getByRole('button', { name: 'Reset to defaults' }));
    expect(useSettingsStore.getState().constants).toEqual(DEFAULT_CONSTANTS);
  });
});

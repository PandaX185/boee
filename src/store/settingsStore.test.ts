import { DEFAULT_CONSTANTS, GB } from '@/core/constants';
import { useSettingsStore } from '@/store/settingsStore';

beforeEach(() => {
  useSettingsStore.setState({ constants: DEFAULT_CONSTANTS });
});

describe('settingsStore', () => {
  it('starts with the default constants', () => {
    expect(useSettingsStore.getState().constants).toEqual(DEFAULT_CONSTANTS);
  });

  it('replaces constants', () => {
    const next = {
      ...DEFAULT_CONSTANTS,
      infrastructure: { ...DEFAULT_CONSTANTS.infrastructure, serverQpsCapacity: 2000 },
    };
    useSettingsStore.getState().setConstants(next);
    expect(useSettingsStore.getState().constants.infrastructure.serverQpsCapacity).toBe(2000);
  });

  it('resets to defaults', () => {
    useSettingsStore.getState().setConstants({
      ...DEFAULT_CONSTANTS,
      infrastructure: {
        ...DEFAULT_CONSTANTS.infrastructure,
        cacheRamBytes: 8 * GB,
      },
    });
    useSettingsStore.getState().resetConstants();
    expect(useSettingsStore.getState().constants).toEqual(DEFAULT_CONSTANTS);
  });
});

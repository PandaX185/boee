import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, waitFor } from '@testing-library/react-native';

import { BOOT_TIMEOUT_MS, useBoot, type Boot } from '@/store/hydration';
import { useScenarioStore } from '@/store/scenarioStore';
import { useSettingsStore } from '@/store/settingsStore';

function freezeHydration() {
  jest.spyOn(useScenarioStore.persist, 'hasHydrated').mockReturnValue(false);
  jest.spyOn(useScenarioStore.persist, 'onFinishHydration').mockReturnValue(() => undefined);
  jest.spyOn(useSettingsStore.persist, 'hasHydrated').mockReturnValue(false);
  jest.spyOn(useSettingsStore.persist, 'onFinishHydration').mockReturnValue(() => undefined);
}

function Probe({ onBoot }: { onBoot: (boot: Boot) => void }) {
  onBoot(useBoot());
  return null;
}

describe('useBoot', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('reports loading, then failed after the timeout', async () => {
    freezeHydration();
    const seen: Boot['status'][] = [];
    await render(
      <Probe
        onBoot={(boot) => {
          seen.push(boot.status);
        }}
      />,
    );
    expect(seen[seen.length - 1]).toBe('loading');
    await act(async () => {
      jest.advanceTimersByTime(BOOT_TIMEOUT_MS);
    });
    expect(seen[seen.length - 1]).toBe('failed');
  });

  it('becomes ready once the stores hydrate', async () => {
    jest.useRealTimers();
    let latest: Boot | null = null;
    render(
      <Probe
        onBoot={(boot) => {
          latest = boot;
        }}
      />,
    );
    await waitFor(() => expect(latest?.status).toBe('ready'));
  });

  it('retries rehydration on demand', async () => {
    freezeHydration();
    const scenarioRehydrate = jest.spyOn(useScenarioStore.persist, 'rehydrate').mockResolvedValue();
    const settingsRehydrate = jest.spyOn(useSettingsStore.persist, 'rehydrate').mockResolvedValue();
    let latest: Boot | null = null;
    await render(
      <Probe
        onBoot={(boot) => {
          latest = boot;
        }}
      />,
    );
    if (!latest) {
      throw new Error('expected boot state');
    }
    const boot: Boot = latest;
    await act(async () => {
      await boot.retry();
    });
    expect(scenarioRehydrate).toHaveBeenCalledTimes(1);
    expect(settingsRehydrate).toHaveBeenCalledTimes(1);
  });

  it('clears storage keys on reset', async () => {
    freezeHydration();
    const multiRemove = jest.spyOn(AsyncStorage, 'multiRemove').mockResolvedValue();
    jest.spyOn(useScenarioStore.persist, 'rehydrate').mockResolvedValue();
    jest.spyOn(useSettingsStore.persist, 'rehydrate').mockResolvedValue();
    let latest: Boot | null = null;
    await render(
      <Probe
        onBoot={(boot) => {
          latest = boot;
        }}
      />,
    );
    if (!latest) {
      throw new Error('expected boot state');
    }
    const boot: Boot = latest;
    await act(async () => {
      await boot.resetSavedData();
    });
    expect(multiRemove).toHaveBeenCalledWith(['boe-scenarios', 'boe-constants']);
  });
});

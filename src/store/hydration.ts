import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { type BootStatus, getBootStatus } from '@/core/boot';
import { SCENARIO_STORAGE_KEY, useScenarioStore } from '@/store/scenarioStore';
import { SETTINGS_STORAGE_KEY, useSettingsStore } from '@/store/settingsStore';

export const BOOT_TIMEOUT_MS = 5000;

export function useScenarioHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useScenarioStore.persist.hasHydrated());
  useEffect(() => {
    return useScenarioStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

export function useSettingsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useSettingsStore.persist.hasHydrated());
  useEffect(() => {
    return useSettingsStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

export interface Boot {
  status: BootStatus;
  retry: () => Promise<void>;
  resetSavedData: () => Promise<void>;
}

export function useBoot(timeoutMs = BOOT_TIMEOUT_MS): Boot {
  const scenarioHydrated = useScenarioHydrated();
  const settingsHydrated = useSettingsHydrated();
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ready = scenarioHydrated && settingsHydrated;

  useEffect(() => {
    if (ready) {
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [ready, timeoutMs, attempt]);

  const retry = useCallback(async () => {
    setTimedOut(false);
    setAttempt((count) => count + 1);
    await Promise.all([useScenarioStore.persist.rehydrate(), useSettingsStore.persist.rehydrate()]);
  }, []);

  const resetSavedData = useCallback(async () => {
    setTimedOut(false);
    setAttempt((count) => count + 1);
    await AsyncStorage.multiRemove([SCENARIO_STORAGE_KEY, SETTINGS_STORAGE_KEY]);
    await Promise.all([useScenarioStore.persist.rehydrate(), useSettingsStore.persist.rehydrate()]);
  }, []);

  return {
    status: getBootStatus(scenarioHydrated, settingsHydrated, timedOut),
    retry,
    resetSavedData,
  };
}

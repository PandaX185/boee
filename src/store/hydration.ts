import { useEffect, useState } from 'react';

import { useScenarioStore } from '@/store/scenarioStore';
import { useSettingsStore } from '@/store/settingsStore';

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

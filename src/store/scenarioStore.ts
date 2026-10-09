import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Scenario } from '@/domain/types';

interface ScenarioState {
  scenarios: Scenario[];
  addScenario: (scenario: Scenario) => void;
  removeScenario: (id: string) => void;
  getScenario: (id: string) => Scenario | undefined;
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      scenarios: [],
      addScenario: (scenario) =>
        set((state) => ({ scenarios: [...state.scenarios, scenario] })),
      removeScenario: (id) =>
        set((state) => ({ scenarios: state.scenarios.filter((item) => item.id !== id) })),
      getScenario: (id) => get().scenarios.find((item) => item.id === id),
    }),
    {
      name: 'boe-scenarios',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

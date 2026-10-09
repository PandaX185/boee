import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/core/id';
import { cloneInputs } from '@/core/scenarios';
import type { Scenario } from '@/domain/types';

export const SCENARIO_STORAGE_KEY = 'boe-scenarios';

interface ScenarioStore {
  scenarios: Scenario[];
  addScenario: (scenario: Scenario) => void;
  updateScenario: (id: string, patch: Partial<Pick<Scenario, 'name' | 'inputs'>>) => void;
  duplicateScenario: (id: string) => Scenario | undefined;
  removeScenario: (id: string) => void;
  getScenario: (id: string) => Scenario | undefined;
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: [],
      addScenario: (scenario) => set((state) => ({ scenarios: [...state.scenarios, scenario] })),
      updateScenario: (id, patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === id
              ? { ...scenario, ...patch, updatedAt: new Date().toISOString() }
              : scenario,
          ),
        })),
      duplicateScenario: (id) => {
        const source = get().scenarios.find((scenario) => scenario.id === id);
        if (!source) {
          return undefined;
        }
        const now = new Date().toISOString();
        const copy: Scenario = {
          id: createId(),
          name: `${source.name} copy`,
          createdAt: now,
          updatedAt: now,
          inputs: cloneInputs(source.inputs),
        };
        set((state) => ({ scenarios: [...state.scenarios, copy] }));
        return copy;
      },
      removeScenario: (id) =>
        set((state) => ({ scenarios: state.scenarios.filter((scenario) => scenario.id !== id) })),
      getScenario: (id) => get().scenarios.find((scenario) => scenario.id === id),
    }),
    {
      name: SCENARIO_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

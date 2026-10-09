import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CONSTANTS } from '@/core/constants';
import type { Constants } from '@/domain/types';

export const SETTINGS_STORAGE_KEY = 'boe-constants';

interface SettingsStore {
  constants: Constants;
  setConstants: (constants: Constants) => void;
  resetConstants: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      constants: DEFAULT_CONSTANTS,
      setConstants: (constants) => set({ constants }),
      resetConstants: () => set({ constants: DEFAULT_CONSTANTS }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

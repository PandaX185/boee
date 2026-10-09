import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CONSTANTS } from '@/core/constants';
import type { Constants } from '@/domain/types';

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
      name: 'boe-constants',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

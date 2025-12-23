import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppearanceMode = 'system' | 'light' | 'dark';

type AppearanceState = {
  mode: AppearanceMode;
  setMode: (mode: AppearanceMode) => void;
};

export const useAppearanceStore = create(
  persist<AppearanceState>(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'appearance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeId } from '@/config/themes';

type PersonalityThemeState = {
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
};

export const usePersonalityThemeStore = create(
  persist<PersonalityThemeState>(
    (set) => ({
      themeId: 'default',
      setThemeId: (themeId) => set({ themeId }),
    }),
    {
      name: 'personality-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

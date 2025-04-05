// lib/store/onboarding.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingState = {
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
};

export const useOnboardingStore = create(
  persist<OnboardingState>(
    (set) => ({
      hasOnboarded: false,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

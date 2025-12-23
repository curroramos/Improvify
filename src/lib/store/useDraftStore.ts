import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Draft = {
  answers: Record<number, string>; // promptIndex -> answer
  updatedAt: number;
};

type DraftState = {
  draft: Draft | null;
  saveDraft: (answers: Record<number, string>) => void;
  clearDraft: () => void;
};

export const useDraftStore = create(
  persist<DraftState>(
    (set) => ({
      draft: null,
      saveDraft: (answers) =>
        set({
          draft: {
            answers,
            updatedAt: Date.now(),
          },
        }),
      clearDraft: () => set({ draft: null }),
    }),
    {
      name: 'reflection-draft',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

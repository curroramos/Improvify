// lib/store/useChallengeStore.ts
import { create } from 'zustand';
import { getChallengesByNoteId } from '@/lib/api/challenges';
import { fetchNotes } from '@/lib/api/notes';
import type { Challenge } from '@/lib/api/challenges';

type State = {
  challenges: Challenge[];
  loading: boolean;
  error: string;
  fetchChallenges: () => Promise<void>;
  clearChallenges: () => void;
};

export const useChallengeStore = create<State>((set) => ({
  challenges: [],
  loading: false,
  error: '',
  fetchChallenges: async () => {
    set({ loading: true, error: '' });

    try {
      const notes = await fetchNotes();
      if (notes.length === 0) {
        set({ challenges: [], loading: false });
        return;
      }

      const noteId = notes[0].id;
      const challenges = await getChallengesByNoteId(noteId);
      set({ challenges });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch challenges.' });
    } finally {
      set({ loading: false });
    }
  },
  clearChallenges: () => set({ challenges: [], error: '' }),
}));

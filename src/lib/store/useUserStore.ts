// stores/useUserStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

type State = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  fetchUser: (userId: string) => Promise<void>;
  refetchUser: (userId: string) => Promise<void>;
};

export const useUserStore = create<State>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  fetchUser: async (userId: string) => {
    if (!userId) {
      set({ user: null, isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      set({ user: data, isLoading: false, error: null });
    } catch (err) {
      console.error('useUserStore fetch error:', err);
      set({ error: err as Error, isLoading: false });
    }
  },

  refetchUser: async (userId: string) => {
    await get().fetchUser(userId);
  },
}));

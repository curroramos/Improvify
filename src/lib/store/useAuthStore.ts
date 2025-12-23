import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { logger } from '../utils/logger';

type AuthState = {
  session: Session | null;
  userId: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  _initialized: boolean;

  // Actions
  initialize: () => () => void;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    data?: { user: User | null; session: Session | null };
    error?: unknown;
  }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    data?: { user: User | null; session: Session | null };
    error?: unknown;
  }>;
  signOut: () => Promise<{ success: boolean; error?: unknown }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: unknown }>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  userId: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  _initialized: false,

  initialize: () => {
    if (get()._initialized) {
      return () => {};
    }

    set({ _initialized: true });

    // Track if we've already handled the session to prevent race conditions
    let handled = false;

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (!handled) {
        handled = true;
        console.warn('Session fetch timeout - continuing without session');
        set({ loading: false });
      }
    }, 10000);

    // Fetch initial session
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (handled) return; // Already timed out
        handled = true;
        clearTimeout(timeoutId);

        if (error) {
          logger.error('Error fetching session:', error.message);
          set({ loading: false });
          return;
        }

        if (data.session) {
          set({
            session: data.session,
            userId: data.session.user.id,
            user: data.session.user,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          set({ loading: false });
        }
      })
      .catch((err) => {
        if (handled) return;
        handled = true;
        clearTimeout(timeoutId);
        logger.error('Session fetch error:', err);
        set({ loading: false });
      });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        userId: session?.user?.id || null,
        user: session?.user || null,
        isAuthenticated: !!session,
        loading: false,
      });
    });

    return () => {
      subscription?.unsubscribe();
    };
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      logger.error('Error signing in:', error);
      return { success: false, error };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      logger.error('Error signing up:', error);
      return { success: false, error };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Error signing out:', error);
      return { success: false, error };
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Error resetting password:', error);
      return { success: false, error };
    }
  },
}));

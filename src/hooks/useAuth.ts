import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const log = (...args: any[]) => console.log('[auth]', ...args);

// Auth service object with common authentication methods
const auth = {
  signOut: async () => {
    log('Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      log('Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  },

  signIn: async (email: string, password: string) => {
    log('Signing in...', { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      log('Sign in successful', { userId: data.user?.id });
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  },

  signUp: async (email: string, password: string) => {
    log('Signing up...', { email });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      log('Sign up successful', { userId: data.user?.id });
      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error };
    }
  },

  resetPassword: async (email: string) => {
    log('Resetting password...', { email });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      log('Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error };
    }
  }
};

// Custom Hook for Auth State Management
export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      log('Fetching initial session...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        setLoading(false);
        return;
      }

      if (data.session) {
        log('Session fetched', { userId: data.session.user.id });
        setSession(data.session);
        setUserId(data.session.user.id);
      } else {
        log('No session found');
      }

      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        log('Auth state changed:', event, { userId: session?.user?.id });
        setSession(session);
        setUserId(session?.user?.id || null);
        setLoading(false);
      }
    );

    return () => {
      log('Unsubscribing from auth state changes');
      subscription?.unsubscribe();
    };
  }, []);

  return {
    session,
    userId,
    loading,
    isAuthenticated: !!session,
    user: session?.user || null,
    ...auth
  };
};

export default useAuth;

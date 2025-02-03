import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient, UserResponse } from '@supabase/supabase-js';
import { AuthError, Session, User, AuthTokenResponse } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = 'https://rhcrjwebjmwhtctyohjp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoY3Jqd2Viam13aHRjdHlvaGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMzMzNTIsImV4cCI6MjA1MzYwOTM1Mn0.TmFV759zY1c0PtsxSWpv1OnQI3vAdwogiBb6_NLnlM4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Unified response type for authentication methods
type AuthResponse = AuthTokenResponse | AuthOAuthResponse;

// Authentication API with proper typing
export const auth = {
  async signInWithEmail(email: string, password: string): Promise<AuthTokenResponse> {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signUp({ email, password });
  },

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    return await supabase.auth.signOut();
  },

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    return await supabase.auth.resetPasswordForEmail(email);
  },

  async updatePassword(newPassword: string): Promise<UserResponse> {
    return await supabase.auth.updateUser({ password: newPassword });
  },

  async signInWithGoogle(): Promise<AuthOAuthResponse> {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'your-app-scheme://auth/callback' },
    });
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

// Custom Hook for Auth State Management
export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession(data.session);
        setUserId(data.session.user.id); // Store user ID in state
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUserId(session?.user?.id || null); // Update user ID when auth state changes
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return { session, userId, loading };
};

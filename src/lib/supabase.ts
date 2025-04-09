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
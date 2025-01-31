// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
        redirect={!session}
      />
      <Stack.Screen
        name="auth/login"
        options={{ headerShown: false }}
        redirect={!!session}
      />
      <Stack.Screen
        name="auth/signup"
        options={{ headerShown: false }}
        redirect={!!session}
      />
    </Stack>
  );
}
// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../lib/supabase';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme'; // Or your color scheme hook
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[colorScheme] || Colors.light;

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack
        screenOptions={{
          headerShown: false, // ✅ hide header globally by default
        }}
      >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
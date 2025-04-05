import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../lib/supabase';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { useOnboardingStore } from '../lib/store/onboarding';

export default function RootLayout() {
  const { session, loading: authLoading } = useAuth();
  const { hasOnboarded } = useOnboardingStore();
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  const colorScheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[colorScheme] || Colors.light;

  useEffect(() => {
    const store = useOnboardingStore as typeof useOnboardingStore & {
      persist?: {
        hasHydrated?: () => boolean;
        onFinishHydration?: (cb: () => void) => () => void;
      };
    };

    const unsub = store.persist?.onFinishHydration?.(() => {
      setHydrated(true);
    });

    if (store.persist?.hasHydrated?.()) {
      setHydrated(true);
    }

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    if (!authLoading && hydrated) {
      if (!session) {
        router.replace(hasOnboarded ? '/auth/login' : '/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [authLoading, hydrated, session, hasOnboarded]);

  if (authLoading || !hydrated) {
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1 },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

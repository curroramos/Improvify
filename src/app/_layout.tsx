import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { ThemeProvider, useTheme } from '@/theme';
import { useOnboardingStore } from '../lib/store/onboarding';
import { useAppearanceStore } from '../lib/store/useAppearanceStore';
import { usePersonalityThemeStore } from '../lib/store/usePersonalityThemeStore';
import { QueryProvider } from '../lib/query';
import { initI18n } from '@/i18n';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Suppress react-native-render-html defaultProps warnings (library issue)
LogBox.ignoreLogs([
  'MemoizedTNodeRenderer: Support for defaultProps',
  'TNodeChildrenRenderer: Support for defaultProps',
]);

// Helper to check store hydration status
const getStoreHydrated = (store: unknown): boolean => {
  const s = store as { persist?: { hasHydrated?: () => boolean } };
  return s.persist?.hasHydrated?.() ?? true;
};

// Hook to subscribe to hydration state
function useStoreHydration() {
  const [hydrated, setHydrated] = useState(() =>
    getStoreHydrated(useOnboardingStore) &&
    getStoreHydrated(useAppearanceStore) &&
    getStoreHydrated(usePersonalityThemeStore)
  );

  useEffect(() => {
    if (hydrated) return;

    const checkHydration = () => {
      if (
        getStoreHydrated(useOnboardingStore) &&
        getStoreHydrated(useAppearanceStore) &&
        getStoreHydrated(usePersonalityThemeStore)
      ) {
        setHydrated(true);
      }
    };

    // Check immediately and set up listeners
    checkHydration();

    const onboardingUnsub = (useOnboardingStore as any).persist?.onFinishHydration?.(checkHydration);
    const appearanceUnsub = (useAppearanceStore as any).persist?.onFinishHydration?.(checkHydration);
    const personalityUnsub = (usePersonalityThemeStore as any).persist?.onFinishHydration?.(checkHydration);

    return () => {
      onboardingUnsub?.();
      appearanceUnsub?.();
      personalityUnsub?.();
    };
  }, [hydrated]);

  return hydrated;
}

function RootLayoutContent() {
  const { session, loading: authLoading } = useAuth();
  const { hasOnboarded } = useOnboardingStore();
  const hydrated = useStoreHydration();
  const [i18nReady, setI18nReady] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  // Initialize i18n (must be async, can't avoid this effect)
  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  // Navigation effect (must be in effect due to router timing)
  useEffect(() => {
    if (!authLoading && hydrated && i18nReady) {
      if (!session) {
        router.replace(hasOnboarded ? '/auth/login' : '/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [authLoading, hydrated, i18nReady, session, hasOnboarded, router]);

  if (authLoading || !hydrated || !i18nReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.brand.primary} />
      </View>
    );
  }

  return (
    <QueryProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background.primary },
        }}
      />
    </QueryProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

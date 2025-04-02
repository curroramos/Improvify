import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../lib/supabase';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';

export default function RootLayout() {
  const { session, loading } = useAuth();       // from your custom supabase auth hook
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [onboardingLoading, setOnboardingLoading] = useState<boolean>(true);

  const colorScheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[colorScheme] || Colors.light;

  // 1) Check AsyncStorage for hasOnboarded
  useEffect(() => {
    (async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(onboarded === 'true');
      } catch (error) {
        console.warn('Error retrieving onboarding status:', error);
      } finally {
        setOnboardingLoading(false);
      }
    })();
  }, []);

  // 2) While any of our checks are still loading, show a loader
  if (loading || onboardingLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  // 3) Render the main stack with redirection rules
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack screenOptions={{ headerShown: false }}>
        {/*
          1) "onboarding" route:
             redirect={hasOnboarded}
             Means if `hasOnboarded` is true, push away from /onboarding 
             so user never sees it again.
        */}
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
          redirect={hasOnboarded}
        />

        {/*
          2) "(tabs)" route:
             redirect={!session || !hasOnboarded}
             Means if there's no session OR user hasn't onboarded, 
             push away from / (tabs) so user doesn't see main app yet.
        */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
          redirect={!session || !hasOnboarded}
        />

        {/*
          3) Auth routes (login/signup):
             redirect={!!session || !hasOnboarded}
             Means if session is present OR user hasn’t done onboarding, 
             push away from login/signup.
             (So if they haven't onboarded, we show onboarding first. 
              If they *are* onboarded+logged in, we also skip auth.)
        */}
        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false }}
          redirect={!!session || !hasOnboarded}
        />
        <Stack.Screen
          name="auth/signup"
          options={{ headerShown: false }}
          redirect={!!session || !hasOnboarded}
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
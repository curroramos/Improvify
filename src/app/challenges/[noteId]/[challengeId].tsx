import React, { useLayoutEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@/hooks/useUser';
import ChallengeDetail from '@/components/ChallengeDetail';
import { useChallenge, useCompleteChallenge, useAddPoints } from '@/lib/query';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/utils/logger';
import { useTheme } from '@/theme';

export default function ChallengeDetailsScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useUser();
  const { userId } = useAuth();

  // React Query hooks
  const { data: challenge, isLoading: loading } = useChallenge(challengeId);
  const completeMutation = useCompleteChallenge(userId ?? undefined);
  const addPointsMutation = useAddPoints(userId ?? undefined);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Challenge Detail' });
  }, [navigation]);

  const handleComplete = async (): Promise<boolean> => {
    if (!challenge || !user) return false;

    try {
      await completeMutation.mutateAsync(challenge.id);
      // Add points to user after completing challenge
      await addPointsMutation.mutateAsync(challenge.points);
      return true;
    } catch (err) {
      logger.error('Failed to complete challenge:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background.primary, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.brand.primary} />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background.primary, paddingTop: insets.top }]}>
        <Text style={{ color: theme.text.primary }}>Challenge not found.</Text>
      </View>
    );
  }

  const completing = completeMutation.isPending || addPointsMutation.isPending;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.background.primary }}>
      <ChallengeDetail challenge={challenge} completing={completing} onComplete={handleComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

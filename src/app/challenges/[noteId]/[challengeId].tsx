import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { completeChallenge } from '@/lib/api/challenges';
import { useUser } from '@/hooks/useUser';
import { Challenge } from '@/types';
import ChallengeDetail from '@/components/ChallengeDetail';
import { useChallengeStore } from '@/lib/store/useChallengeStore';
import { useUserStore } from '@/lib/store/useUserStore';

export default function ChallengeDetailsScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const navigation = useNavigation();
  const { user } = useUser();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Challenge Detail' });
  }, [navigation]);

  useEffect(() => {
    if (!challengeId) return;

    const fetchChallenge = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (error) throw error;
        setChallenge(data);
      } catch (err) {
        console.error('Failed to fetch challenge:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  const handleComplete = async () => {
    if (!challenge || !user) return;

    setCompleting(true);
    try {
      const { challenge: updated, user: updatedUser } = await completeChallenge(challenge.id, user.id);
      if (updated?.[0]) setChallenge(updated[0]);
      console.log('User updated:', updatedUser);
      useChallengeStore.getState().fetchChallenges();
      console.log('[challenge detail] Challenges fetched successfully');
      useUserStore.getState().refetchUser(user.id); // <- this line refetches user
      console.log('[challenge detail] User refetched successfully');
    } catch (err) {
      console.error('Failed to complete challenge:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Challenge not found.</Text>
      </View>
    );
  }

  return (
    <ChallengeDetail
      challenge={challenge}
      completing={completing}
      onComplete={handleComplete}
    />
  );
}

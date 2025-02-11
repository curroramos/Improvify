import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { completeChallenge } from '@/lib/api/challenges';
import { useUser } from '@/hooks/useUser';
import { Challenge } from '@/types';

export default function ChallengeDetailsScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { user } = useUser(); // Get logged-in user
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false); // Track completion process

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) return;
      try {
        console.log(`Fetching challenge with ID: ${challengeId}`);
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (error) throw error;
        setChallenge(data);
      } catch (error) {
        console.error('Error fetching challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  const handleCompleteChallenge = async () => {
    if (!challenge || !user) return;

    try {
      setCompleting(true);
      const { challenge: updatedChallenge, user: updatedUser } = await completeChallenge(challenge.id, user.id);

      if (updatedChallenge) {
        setChallenge(updatedChallenge[0]); // Update UI with new challenge status
      }
      console.log("User points and level updated:", updatedUser);
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!challenge) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>Challenge not found.</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{challenge.title}</Text>
      <Text>{challenge.description}</Text>
      <Text>Points: {challenge.points}</Text>
      <Text>Status: {challenge.completed ? 'Completed' : 'Pending'}</Text>
      {challenge.created_at && <Text>Created: {new Date(challenge.created_at).toDateString()}</Text>}

      {!challenge.completed && (
        <Pressable
          onPress={handleCompleteChallenge}
          disabled={completing}
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: completing ? '#ccc' : '#007AFF',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
            {completing ? 'Completing...' : 'Mark as Completed'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Challenge } from '@/lib/api/challenges';

export default function ChallengeDetailsScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

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
      <Text>Status: {challenge.completed ? '✅ Completed' : '❌ Pending'}</Text>
      {challenge.created_at && <Text>Created: {new Date(challenge.created_at).toDateString()}</Text>}

      {/* Mark Challenge as Completed */}
      {!challenge.completed && (
        <Pressable
          onPress={async () => {
            try {
              const { error } = await supabase
                .from('challenges')
                .update({ completed: true })
                .eq('id', challengeId);

              if (error) throw error;
              setChallenge({ ...challenge, completed: true });
            } catch (error) {
              console.error('Error updating challenge:', error);
            }
          }}
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: '#007AFF',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Mark as Completed</Text>
        </Pressable>
      )}
    </View>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getChallengesByNoteId, Challenge } from '@/lib/api/challenges';
import ChallengeCard from '@/components/ChallengeCard';

export default function ChallengesScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>(); // ✅ Receives `noteId` from the path
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!noteId) {
        console.error('Error: No noteId found in route params.');
        setErrorMessage('No noteId provided in the route.');
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching challenges for noteId: ${noteId}`);
        const data = await getChallengesByNoteId(noteId);

        console.log(`Retrieved ${data.length} challenges from Supabase.`, data);

        if (data.length === 0) {
          console.warn('No challenges found for this note.');
          setErrorMessage('No challenges found for this note.');
        } else {
          setChallenges(data);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
        setErrorMessage(`Error retrieving challenges: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [noteId]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (errorMessage) {
    return <Text style={styles.errorText}>{errorMessage}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Challenges for Note ID: {noteId}</Text>
      {challenges.map((item) => (
        <ChallengeCard
          key={item.id}
          title={item.title}
          description={item.description}
          points={item.points}
          completed={item.completed}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ecf0f1',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
});

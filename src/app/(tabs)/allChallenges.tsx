import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Challenge, getChallengesByNoteId } from '@/lib/api/challenges';
import { fetchNotes } from '@/lib/api/notes';
import ChallengeCard from '@/components/ChallengeCard';

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  console.group('🟢 ChallengesScreen Mount');
  console.log('Initial state:', { loading, errorMessage, challenges });
  console.groupEnd();

  // Fetch all challenges for the user
  const fetchAllChallenges = useCallback(async () => {
    console.group('🟠 Fetching All Challenges');
    try {
      setLoading(true);
      setErrorMessage(null);

      // Step 1: Fetch all notes for the user
      console.log('Fetching notes...');
      const notes = await fetchNotes();
      console.log(`Retrieved ${notes.length} notes`);

      if (notes.length === 0) {
        console.warn('No notes found for the user');
        setErrorMessage('No notes found for the user.');
        return;
      }

      // Step 2: Fetch challenges for each note
      console.log('Fetching challenges for each note...');
      const allChallenges: Challenge[] = [];

      for (const note of notes) {
        console.log(`Fetching challenges for noteId: ${note.id}`);
        const challengesForNote = await getChallengesByNoteId(note.id);
        allChallenges.push(...challengesForNote);
      }

      console.log(`Retrieved ${allChallenges.length} challenges in total`);
      setChallenges(allChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      console.log('Fetch operation completed');
      setLoading(false);
      setRefreshing(false);
      console.groupEnd();
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchAllChallenges();
  }, [fetchAllChallenges]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    console.log('🔄 Pull-to-refresh triggered');
    setRefreshing(true);
    await fetchAllChallenges();
  }, [fetchAllChallenges]);

  if (loading && !refreshing) {
    console.log('Rendering loading indicator');
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (errorMessage) {
    console.log('Rendering error message:', errorMessage);
    return <Text style={styles.errorText}>{errorMessage}</Text>;
  }

  console.log('Rendering challenges list');
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Your Challenges</Text>
      {challenges.length === 0 ? (
        <Text style={styles.emptyText}>No challenges found.</Text>
      ) : (
        challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}  // This is fine for React but doesn't pass `id` as a prop
          id={challenge.id}   // <-- Ensure `id` is passed as a prop
          title={challenge.title}
          description={challenge.description}
          points={challenge.points}
          completed={challenge.completed}
        />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d',
    fontSize: 16,
  },
});
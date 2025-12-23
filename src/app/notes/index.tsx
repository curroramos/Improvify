import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Alert, StyleSheet, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { notesRepository } from '@/lib/repositories';
import { NoteWithChallenges } from '@/types';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import NoteCard from '@/components/NoteCard';
import EmptyState from '@/components/EmptyState';

const NotesScreen = () => {
  const { theme } = useTheme();
  const { userId } = useAuth();

  const [notes, setNotes] = useState<NoteWithChallenges[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    if (!userId) return;
    setError(null);
    try {
      const data = await notesRepository.findByUserIdWithChallenges(userId);
      setNotes(data);
    } catch {
      setError('Failed to load notes. Tap to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert('Delete Reflection', 'Are you sure you want to delete this reflection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesRepository.delete(id);
            setNotes((prev) => prev.filter((note) => note.id !== id));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {
            Alert.alert('Error', 'Failed to delete note');
          }
        },
      },
    ]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      loadNotes();
    }
  }, [userId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.brand.primary} style={styles.loader} />
      ) : error ? (
        <Pressable style={styles.errorContainer} onPress={loadNotes}>
          <Text style={[styles.errorText, { color: theme.text.secondary }]}>{error}</Text>
        </Pressable>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) =>
            item && (
              <Link href={`/notes/${item.id}`} asChild>
                <NoteCard note={item} onDelete={handleDeleteNote} />
              </Link>
            )
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </View>
  );
};

export default NotesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

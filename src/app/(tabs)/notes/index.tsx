import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics'; // For haptic feedback on interactions
import { fetchNotes, deleteNote } from '../../../lib/api/notes';
import { Note } from '../../../types';
import Colors from '../../../constants/Colors';
import NoteCard from '@/components/NoteCard';
import EmptyState from '@/components/EmptyState';

const NotesScreen = () => {
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const theme = Colors[colorScheme] || Colors.light;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      setNotes(data.filter((note): note is Note => note !== null));
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      'Delete Reflection',
      'Are you sure you want to delete this reflection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(id);
              setNotes((prev) => prev.filter((note) => note.id !== id));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Subtle haptic feedback
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  useEffect(() => {
    setLoading(true);
    loadNotes();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary.main}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) =>
            item && (
              <Link href={`/notes/${item.id}`} asChild>
                <NoteCard
                  note={item}
                  onDelete={handleDeleteNote}
                  backgroundColor={theme.card}
                  textColor={theme.text}
                  textSecondaryColor={theme.textSecondary}
                  dangerColor={theme.danger.main}
                />
              </Link>
            )
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <EmptyState
              iconColor={theme.border}
              textColor={theme.textSecondary}
            />
          }
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
  noteCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  noteDate: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  blurView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8, // Add padding for better touch area
    borderRadius: 4, // Optional: Rounded corners
  }
});
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getNoteById } from '../../lib/api/notes';
import { Note } from '../../types';
import { NoteDetail } from '../../components/NoteDetail'; // adjust path

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      try {
        if (!noteId) return;
        const data = await getNoteById(noteId);
        setNote(data);
      } catch (error) {
        console.error('Failed to load note:', error);
        Alert.alert('Error', 'Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <Text>Note not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </Pressable>

        <Link href={`/notes/${noteId}/edit`} asChild>
          <Pressable style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color="#007AFF" />
          </Pressable>
        </Link>
      </View>

      {/* Reusable NoteDetail component */}
      <NoteDetail note={note} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
});

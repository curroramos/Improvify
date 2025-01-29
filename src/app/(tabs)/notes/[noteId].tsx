import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getNoteById} from '../../../lib/api';
import { Note } from '../../../app/types'; // Or your actual path to types.ts

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

      <View style={styles.content}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>
          {new Date(note.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.body}>{note.content}</Text>
      </View>
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
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
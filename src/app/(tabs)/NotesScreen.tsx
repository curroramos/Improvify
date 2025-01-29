import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Alert, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchNotes, deleteNote } from '../../lib/api';
import { Note } from '@/app/types';

const NotesScreen = () => {
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
              setNotes(prev => prev.filter(note => note.id !== id));
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
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item ? (
              <Link href={`/notes/${item.id}`} asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.noteCard,
                    pressed && { opacity: 0.9 }
                  ]}
                >
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text 
                    numberOfLines={2} 
                    style={styles.noteContent}
                  >
                    {item.content}
                  </Text>
                  <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    <Pressable 
                      onPress={() => handleDeleteNote(item.id)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                    >
                      <MaterialIcons name="delete" size={20} color="#ff3b30" />
                    </Pressable>
                  </View>
                </Pressable>
              </Link>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="note-add" size={48} color="#e0e0e0" />
              <Text style={styles.emptyText}>No reflections yet!</Text>
              <Text style={styles.emptySubtext}>Tap the + button to begin</Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <Link href="/notes/create" asChild>
        <Pressable style={styles.fab}>
          <MaterialIcons name="add" size={28} color="white" />
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
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
    color: '#1a1a1a',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default NotesScreen;
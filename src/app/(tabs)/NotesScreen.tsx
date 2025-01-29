import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html'; // <-- HTML rendering library
import { fetchNotes, deleteNote } from '../../lib/api';
import { Note } from '@/app/types';

/**
 * NOTE: RenderHtml will render entire HTML by default.
 * If you only want a small preview (2 lines, for example),
 * you can limit container height (e.g., 60 px) and clip
 * overflowing text. See styles.htmlPreviewContainer below.
 */

const NotesScreen = () => {
  const { width } = useWindowDimensions(); // Used to set contentWidth for RenderHtml
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
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  {/* Title */}
                  <Text style={styles.noteTitle}>{item.title}</Text>

                  {/* HTML Preview */}
                  <View style={styles.htmlPreviewContainer}>
                    <RenderHtml
                      contentWidth={width - 32} // minus horizontal padding
                      source={{ html: item.content }}
                      tagsStyles={{
                        body: {
                          margin: 0,
                          color: '#666',
                          fontSize: 14,
                          lineHeight: 20,
                        },
                      }}
                    />
                  </View>

                  {/* Footer (date + delete button) */}
                  <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    <Pressable
                      onPress={() => handleDeleteNote(item.id)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : 1,
                      })}
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

export default NotesScreen;

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

  /**
   * If you'd like to "truncate" the preview to a certain height
   * (approx. 2 lines), you can set:
   *   maxHeight: 45 or 50,
   *   overflow: 'hidden'
   *
   * For example, to show ~2 lines, uncomment below:
   *
   * maxHeight: 45,
   * overflow: 'hidden',
   */
  htmlPreviewContainer: {
    marginBottom: 12,
    maxHeight: 45,
    overflow: 'hidden',
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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  StyleSheet,
  useColorScheme, // <-- import useColorScheme
} from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchNotes, deleteNote } from '../../../lib/api';
import { Note } from '../../types';

// 1. Import your color scheme
import Colors from '../../../constants/Colors';

const NotesScreen = () => {
  // 2. Detect the user's preferred color scheme
  const colorScheme = useColorScheme() as 'light' | 'dark';

  // 3. Get the appropriate palette (fallback to light if null)
  const theme = Colors[colorScheme] || Colors.light;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      // Filter out null notes just in case
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Show loader while fetching */}
      {loading ? (
        <ActivityIndicator
          size="large"
          // Use theme.primary.main for the loader color
          color={theme.primary.main}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) =>
            item ? (
              <Link href={`/notes/${item.id}`} asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.noteCard,
                    { backgroundColor: theme.card },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={[styles.noteTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>

                  {/* Footer (date + delete) */}
                  <View style={styles.noteFooter}>
                    <Text style={[styles.noteDate, { color: theme.textSecondary }]}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    <Pressable
                      onPress={() => handleDeleteNote(item.id)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                    >
                      {/* Use theme.danger.main for delete icon */}
                      <MaterialIcons
                        name="delete"
                        size={20}
                        color={theme.danger.main}
                      />
                    </Pressable>
                  </View>
                </Pressable>
              </Link>
            ) : null
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {/* For the empty icon, use theme.border or textSecondary */}
              <MaterialIcons name="note-add" size={48} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No reflections yet!
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Tap the + button to begin
              </Text>
            </View>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Basic shadow / elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow / elevation for the FAB
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

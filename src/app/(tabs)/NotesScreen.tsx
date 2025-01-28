import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { fetchNotes, createNote, deleteNote } from '../../lib/api';
import { Note } from '../types';

const NotesScreen = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchNotes();
      setNotes(data.filter((note): note is Note => note !== null));
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation Error', 'Title and content cannot be empty!');
      return;
    }

    try {
      setIsCreating(true);
      const newNote = await createNote(
        title,
        content,
        'b4e0c3e8-3e98-4a9d-8f34-6c1c9c7c7a30' // Replace with actual user ID later
      );
      setNotes((prev) => [newNote, ...prev]);
      setTitle('');
      setContent('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      'Delete Confirmation',
      'Are you sure you want to delete this note?',
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
              console.error('Error deleting note:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Your Notes
      </Text>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          marginVertical: 10,
          padding: 10,
        }}
      />
      <TextInput
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          marginBottom: 10,
          padding: 10,
          height: 100,
          textAlignVertical: 'top',
        }}
        multiline
      />
      <Button
        title={isCreating ? 'Adding Note...' : 'Add Note'}
        onPress={handleCreateNote}
        disabled={loading || isCreating}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item?.id ?? Math.random().toString()}
          renderItem={({ item }) =>
            item ? (
              <View
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                  marginVertical: 5,
                  borderRadius: 8,
                  backgroundColor: '#fff',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
                <Text style={{ marginVertical: 5 }}>{item.content}</Text>
                <Button title="Delete" onPress={() => handleDeleteNote(item.id)} color="red" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 20 }}>
              No notes available. Add your first note!
            </Text>
          }
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />
      )}
    </View>
  );
};

export default NotesScreen;

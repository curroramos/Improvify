import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { createNote } from '../../../lib/api';

export default function CreateNoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to get the formatted current date
  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }); // Example: "Monday, January 28, 2025"
  };

  // Set default title when component mounts
  useEffect(() => {
    setTitle(getFormattedDate());
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await createNote(
        title,
        content,
        'b4e0c3e8-3e98-4a9d-8f34-6c1c9c7c7a30'
      );

      // Reset the fields after successful submission
      setTitle(getFormattedDate()); // Reset title to the current date
      setContent('');

      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Link href="../" asChild>
          <Pressable>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </Pressable>
        </Link>
        <Text style={styles.title}>New Reflection</Text>
        <Pressable 
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && { opacity: 0.6 }
          ]}
        >
          <Text style={styles.saveText}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="Title"
        placeholderTextColor="#666"
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        maxLength={60}
      />

      <TextInput
        placeholder="Start writing your reflection here..."
        placeholderTextColor="#666"
        style={styles.contentInput}
        multiline
        textAlignVertical="top"
        value={content}
        onChangeText={setContent}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveText: {
    color: 'white',
    fontWeight: '500',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

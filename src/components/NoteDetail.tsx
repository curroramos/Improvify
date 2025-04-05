// NoteDetail.tsx
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Note } from '../types'; // Adjust path accordingly

interface NoteDetailProps {
  note: Note;
}

export function NoteDetail({ note }: NoteDetailProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.content}>
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.date}>
        {new Date(note.created_at).toLocaleDateString()}
      </Text>

      <RenderHtml
        contentWidth={width - 40} // e.g., subtract some padding
        source={{ html: note.content || '' }}
        tagsStyles={{
          body: {
            margin: 0,
            color: '#333',
            fontSize: 16,
            lineHeight: 24,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
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
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  onPress?: () => void;
}

const NoteCard = ({
  note,
  backgroundColor,
  textColor,
  textSecondaryColor,
  onPress,
}: NoteCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.contentWrapper}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {note.title}
        </Text>

        <Text style={[styles.content, { color: textSecondaryColor }]} numberOfLines={3}>
          {note.content}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.date, { color: textSecondaryColor }]}>
          {new Date(note.created_at).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  contentWrapper: {
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default NoteCard;
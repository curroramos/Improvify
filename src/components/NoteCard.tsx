import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Note } from '../types';
import { NoteDetail } from './NoteDetail'; // Adjust the import path

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
        <NoteDetail
          note={note}
        />
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
    flex: 1,
  },
});

export default NoteCard;

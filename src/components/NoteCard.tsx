import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  dangerColor: string;
}

const NoteCard = ({
  note,
  onDelete,
  backgroundColor,
  textColor,
  textSecondaryColor,
  dangerColor,
}: NoteCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.title, { color: textColor }]}>{note.title}</Text>
      
      <View style={styles.footer}>
        <Text style={[styles.date, { color: textSecondaryColor }]}>
          {new Date(note.created_at).toLocaleDateString()}
        </Text>
        
        <Pressable
          onPress={() => onDelete(note.id)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <MaterialIcons name="delete" size={20} color={dangerColor} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
});

export default NoteCard;
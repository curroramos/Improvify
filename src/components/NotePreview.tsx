import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type NotePreviewProps = {
  date: string;
  note: string;
  challenges: number;
  total: number;
};

export default function NotePreview({ date, note, challenges, total }: NotePreviewProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.note} numberOfLines={2}>
        {note}
      </Text>
      <Text style={styles.challenges}>
        ok challenges {challenges}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  note: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  challenges: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
});

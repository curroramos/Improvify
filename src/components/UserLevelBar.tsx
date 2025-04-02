import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type UserLevelBarProps = {
  level: number;
  points: number;
};

export default function UserLevelBar({ level, points }: UserLevelBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Level {level}</Text>
      <Text style={styles.points}>{points} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  points: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

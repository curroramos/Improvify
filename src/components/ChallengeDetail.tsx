import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Challenge } from '@/types';

type Props = {
  challenge: Challenge;
  completing: boolean;
  onComplete: () => void;
};

export default function ChallengeDetail({ challenge, completing, onComplete }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>Points: {challenge.points}</Text>
          <Text style={styles.metaText}>
            Status: {challenge.completed ? '✅ Completed' : '⏳ Pending'}
          </Text>
          {challenge.created_at && (
            <Text style={styles.metaText}>
              Created: {new Date(challenge.created_at).toDateString()}
            </Text>
          )}
        </View>

        {!challenge.completed && (
          <Pressable
            onPress={onComplete}
            disabled={completing}
            style={({ pressed }) => [
              styles.button,
              completing ? styles.buttonDisabled : null,
              pressed && !completing ? styles.buttonPressed : null,
            ]}
          >
            <Text style={styles.buttonText}>
              {completing ? 'Completing...' : 'Mark as Completed'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111',
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    lineHeight: 22,
  },
  meta: {
    marginBottom: 24,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
});

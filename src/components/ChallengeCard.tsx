import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChallengeCardProps {
  title: string;
  description: string;
  points: number;
  completed: boolean;
}

export default function ChallengeCard({ title, description, points, completed }: ChallengeCardProps) {
  console.log('Rendering ChallengeCard with:', { title, points, completed });

  const getDifficultyColor = () => {
    console.log(`Calculating difficulty for points: ${points}`);
    
    if (points <= 25) {
      console.log('Easy difficulty selected');
      return { gradient: ['#D4EDDA', '#A9DFBF'], border: '#2ecc71' };
    }
    if (points <= 35) {
      console.log('Medium difficulty selected');
      return { gradient: ['#FDEBD0', '#FAD7A0'], border: '#f39c12' };
    }
    console.log('Hard difficulty selected');
    return { gradient: ['#FADBD8', '#F5B7B1'], border: '#e74c3c' };
  };

  const colors = getDifficultyColor();
  console.log('Selected colors:', colors);

  return (
    <View style={[styles.cardContainer, { borderColor: colors.border }]}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.points}>{points} Points</Text>
          <Text style={[styles.status, completed ? styles.completed : styles.pending]}>
            {completed ? 'Completed' : 'Pending'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  points: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  completed: {
    color: '#27ae60',
  },
  pending: {
    color: '#e67e22',
  },
});

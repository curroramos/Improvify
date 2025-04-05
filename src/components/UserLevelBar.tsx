import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type UserLevelBarProps = {
  level: number;
  points: number;
  nextLevelPoints?: number; // Points needed for next level
};

export default function UserLevelBar({ 
  level, 
  points, 
  nextLevelPoints = 100 // Default value if not provided
}: UserLevelBarProps) {
  // Calculate progress percentage (capped at 100%)
  const progress = Math.min((points / nextLevelPoints) * 100, 100);
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.levelBadge}>
          <MaterialIcons name="stars" size={16} color="#ffffff" />
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <Text style={styles.points}>{points} / {nextLevelPoints} pts</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progress}%` }
          ]} 
        />
        
        {/* Milestones */}
        <View style={[styles.milestone, { left: '25%' }]} />
        <View style={[styles.milestone, { left: '50%' }]} />
        <View style={[styles.milestone, { left: '75%' }]} />
        
        {/* Progress indicator */}
        <View style={[styles.progressIndicator, { left: `${progress}%` }]}>
          <MaterialIcons name="brightness-1" size={12} color="#FFD700" />
        </View>
      </View>
      
      <View style={styles.labelRow}>
        <Text style={styles.currentLevelLabel}>Level {level}</Text>
        <Text style={styles.nextLevelLabel}>Level {level + 1}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    marginVertical: 8,
    position: 'relative',
    overflow: 'visible',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  milestone: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 2,
  },
  progressIndicator: {
    position: 'absolute',
    top: -2,
    transform: [{ translateX: -6 }], // Center the indicator
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  currentLevelLabel: {
    fontSize: 12,
    color: '#666',
  },
  nextLevelLabel: {
    fontSize: 12,
    color: '#666',
  },
});
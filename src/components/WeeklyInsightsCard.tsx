import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { WeeklyInsight } from '@/types';
import { useTheme, colors } from '@/theme';

interface WeeklyInsightsCardProps {
  insight: WeeklyInsight;
  onPress?: () => void;
  daysUntilNext?: number;
}

export default function WeeklyInsightsCard({
  insight,
  onPress,
  daysUntilNext,
}: WeeklyInsightsCardProps) {
  const { theme, gradients } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const { stats, patterns } = insight;

  // Get first positive pattern if any
  const topPattern = patterns.find((p) => p.type === 'positive') || patterns[0];

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'positive':
        return colors.emerald[300];
      case 'negative':
        return colors.rose[300];
      default:
        return colors.slate[300];
    }
  };

  return (
    <Animated.View
      style={[styles.container, { shadowColor: theme.brand.primary }]}
      entering={FadeIn.duration(500)}
    >
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Header */}
          <Animated.View style={styles.header} entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="insights" size={20} color={theme.text.inverse} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text.inverse }]}>Weekly Insights</Text>
                <Text style={styles.subtitle}>
                  {stats.totalReflections} reflections · {stats.completionRate}% completion
                </Text>
              </View>
            </View>
            {onPress && <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />}
          </Animated.View>

          {/* Preview Content */}
          <View style={styles.previewContent}>
            {topPattern && (
              <View style={styles.patternPreview}>
                <MaterialIcons
                  name={
                    topPattern.type === 'positive'
                      ? 'trending-up'
                      : topPattern.type === 'negative'
                        ? 'trending-down'
                        : 'trending-flat'
                  }
                  size={14}
                  color={getPatternColor(topPattern.type)}
                />
                <Text style={[styles.patternText, { color: theme.text.inverse }]} numberOfLines={1}>
                  {topPattern.title}
                </Text>
              </View>
            )}

            <View style={styles.statsPreview}>
              <View style={styles.statItem}>
                <MaterialIcons name="stars" size={14} color={colors.amber[300]} />
                <Text style={styles.statText}>{stats.totalPointsEarned} pts</Text>
              </View>
              {daysUntilNext !== undefined && daysUntilNext > 0 && (
                <View style={styles.statItem}>
                  <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statText}>{daysUntilNext}d until next</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  previewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patternPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  patternText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  statsPreview: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

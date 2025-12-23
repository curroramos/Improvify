import React from 'react';
import { View, StyleSheet, Text, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { RadarChart } from './RadarChart';
import { LifeBalanceData } from '@/types';
import { getCategoryConfig } from '@/constants/Categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LifeBalanceCardProps {
  data: LifeBalanceData | undefined;
  isLoading?: boolean;
  onPress?: () => void;
}

export function LifeBalanceCard({ data, isLoading, onPress }: LifeBalanceCardProps) {
  if (isLoading) {
    return <LifeBalanceCardSkeleton />;
  }

  if (!data) {
    return <LifeBalanceEmptyState onPress={onPress} />;
  }

  const { scores } = data;

  // Get top 3 categories by points
  const topCategories = [...scores]
    .filter((s) => s.total_points > 0)
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 3);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(500)}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Header */}
          <Animated.View style={styles.header} entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Life Balance</Text>
              <Text style={styles.subtitle}>Tap to see details</Text>
            </View>
            {onPress && <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />}
          </Animated.View>

          {/* Radar Chart - Centered and Bigger */}
          <Animated.View style={styles.chartContainer} entering={FadeIn.delay(200).duration(600)}>
            <RadarChart
              data={scores}
              size={SCREEN_WIDTH * 0.6}
              showLabels={false}
              fixedScale={true}
            />
          </Animated.View>

          {/* Top Categories Pills */}
          {topCategories.length > 0 && (
            <Animated.View
              style={styles.categoriesContainer}
              entering={FadeInUp.delay(400).duration(400)}
            >
              <View style={styles.categoriesRow}>
                {topCategories.map((score) => {
                  const config = getCategoryConfig(score.category);
                  return (
                    <View
                      key={score.category}
                      style={[
                        styles.categoryPill,
                        { backgroundColor: `${config.color}20`, borderColor: config.color },
                      ]}
                    >
                      <MaterialIcons
                        name={config.icon as keyof typeof MaterialIcons.glyphMap}
                        size={12}
                        color={config.color}
                      />
                      <Text style={[styles.categoryPillText, { color: config.color }]}>
                        {score.total_points}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Decorative elements */}
          <View style={styles.cornerDecor1} />
          <View style={styles.cornerDecor2} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function LifeBalanceCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.skeletonCard]}>
        <View style={styles.skeletonHeader}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonBadge} />
        </View>
        <View style={styles.skeletonChart} />
        <View style={styles.skeletonStats} />
      </View>
    </View>
  );
}

function LifeBalanceEmptyState({ onPress }: { onPress?: () => void }) {
  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(400)}>
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.emptyCard]}
        >
          <MaterialIcons name="radar" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>No Life Balance Data Yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete challenges to see your progress across all life areas
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cornerDecor1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  cornerDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  // Skeleton styles
  skeletonCard: {
    backgroundColor: '#1a1a2e',
    minHeight: 350,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skeletonTitle: {
    width: 120,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  skeletonBadge: {
    width: 60,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  skeletonChart: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 100,
    alignSelf: 'center',
    marginVertical: 20,
  },
  skeletonStats: {
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  // Empty state styles
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

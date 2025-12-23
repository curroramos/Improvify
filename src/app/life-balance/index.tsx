import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useUser } from '@/hooks/useUser';
import { useLifeBalance } from '@/lib/query/hooks/useChallenges';
import { RadarChart } from '@/components/RadarChart';
import { getCategoryConfig } from '@/constants/Categories';
import { LifeCategory } from '@/types';
import { useTheme } from '@/theme';
import { ThemeTokens } from '@/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated category row component
const CategoryProgressRow = ({
  category,
  points,
  percentage: _percentage,
  completedCount,
  index,
  maxPoints,
  theme,
}: {
  category: LifeCategory;
  points: number;
  percentage: number;
  completedCount: number;
  index: number;
  maxPoints: number;
  theme: ThemeTokens;
}) => {
  const config = getCategoryConfig(category);
  const animatedWidth = useSharedValue(0);
  const isTop = index === 0;
  const relativeWidth = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

  React.useEffect(() => {
    animatedWidth.value = withDelay(
      index * 50,
      withSpring(relativeWidth, { damping: 15, stiffness: 120 })
    );
  }, [relativeWidth, index, animatedWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(300 + index * 40).duration(300)}
      style={[styles.categoryItem, isTop && { backgroundColor: theme.surface.secondary }]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: `${config.color}15` }]}>
        <MaterialIcons
          name={config.icon as keyof typeof MaterialIcons.glyphMap}
          size={20}
          color={config.color}
        />
      </View>
      <View style={styles.categoryInfo}>
        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryName, { color: theme.text.secondary }, isTop && { color: theme.text.primary, fontWeight: '700' }]}>{config.label}</Text>
          <View style={styles.categoryStats}>
            <Text style={[styles.categoryPoints, { color: config.color }]}>{points}</Text>
            <Text style={[styles.categoryXpLabel, { color: theme.text.tertiary }]}>XP</Text>
          </View>
        </View>
        <View style={[styles.progressBarContainer, { backgroundColor: theme.surface.secondary }]}>
          <Animated.View style={[styles.progressBarAnimated, progressStyle]}>
            <LinearGradient
              colors={[config.color, `${config.color}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <Text style={[styles.categoryCompletedText, { color: theme.text.tertiary }]}>
          {completedCount} challenge{completedCount !== 1 ? 's' : ''} completed
        </Text>
      </View>
    </Animated.View>
  );
};

export default function LifeBalanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useUser();
  const { data, isLoading } = useLifeBalance(user?.id);

  // Sort categories by points (highest first)
  const sortedCategories = data?.scores
    ? [...data.scores].sort((a, b) => b.total_points - a.total_points)
    : [];

  const activeCategories = sortedCategories.filter((s) => s.total_points > 0);
  const inactiveCategories = sortedCategories.filter((s) => s.total_points === 0);

  // Get strongest and weakest categories
  const strongestCategory = activeCategories[0];
  const weakestCategory =
    activeCategories.length > 1
      ? activeCategories[activeCategories.length - 1]
      : inactiveCategories[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={[styles.backButton, { backgroundColor: theme.surface.primary }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Life Balance</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brand.primary} />
        </View>
      ) : !data ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="radar" size={64} color={theme.text.tertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Data Yet</Text>
          <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
            Complete challenges to see your life balance across all areas
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        >
          {/* Radar Chart */}
          <Animated.View style={[styles.chartCard, { backgroundColor: theme.surface.primary }]} entering={FadeIn.duration(500)}>
            <View style={styles.chartWrapper}>
              <RadarChart
                data={data.scores}
                size={SCREEN_WIDTH}
                showLabels={true}
                showPoints={true}
                animated={true}
                fixedScale={false}
              />
            </View>
          </Animated.View>

          {/* Strongest / Weakest Areas */}
          {(strongestCategory || weakestCategory) && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <View style={styles.highlightRow}>
                {/* Strongest */}
                {strongestCategory && (
                  <View style={[styles.highlightCard, { backgroundColor: theme.surface.primary }]}>
                    <View style={styles.highlightHeader}>
                      <MaterialIcons name="arrow-upward" size={16} color={theme.semantic.success} />
                      <Text style={[styles.highlightLabel, { color: theme.text.secondary }]}>Strongest</Text>
                    </View>
                    <View
                      style={[
                        styles.highlightIcon,
                        {
                          backgroundColor: `${getCategoryConfig(strongestCategory.category).color}15`,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          getCategoryConfig(strongestCategory.category)
                            .icon as keyof typeof MaterialIcons.glyphMap
                        }
                        size={28}
                        color={getCategoryConfig(strongestCategory.category).color}
                      />
                    </View>
                    <Text style={[styles.highlightName, { color: theme.text.primary }]}>
                      {getCategoryConfig(strongestCategory.category).shortLabel}
                    </Text>
                    <Text style={[styles.highlightPoints, { color: theme.text.secondary }]}>{strongestCategory.total_points} XP</Text>
                  </View>
                )}

                {/* Weakest */}
                {weakestCategory && (
                  <View style={[styles.highlightCard, { backgroundColor: theme.surface.primary }]}>
                    <View style={styles.highlightHeader}>
                      <MaterialIcons name="arrow-downward" size={16} color={theme.semantic.error} />
                      <Text style={[styles.highlightLabel, { color: theme.text.secondary }]}>Weakest</Text>
                    </View>
                    <View
                      style={[
                        styles.highlightIcon,
                        {
                          backgroundColor: `${getCategoryConfig(weakestCategory.category).color}15`,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          getCategoryConfig(weakestCategory.category)
                            .icon as keyof typeof MaterialIcons.glyphMap
                        }
                        size={28}
                        color={getCategoryConfig(weakestCategory.category).color}
                      />
                    </View>
                    <Text style={[styles.highlightName, { color: theme.text.primary }]}>
                      {getCategoryConfig(weakestCategory.category).shortLabel}
                    </Text>
                    <Text style={[styles.highlightPoints, { color: theme.text.secondary }]}>{weakestCategory.total_points} XP</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Active Categories */}
          {activeCategories.length > 0 && (
            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Your Progress</Text>
              </View>
              <View style={[styles.categoriesList, { backgroundColor: theme.surface.primary }]}>
                {activeCategories.map((score, index) => (
                  <CategoryProgressRow
                    key={score.category}
                    category={score.category}
                    points={score.total_points}
                    percentage={score.percentage}
                    completedCount={Number(score.completed_count)}
                    index={index}
                    maxPoints={activeCategories[0]?.total_points || 1}
                    theme={theme}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Inactive Categories */}
          {inactiveCategories.length > 0 && (
            <Animated.View entering={FadeInUp.delay(500).duration(400)}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Areas to Explore</Text>
              </View>
              <View style={[styles.inactiveCard, { backgroundColor: theme.surface.primary }]}>
                <View style={styles.inactiveGrid}>
                  {inactiveCategories.map((score, index) => {
                    const config = getCategoryConfig(score.category);
                    return (
                      <Animated.View
                        key={score.category}
                        entering={FadeInUp.delay(550 + index * 30).duration(250)}
                        style={styles.inactiveItem}
                      >
                        <View
                          style={[styles.inactiveIcon, { backgroundColor: `${config.color}12` }]}
                        >
                          <MaterialIcons
                            name={config.icon as keyof typeof MaterialIcons.glyphMap}
                            size={22}
                            color={`${config.color}90`}
                          />
                        </View>
                        <Text style={[styles.inactiveName, { color: theme.text.secondary }]}>{config.shortLabel}</Text>
                        <View style={[styles.inactiveEmptyBar, { backgroundColor: theme.surface.secondary }]}>
                          <View
                            style={[
                              styles.inactiveEmptyDot,
                              { backgroundColor: `${config.color}40` },
                            ]}
                          />
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
                <View style={[styles.inactiveHint, { borderTopColor: theme.border.secondary }]}>
                  <MaterialIcons name="lightbulb-outline" size={16} color={theme.text.tertiary} />
                  <Text style={[styles.inactiveHintText, { color: theme.text.tertiary }]}>
                    Complete challenges in these areas to unlock insights
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  chartCard: {
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 16,
    marginHorizontal: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  highlightCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  highlightName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  highlightPoints: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoriesList: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  categoryPoints: {
    fontSize: 16,
    fontWeight: '800',
  },
  categoryXpLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarAnimated: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryCompletedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inactiveCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  inactiveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  inactiveItem: {
    width: (SCREEN_WIDTH - 64) / 4,
    alignItems: 'center',
    paddingVertical: 8,
  },
  inactiveIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  inactiveName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  inactiveEmptyBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveEmptyDot: {
    width: 6,
    height: 4,
    borderRadius: 2,
  },
  inactiveHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inactiveHintText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

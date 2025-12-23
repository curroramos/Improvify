import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useLatestWeeklyInsight } from '@/lib/query/hooks/useWeeklyInsights';
import { useUser } from '@/hooks/useUser';
import { useTheme } from '@/theme';
import type { InsightPattern, InsightRecommendation } from '@/types';

function PatternCard({ pattern, index }: { pattern: InsightPattern; index: number }) {
  const { theme } = useTheme();

  const getPatternStyles = () => {
    switch (pattern.type) {
      case 'positive':
        return {
          icon: 'trending-up' as const,
          color: theme.semantic.success,
          bgColor: theme.semantic.successLight,
          borderColor: theme.semantic.success + '40',
        };
      case 'negative':
        return {
          icon: 'trending-down' as const,
          color: theme.semantic.error,
          bgColor: theme.semantic.errorLight,
          borderColor: theme.semantic.error + '40',
        };
      default:
        return {
          icon: 'trending-flat' as const,
          color: theme.text.tertiary,
          bgColor: theme.background.tertiary,
          borderColor: theme.border.secondary,
        };
    }
  };

  const patternStyle = getPatternStyles();

  return (
    <Animated.View
      entering={FadeInUp.delay(200 + index * 80).duration(400)}
      style={[
        patternCardStyles.card,
        { backgroundColor: patternStyle.bgColor, borderColor: patternStyle.borderColor },
      ]}
    >
      <View style={[patternCardStyles.iconContainer, { backgroundColor: patternStyle.color }]}>
        <MaterialIcons name={patternStyle.icon} size={20} color={theme.text.inverse} />
      </View>
      <View style={patternCardStyles.content}>
        <Text style={[patternCardStyles.title, { color: theme.text.primary }]}>{pattern.title}</Text>
        <Text style={[patternCardStyles.description, { color: theme.text.secondary }]}>{pattern.description}</Text>
      </View>
    </Animated.View>
  );
}

function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: InsightRecommendation;
  index: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(400 + index * 80).duration(400)}
      style={[recommendationCardStyles.card, { backgroundColor: theme.semantic.warningLight, borderColor: theme.semantic.warning + '40' }]}
    >
      <View style={[recommendationCardStyles.iconContainer, { backgroundColor: theme.semantic.warning + '20' }]}>
        <MaterialIcons name="lightbulb" size={20} color={theme.semantic.warning} />
      </View>
      <View style={recommendationCardStyles.content}>
        <Text style={[recommendationCardStyles.title, { color: theme.text.primary }]}>{recommendation.title}</Text>
        <Text style={[recommendationCardStyles.description, { color: theme.text.secondary }]}>{recommendation.description}</Text>
      </View>
    </Animated.View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { theme, gradients } = useTheme();
  const { data: latestInsight, isLoading } = useLatestWeeklyInsight(user?.id);

  if (isLoading) {
    return (
      <View style={[pageStyles.container, { paddingTop: insets.top, backgroundColor: theme.background.primary }]}>
        <View style={pageStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brand.primary} />
        </View>
      </View>
    );
  }

  if (!latestInsight) {
    return (
      <View style={[pageStyles.container, { paddingTop: insets.top, backgroundColor: theme.background.primary }]}>
        <View style={pageStyles.header}>
          <Pressable style={[pageStyles.backButton, { backgroundColor: theme.surface.primary }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
          </Pressable>
          <Text style={[pageStyles.headerTitle, { color: theme.text.primary }]}>Weekly Insights</Text>
          <View style={pageStyles.placeholder} />
        </View>
        <View style={pageStyles.emptyContainer}>
          <MaterialIcons name="insights" size={64} color={theme.text.tertiary} />
          <Text style={[pageStyles.emptyTitle, { color: theme.text.primary }]}>No Insights Yet</Text>
          <Text style={[pageStyles.emptyText, { color: theme.text.tertiary }]}>
            Generate your first weekly insights from your profile page
          </Text>
        </View>
      </View>
    );
  }

  const { stats, patterns, recommendations, summary } = latestInsight;

  return (
    <View style={[pageStyles.container, { paddingTop: insets.top, backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={pageStyles.header}>
        <Pressable style={[pageStyles.backButton, { backgroundColor: theme.surface.primary }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
        </Pressable>
        <Text style={[pageStyles.headerTitle, { color: theme.text.primary }]}>Weekly Insights</Text>
        <View style={pageStyles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[pageStyles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Summary Card */}
        <Animated.View entering={FadeIn.duration(500)}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[pageStyles.summaryCard, { shadowColor: theme.brand.primary }]}
          >
            <Text style={pageStyles.summaryText}>{summary}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={pageStyles.statsRow}>
          <View style={[pageStyles.statCard, { backgroundColor: theme.surface.primary }]}>
            <MaterialIcons name="edit-note" size={24} color={theme.brand.primary} />
            <Text style={[pageStyles.statValue, { color: theme.text.primary }]}>{stats.totalReflections}</Text>
            <Text style={[pageStyles.statLabel, { color: theme.text.tertiary }]}>Reflections</Text>
          </View>
          <View style={[pageStyles.statCard, { backgroundColor: theme.surface.primary }]}>
            <MaterialIcons name="check-circle" size={24} color={theme.semantic.success} />
            <Text style={[pageStyles.statValue, { color: theme.text.primary }]}>
              {stats.completedChallenges}/{stats.totalChallenges}
            </Text>
            <Text style={[pageStyles.statLabel, { color: theme.text.tertiary }]}>Challenges</Text>
          </View>
          <View style={[pageStyles.statCard, { backgroundColor: theme.surface.primary }]}>
            <MaterialIcons name="stars" size={24} color={theme.semantic.warning} />
            <Text style={[pageStyles.statValue, { color: theme.text.primary }]}>{stats.totalPointsEarned}</Text>
            <Text style={[pageStyles.statLabel, { color: theme.text.tertiary }]}>XP Earned</Text>
          </View>
        </Animated.View>

        {/* Completion Rate */}
        <Animated.View
          entering={FadeInUp.delay(150).duration(400)}
          style={[pageStyles.completionCard, { backgroundColor: theme.surface.primary }]}
        >
          <View style={pageStyles.completionHeader}>
            <Text style={[pageStyles.completionLabel, { color: theme.text.secondary }]}>Completion Rate</Text>
            <Text style={[pageStyles.completionValue, { color: theme.semantic.success }]}>{stats.completionRate}%</Text>
          </View>
          <View style={[pageStyles.completionTrack, { backgroundColor: theme.background.tertiary }]}>
            <Animated.View
              style={[pageStyles.completionBar, { width: `${stats.completionRate}%`, backgroundColor: theme.semantic.success }]}
            />
          </View>
        </Animated.View>

        {/* Patterns Section */}
        {patterns.length > 0 && (
          <View style={pageStyles.section}>
            <Text style={[pageStyles.sectionTitle, { color: theme.text.primary }]}>Patterns Identified</Text>
            {patterns.map((pattern, index) => (
              <PatternCard key={index} pattern={pattern} index={index} />
            ))}
          </View>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <View style={pageStyles.section}>
            <Text style={[pageStyles.sectionTitle, { color: theme.text.primary }]}>Recommendations</Text>
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const pageStyles = StyleSheet.create({
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
    shadowOpacity: 0.08,
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
    padding: 16,
    gap: 16,
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
    padding: 32,
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
  summaryCard: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  completionCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  completionValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  completionTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionBar: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
});

const patternCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
  },
});

const recommendationCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
  },
});

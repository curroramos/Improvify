import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInUp,
  ZoomIn,
  SlideInRight,
} from 'react-native-reanimated';
import { useLatestWeeklyInsight, useGenerateWeeklyInsights } from '@/lib/query';
import { useAuth } from '@/hooks/useAuth';
import type { WeeklyInsight, InsightPattern } from '@/types';
import { logger } from '@/lib/utils/logger';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Pattern icon helper
function PatternIcon({ type }: { type: InsightPattern['type'] }) {
  switch (type) {
    case 'positive':
      return <MaterialIcons name="trending-up" size={18} color="#10B981" />;
    case 'negative':
      return <MaterialIcons name="trending-down" size={18} color="#EF4444" />;
    default:
      return <MaterialIcons name="trending-flat" size={18} color="#6B7280" />;
  }
}

function getPatternColors(type: InsightPattern['type']) {
  switch (type) {
    case 'positive':
      return { bg: '#ECFDF5', text: '#047857', iconBg: '#D1FAE5' };
    case 'negative':
      return { bg: '#FEF2F2', text: '#B91C1C', iconBg: '#FEE2E2' };
    default:
      return { bg: '#F3F4F6', text: '#4B5563', iconBg: '#E5E7EB' };
  }
}

function getWeekDateRange(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

// Stat card component with icon background
function StatCard({
  icon,
  value,
  label,
  colors,
  delay,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string | number;
  label: string;
  colors: readonly [string, string];
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)} style={modalStyles.statCard}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={modalStyles.statIconContainer}
      >
        <MaterialIcons name={icon} size={20} color="#FFF" />
      </LinearGradient>
      <Text style={modalStyles.statValue}>{value}</Text>
      <Text style={modalStyles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// Full Insights Modal
function InsightsModal({
  visible,
  onClose,
  insight,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  insight: WeeklyInsight | null;
  loading: boolean;
}) {
  const insets = useSafeAreaInsets();
  const weekRange = getWeekDateRange();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.container}>
        {/* Gradient Header */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={modalStyles.headerGradient}
        >
          <View style={modalStyles.header}>
            <View>
              <Text style={modalStyles.headerTitle}>Weekly Insights</Text>
              <Text style={modalStyles.headerSubtitle}>{weekRange}</Text>
            </View>
            <Pressable onPress={onClose} style={modalStyles.closeButton}>
              <MaterialIcons name="close" size={22} color="#FFF" />
            </Pressable>
          </View>
        </LinearGradient>

        {loading ? (
          <View style={modalStyles.loadingContainer}>
            <Animated.View entering={ZoomIn.duration(300)}>
              <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={modalStyles.loadingIcon}>
                <ActivityIndicator size="large" color="#6366F1" />
              </LinearGradient>
            </Animated.View>
            <Animated.Text entering={FadeIn.delay(200)} style={modalStyles.loadingText}>
              Analyzing your week...
            </Animated.Text>
            <Animated.Text entering={FadeIn.delay(400)} style={modalStyles.loadingSubtext}>
              Discovering patterns and insights
            </Animated.Text>
          </View>
        ) : insight ? (
          <ScrollView
            style={modalStyles.content}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Summary Card */}
            <Animated.View entering={FadeInUp.delay(100).duration(400)} style={modalStyles.section}>
              <View style={modalStyles.summaryCard}>
                <View style={modalStyles.summaryIconRow}>
                  <View style={modalStyles.summaryIconBg}>
                    <MaterialIcons name="auto-awesome" size={20} color="#6366F1" />
                  </View>
                  <Text style={modalStyles.summaryLabel}>AI Summary</Text>
                </View>
                <Text style={modalStyles.summaryText}>{insight.summary}</Text>
              </View>
            </Animated.View>

            {/* Stats Section */}
            <Animated.View entering={FadeInUp.delay(150).duration(400)} style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Your Progress</Text>
              <View style={modalStyles.statsGrid}>
                <StatCard
                  icon="edit-note"
                  value={insight.stats.totalReflections}
                  label="Reflections"
                  colors={['#6366F1', '#818CF8'] as const}
                  delay={200}
                />
                <StatCard
                  icon="flag"
                  value={`${insight.stats.completedChallenges}/${insight.stats.totalChallenges}`}
                  label="Challenges"
                  colors={['#8B5CF6', '#A78BFA'] as const}
                  delay={250}
                />
                <StatCard
                  icon="trending-up"
                  value={`${insight.stats.completionRate}%`}
                  label="Completion"
                  colors={['#EC4899', '#F472B6'] as const}
                  delay={300}
                />
                <StatCard
                  icon="stars"
                  value={insight.stats.totalPointsEarned}
                  label="XP Earned"
                  colors={['#F59E0B', '#FBBF24'] as const}
                  delay={350}
                />
              </View>
            </Animated.View>

            {/* Patterns Section */}
            {insight.patterns.length > 0 && (
              <View style={modalStyles.section}>
                <Animated.Text
                  entering={FadeInUp.delay(400).duration(300)}
                  style={modalStyles.sectionTitle}
                >
                  Patterns Noticed
                </Animated.Text>
                {insight.patterns.map((pattern, index) => {
                  const colors = getPatternColors(pattern.type);
                  return (
                    <Animated.View
                      key={index}
                      entering={SlideInRight.delay(450 + index * 80).duration(300)}
                      style={[modalStyles.patternCard, { backgroundColor: colors.bg }]}
                    >
                      <View style={[modalStyles.patternIconBg, { backgroundColor: colors.iconBg }]}>
                        <PatternIcon type={pattern.type} />
                      </View>
                      <View style={modalStyles.patternContent}>
                        <Text style={[modalStyles.patternTitle, { color: colors.text }]}>
                          {pattern.title}
                        </Text>
                        <Text style={modalStyles.patternDescription}>{pattern.description}</Text>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            )}

            {/* Recommendations Section */}
            {insight.recommendations.length > 0 && (
              <View style={modalStyles.section}>
                <Animated.Text
                  entering={FadeInUp.delay(550).duration(300)}
                  style={modalStyles.sectionTitle}
                >
                  Recommendations
                </Animated.Text>
                {insight.recommendations.map((rec, index) => (
                  <Animated.View
                    key={index}
                    entering={SlideInRight.delay(600 + index * 80).duration(300)}
                    style={modalStyles.recommendationCard}
                  >
                    <LinearGradient
                      colors={['#FEF3C7', '#FDE68A']}
                      style={modalStyles.recommendationIcon}
                    >
                      <MaterialIcons name="lightbulb" size={18} color="#D97706" />
                    </LinearGradient>
                    <View style={modalStyles.recommendationContent}>
                      <Text style={modalStyles.recommendationTitle}>{rec.title}</Text>
                      <Text style={modalStyles.recommendationDescription}>{rec.description}</Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={modalStyles.emptyContainer}>
            <View style={modalStyles.emptyIcon}>
              <MaterialIcons name="insights" size={48} color="#94A3B8" />
            </View>
            <Text style={modalStyles.emptyTitle}>No Insights Yet</Text>
            <Text style={modalStyles.emptyText}>
              Complete some reflections this week to generate insights
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

// Get the start of the current week (Monday)
function getCurrentWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Check if today is Sunday (day 0)
function isSunday(): boolean {
  return new Date().getDay() === 0;
}

// Main Component
export default function WeeklyInsightButton() {
  const { userId } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: latestInsight, isLoading: loadingInsight } = useLatestWeeklyInsight(
    userId ?? undefined
  );
  const generateMutation = useGenerateWeeklyInsights(userId ?? undefined);

  // Determine availability based on:
  // 1. Not loading
  // 2. No insight exists for current week
  // 3. Today is Sunday
  const currentWeekStart = getCurrentWeekStart();
  const hasInsightForCurrentWeek = latestInsight?.week_start_date === currentWeekStart;
  const isAvailable = !loadingInsight && !hasInsightForCurrentWeek && isSunday();

  // Animation values
  const pulseScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  // Pulse animation for available state
  useEffect(() => {
    if (isAvailable) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.8, { duration: 1000 }), withTiming(0.4, { duration: 1000 })),
        -1,
        true
      );
    }
  }, [isAvailable, pulseScale, glowOpacity]);

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isAvailable) {
      setModalVisible(true);

      // Generate new insights (only called when isAvailable is true, meaning no insight exists for current week)
      try {
        await generateMutation.mutateAsync();
      } catch (error) {
        logger.error('Failed to generate insights:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value * pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Available state - big special button
  if (isAvailable) {
    return (
      <>
        <Animated.View entering={ZoomIn.springify()} style={styles.availableContainer}>
          <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.availableButton, buttonAnimatedStyle]}
          >
            {/* Glow effect */}
            <Animated.View style={[styles.glowEffect, glowStyle]} />

            <LinearGradient
              colors={['#6366F1', '#8B5CF6', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.availableGradient}
            >
              <View style={styles.availableIconContainer}>
                <MaterialIcons name="auto-awesome" size={32} color="#FFF" />
              </View>
              <View style={styles.availableContent}>
                <Text style={styles.availableTitle}>Weekly Insights Ready!</Text>
                <Text style={styles.availableSubtitle}>
                  Tap to discover your patterns and progress
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={28} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        <InsightsModal
          visible={modalVisible}
          onClose={handleCloseModal}
          insight={latestInsight ?? null}
          loading={generateMutation.isPending || loadingInsight}
        />
      </>
    );
  }

  // Not available - hide the button
  return null;
}

const styles = StyleSheet.create({
  // Available state styles
  availableContainer: {
    marginBottom: 24,
  },
  availableButton: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#8B5CF6',
    borderRadius: 30,
    zIndex: -1,
  },
  availableGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  availableIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableContent: {
    flex: 1,
  },
  availableTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  availableSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  summaryIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  patternCard: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  patternIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternContent: {
    flex: 1,
  },
  patternTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 19,
  },
});

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useUser } from '@/hooks/useUser';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { Timeframe } from '@/types';
import { getLevelProgressData } from '@/lib/domain/leveling';
import { useTheme } from '@/theme';
import { ThemeTokens } from '@/theme/tokens';

const TIMEFRAME_OPTIONS = [
  { key: 'daily' as Timeframe, label: 'Day' },
  { key: 'weekly' as Timeframe, label: 'Week' },
  { key: 'monthly' as Timeframe, label: 'Month' },
];

const CHART_HEIGHT = 140;
const CHART_PADDING_TOP = 30;
const CHART_PADDING_BOTTOM = 10;
const CHART_PADDING_HORIZONTAL = 16;

// Line graph component
const LineGraph = ({
  data,
  labels,
  maxValue,
  theme,
}: {
  data: number[];
  labels: string[];
  maxValue: number;
  theme: ThemeTokens;
}) => {
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth - 72; // Account for card padding
  const chartWidth = containerWidth - CHART_PADDING_HORIZONTAL * 2;
  const pointSpacing = chartWidth / (data.length - 1);
  const graphHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  // Calculate Y position for a value
  const getY = (value: number) => {
    if (maxValue === 0) return graphHeight + CHART_PADDING_TOP;
    const normalized = value / maxValue;
    return CHART_PADDING_TOP + graphHeight * (1 - normalized);
  };

  // Generate smooth curve path
  const generatePath = () => {
    if (data.length === 0) return '';

    const points = data.map((value, index) => ({
      x: CHART_PADDING_HORIZONTAL + index * pointSpacing,
      y: getY(value),
    }));

    // Create smooth bezier curve
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;

      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  // Generate filled area path
  const generateAreaPath = () => {
    if (data.length === 0) return '';

    const linePath = generatePath();
    const lastX = CHART_PADDING_HORIZONTAL + (data.length - 1) * pointSpacing;
    const firstX = CHART_PADDING_HORIZONTAL;
    const bottomY = CHART_HEIGHT;

    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const linePath = generatePath();
  const areaPath = generateAreaPath();

  return (
    <View style={styles.lineGraphContainer}>
      <Svg width={containerWidth} height={CHART_HEIGHT} style={styles.svg}>
        <Defs>
          <SvgGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.brand.secondary} stopOpacity="0.3" />
            <Stop offset="1" stopColor={theme.brand.secondary} stopOpacity="0.02" />
          </SvgGradient>
        </Defs>

        {/* Filled area */}
        <Path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <Path d={linePath} stroke={theme.brand.secondary} strokeWidth={2.5} fill="none" strokeLinecap="round" />

        {/* Data points */}
        {data.map((value, index) => {
          const x = CHART_PADDING_HORIZONTAL + index * pointSpacing;
          const y = getY(value);
          const isLast = index === data.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Outer glow for last point */}
              {isLast && value > 0 && (
                <Circle cx={x} cy={y} r={10} fill={theme.brand.secondary} fillOpacity={0.15} />
              )}
              {/* Point */}
              <Circle
                cx={x}
                cy={y}
                r={isLast ? 6 : 4}
                fill={isLast ? theme.brand.secondary : theme.brand.secondaryHover}
                stroke={theme.surface.primary}
                strokeWidth={2}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Value labels above points */}
      <View style={[styles.valueLabelsRow, { width: containerWidth }]}>
        {data.map((value, index) => {
          const x = CHART_PADDING_HORIZONTAL + index * pointSpacing;
          const y = getY(value);
          const isLast = index === data.length - 1;

          return (
            <View
              key={index}
              style={[
                styles.valueLabel,
                {
                  left: x - 20,
                  top: y - 24,
                },
              ]}
            >
              {value > 0 && (
                <Text style={[
                  styles.valueLabelText,
                  { color: theme.brand.secondaryHover },
                  isLast && { color: theme.brand.secondary, fontSize: 12 },
                ]}>
                  {value}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={[styles.xAxisLabels, { paddingHorizontal: CHART_PADDING_HORIZONTAL }]}>
        {labels.map((label, index) => {
          const isLast = index === labels.length - 1;
          return (
            <View key={index} style={styles.xAxisLabelContainer}>
              <Text style={[
                styles.xAxisLabel,
                { color: theme.text.tertiary },
                isLast && { fontWeight: '700', color: theme.brand.secondary },
              ]}>{label}</Text>
              {isLast && <View style={[styles.todayDot, { backgroundColor: theme.brand.secondary }]} />}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, gradients } = useTheme();
  const { user, isLoading } = useUser();
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
  const { history: pointsHistory } = usePointsHistory(user?.id, timeframe);

  // Format date helper
  const formatDate = useCallback((date: Date, format: string) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    switch (format) {
      case 'day':
        return days[date.getDay()];
      case 'week':
        return `${months[date.getMonth()]} ${date.getDate()}`;
      case 'month':
        return months[date.getMonth()];
      default:
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  }, []);

  // Get period start
  const getPeriodStart = useCallback(
    (date: Date) => {
      const newDate = new Date(date);
      switch (timeframe) {
        case 'daily':
          return new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        case 'weekly':
          const day = newDate.getDay();
          const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
          newDate.setDate(diff);
          return new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        case 'monthly':
          return new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        default:
          return newDate;
      }
    },
    [timeframe]
  );

  // Generate all periods for the chart (always 7)
  const getAllPeriods = useCallback(() => {
    const periods: Date[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      switch (timeframe) {
        case 'daily':
          date.setDate(date.getDate() - i);
          periods.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
          break;
        case 'weekly':
          date.setDate(date.getDate() - i * 7);
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          date.setDate(diff);
          periods.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
          break;
        case 'monthly':
          date.setMonth(date.getMonth() - i);
          periods.push(new Date(date.getFullYear(), date.getMonth(), 1));
          break;
      }
    }
    return periods;
  }, [timeframe]);

  // Process chart data - always show 7 periods
  const chartData = useMemo(() => {
    // Group points by period
    const grouped = new Map<string, number>();
    pointsHistory.forEach((entry) => {
      const date = new Date(entry.date);
      const periodStart = getPeriodStart(date);
      const key = periodStart.toISOString().split('T')[0];
      grouped.set(key, (grouped.get(key) || 0) + entry.points_added);
    });

    // Generate all 7 periods (including those with 0 points)
    const allPeriods = getAllPeriods();
    const chartEntries = allPeriods.map((periodStart) => {
      const key = periodStart.toISOString().split('T')[0];
      return {
        periodStart,
        total: grouped.get(key) || 0,
      };
    });

    const labels = chartEntries.map(({ periodStart }) => {
      switch (timeframe) {
        case 'daily':
          return formatDate(periodStart, 'day');
        case 'weekly':
          return formatDate(periodStart, 'week');
        case 'monthly':
          return formatDate(periodStart, 'month');
        default:
          return formatDate(periodStart, 'day');
      }
    });
    const data = chartEntries.map((entry) => entry.total);
    const maxValue = Math.max(...data, 1);
    const totalPeriod = data.reduce((a, b) => a + b, 0);

    return { labels, data, maxValue, totalPeriod };
  }, [pointsHistory, timeframe, getPeriodStart, formatDate, getAllPeriods]);

  const handleTimeframePress = useCallback((newTimeframe: Timeframe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeframe(newTimeframe);
  }, []);

  const levelData = user ? getLevelProgressData(user.total_points) : null;

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brand.primary} />
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background.primary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: theme.text.tertiary }]}>Unable to load data</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={[styles.backButton, { backgroundColor: theme.surface.primary }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Progress</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Level Card */}
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.levelCard, { shadowColor: theme.brand.primary }]}>
          <LinearGradient
            colors={[theme.brand.primary, theme.brand.secondary, theme.brand.secondaryHover]}
            style={styles.levelGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative circles */}
            <View style={styles.levelDecor1} />
            <View style={styles.levelDecor2} />

            <View style={styles.levelContent}>
              <View style={styles.levelBadge}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.levelBadgeGradient}
                >
                  <MaterialIcons name="workspace-premium" size={32} color="#FFF" />
                </LinearGradient>
                <View style={[styles.levelNumberBadge, { borderColor: theme.brand.primary }]}>
                  <Text style={styles.levelNumber}>{levelData?.level}</Text>
                </View>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>Current Level</Text>
                <Text style={styles.levelTitle}>{levelData?.title}</Text>
                <View style={styles.levelXpRow}>
                  <MaterialIcons name="stars" size={18} color="#FCD34D" />
                  <Text style={styles.levelXP}>{user.total_points.toLocaleString()} XP</Text>
                </View>
              </View>
            </View>
            <View style={styles.levelProgressContainer}>
              <View style={styles.levelProgressHeader}>
                <Text style={styles.levelProgressLabel}>
                  Progress to Level {(levelData?.level || 0) + 1}
                </Text>
                <Text style={styles.levelProgressPercent}>
                  {Math.round(levelData?.progress || 0)}%
                </Text>
              </View>
              <View style={styles.levelProgressTrack}>
                <Animated.View
                  style={[styles.levelProgressBar, { width: `${levelData?.progress || 0}%` }]}
                />
              </View>
              <Text style={styles.levelProgressText}>
                {levelData?.pointsToNext.toLocaleString()} XP remaining
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface.primary }]}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.semantic.warningLight }]}>
              <MaterialIcons name="local-fire-department" size={22} color={theme.semantic.warning} />
            </View>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{user.current_streak}</Text>
            <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCenter, { backgroundColor: theme.surface.primary }]}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.semantic.successLight }]}>
              <MaterialIcons name="trending-up" size={22} color={theme.semantic.success} />
            </View>
            <Text style={[styles.statValue, { color: theme.semantic.success }]}>
              {chartData.totalPeriod.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>This Period</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface.primary }]}>
            <View style={[styles.statIconContainer, { backgroundColor: `${theme.brand.primary}20` }]}>
              <MaterialIcons name="emoji-events" size={22} color={theme.brand.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{user.longest_streak}</Text>
            <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>Best Streak</Text>
          </View>
        </Animated.View>

        {/* Chart Section */}
        <Animated.View entering={FadeInUp.delay(250).duration(400)} style={[styles.chartCard, { backgroundColor: theme.surface.primary }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>XP Over Time</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.text.tertiary }]}>
                {chartData.totalPeriod > 0
                  ? `${chartData.totalPeriod} XP earned`
                  : 'No activity yet'}
              </Text>
            </View>
            <View style={[styles.timeframePicker, { backgroundColor: theme.surface.secondary }]}>
              {TIMEFRAME_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => handleTimeframePress(option.key)}
                  style={[
                    styles.timeframeButton,
                    timeframe === option.key && [styles.timeframeButtonActive, { backgroundColor: theme.surface.primary, shadowColor: theme.brand.primary }],
                  ]}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      { color: theme.text.tertiary },
                      timeframe === option.key && { color: theme.brand.primary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <LineGraph
            data={chartData.data}
            labels={chartData.labels}
            maxValue={chartData.maxValue}
            theme={theme}
          />
        </Animated.View>
      </ScrollView>
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
  errorText: {
    fontSize: 16,
  },
  // Level Card
  levelCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  levelGradient: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  levelDecor1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    marginRight: 16,
    position: 'relative',
  },
  levelBadgeGradient: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumberBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FCD34D',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  levelNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  levelXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelXP: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  levelProgressContainer: {
    gap: 8,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelProgressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  levelProgressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  levelProgressTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  levelProgressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 5,
  },
  levelProgressText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardCenter: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.08,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Chart Card
  chartCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  timeframePicker: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  timeframeButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 7,
  },
  timeframeButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Line Graph
  lineGraphContainer: {
    position: 'relative',
  },
  svg: {
    marginLeft: 0,
  },
  valueLabelsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  valueLabel: {
    position: 'absolute',
    width: 40,
    alignItems: 'center',
  },
  valueLabelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  xAxisLabelContainer: {
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useStreakData } from '@/lib/query';
import { StreakCalendarModal } from './StreakCalendarModal';
import { LottieStreakFire } from './LottieStreakFire';
import { getFireState } from '@/lib/domain/streak';
import { useTheme } from '@/theme';

interface StreakCalendarProps {
  userId: string;
}

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getLast7Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }

  return days;
}

interface DayCircleProps {
  hasReflection: boolean;
  isToday: boolean;
  dayLetter: string;
  index: number;
}

function DayCircle({ hasReflection, isToday, dayLetter, index }: DayCircleProps) {
  const { theme, gradients } = useTheme();

  return (
    <Animated.View entering={FadeInRight.delay(index * 40).duration(250)} style={styles.dayColumn}>
      <View
        style={[
          styles.dayCircle,
          { backgroundColor: theme.background.tertiary },
          hasReflection && { backgroundColor: theme.brand.primary },
          isToday && !hasReflection && {
            backgroundColor: `${theme.brand.primary}15`,
            borderWidth: 2,
            borderColor: theme.brand.primary,
          },
        ]}
      >
        {hasReflection ? (
          <LinearGradient
            colors={gradients.primary}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : null}
        {hasReflection ? (
          <MaterialIcons name="check" size={14} color={theme.text.inverse} />
        ) : (
          <Text
            style={[
              styles.dayLetter,
              { color: theme.text.tertiary },
              isToday && { color: theme.brand.primary, fontWeight: '700' },
            ]}
          >
            {dayLetter}
          </Text>
        )}
      </View>
      {isToday && <View style={[styles.todayIndicator, { backgroundColor: theme.brand.primary }]} />}
    </Animated.View>
  );
}

export function StreakCalendar({ userId }: StreakCalendarProps) {
  const { theme } = useTheme();
  const { currentStreak, reflectionDates, isLoading } = useStreakData(userId);
  const [modalVisible, setModalVisible] = useState(false);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const last7Days = useMemo(() => getLast7Days(), []);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Track timeout for cleanup to prevent memory leak
  const scaleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scaleTimeoutRef.current) {
        clearTimeout(scaleTimeoutRef.current);
      }
    };
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });

    // Clear any existing timeout
    if (scaleTimeoutRef.current) {
      clearTimeout(scaleTimeoutRef.current);
    }

    scaleTimeoutRef.current = setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, 100);
    setModalVisible(true);
  }, [scale]);

  if (isLoading) {
    return null;
  }

  const fireState = getFireState(currentStreak);

  return (
    <>
      <Animated.View entering={FadeIn.duration(400)} style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          style={[styles.container, { backgroundColor: theme.surface.primary }]}
        >
          {/* Left: Streak Info */}
          <View style={styles.streakSection}>
            <LottieStreakFire state={fireState.state} size={24} compact />
            <Text style={[styles.streakCount, { color: theme.text.primary }]}>{currentStreak}</Text>
            <View style={styles.streakLabelContainer}>
              <Text style={[styles.streakLabel, { color: theme.text.tertiary }]}>days</Text>
              <Text style={[styles.streakLabel, { color: theme.text.tertiary }]}>streak</Text>
            </View>
          </View>

          {/* Right: Days Section */}
          <View style={styles.daysSection}>
            {last7Days.map((date, index) => {
              const dateStr = toDateString(date);
              const hasReflection = reflectionDates.has(dateStr);
              const isToday = date.getTime() === today.getTime();
              const dayLetter = WEEKDAY_LETTERS[date.getDay()];

              return (
                <DayCircle
                  key={dateStr}
                  hasReflection={hasReflection}
                  isToday={isToday}
                  dayLetter={dayLetter}
                  index={index}
                />
              );
            })}
          </View>
        </Pressable>
      </Animated.View>

      <StreakCalendarModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userId={userId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  streakLabelContainer: {
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 8,
    fontWeight: '600',
    lineHeight: 10,
  },
  daysSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayColumn: {
    alignItems: 'center',
    position: 'relative',
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dayLetter: {
    fontSize: 11,
    fontWeight: '600',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

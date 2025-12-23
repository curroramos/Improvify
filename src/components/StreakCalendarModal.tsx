import React, { useState, useMemo } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useStreakData } from '@/lib/query';
import { LottieStreakFire } from './LottieStreakFire';
import { getFireState } from '@/lib/domain/streak';
import { useTheme } from '@/theme';

interface StreakCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

export function StreakCalendarModal({ visible, onClose, userId }: StreakCalendarModalProps) {
  const { theme } = useTheme();
  const { currentStreak, longestStreak, reflectionDates } = useStreakData(userId);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const fireState = getFireState(currentStreak);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.backdrop, { backgroundColor: theme.surface.overlay }]}
      >
        <Pressable style={styles.backdropPressable} onPress={handleClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        entering={SlideInDown.duration(300)}
        exiting={SlideOutDown.duration(200)}
        style={[styles.sheet, { backgroundColor: theme.surface.primary }]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: theme.border.secondary }]} />
        </View>

        {/* Streak Stats */}
        <View style={[styles.statsRow, { backgroundColor: theme.background.secondary }]}>
          <View style={styles.statItem}>
            <LottieStreakFire state={fireState.state} size={28} compact />
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{currentStreak}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Current</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border.secondary }]} />
          <View style={styles.statItem}>
            <MaterialIcons name="emoji-events" size={28} color={theme.semantic.warning} />
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{longestStreak}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Best</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border.secondary }]} />
          <View style={styles.statItem}>
            <MaterialIcons name="check-circle" size={28} color={theme.semantic.success} />
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{reflectionDates.size}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Total</Text>
          </View>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <Pressable onPress={handlePrevMonth} hitSlop={12}>
            <MaterialIcons name="chevron-left" size={28} color={theme.text.secondary} />
          </Pressable>
          <Text style={[styles.monthTitle, { color: theme.text.primary }]}>
            {MONTHS[month]} {year}
          </Text>
          <Pressable onPress={handleNextMonth} hitSlop={12}>
            <MaterialIcons name="chevron-right" size={28} color={theme.text.secondary} />
          </Pressable>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((day, i) => (
            <View key={i} style={styles.weekdayCell}>
              <Text style={[styles.weekdayText, { color: theme.text.tertiary }]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {monthDays.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const dateStr = toDateString(date);
            const hasReflection = reflectionDates.has(dateStr);
            const isToday = date.getTime() === today.getTime();
            const isFuture = date.getTime() > today.getTime();

            return (
              <View key={dateStr} style={styles.dayCell}>
                <View
                  style={[
                    styles.dayCellInner,
                    hasReflection && { backgroundColor: theme.brand.primary },
                    isToday && !hasReflection && {
                      borderWidth: 2,
                      borderColor: theme.brand.primary,
                    },
                  ]}
                >
                  {hasReflection ? (
                    <MaterialIcons name="check" size={14} color={theme.text.inverse} />
                  ) : (
                    <Text
                      style={[
                        styles.dayText,
                        { color: theme.text.secondary },
                        isToday && { color: theme.brand.primary, fontWeight: '600' },
                        isFuture && { color: theme.text.tertiary },
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 48,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

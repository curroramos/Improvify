import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useUser } from '@/hooks/useUser';
import { useTheme } from '@/theme';

const BUTTON_SIZE = 60;
const STROKE_WIDTH = 4;
const RADIUS = (BUTTON_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Calculate milliseconds until midnight (local time)
 */
function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/**
 * Calculate progress (0-1) through the day
 * 0 = midnight, 1 = just before next midnight
 */
function getDayProgress(): number {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const msInDay = 24 * 60 * 60 * 1000;
  const msSinceStart = now.getTime() - startOfDay.getTime();
  return msSinceStart / msInDay;
}

/**
 * Format time remaining as "12h 26m" or "45m" if less than 1 hour
 */
function formatTimeRemaining(ms: number): string {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Check if a date is today (in local timezone)
 */
function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

interface DailyCreateButtonProps {
  onPress: () => void;
}

export function DailyCreateButton({ onPress }: DailyCreateButtonProps) {
  const { user } = useUser();
  const { theme, gradients } = useTheme();
  const [progress, setProgress] = useState(getDayProgress());
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(getMsUntilMidnight()));

  const hasCreatedToday = isToday(user?.last_reflection_date);

  // Update progress every minute
  useEffect(() => {
    if (!hasCreatedToday) return;

    const updateProgress = () => {
      setProgress(getDayProgress());
      setTimeRemaining(formatTimeRemaining(getMsUntilMidnight()));
    };

    // Update immediately
    updateProgress();

    // Update every minute
    const interval = setInterval(updateProgress, 60 * 1000);

    return () => clearInterval(interval);
  }, [hasCreatedToday]);

  const handlePress = useCallback(() => {
    if (hasCreatedToday) {
      // Could show a message or navigate to today's note
      return;
    }
    onPress();
  }, [hasCreatedToday, onPress]);

  // Calculate stroke dash offset for progress circle
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  if (hasCreatedToday) {
    // Show countdown timer with circular progress
    return (
      <View style={styles.container}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <View style={styles.progressContainer}>
            {/* Background circle */}
            <Svg width={BUTTON_SIZE} height={BUTTON_SIZE} style={styles.svgBackground}>
              <Circle
                cx={BUTTON_SIZE / 2}
                cy={BUTTON_SIZE / 2}
                r={RADIUS}
                stroke={`${theme.brand.primary}33`}
                strokeWidth={STROKE_WIDTH}
                fill={theme.surface.secondary}
              />
            </Svg>

            {/* Progress circle */}
            <Svg
              width={BUTTON_SIZE}
              height={BUTTON_SIZE}
              style={[styles.svgProgress, { transform: [{ rotate: '-90deg' }] }]}
            >
              <Circle
                cx={BUTTON_SIZE / 2}
                cy={BUTTON_SIZE / 2}
                r={RADIUS}
                stroke={theme.brand.primary}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>

            {/* Checkmark icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark" size={24} color={theme.brand.primary} />
            </View>
          </View>
        </Pressable>

        {/* Time remaining label */}
        <Text style={[styles.timeLabel, { color: theme.brand.primary }]}>{timeRemaining}</Text>
      </View>
    );
  }

  // Show regular create button
  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.createButton,
          { shadowColor: theme.brand.primary },
          pressed && styles.createButtonPressed,
        ]}
      >
        <LinearGradient
          colors={[theme.brand.secondaryHover, theme.brand.primary, theme.brand.primaryHover]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  buttonPressed: {
    transform: [{ scale: 0.92 }],
  },
  progressContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgBackground: {
    position: 'absolute',
  },
  svgProgress: {
    position: 'absolute',
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    width: 80,
    textAlign: 'center',
  },
  createButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonPressed: {
    transform: [{ scale: 0.92 }],
    shadowOpacity: 0.2,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

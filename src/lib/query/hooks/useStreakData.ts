import { useMemo } from 'react';
import { useNotes } from './useNotes';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  reflectionDates: Set<string>;
  thisMonthCount: number;
  isLoading: boolean;
}

/**
 * Convert a Date to YYYY-MM-DD string in user's local timezone.
 * This ensures streak calculations are consistent with the user's local day.
 */
function toDateString(date: Date): string {
  // Create a new date at local midnight to avoid timezone edge cases
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateCurrentStreak(dates: Set<string>): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = today;

  // Check if today has a reflection, if not start from yesterday
  if (!dates.has(toDateString(checkDate))) {
    // No reflection today - streak is based on yesterday
    checkDate = addDays(checkDate, -1);
  }

  // Count consecutive days backwards
  while (dates.has(toDateString(checkDate))) {
    streak++;
    checkDate = addDays(checkDate, -1);
  }

  return streak;
}

function calculateLongestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0;

  // Convert to sorted array of dates
  const sortedDates = Array.from(dates).sort();

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);

    // Check if consecutive days
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

function countThisMonth(dates: Set<string>): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  let count = 0;
  dates.forEach((date) => {
    if (date.startsWith(monthPrefix)) {
      count++;
    }
  });

  return count;
}

export function useStreakData(userId: string | undefined): StreakData {
  const { data: notes, isLoading } = useNotes(userId);

  const streakData = useMemo(() => {
    if (!notes || notes.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        reflectionDates: new Set<string>(),
        thisMonthCount: 0,
      };
    }

    // Extract unique dates from notes
    const reflectionDates = new Set<string>();
    notes.forEach((note) => {
      const date = new Date(note.created_at);
      reflectionDates.add(toDateString(date));
    });

    return {
      currentStreak: calculateCurrentStreak(reflectionDates),
      longestStreak: calculateLongestStreak(reflectionDates),
      reflectionDates,
      thisMonthCount: countThisMonth(reflectionDates),
    };
  }, [notes]);

  return {
    ...streakData,
    isLoading,
  };
}

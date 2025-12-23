import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeeklyInsightsState {
  lastViewedAt: string | null; // ISO date string
  lastWeekStart: string | null; // The week_start_date of the last viewed insight

  // Actions
  markAsViewed: (weekStart: string) => void;
  canViewThisWeek: () => boolean;
  getDaysUntilNext: () => number;
  reset: () => void;
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

// Get the start of next week (Monday)
function getNextWeekStart(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 1 : 8 - day);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const useWeeklyInsightsStore = create<WeeklyInsightsState>()(
  persist(
    (set, get) => ({
      lastViewedAt: null,
      lastWeekStart: null,

      markAsViewed: (weekStart: string) => {
        set({
          lastViewedAt: new Date().toISOString(),
          lastWeekStart: weekStart,
        });
      },

      canViewThisWeek: () => {
        const { lastWeekStart } = get();
        const currentWeekStart = getCurrentWeekStart();

        // Can view if never viewed or last viewed was a different week
        return !lastWeekStart || lastWeekStart !== currentWeekStart;
      },

      getDaysUntilNext: () => {
        const now = new Date();
        const nextWeek = getNextWeekStart();
        const diffTime = nextWeek.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      },

      reset: () => {
        set({
          lastViewedAt: null,
          lastWeekStart: null,
        });
      },
    }),
    {
      name: 'weekly-insights-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

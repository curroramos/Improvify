// Query client and provider
export { queryClient } from './queryClient';
export { QueryProvider } from './QueryProvider';
export { queryKeys } from './queryKeys';

// Challenge hooks
export {
  useChallenge,
  useChallenges,
  useChallengesByNote,
  usePendingChallenges,
  useChallengeStats,
  useCreateChallenges,
  useCompleteChallenge,
} from './hooks/useChallenges';

// User hooks
export {
  useUserQuery,
  useUserProgress,
  usePointsHistory,
  useCreateUser,
  useUpdateProfile,
  useAddPoints,
} from './hooks/useUserQuery';

// Notes hooks
export {
  useNotes,
  useTodaysNote,
  useNote,
  useSearchNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useMarkChallengesGenerated,
} from './hooks/useNotes';

// Weekly Insights hooks
export {
  useWeeklyInsights,
  useLatestWeeklyInsight,
  useGenerateWeeklyInsights,
} from './hooks/useWeeklyInsights';

// Streak hooks (legacy)
export { useStreakData } from './hooks/useStreakData';
export type { StreakData } from './hooks/useStreakData';

// Enhanced Streak hooks
export {
  useEnhancedStreak,
  useUncelebratedMilestones,
  useAllMilestones,
  useCelebrateMilestone,
  useUseShield,
  usePurchaseShield,
  useAddGems,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  streakKeys,
} from './hooks/useStreak';
export type { EnhancedStreakData } from './hooks/useStreak';

// User Preferences hooks
export {
  useUserPreferences,
  useUpdatePreferences,
  useEnsurePreferences,
} from './hooks/usePreferences';

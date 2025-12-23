import { Timeframe, LifeCategory } from '@/types';

export const queryKeys = {
  // User queries
  user: (userId: string) => ['user', userId] as const,
  userProgress: (userId: string) => ['user', userId, 'progress'] as const,
  pointsHistory: (userId: string, timeframe: Timeframe) =>
    ['user', userId, 'points-history', timeframe] as const,

  // Notes queries
  notes: (userId: string) => ['notes', userId] as const,
  note: (noteId: string) => ['notes', 'detail', noteId] as const,
  notesSearch: (userId: string, query: string) => ['notes', userId, 'search', query] as const,

  // Challenges queries
  challenge: (challengeId: string) => ['challenges', 'detail', challengeId] as const,
  challenges: (userId: string) => ['challenges', userId] as const,
  challengesByNote: (noteId: string) => ['challenges', 'note', noteId] as const,
  challengesByCategory: (userId: string, category: LifeCategory) =>
    ['challenges', userId, 'category', category] as const,
  pendingChallenges: (userId: string) => ['challenges', userId, 'pending'] as const,
  challengeStats: (userId: string) => ['challenges', userId, 'stats'] as const,

  // Life Balance queries
  lifeBalance: (userId: string) => ['life-balance', userId] as const,
  categoryScores: (userId: string) => ['category-scores', userId] as const,

  // Weekly insights queries
  weeklyInsights: (userId: string) => ['weekly-insights', userId] as const,
  latestWeeklyInsight: (userId: string) => ['weekly-insights', userId, 'latest'] as const,

  // User preferences queries
  userPreferences: (userId: string) => ['user-preferences', userId] as const,
};

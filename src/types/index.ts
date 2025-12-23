/**
 * Centralized type definitions
 *
 * All shared types should be defined here to ensure a single source of truth.
 * Import from '@/types' throughout the application.
 */

// ============================================================================
// Life Category Types (Wheel of Life)
// ============================================================================

export type LifeCategory =
  | 'health'
  | 'career'
  | 'finance'
  | 'relationships'
  | 'personal_growth'
  | 'fun'
  | 'environment'
  | 'spirituality';

export const LIFE_CATEGORIES: LifeCategory[] = [
  'health',
  'career',
  'finance',
  'relationships',
  'personal_growth',
  'fun',
  'environment',
  'spirituality',
];

export interface CategoryScore {
  category: LifeCategory;
  total_points: number;
  completed_count: number;
  percentage: number;
}

export interface LifeBalanceData {
  scores: CategoryScore[];
  totalPoints: number;
  dominantCategory: LifeCategory | null;
  weakestCategory: LifeCategory | null;
  overallBalance: number; // 0-100 score indicating how balanced
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  level: number;
  total_points: number;
  created_at: string;
  last_updated: string;
  // Streak engagement fields
  streak_shields: number;
  gems: number;
  current_streak: number;
  longest_streak: number;
  last_reflection_date?: string | null;
  streak_shield_active: boolean;
  last_shield_earned_at?: string | null;
  streak_broken_at?: string | null;
  // Notification preferences
  push_token?: string | null;
  notifications_enabled: boolean;
  notification_time?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme_id: string;
  daily_reminder_enabled: boolean;
  daily_reminder_time: string;
  weekly_insights_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInput {
  theme_id?: string;
  daily_reminder_enabled?: boolean;
  daily_reminder_time?: string;
  weekly_insights_enabled?: boolean;
}

// ============================================================================
// Streak Types
// ============================================================================

export type StreakFireState = 'dead' | 'small' | 'medium' | 'large' | 'blue';

export interface StreakMilestone {
  id: string;
  user_id: string;
  milestone_days: number;
  achieved_at: string;
  celebrated: boolean;
}

export interface StreakHistory {
  id: string;
  user_id: string;
  streak_length: number;
  started_at: string;
  ended_at?: string | null;
  ended_reason?: string | null;
  created_at: string;
}

export interface ShieldTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earned' | 'used' | 'purchased' | 'expired';
  shields_change: number;
  reason?: string;
  created_at: string;
}

export interface GemTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earned' | 'spent';
  gems_change: number;
  reason?: string;
  created_at: string;
}

// ============================================================================
// Note Types
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  challenges_generated: boolean;
}

// ============================================================================
// Challenge Types
// ============================================================================

export interface Challenge {
  id: string;
  note_id: string;
  user_id: string;
  title: string;
  description: string;
  points: number;
  category: LifeCategory;
  completed: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  due_date?: string | null;
}

export interface NoteWithChallenges extends Note {
  challenges: Challenge[];
}

export interface ChallengeInput {
  title: string;
  description: string;
  points: number;
  category: LifeCategory;
}

// ============================================================================
// Points & History Types
// ============================================================================

export interface UserPointsHistory {
  id: string;
  user_id: string;
  points_added: number;
  category: LifeCategory;
  date: string;
  created_at: string;
}

export interface PointsHistory {
  date: string;
  points_added: number;
  category?: LifeCategory;
}

export type Timeframe = 'daily' | 'weekly' | 'monthly';

// ============================================================================
// Weekly Insights Types
// ============================================================================

export interface InsightPattern {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
}

export interface InsightRecommendation {
  title: string;
  description: string;
}

export interface InsightStats {
  totalReflections: number;
  totalChallenges: number;
  completedChallenges: number;
  completionRate: number;
  totalPointsEarned: number;
}

export interface WeeklyInsight {
  id: string;
  user_id: string;
  week_start_date: string;
  summary: string;
  patterns: InsightPattern[];
  recommendations: InsightRecommendation[];
  stats: InsightStats;
  created_at: string;
}

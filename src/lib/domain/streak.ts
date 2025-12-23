/**
 * Streak Domain Logic
 *
 * Handles streak calculations, fire states, milestones, and shield logic.
 */

import { StreakFireState } from '@/types';

// ============================================================================
// Streak Fire States
// ============================================================================

export interface FireStateConfig {
  state: StreakFireState;
  minDays: number;
  maxDays: number;
  color: string;
  glowColor: string;
  intensity: number; // 0-1
  label: string;
}

// Fire states matching visual spec:
// 0 days: Dead ember (Gray, No animation)
// 1-6 days: Small flame (Orange, Gentle flicker)
// 7-13 days: Medium flame (Orange-Yellow, Active flicker)
// 14-29 days: Large flame (Yellow-Gold, Dynamic pulse)
// 30+ days: Blue flame (Blue-White, Intense glow + particles)
export const FIRE_STATES: FireStateConfig[] = [
  {
    state: 'dead',
    minDays: 0,
    maxDays: 0,
    color: '#6B7280', // Gray - Dead ember
    glowColor: '#374151',
    intensity: 0,
    label: 'No streak',
  },
  {
    state: 'small',
    minDays: 1,
    maxDays: 6,
    color: '#F97316', // Orange - Small flame
    glowColor: '#FB923C',
    intensity: 0.3,
    label: 'Getting started',
  },
  {
    state: 'medium',
    minDays: 7,
    maxDays: 13,
    color: '#FBBF24', // Orange-Yellow - Medium flame
    glowColor: '#FCD34D',
    intensity: 0.5,
    label: 'Building momentum',
  },
  {
    state: 'large',
    minDays: 14,
    maxDays: 29,
    color: '#FCD34D', // Yellow-Gold - Large flame
    glowColor: '#FDE68A',
    intensity: 0.7,
    label: 'On fire!',
  },
  {
    state: 'blue',
    minDays: 30,
    maxDays: Infinity,
    color: '#93C5FD', // Blue-White - Intense flame
    glowColor: '#BFDBFE',
    intensity: 1,
    label: 'Unstoppable!',
  },
];

export function getFireState(streakDays: number): FireStateConfig {
  for (const state of FIRE_STATES) {
    if (streakDays >= state.minDays && streakDays <= state.maxDays) {
      return state;
    }
  }
  return FIRE_STATES[0]; // Default to dead
}

// ============================================================================
// Streak Milestones
// ============================================================================

export interface MilestoneConfig {
  days: number;
  title: string;
  description: string;
  emoji: string;
  reward?: {
    type: 'gems' | 'shield';
    amount: number;
  };
}

export const STREAK_MILESTONES: MilestoneConfig[] = [
  {
    days: 3,
    title: 'Building Momentum!',
    description: "You've reflected for 3 days straight. Keep it up!",
    emoji: '🔥',
  },
  {
    days: 7,
    title: 'One Week Strong!',
    description: "A full week of reflection. You're developing a habit!",
    emoji: '🎯',
    reward: { type: 'shield', amount: 1 },
  },
  {
    days: 14,
    title: 'Two Weeks of Growth!',
    description: "14 days! You're seeing real progress now.",
    emoji: '⭐',
    reward: { type: 'gems', amount: 5 },
  },
  {
    days: 30,
    title: 'Monthly Master!',
    description: "30 days of consistent reflection. You're transforming!",
    emoji: '🏆',
    reward: { type: 'gems', amount: 10 },
  },
  {
    days: 50,
    title: 'Reflection Veteran!',
    description: '50 days! Your dedication is inspiring.',
    emoji: '💎',
    reward: { type: 'gems', amount: 15 },
  },
  {
    days: 100,
    title: 'Century Club!',
    description: '100 days of growth. You are extraordinary!',
    emoji: '👑',
    reward: { type: 'gems', amount: 25 },
  },
  {
    days: 365,
    title: 'Full Year of Growth!',
    description: "365 days of reflection. You've transformed your life through daily reflection.",
    emoji: '🌟',
    reward: { type: 'gems', amount: 100 },
  },
];

export function getMilestoneConfig(days: number): MilestoneConfig | undefined {
  return STREAK_MILESTONES.find((m) => m.days === days);
}

export function getNextMilestone(currentStreak: number): MilestoneConfig | undefined {
  return STREAK_MILESTONES.find((m) => m.days > currentStreak);
}

export function getAchievedMilestones(currentStreak: number): MilestoneConfig[] {
  return STREAK_MILESTONES.filter((m) => m.days <= currentStreak);
}

// ============================================================================
// Shield Logic
// ============================================================================

export const SHIELD_GEM_COST = 5;
export const DAYS_PER_FREE_SHIELD = 7;

export interface ShieldStatus {
  hasShields: boolean;
  shieldCount: number;
  isShieldActive: boolean;
  canUseShield: boolean;
  daysUntilNextFreeShield: number;
}

export function getShieldStatus(
  shieldCount: number,
  isShieldActive: boolean,
  currentStreak: number,
  lastReflectionDate: string | null
): ShieldStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let canUseShield = false;

  if (lastReflectionDate) {
    const lastDate = new Date(lastReflectionDate);
    lastDate.setHours(0, 0, 0, 0);

    // Can use shield if missed yesterday and have shields
    canUseShield =
      shieldCount > 0 &&
      !isShieldActive &&
      lastDate.getTime() < yesterday.getTime() &&
      currentStreak > 0;
  }

  // Calculate days until next free shield (every 7 days of streak)
  const daysIntoCurrentCycle = currentStreak % DAYS_PER_FREE_SHIELD;
  const daysUntilNextFreeShield =
    currentStreak === 0 ? DAYS_PER_FREE_SHIELD : DAYS_PER_FREE_SHIELD - daysIntoCurrentCycle;

  return {
    hasShields: shieldCount > 0,
    shieldCount,
    isShieldActive,
    canUseShield,
    daysUntilNextFreeShield:
      daysUntilNextFreeShield === 0 ? DAYS_PER_FREE_SHIELD : daysUntilNextFreeShield,
  };
}

// ============================================================================
// Streak Danger Detection
// ============================================================================

export type StreakDangerLevel = 'safe' | 'reminder' | 'warning' | 'danger';

export interface StreakDangerStatus {
  level: StreakDangerLevel;
  hoursLeft: number;
  message: string;
}

export function getStreakDangerStatus(
  hasReflectedToday: boolean,
  currentStreak: number
): StreakDangerStatus {
  if (hasReflectedToday || currentStreak === 0) {
    return {
      level: 'safe',
      hoursLeft: 24,
      message: '',
    };
  }

  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const hoursLeft = Math.max(0, (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (hoursLeft <= 2) {
    return {
      level: 'danger',
      hoursLeft,
      message: `Only ${Math.ceil(hoursLeft * 60)} minutes to save your ${currentStreak}-day streak!`,
    };
  } else if (hoursLeft <= 5) {
    return {
      level: 'warning',
      hoursLeft,
      message: `${Math.ceil(hoursLeft)} hours left to keep your streak!`,
    };
  } else if (hoursLeft <= 12) {
    return {
      level: 'reminder',
      hoursLeft,
      message: "Don't forget to reflect today!",
    };
  }

  return {
    level: 'safe',
    hoursLeft,
    message: '',
  };
}

// ============================================================================
// XP Multiplier based on streak
// ============================================================================

export interface XPMultiplier {
  multiplier: number;
  label: string;
}

export function getStreakXPMultiplier(streakDays: number): XPMultiplier {
  if (streakDays >= 60) {
    return { multiplier: 2.0, label: '2x XP' };
  } else if (streakDays >= 30) {
    return { multiplier: 1.5, label: '1.5x XP' };
  } else if (streakDays >= 14) {
    return { multiplier: 1.25, label: '1.25x XP' };
  } else if (streakDays >= 7) {
    return { multiplier: 1.1, label: '1.1x XP' };
  }
  return { multiplier: 1.0, label: '' };
}

// ============================================================================
// Streak Repair Logic
// ============================================================================

export const STREAK_REPAIR_WINDOW_HOURS = 24;

export interface StreakRepairOption {
  type: 'gems' | 'double_reflection';
  cost?: number;
  description: string;
}

export function canRepairStreak(streakBrokenAt: string | null, currentStreak: number): boolean {
  if (!streakBrokenAt || currentStreak > 0) return false;

  const brokenTime = new Date(streakBrokenAt).getTime();
  const now = Date.now();
  const hoursSinceBroken = (now - brokenTime) / (1000 * 60 * 60);

  return hoursSinceBroken <= STREAK_REPAIR_WINDOW_HOURS;
}

export function getStreakRepairOptions(previousStreak: number): StreakRepairOption[] {
  // Cost scales with streak length
  const gemCost = Math.min(50, Math.max(10, Math.floor(previousStreak / 5) * 5));

  return [
    {
      type: 'gems',
      cost: gemCost,
      description: `Pay ${gemCost} gems to restore your streak`,
    },
    {
      type: 'double_reflection',
      description: 'Complete 2 reflections today to restore your streak',
    },
  ];
}

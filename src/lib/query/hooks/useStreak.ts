import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { streakRepository, StreakData } from '@/lib/repositories';
import { queryKeys } from '../queryKeys';
import {
  getFireState,
  getShieldStatus,
  getStreakDangerStatus,
  getStreakXPMultiplier,
  getMilestoneConfig,
  getNextMilestone,
  FireStateConfig,
  ShieldStatus,
  StreakDangerStatus,
  XPMultiplier,
  MilestoneConfig,
} from '@/lib/domain/streak';

// ============================================================================
// Query Keys
// ============================================================================

export const streakKeys = {
  all: ['streak'] as const,
  data: (userId: string) => [...streakKeys.all, 'data', userId] as const,
  milestones: (userId: string) => [...streakKeys.all, 'milestones', userId] as const,
  uncelebrated: (userId: string) => [...streakKeys.all, 'uncelebrated', userId] as const,
};

// ============================================================================
// Enhanced Streak Data Hook
// ============================================================================

export interface EnhancedStreakData extends StreakData {
  fireState: FireStateConfig;
  shieldStatus: ShieldStatus;
  dangerStatus: StreakDangerStatus;
  xpMultiplier: XPMultiplier;
  nextMilestone: MilestoneConfig | undefined;
  hasReflectedToday: boolean;
}

export function useEnhancedStreak(userId: string | undefined) {
  return useQuery({
    queryKey: streakKeys.data(userId ?? ''),
    queryFn: async (): Promise<EnhancedStreakData> => {
      if (!userId) throw new Error('User ID required');

      const data = await streakRepository.getStreakData(userId);

      // Check if user has reflected today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const hasReflectedToday = data.lastReflectionDate
        ? new Date(data.lastReflectionDate).toDateString() === today.toDateString()
        : false;

      // Calculate derived data
      const fireState = getFireState(data.currentStreak);
      const shieldStatus = getShieldStatus(
        data.streakShields,
        data.isShieldActive,
        data.currentStreak,
        data.lastReflectionDate
      );
      const dangerStatus = getStreakDangerStatus(hasReflectedToday, data.currentStreak);
      const xpMultiplier = getStreakXPMultiplier(data.currentStreak);
      const nextMilestone = getNextMilestone(data.currentStreak);

      return {
        ...data,
        fireState,
        shieldStatus,
        dangerStatus,
        xpMultiplier,
        nextMilestone,
        hasReflectedToday,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes to update danger status
  });
}

// ============================================================================
// Milestones Hooks
// ============================================================================

export function useUncelebratedMilestones(userId: string | undefined) {
  return useQuery({
    queryKey: streakKeys.uncelebrated(userId ?? ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      return streakRepository.getUncelebratedMilestones(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAllMilestones(userId: string | undefined) {
  return useQuery({
    queryKey: streakKeys.milestones(userId ?? ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      return streakRepository.getAllMilestones(userId);
    },
    enabled: !!userId,
  });
}

export function useCelebrateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, milestoneDays }: { userId: string; milestoneDays: number }) => {
      await streakRepository.markMilestoneCelebrated(userId, milestoneDays);

      // Get milestone config for rewards
      const config = getMilestoneConfig(milestoneDays);
      if (config?.reward) {
        if (config.reward.type === 'gems') {
          await streakRepository.addGems(
            userId,
            config.reward.amount,
            `Milestone reward: ${milestoneDays}-day streak`
          );
        }
        // Shield rewards are handled by the database trigger
      }

      return { milestoneDays, config };
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: streakKeys.uncelebrated(userId) });
      queryClient.invalidateQueries({ queryKey: streakKeys.data(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
}

// ============================================================================
// Shield Mutations
// ============================================================================

export function useUseShield() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const success = await streakRepository.useShield(userId);
      if (!success) {
        throw new Error('Could not use shield');
      }
      return success;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: streakKeys.data(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
}

export function usePurchaseShield() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const success = await streakRepository.purchaseShield(userId);
      if (!success) {
        throw new Error('Not enough gems to purchase shield');
      }
      return success;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: streakKeys.data(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
}

// ============================================================================
// Gem Mutations
// ============================================================================

export function useAddGems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      gems,
      reason,
    }: {
      userId: string;
      gems: number;
      reason: string;
    }) => {
      return streakRepository.addGems(userId, gems, reason);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: streakKeys.data(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
}

// ============================================================================
// Notification Preferences
// ============================================================================

export function useNotificationPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: [...streakKeys.all, 'notifications', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      return streakRepository.getNotificationPreferences(userId);
    },
    enabled: !!userId,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: {
        notifications_enabled?: boolean;
        notification_time?: string;
        push_token?: string;
      };
    }) => {
      await streakRepository.updateNotificationPreferences(userId, preferences);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [...streakKeys.all, 'notifications', userId] });
    },
  });
}

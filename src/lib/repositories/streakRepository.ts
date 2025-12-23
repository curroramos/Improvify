import { supabase } from '../supabase';
import { StreakMilestone } from '@/types';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastReflectionDate: string | null;
  streakShields: number;
  gems: number;
  isShieldActive: boolean;
  streakBrokenAt: string | null;
}

class StreakRepositoryClass {
  async getStreakData(userId: string): Promise<StreakData> {
    const { data, error } = await supabase
      .from('users')
      .select(
        'current_streak, longest_streak, last_reflection_date, streak_shields, gems, streak_shield_active, streak_broken_at'
      )
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      currentStreak: data.current_streak ?? 0,
      longestStreak: data.longest_streak ?? 0,
      lastReflectionDate: data.last_reflection_date,
      streakShields: data.streak_shields ?? 0,
      gems: data.gems ?? 0,
      isShieldActive: data.streak_shield_active ?? false,
      streakBrokenAt: data.streak_broken_at,
    };
  }

  async useShield(userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('use_streak_shield', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data as boolean;
  }

  async purchaseShield(userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('purchase_shield', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data as boolean;
  }

  async addGems(userId: string, gems: number, reason: string): Promise<number> {
    const { data, error } = await supabase.rpc('add_gems', {
      p_user_id: userId,
      p_gems: gems,
      p_reason: reason,
    });

    if (error) throw error;
    return data as number;
  }

  async getUncelebratedMilestones(userId: string): Promise<StreakMilestone[]> {
    const { data, error } = await supabase.rpc('get_uncelebrated_milestones', {
      p_user_id: userId,
    });

    if (error) throw error;

    return (data ?? []).map((m: { milestone_days: number; achieved_at: string }) => ({
      id: `${userId}-${m.milestone_days}`,
      user_id: userId,
      milestone_days: m.milestone_days,
      achieved_at: m.achieved_at,
      celebrated: false,
    }));
  }

  async markMilestoneCelebrated(userId: string, milestoneDays: number): Promise<void> {
    const { error } = await supabase.rpc('mark_milestone_celebrated', {
      p_user_id: userId,
      p_milestone_days: milestoneDays,
    });

    if (error) throw error;
  }

  async getAllMilestones(userId: string): Promise<StreakMilestone[]> {
    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('user_id', userId)
      .order('milestone_days', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      notifications_enabled?: boolean;
      notification_time?: string;
      push_token?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        ...preferences,
        last_updated: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  }

  async getNotificationPreferences(userId: string): Promise<{
    notifications_enabled: boolean;
    notification_time: string;
    push_token: string | null;
  }> {
    const { data, error } = await supabase
      .from('users')
      .select('notifications_enabled, notification_time, push_token')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      notifications_enabled: data.notifications_enabled ?? true,
      notification_time: data.notification_time ?? '09:00:00',
      push_token: data.push_token,
    };
  }
}

export const streakRepository = new StreakRepositoryClass();

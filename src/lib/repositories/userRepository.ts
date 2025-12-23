import { supabase } from '../supabase';
import { BaseRepository } from './base';
import { User, PointsHistory, Timeframe } from '@/types';
import { getLevelForPoints } from '@/lib/domain/leveling';

export type UserProgress = {
  level: number;
  total_points: number;
};

export type CreateUserData = {
  full_name: string;
  email: string;
  avatar_url?: string;
};

class UserRepositoryClass extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async getProgress(userId: string): Promise<UserProgress> {
    const { data, error } = await this.table
      .select('level, total_points')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return {
      level: data.level,
      total_points: data.total_points,
    };
  }

  async createUser(userId: string, userData: CreateUserData): Promise<User> {
    const newUser = {
      id: userId,
      full_name: userData.full_name,
      email: userData.email,
      avatar_url: userData.avatar_url || null,
      level: 1,
      total_points: 0,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };

    const { data, error } = await this.table.insert([newUser]).select('*').single();

    if (error) throw error;
    return data as User;
  }

  async ensureUserExists(userId: string, email: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findById(userId);
    if (existingUser) return existingUser;

    // Create user if not exists
    return this.createUser(userId, {
      email,
      full_name: email.split('@')[0],
    });
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.table
      .update({
        ...updates,
        last_updated: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as User;
  }

  async addPoints(userId: string, pointsToAdd: number): Promise<User & { leveledUp: boolean }> {
    // Get current user data
    const { data: currentUser, error: fetchError } = await this.table
      .select('level, total_points')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newTotalPoints = currentUser.total_points + pointsToAdd;
    const newLevel = getLevelForPoints(newTotalPoints);
    const leveledUp = newLevel > currentUser.level;

    // Update user record
    const { data, error } = await this.table
      .update({
        total_points: newTotalPoints,
        level: newLevel,
        last_updated: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;

    // Record points history - await to ensure consistency
    await this.recordPointsHistory(userId, pointsToAdd);

    return { ...(data as User), leveledUp };
  }

  async getPointsHistory(userId: string, timeframe: Timeframe): Promise<PointsHistory[]> {
    const now = Date.now();
    let startDate: Date;

    // Fetch 7 periods worth of data for each timeframe to match the chart display
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); // last 7 days
        break;
      case 'weekly':
        startDate = new Date(now - 7 * 7 * 24 * 60 * 60 * 1000); // last 7 weeks
        break;
      case 'monthly':
        startDate = new Date(now - 7 * 30 * 24 * 60 * 60 * 1000); // last 7 months
        break;
    }

    const { data, error } = await supabase
      .from('user_points_history')
      .select('date, points_added, category')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((entry) => ({
      date: entry.date,
      points_added: entry.points_added,
      category: entry.category,
    }));
  }

  private async recordPointsHistory(userId: string, pointsAdded: number): Promise<void> {
    const { error } = await supabase.from('user_points_history').insert({
      user_id: userId,
      points_added: pointsAdded,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete points history
    await supabase.from('user_points_history').delete().eq('user_id', userId);

    // 2. Delete weekly insights
    await supabase.from('weekly_insights').delete().eq('user_id', userId);

    // 3. Delete challenges (via notes cascade or directly)
    await supabase.from('challenges').delete().eq('user_id', userId);

    // 4. Delete notes
    await supabase.from('notes').delete().eq('user_id', userId);

    // 5. Delete preferences
    await supabase.from('user_preferences').delete().eq('user_id', userId);

    // 6. Delete user record
    const { error } = await this.table.delete().eq('id', userId);

    if (error) throw error;
  }
}

export const userRepository = new UserRepositoryClass();

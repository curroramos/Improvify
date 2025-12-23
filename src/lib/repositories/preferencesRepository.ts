import { supabase } from '../supabase';
import type { UserPreferences, UserPreferencesInput } from '@/types';
import { logger } from '../utils/logger';

export const preferencesRepository = {
  async getByUserId(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching preferences:', error);
      throw error;
    }

    return data;
  },

  async upsert(userId: string, preferences: UserPreferencesInput): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      logger.error('Error upserting preferences:', error);
      throw error;
    }

    return data;
  },

  async update(userId: string, preferences: UserPreferencesInput): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating preferences:', error);
      throw error;
    }

    return data;
  },

  async ensureExists(userId: string): Promise<UserPreferences> {
    const existing = await this.getByUserId(userId);
    if (existing) return existing;

    return this.upsert(userId, {});
  },
};

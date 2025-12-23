import { BaseRepository } from './base';
import { Challenge, ChallengeInput, CategoryScore, LifeCategory } from '@/types';
import { supabase } from '@/lib/supabase';

class ChallengesRepositoryClass extends BaseRepository<Challenge> {
  constructor() {
    super('challenges');
  }

  async findByNoteId(noteId: string): Promise<Challenge[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Challenge[];
  }

  async findByUserId(userId: string): Promise<Challenge[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Challenge[];
  }

  async findPendingByUserId(userId: string): Promise<Challenge[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Challenge[];
  }

  async createMany(
    noteId: string,
    userId: string,
    challenges: ChallengeInput[]
  ): Promise<Challenge[]> {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now

    const records = challenges.map((c) => ({
      note_id: noteId,
      user_id: userId,
      title: c.title,
      description: c.description,
      points: c.points,
      category: c.category,
      completed: false,
      created_at: now.toISOString(),
      due_date: dueDate.toISOString(),
    }));

    const { data, error } = await this.table.insert(records).select('*');

    if (error) throw error;
    return (data ?? []) as Challenge[];
  }

  async findByCategory(userId: string, category: LifeCategory): Promise<Challenge[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Challenge[];
  }

  async markCompleted(id: string): Promise<Challenge> {
    const { data, error } = await this.table
      .update({ completed: true })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as Challenge;
  }

  async countByUserId(userId: string): Promise<{ total: number; completed: number }> {
    const { count: total, error: totalError } = await this.table
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (totalError) throw totalError;

    const { count: completed, error: completedError } = await this.table
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);

    if (completedError) throw completedError;

    return {
      total: total ?? 0,
      completed: completed ?? 0,
    };
  }

  async getLifeBalance(userId: string): Promise<CategoryScore[]> {
    // Call the database function to get life balance scores
    const { data, error } = await supabase.rpc('get_life_balance', {
      p_user_id: userId,
    });

    if (error) throw error;

    return (data ?? []) as CategoryScore[];
  }

  async getCategoryScores(userId: string): Promise<CategoryScore[]> {
    // Direct query to category_scores materialized view
    const { data, error } = await supabase
      .from('category_scores')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data ?? []) as CategoryScore[];
  }

  async refreshCategoryScores(): Promise<void> {
    // Refresh the materialized view
    const { error } = await supabase.rpc('refresh_category_scores');
    if (error) throw error;
  }

  async dismiss(id: string): Promise<void> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) throw error;
  }

  async cleanupExpired(userId: string): Promise<number> {
    // Delete challenges that expired more than 24 hours ago
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await this.table
      .delete()
      .eq('user_id', userId)
      .eq('completed', false)
      .lt('due_date', cutoff)
      .select('id');

    if (error) throw error;
    return data?.length ?? 0;
  }
}

export const challengesRepository = new ChallengesRepositoryClass();

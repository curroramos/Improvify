import { BaseRepository } from './base';
import { WeeklyInsight, InsightPattern, InsightRecommendation, InsightStats } from '@/types';

class WeeklyInsightsRepositoryClass extends BaseRepository<WeeklyInsight> {
  constructor() {
    super('weekly_insights');
  }

  async findByUserId(userId: string): Promise<WeeklyInsight[]> {
    const { data, error } = await this.table
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false });

    if (error) throw error;
    return (data ?? []) as WeeklyInsight[];
  }

  async findByUserAndWeek(userId: string, weekStartDate: string): Promise<WeeklyInsight | null> {
    const { data, error } = await this.table
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as WeeklyInsight;
  }

  async getLatest(userId: string): Promise<WeeklyInsight | null> {
    const { data, error } = await this.table
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as WeeklyInsight;
  }

  async saveInsights(
    userId: string,
    weekStartDate: string,
    summary: string,
    patterns: InsightPattern[],
    recommendations: InsightRecommendation[],
    stats: InsightStats
  ): Promise<WeeklyInsight> {
    // Upsert: update if exists, insert if not
    const { data, error } = await this.table
      .upsert(
        {
          user_id: userId,
          week_start_date: weekStartDate,
          summary,
          patterns,
          recommendations,
          stats,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,week_start_date',
        }
      )
      .select('*')
      .single();

    if (error) throw error;
    return data as WeeklyInsight;
  }
}

export const weeklyInsightsRepository = new WeeklyInsightsRepositoryClass();

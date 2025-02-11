import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Timeframe = 'daily' | 'weekly' | 'monthly';

export interface PointsHistory {
  date: string;
  points_added: number;
}

export const usePointsHistory = (userId: string | undefined, timeframe: Timeframe) => {
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchPointsHistory = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('user_points_history')
          .select('date, points_added')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (timeframe === 'weekly') {
          query = query.gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        } else if (timeframe === 'monthly') {
          query = query.gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        setHistory(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPointsHistory();
  }, [userId, timeframe]);

  return { history, isLoading, error };
};

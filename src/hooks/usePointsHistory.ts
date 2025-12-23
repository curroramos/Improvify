import { usePointsHistory as usePointsHistoryQuery } from '@/lib/query';
import { Timeframe } from '@/types';

export const usePointsHistory = (userId: string | undefined, timeframe: Timeframe) => {
  const { data: history, isLoading, error } = usePointsHistoryQuery(userId, timeframe);

  return {
    history: history ?? [],
    isLoading,
    error,
  };
};

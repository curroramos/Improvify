import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesRepository } from '@/lib/repositories';
import { queryKeys } from '../queryKeys';
import type { Challenge, ChallengeInput, LifeCategory, LifeBalanceData } from '@/types';
import { LIFE_CATEGORIES } from '@/types';

export function useChallenge(challengeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.challenge(challengeId ?? ''),
    queryFn: () => challengesRepository.findById(challengeId!),
    enabled: !!challengeId,
  });
}

export function useChallenges(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.challenges(userId ?? ''),
    queryFn: () => challengesRepository.findByUserId(userId!),
    enabled: !!userId,
  });
}

export function useChallengesByNote(noteId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.challengesByNote(noteId ?? ''),
    queryFn: () => challengesRepository.findByNoteId(noteId!),
    enabled: !!noteId,
  });
}

export function usePendingChallenges(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pendingChallenges(userId ?? ''),
    queryFn: () => challengesRepository.findPendingByUserId(userId!),
    enabled: !!userId,
  });
}

export function useChallengeStats(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.challengeStats(userId ?? ''),
    queryFn: () => challengesRepository.countByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCreateChallenges(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, challenges }: { noteId: string; challenges: ChallengeInput[] }) => {
      if (!userId) {
        return Promise.reject(new Error('User not authenticated'));
      }
      return challengesRepository.createMany(noteId, userId, challenges);
    },
    onSuccess: (newChallenges, { noteId }) => {
      if (!userId) return;
      // Update challenges by note
      queryClient.setQueryData<Challenge[]>(queryKeys.challengesByNote(noteId), (old) => [
        ...(old ?? []),
        ...newChallenges,
      ]);
      // Invalidate user challenges and pending challenges
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingChallenges(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challengeStats(userId) });
    },
  });
}

export function useCompleteChallenge(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      // Mark challenge as completed
      const result = await challengesRepository.markCompleted(challengeId);
      // Refresh the materialized view so life balance updates
      await challengesRepository.refreshCategoryScores();
      return result;
    },
    onMutate: async (challengeId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.challenges(userId!) });
      await queryClient.cancelQueries({ queryKey: queryKeys.pendingChallenges(userId!) });
      await queryClient.cancelQueries({ queryKey: queryKeys.challenge(challengeId) });

      // Snapshot previous values for rollback
      const previousChallenges = queryClient.getQueryData<Challenge[]>(
        queryKeys.challenges(userId!)
      );
      const previousChallenge = queryClient.getQueryData<Challenge>(
        queryKeys.challenge(challengeId)
      );

      // Optimistically update the individual challenge
      queryClient.setQueryData<Challenge>(queryKeys.challenge(challengeId), (old) =>
        old ? { ...old, completed: true } : old
      );

      // Optimistically update challenges list
      queryClient.setQueryData<Challenge[]>(queryKeys.challenges(userId!), (old) =>
        old?.map((c) => (c.id === challengeId ? { ...c, completed: true } : c))
      );

      queryClient.setQueryData<Challenge[]>(queryKeys.pendingChallenges(userId!), (old) =>
        old?.filter((c) => c.id !== challengeId)
      );

      return { previousChallenges, previousChallenge, challengeId };
    },
    onError: (_err, _challengeId, context) => {
      // Rollback on error
      if (context?.previousChallenges) {
        queryClient.setQueryData(queryKeys.challenges(userId!), context.previousChallenges);
      }
      if (context?.previousChallenge && context?.challengeId) {
        queryClient.setQueryData(
          queryKeys.challenge(context.challengeId),
          context.previousChallenge
        );
      }
    },
    onSettled: (_data, _error, challengeId) => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: queryKeys.challenge(challengeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(userId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingChallenges(userId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challengeStats(userId!) });
      // Also invalidate life balance when a challenge is completed
      queryClient.invalidateQueries({ queryKey: queryKeys.lifeBalance(userId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.categoryScores(userId!) });
    },
  });
}

// ============================================================================
// Life Balance Hooks
// ============================================================================

export function useChallengesByCategory(userId: string | undefined, category: LifeCategory) {
  return useQuery({
    queryKey: queryKeys.challengesByCategory(userId ?? '', category),
    queryFn: () => challengesRepository.findByCategory(userId!, category),
    enabled: !!userId,
  });
}

export function useLifeBalance(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lifeBalance(userId ?? ''),
    queryFn: async (): Promise<LifeBalanceData> => {
      // Refresh the materialized view to ensure fresh data
      await challengesRepository.refreshCategoryScores();
      const scores = await challengesRepository.getLifeBalance(userId!);

      // Calculate total points across all categories
      const totalPoints = scores.reduce((sum, s) => sum + s.total_points, 0);

      // Find dominant and weakest categories (only among those with points)
      const categoriesWithPoints = scores.filter((s) => s.total_points > 0);
      const dominantCategory =
        categoriesWithPoints.length > 0
          ? categoriesWithPoints.reduce((max, s) => (s.total_points > max.total_points ? s : max))
              .category
          : null;
      const weakestCategory =
        categoriesWithPoints.length > 0
          ? categoriesWithPoints.reduce((min, s) => (s.total_points < min.total_points ? s : min))
              .category
          : null;

      // Calculate overall balance (0-100)
      // Perfect balance = 100 (all categories equal)
      // Complete imbalance = 0 (all points in one category)
      let overallBalance = 0;
      if (totalPoints > 0) {
        const avgPerCategory = totalPoints / LIFE_CATEGORIES.length;
        const deviations = scores.map((s) => Math.abs(s.total_points - avgPerCategory));
        const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / LIFE_CATEGORIES.length;
        // Normalize: 0 deviation = 100 balance, max deviation (all in one) = 0 balance
        const maxPossibleDeviation = totalPoints * (1 - 1 / LIFE_CATEGORIES.length);
        overallBalance =
          maxPossibleDeviation > 0
            ? Math.round((1 - avgDeviation / maxPossibleDeviation) * 100)
            : 100;
      }

      return {
        scores,
        totalPoints,
        dominantCategory,
        weakestCategory,
        overallBalance,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to avoid too many refreshes
  });
}

export function useCategoryScores(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.categoryScores(userId ?? ''),
    queryFn: () => challengesRepository.getCategoryScores(userId!),
    enabled: !!userId,
  });
}

export function useRefreshCategoryScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => challengesRepository.refreshCategoryScores(),
    onSuccess: () => {
      // Invalidate all life balance related queries
      queryClient.invalidateQueries({ queryKey: ['life-balance'] });
      queryClient.invalidateQueries({ queryKey: ['category-scores'] });
    },
  });
}

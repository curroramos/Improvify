import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesRepository } from '@/lib/repositories';
import { queryKeys } from '../queryKeys';
import type { UserPreferences, UserPreferencesInput } from '@/types';

export function useUserPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.userPreferences(userId ?? ''),
    queryFn: () => preferencesRepository.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdatePreferences(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: UserPreferencesInput) =>
      preferencesRepository.upsert(userId!, preferences),
    onMutate: async (newPreferences) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userPreferences(userId!) });

      const previousPreferences = queryClient.getQueryData<UserPreferences>(
        queryKeys.userPreferences(userId!)
      );

      queryClient.setQueryData<UserPreferences | null>(queryKeys.userPreferences(userId!), (old) =>
        old ? { ...old, ...newPreferences } : null
      );

      return { previousPreferences };
    },
    onError: (_err, _newPreferences, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(queryKeys.userPreferences(userId!), context.previousPreferences);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPreferences(userId!) });
    },
  });
}

export function useEnsurePreferences(userId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.userPreferences(userId ?? ''), 'ensure'],
    queryFn: () => preferencesRepository.ensureExists(userId!),
    enabled: !!userId,
    staleTime: Infinity,
  });
}

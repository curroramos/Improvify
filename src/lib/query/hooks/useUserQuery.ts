import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userRepository, CreateUserData } from '@/lib/repositories';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '../queryKeys';
import type { User, Timeframe } from '@/types';

export function useUserQuery(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.user(userId ?? ''),
    queryFn: () => userRepository.findById(userId!),
    enabled: !!userId,
  });

  // Real-time subscription for user updates
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`user-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const userData = payload.new;
          if (userData && typeof userData === 'object' && 'id' in userData) {
            queryClient.setQueryData(queryKeys.user(userId), userData as User);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);

  return query;
}

export function useUserProgress(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.userProgress(userId ?? ''),
    queryFn: () => userRepository.getProgress(userId!),
    enabled: !!userId,
  });
}

export function usePointsHistory(userId: string | undefined, timeframe: Timeframe) {
  return useQuery({
    queryKey: queryKeys.pointsHistory(userId ?? '', timeframe),
    queryFn: () => userRepository.getPointsHistory(userId!, timeframe),
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: CreateUserData }) =>
      userRepository.createUser(userId, userData),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user(user.id), user);
    },
  });
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<User>) => userRepository.updateProfile(userId!, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user(userId!) });
      const previousUser = queryClient.getQueryData<User>(queryKeys.user(userId!));

      // Optimistically update user
      queryClient.setQueryData<User>(queryKeys.user(userId!), (old) =>
        old ? { ...old, ...updates } : old
      );

      return { previousUser };
    },
    onError: (_err, _updates, context) => {
      if (context?.previousUser && userId) {
        queryClient.setQueryData(queryKeys.user(userId), context.previousUser);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
      }
    },
  });
}

export function useAddPoints(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pointsToAdd: number) => userRepository.addPoints(userId!, pointsToAdd),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.user(userId!), updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.userProgress(userId!) });
      // Invalidate points history to show new points
      queryClient.invalidateQueries({
        queryKey: ['user', userId, 'points-history'],
      });
    },
  });
}

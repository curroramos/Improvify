import { useAuth } from './useAuth';
import { useUserQuery } from '@/lib/query';

/**
 * Convenience hook that wraps React Query's useUserQuery with auth context.
 * Automatically fetches user data and sets up real-time subscription when authenticated.
 * Uses React Query for caching, deduplication, and automatic background refetching.
 */
export const useUser = () => {
  const { userId, isAuthenticated } = useAuth();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useUserQuery(isAuthenticated && userId ? userId : undefined);

  return {
    user: user ?? null,
    isLoading,
    error,
    refetch,
  };
};

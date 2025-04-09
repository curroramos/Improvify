import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// Define proper type for user data with the fields used in your app
export type UserProfile = {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  // Add other fields from your users table as needed
  [key: string]: any;
};

export const useUser = () => {
  const { userId, isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Skip fetching if not authenticated
    if (!isAuthenticated || !userId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching user profile for ID:', userId);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Error fetching user profile:', userError);
          throw userError;
        }
        
        console.log('User profile retrieved:', userData);
        setUser(userData);
      } catch (err) {
        console.error('Error in useUser hook:', err);
        setError(err as Error);
        // Don't clear user data on error to prevent UI flashing
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up real-time subscription for user updates
    const subscription = supabase
      .channel(`user-updates-${userId}`) // Add unique identifier
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload) => {
          console.log('User profile updated:', payload.new);
          setUser(payload.new as UserProfile);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up user subscription');
      subscription.unsubscribe();
    };
  }, [userId, isAuthenticated]);

  // Enhanced return object with convenience methods
  return { 
    user, 
    isLoading, 
    error,
    refetch: async () => {
      if (userId) {
        try {
          setIsLoading(true);
          const { data, error: refetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (refetchError) throw refetchError;
          setUser(data);
        } catch (err) {
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };
};

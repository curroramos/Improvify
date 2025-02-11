import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (authUser?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.user.id)
            .single();

          if (userError) throw userError;

          setUser(userData);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const subscription = supabase
      .channel('user-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload) => {
          if (payload.new.id === user?.id) {
            setUser(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, error };
};

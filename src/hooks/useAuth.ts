import { useEffect } from 'react';
import { useAuthStore } from '../lib/store/useAuthStore';

// Re-export store for direct access when needed
export { useAuthStore };

// Custom Hook for Auth State Management - now backed by Zustand
export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    const unsubscribe = store.initialize();
    return unsubscribe;
  }, []);

  return {
    session: store.session,
    userId: store.userId,
    loading: store.loading,
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
  };
};

export default useAuth;

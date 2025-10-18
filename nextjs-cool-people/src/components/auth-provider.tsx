'use client';

import { getSessionAction } from '@/lib/actions';
import type { User } from '@/lib/types';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

type AuthContextType = {
  user: User | null;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const session = await getSessionAction();
      setUser(session.user);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

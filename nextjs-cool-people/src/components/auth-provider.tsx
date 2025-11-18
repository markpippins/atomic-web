'use client';

import type { User } from '@/lib/types';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

interface LoginResponse {
  token: string;
  message?: string;
  ok: boolean;
  user?: User;
  errors?: { message: string }[];
}

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (alias: string, identifier: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if debug mode is enabled from environment variables
const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
const debugUserAlias = process.env.NEXT_PUBLIC_DEBUG_USER_ALIAS || 'debug_user';
const debugUserEmail = process.env.NEXT_PUBLIC_DEBUG_USER_EMAIL || 'debug@example.com';

// Create a dummy user for debug mode
const dummyUser: User = {
  id: 'debug-user-id',
  name: debugUserAlias,
  username: debugUserAlias,
  avatar: 'avatar1',
  bio: 'Debug user',
  alias: debugUserAlias,
  email: debugUserEmail,
  profileId: 'debug-profile-id',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(isDebugMode ? dummyUser : null);
  const [token, setToken] = useState<string | null>(isDebugMode ? 'debug-token' : null);

  const login = useCallback(async (alias: string, identifier: string) => {
    // Skip API call if in debug mode
    if (isDebugMode) {
      console.log("Debug mode: Using dummy user instead of API login");
      setUser(dummyUser);
      setToken('debug-token');
      // Store in localStorage for access by other functions
      if (typeof window !== 'undefined') {
        localStorage.setItem('coolpeople-token', 'debug-token');
        localStorage.setItem('coolpeople-user', JSON.stringify(dummyUser));
      }
      return;
    }

    // Generate a unique request ID
    const requestId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `req-${Date.now()}`;

    const requestBody = {
      service: "loginService",
      operation: "login",
      params: { alias, identifier },
      requestId
    };

    try {
      const response = await fetch('/api/broker/submitRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: LoginResponse = await response.json();
      
      if (!response.ok || !data.ok) {
        const errorDetails = data.errors?.[0]?.message || "Login failed";
        throw new Error(errorDetails);
      }

      // Store the token and user data
      if (data.token) {
        setToken(data.token);
        
        // Use the user data from the response if available, otherwise create a minimal user object
        if (data.user) {
          setUser(data.user);
          // Store in localStorage for access by other functions
          if (typeof window !== 'undefined') {
            localStorage.setItem('coolpeople-token', data.token);
            localStorage.setItem('coolpeople-user', JSON.stringify(data.user));
          }
        } else {
          const minimalUser: User = {
            id: `temp-${Date.now()}`, // Temporary ID
            name: alias, // Use alias as name
            username: alias, // Use alias as username
            avatar: 'avatar1', // Provide a default avatar
            bio: 'New user', // Provide a default bio
            alias: alias, // Use the alias from login parameters
            email: `${alias}@temp.com`, // Temporary email
            profileId: `profile-${Date.now()}`,
          };
          setUser(minimalUser);
          // Store in localStorage for access by other functions
          if (typeof window !== 'undefined') {
            localStorage.setItem('coolpeople-token', data.token);
            localStorage.setItem('coolpeople-user', JSON.stringify(minimalUser));
          }
        }
      } else {
        throw new Error("No token received from login service");
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // Clear from localStorage as well
    if (typeof window !== 'undefined') {
      localStorage.removeItem('coolpeople-token');
      localStorage.removeItem('coolpeople-user');
    }
    // In a real app, you might also call an API endpoint to invalidate the token
  }, []);

  const checkAuth = useCallback(async () => {
    // In the token-based system, we don't have a session check API from server
    // We'll check if we have a token stored in localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('coolpeople-token');
      const storedUser = localStorage.getItem('coolpeople-user');
      
      if (storedToken) {
        // Token exists, user is considered authenticated
        setToken(storedToken);
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Error parsing stored user:', e);
            setUser(null);
          }
        }
      } else {
        // No token, user is not authenticated
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isLoggedIn = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout, checkAuth }}>
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

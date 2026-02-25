'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { apiClient } from '@/lib/api-client';
import {
  type AuthUser,
  type AuthTokens,
  setTokens,
  clearTokens,
  fetchCurrentUser,
  getStoredTokens,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  googleAuth: (profile: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthResponse = useCallback(
    (userData: AuthUser, tokens: AuthTokens) => {
      setTokens(tokens);
      setUser(userData);
    },
    [],
  );

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    async function init() {
      const tokens = getStoredTokens();
      if (tokens) {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    handleAuthResponse(data.data.user, data.data.tokens);
  };

  const register = async (input: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
  }) => {
    const { data } = await apiClient.post('/auth/register', input);
    handleAuthResponse(data.data.user, data.data.tokens);
  };

  const googleAuth = async (profile: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }) => {
    const { data } = await apiClient.post('/auth/google', profile);
    handleAuthResponse(data.data.user, data.data.tokens);
  };

  const logout = async () => {
    try {
      const tokens = getStoredTokens();
      await apiClient.post('/auth/logout', {
        refreshToken: tokens?.refreshToken,
      });
    } catch {
      // Logout even if API call fails
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleAuth,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { apiClient } from './api-client';

export interface AuthUser {
  _id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const tokens = getStoredTokens();
    if (!tokens) return null;

    const { data } = await apiClient.get('/auth/me');
    return data.data;
  } catch {
    clearTokens();
    return null;
  }
}

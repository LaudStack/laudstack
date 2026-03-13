/**
 * LaudStack AuthContext — compatibility wrapper around real Manus OAuth
 * Delegates to the real useAuth from _core/hooks/useAuth
 * Keeps the same API so existing pages don't need to change their imports
 */

import { createContext, useContext, ReactNode } from 'react';
import { useAuth as useRealAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const real = useRealAuth();

  const user: AuthUser | null = real.user
    ? {
        id: String((real.user as any).id ?? ''),
        name: (real.user as any).name ?? 'User',
        email: (real.user as any).email ?? '',
        avatar: (real.user as any).avatarUrl ?? undefined,
        avatarUrl: (real.user as any).avatarUrl ?? null,
        role: (real.user as any).role ?? 'user',
      }
    : null;

  const signIn = () => {
    window.location.href = getLoginUrl();
  };

  const signOut = () => {
    real.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: real.isAuthenticated,
        loading: real.loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Returns initials from a full name, e.g. "Jane Smith" → "JS" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

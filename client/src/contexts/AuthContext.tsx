/**
 * LaudStack AuthContext — Real tRPC + Manus OAuth authentication
 * Wraps the core useAuth hook from _core/hooks/useAuth.ts
 * Provides backward-compatible API for all existing components
 */
import { createContext, useContext, ReactNode } from 'react';
import { useAuth as useCoreAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import type { User } from '../../../drizzle/schema';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  reviewCount: number;
  joinedAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  rawUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(raw: User | null | undefined): AuthUser | null {
  if (!raw) return null;
  return {
    id: String(raw.id),
    name: raw.name || raw.email?.split('@')[0] || 'User',
    email: raw.email || '',
    role: raw.role === 'admin' ? 'admin' : 'user',
    reviewCount: 0,
    joinedAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: rawUser, isAuthenticated, loading, logout } = useCoreAuth();

  const signIn = () => {
    window.location.href = getLoginUrl();
  };

  const signOut = async () => {
    await logout();
    window.location.href = '/';
  };

  const user = mapUser(rawUser);

  return (
    <AuthContext.Provider value={{ user, rawUser: rawUser ?? null, isAuthenticated, loading, signIn, signOut }}>
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

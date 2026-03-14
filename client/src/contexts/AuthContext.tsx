/**
 * LaudStack AuthContext — mock authentication state
 * Persists to sessionStorage so state survives HMR but resets on tab close.
 * Replace with real Supabase auth when backend is integrated.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;   // initials fallback if undefined
  role: 'user' | 'founder' | 'admin';
  reviewCount: number;
  joinedAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'laudstack_auth_user';

function loadFromSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadFromSession);

  const signIn = useCallback((name: string, email: string) => {
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role: 'user',
      reviewCount: 0,
      joinedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
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

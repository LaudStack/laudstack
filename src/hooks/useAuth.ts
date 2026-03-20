"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { runAllCacheInvalidators } from "@/hooks/authCacheInvalidators";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

interface CachedAuth {
  user: User | null;
  resolved: boolean;
}

let _cache: CachedAuth = { user: null, resolved: false };
const _listeners = new Set<() => void>();
let _initialised = false;

function _notify() {
  _listeners.forEach((l) => l());
}

function _setCache(user: User | null, resolved: boolean) {
  _cache = { user, resolved };
  _notify();
}

function _subscribe(cb: () => void) {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}

function _getSnapshot(): CachedAuth {
  return _cache;
}

const _serverSnapshot: CachedAuth = { user: null, resolved: false };
function _getServerSnapshot(): CachedAuth {
  return _serverSnapshot;
}

/** Boot the auth listener once, globally */
function _ensureInitialised() {
  if (_initialised) return;
  _initialised = true;

  const supabase = getSupabaseClient();

  supabase.auth.getUser().then(({ data: { user } }) => {
    _setCache(user, true);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    _setCache(session?.user ?? null, true);
  });
}

// Boot immediately at module import time — reduces the window before
// resolved=true so the skeleton flash is minimised on first render.
if (typeof window !== "undefined") {
  _ensureInitialised();
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null; user: User | null }>;
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: string | null; supabaseId?: string }>;
} {
  useEffect(() => { _ensureInitialised(); }, []);

  const cached = useSyncExternalStore(_subscribe, _getSnapshot, _getServerSnapshot);

  const supabase = getSupabaseClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    _setCache(null, true);
    // Invalidate all session caches so the next login fetches fresh data
    runAllCacheInvalidators();
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const signInWithLinkedIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "openid profile email",
      },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    return { error: error?.message ?? null, user: data?.user ?? null };
  };

  const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirst = firstName?.trim();
    const cleanLast = lastName?.trim();
    const fullName = [cleanFirst, cleanLast].filter(Boolean).join(" ") || undefined;
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: cleanFirst,
          last_name: cleanLast,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    return { error: error?.message ?? null, supabaseId: data?.user?.id };
  };

  return {
    user: cached.user,
    loading: !cached.resolved,
    isAuthenticated: !!cached.user,
    signOut,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithEmail,
    signUpWithEmail,
  };
}

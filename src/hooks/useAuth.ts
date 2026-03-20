"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Module-level singleton — createBrowserClient is called once per browser
 * session, not on every render. This prevents the infinite re-render loop
 * caused by a new client instance being created each time the hook runs.
 *
 * We defer initialisation to the first call so that server-side rendering
 * (where window/document are unavailable) doesn't throw.
 */
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

/* ─── Module-level auth cache ─────────────────────────────────────────────
 * Keeps the last-known auth state so that when React re-mounts the Navbar
 * during client-side navigation, the component can render the correct
 * auth UI *immediately* instead of showing a skeleton → real content flash.
 *
 * The cache is populated:
 *   1. After the first getUser() call resolves
 *   2. On every onAuthStateChange event
 *   3. On signOut
 *
 * We use useSyncExternalStore so all hook consumers share the same snapshot.
 * ────────────────────────────────────────────────────────────────────────── */
interface CachedAuth {
  user: User | null;
  resolved: boolean; // true once the first getUser() has returned
}

let _cache: CachedAuth = { user: null, resolved: false };
const _listeners = new Set<() => void>();
let _initialised = false; // ensures we only call getUser + subscribe once

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

  // 1. Resolve initial user
  supabase.auth.getUser().then(({ data: { user } }) => {
    _setCache(user, true);
  });

  // 2. Subscribe to auth changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    _setCache(session?.user ?? null, true);
  });
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null; user: User | null }>;
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: string | null; supabaseId?: string }>;
} {
  // Boot the global listener on first hook call
  useEffect(() => { _ensureInitialised(); }, []);

  // All instances share the same snapshot — no per-component loading flash
  const cached = useSyncExternalStore(_subscribe, _getSnapshot, _getServerSnapshot);

  // Stable reference — same object across all renders
  const supabase = getSupabaseClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    _setCache(null, true);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  /**
   * LinkedIn OAuth via Supabase (linkedin_oidc provider).
   * Extracts: first_name, last_name, email, avatar_url, and location data.
   * Requires LinkedIn OIDC configured in Supabase Dashboard → Auth → Providers.
   */
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

    // CRITICAL: Sign out immediately after signup to prevent premature auto-login.
    // Supabase may auto-confirm the email and create a session instantly (depending
    // on project settings). We need the user to complete our custom OTP verification
    // first, so we destroy the session here. The user will be properly signed in
    // after OTP verification succeeds.
    if (!error && data?.user?.id) {
      await supabase.auth.signOut();
    }

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

"use client";

import { useState, useEffect } from "react";
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

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: string | null; supabaseId?: string }>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable reference — same object across all renders
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  // supabase is a stable singleton — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    return { error: error?.message ?? null, supabaseId: data?.user?.id };
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithEmail,
    signUpWithEmail,
  };
}

// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { upsertUser } from "@/server/db";
import { isStaffRole } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const { searchParams, origin } = requestUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Support both 'next' and 'return' query params for redirect after auth
  const rawNext = searchParams.get("next") || searchParams.get("return") || "/";
  // Prevent open redirect — only allow relative paths
  const next = rawNext.startsWith("/") ? rawNext : "/";

  // ─── Handle OAuth error params from Supabase ─────────────────────────
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription);
    const errorUrl = new URL("/auth/error", origin);
    errorUrl.searchParams.set("error", error);
    if (errorDescription) errorUrl.searchParams.set("message", errorDescription);
    return NextResponse.redirect(errorUrl.toString());
  }

  // ─── No code provided ────────────────────────────────────────────────
  if (!code) {
    console.error("[Auth Callback] No code parameter in callback URL:", requestUrl.toString());
    return NextResponse.redirect(`${origin}/auth/error?error=no_code&message=No+authorization+code+received`);
  }

  // ─── Exchange code for session ───────────────────────────────────────
  const cookieStore = await cookies();

  // Log available cookies for debugging (names only, not values)
  const allCookies = cookieStore.getAll();
  const cookieNames = allCookies.map(c => c.name);
  const hasCodeVerifier = cookieNames.some(n => n.includes("code-verifier") || n.includes("code_verifier"));
  console.log("[Auth Callback] Available cookies:", cookieNames.join(", "));
  console.log("[Auth Callback] Has code verifier cookie:", hasCodeVerifier);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // Ensure cookies work across the domain
                path: "/",
              });
            });
          } catch (err) {
            console.error("[Auth Callback] Failed to set cookies:", err);
            // This can happen in certain edge cases with streaming responses
            // The session will still be established via the response cookies
          }
        },
      },
    }
  );

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[Auth Callback] Code exchange failed:", exchangeError.message);
    console.error("[Auth Callback] Exchange error details:", JSON.stringify(exchangeError));

    // If code verifier is missing, this is likely a cookie issue
    if (exchangeError.message.includes("code verifier") || exchangeError.message.includes("code_verifier")) {
      console.error("[Auth Callback] PKCE code verifier missing — likely a cookie domain mismatch or SameSite issue");
      // Try to redirect to login with an informative error
      return NextResponse.redirect(
        `${origin}/auth/login?error=session_expired&message=Your+session+expired+during+login.+Please+try+again.`
      );
    }

    return NextResponse.redirect(
      `${origin}/auth/error?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
    );
  }

  if (!data.user) {
    console.error("[Auth Callback] No user returned after code exchange");
    return NextResponse.redirect(`${origin}/auth/error?error=no_user&message=Authentication+succeeded+but+no+user+data+was+returned`);
  }

  // ─── Extract user metadata ───────────────────────────────────────────
  const user = data.user;
  const meta = user.user_metadata ?? {};
  const identities = user.identities ?? [];

  console.log("[Auth Callback] User authenticated:", user.id, user.email);
  console.log("[Auth Callback] Provider:", identities[0]?.provider ?? "unknown");
  console.log("[Auth Callback] User metadata keys:", Object.keys(meta).join(", "));

  // Determine login method
  const provider = identities[0]?.provider ?? "email";
  const loginMethod =
    provider === "google" ? "google" :
    provider === "linkedin_oidc" ? "linkedin" :
    "email";

  // Extract name fields
  // LinkedIn OIDC returns: given_name, family_name, full_name
  // Google returns: full_name, name
  const firstName =
    meta.given_name ||
    meta.first_name ||
    (meta.full_name ? (meta.full_name as string).split(" ")[0] : null) ||
    (meta.name ? (meta.name as string).split(" ")[0] : null) ||
    null;

  const lastName =
    meta.family_name ||
    meta.last_name ||
    (meta.full_name ? (meta.full_name as string).split(" ").slice(1).join(" ") : null) ||
    (meta.name ? (meta.name as string).split(" ").slice(1).join(" ") : null) ||
    null;

  const fullName =
    meta.full_name ||
    meta.name ||
    (firstName && lastName ? `${firstName} ${lastName}` : firstName) ||
    null;

  // Extract avatar
  // LinkedIn OIDC returns: picture; Google returns: avatar_url or picture
  const avatarUrl = meta.avatar_url || meta.picture || null;

  // LinkedIn-specific fields
  const linkedinId = loginMethod === "linkedin" ? (identities[0]?.id ?? null) : null;
  const linkedinUrl = meta.linkedin_url || meta.profile_url || null;

  // ─── Upsert user in database ─────────────────────────────────────────
  try {
    const dbUser = await upsertUser({
      supabaseId: user.id,
      email: user.email,
      name: fullName ?? undefined,
      avatarUrl: avatarUrl ?? undefined,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      loginMethod,
      linkedinId: linkedinId ?? undefined,
      linkedinUrl: linkedinUrl ?? undefined,
      emailVerified: user.email_confirmed_at != null,
    });

    console.log("[Auth Callback] User upserted:", dbUser?.id, "onboardingCompleted:", dbUser?.onboardingCompleted);

    // Redirect staff/admin users to admin panel — they should never see user-facing dashboard
    if (dbUser && isStaffRole(dbUser.role)) {
      return NextResponse.redirect(`${origin}/ops-console/dashboard`);
    }

    // Redirect new users to onboarding — but NOT if they're resetting their password
    const isPasswordReset = next.startsWith("/auth/reset-password");
    if (dbUser && !dbUser.onboardingCompleted && !isPasswordReset) {
      console.log("[Auth Callback] New user — redirecting to onboarding");
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    console.log("[Auth Callback] Existing user — redirecting to:", next);
    return NextResponse.redirect(`${origin}${next}`);
  } catch (dbError) {
    console.error("[Auth Callback] Database upsert failed:", dbError);
    // Even if DB upsert fails, the user is authenticated via Supabase
    // Redirect them to the app — the session exists, and the DB record
    // can be created on the next page load via middleware or API call
    return NextResponse.redirect(`${origin}${next}`);
  }
}

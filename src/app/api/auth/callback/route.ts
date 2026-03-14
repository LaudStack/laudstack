// Force dynamic rendering — prevents static analysis at build time
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { upsertUser } from "@/server/db";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const meta = user.user_metadata ?? {};
      const identities = user.identities ?? [];

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

      // Sync user to our database with all extracted fields
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

      // Redirect new users to onboarding
      if (dbUser && !dbUser.onboardingCompleted) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to error page if auth failed
  return NextResponse.redirect(`${origin}/auth/error`);
}

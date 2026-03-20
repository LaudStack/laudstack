import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * LaudStack Middleware
 *
 * Responsibilities:
 * 1. SEO URL rewrites (alternatives, vs pages)
 * 2. Supabase session refresh
 * 3. Server-side route protection:
 *    - /ops-console/* (except /gate) → requires staff role
 *    - /dashboard/* → requires authenticated user (NOT staff)
 *    - /onboarding → requires authenticated user (NOT staff)
 *    - /api/admin/* → requires staff role
 *
 * Role enforcement:
 *    - Staff/admin users are blocked from /dashboard and /onboarding
 *    - Regular users are blocked from /ops-console (except /gate)
 */

// Staff roles that should be redirected to admin panel
const STAFF_ROLES = new Set([
  "customer_rep", "moderator", "analyst", "manager", "admin", "super_admin",
]);

/**
 * Lightweight role check using Supabase PostgREST (Edge-compatible).
 * Returns the user's role from the app database.
 */
async function getUserRole(supabaseId: string): Promise<string | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?supabase_id=eq.${supabaseId}&select=role&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      // Short timeout for middleware
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── SEO URL Rewrites ──────────────────────────────────────────────────
  // /chatgpt-alternatives → /alt/chatgpt
  const altMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]*)-alternatives$/);
  if (altMatch) {
    const toolSlug = altMatch[1];
    const url = request.nextUrl.clone();
    url.pathname = `/alt/${toolSlug}`;
    return NextResponse.rewrite(url);
  }

  // /chatgpt-vs-claude → /vs/chatgpt/claude
  const vsMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]*)-vs-([a-z0-9][a-z0-9-]*)$/);
  if (vsMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/vs/${vsMatch[1]}/${vsMatch[2]}`;
    return NextResponse.rewrite(url);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired — required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ─── Route Protection ─────────────────────────────────────────────────

  // Admin panel routes (except the gate/login page)
  const isAdminRoute =
    pathname.startsWith("/ops-console") && pathname !== "/ops-console/gate";
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute || isAdminApiRoute) {
    if (!user) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/ops-console/gate";
      return NextResponse.redirect(url);
    }
    // Note: Full role check happens in the layout/API route level
    // because middleware ensures authentication; the layout/route enforces authorization.
  }

  // User dashboard routes — require authentication, block staff/admin users
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Check if the user is a staff/admin — redirect them to admin panel
    const role = await getUserRole(user.id);
    if (role && STAFF_ROLES.has(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/ops-console/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Onboarding — block staff/admin users (they don't need user onboarding)
  if (pathname === "/onboarding" && user) {
    const role = await getUserRole(user.id);
    if (role && STAFF_ROLES.has(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/ops-console/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/stripe/webhook (Stripe webhooks need raw body)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)",
  ],
};

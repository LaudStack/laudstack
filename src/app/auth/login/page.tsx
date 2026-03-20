"use client";
export const dynamic = "force-dynamic";

/*
 * LaudStack — Sign In / Sign Up
 *
 * Design: Split-panel layout with main Navbar
 *  - Left panel: Polished branding with gradient, floating tool cards, social proof
 *  - Right panel: White form area with tab toggle, social OAuth, email/password
 *  - No OTP during signup — email verification is deferred to sensitive actions
 *  - Responsive: stacks on mobile (left panel hidden)
 */

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createUserAfterSignup } from "@/app/actions/createUserAfterSignup";
import Navbar from "@/components/Navbar";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/logo_dark_transparent_47bd35ed.png";

// OTP, VerifyStep, and Google OAuth removed.
// Email verification is handled on-demand via EmailVerificationModal for sensitive actions only.

// ─── Auth form ────────────────────────────────────────────────────────────────

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("return") || searchParams?.get("next") || "/";
  const initialTab = searchParams?.get("tab");

  const [mode, setMode] = useState<"signin" | "signup">(initialTab === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"linkedin" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // OTP step removed — signup is now frictionless

  const { signInWithEmail, signUpWithEmail, signInWithLinkedIn } = useAuth();
  const isSignUp = mode === "signup";

  // Simple but effective email format validation
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Sanitize inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    // Validation
    if (!cleanEmail) { setError("Email is required."); return; }
    if (!isValidEmail(cleanEmail)) { setError("Please enter a valid email address."); return; }
    if (!cleanPassword) { setError("Password is required."); return; }
    if (cleanPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (isSignUp && !cleanFirst) { setError("First name is required."); return; }
    if (isSignUp && !cleanLast) { setError("Last name is required."); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        const result = await signUpWithEmail(cleanEmail, cleanPassword, cleanFirst, cleanLast) as { error: string | null; supabaseId?: string };
        if (result.error) {
          // Handle Supabase "User already registered" error gracefully
          if (result.error.toLowerCase().includes("already registered") || result.error.toLowerCase().includes("already exists")) {
            setError("An account with this email already exists. Please sign in instead.");
          } else {
            setError(result.error);
          }
          return;
        }
        if (!result.supabaseId) {
          setError("Account creation failed. Please try again.");
          return;
        }

        // Create the DB user record immediately (no OTP required)
        try {
          await createUserAfterSignup({
            supabaseId: result.supabaseId,
            email: cleanEmail,
            firstName: cleanFirst,
            lastName: cleanLast,
          });
        } catch (err) {
          console.error("[Signup] Failed to create DB user:", err);
          // Non-critical — the auth callback will also create the user
        }

        toast.success("Account created! Welcome to LaudStack.");

        // Redirect to onboarding
        router.push("/onboarding");
      } else {
        const { error: signInError } = await signInWithEmail(cleanEmail, cleanPassword);
        if (signInError) {
          // Provide user-friendly error messages
          if (signInError.toLowerCase().includes("invalid") || signInError.toLowerCase().includes("credentials")) {
            setError("Invalid email or password. Please try again.");
          } else if (signInError.toLowerCase().includes("email not confirmed")) {
            // Supabase email confirmation is disabled, so this shouldn't happen.
            // If it does, don't block the user — just log and proceed.
            console.warn("[Login] Unexpected 'email not confirmed' error — Supabase confirm email should be OFF.");
            // Don't show an error — try to proceed with the session
            toast.success("Welcome back!");
            router.push("/dashboard");
            return;
          } else {
            setError(signInError);
          }
          return;
        }
        toast.success("Welcome back!");
        // Check user role to determine redirect destination
        try {
          const supabase = (await import('@supabase/ssr')).createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const { data: { user: supaUser } } = await supabase.auth.getUser();
          if (supaUser) {
            const roleRes = await fetch('/api/auth/check-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ supabaseId: supaUser.id }),
            });
            const roleData = await roleRes.json();
            if (roleData.isStaff) {
              router.push('/ops-console/dashboard');
              return;
            }
          }
        } catch (err) {
          console.error('[Auth] Role check failed, using default redirect:', err);
        }
        router.push(returnUrl);
      }
    } catch (err) {
      console.error("[Auth] Unexpected error during signup/signin:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedIn = async () => {
    setOauthLoading("linkedin");
    try { await signInWithLinkedIn(); }
    catch { toast.error("LinkedIn sign-in failed. Please try again."); setOauthLoading(null); }
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-slate-600">
          {isSignUp
            ? "Join professionals discovering the best stacks"
            : "Sign in to your LaudStack account"}
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        <button
          type="button"
          onClick={() => { setMode("signin"); setError(null); }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            mode === "signin"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(null); }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            mode === "signup"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form — email/password first */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white shadow-sm transition-all"
                  autoComplete="given-name"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white shadow-sm transition-all"
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white shadow-sm transition-all"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            {!isSignUp && (
              <Link href="/auth/reset-password" className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isSignUp ? "Min. 8 characters" : "••••••••"}
              className="w-full pl-9 pr-10 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white shadow-sm transition-all"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-slate-900 transition-all disabled:opacity-50 hover:brightness-105"
          style={{ background: "#F59E0B" }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
          ) : (
            <>
              {isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {isSignUp && (
          <p className="text-center text-xs text-slate-600 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-semibold">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-semibold">Privacy Policy</Link>.
          </p>
        )}
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-500 font-medium">Or Continue with</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* LinkedIn button — full logo with text */}
      <button
        onClick={handleLinkedIn}
        disabled={!!oauthLoading || loading}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60 shadow-sm"
      >
        {oauthLoading === "linkedin" ? (
          <div className="w-4 h-4 border-2 border-[#0A66C2]/30 border-t-[#0A66C2] rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-[22px] h-[22px] shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">LinkedIn</span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── Decorative background stripes (Stripe-inspired) ────────────────────────

function DecorativeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Amber stripe — top right */}
      <div
        className="absolute"
        style={{
          width: '600px',
          height: '40px',
          background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
          top: '120px',
          right: '-80px',
          transform: 'rotate(-35deg)',
          borderRadius: '20px',
          opacity: 0.18,
        }}
      />
      {/* Blue stripe — bottom left */}
      <div
        className="absolute"
        style={{
          width: '500px',
          height: '32px',
          background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
          bottom: '140px',
          left: '-60px',
          transform: 'rotate(-35deg)',
          borderRadius: '16px',
          opacity: 0.12,
        }}
      />
      {/* Cyan stripe — bottom left (secondary) */}
      <div
        className="absolute"
        style={{
          width: '400px',
          height: '24px',
          background: 'linear-gradient(90deg, #06B6D4 0%, #22D3EE 100%)',
          bottom: '100px',
          left: '-40px',
          transform: 'rotate(-35deg)',
          borderRadius: '12px',
          opacity: 0.10,
        }}
      />
      {/* Amber stripe — top right (secondary) */}
      <div
        className="absolute"
        style={{
          width: '450px',
          height: '28px',
          background: 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%)',
          top: '170px',
          right: '-40px',
          transform: 'rotate(-35deg)',
          borderRadius: '14px',
          opacity: 0.12,
        }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #94A3B8 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main platform Navbar */}
      <Navbar />
      {/* Spacer for fixed navbar */}
      <div className="h-[60px] lg:h-[64px]" />

      {/* Stripe-style centered layout with decorative background */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 sm:px-6 py-8 sm:py-12">
        {/* Decorative background stripes */}
        <DecorativeBackground />

        {/* Form card */}
        <div className="relative z-10 w-full max-w-[440px]">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <AuthForm />
            </Suspense>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300 text-xs">·</span>
            <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-300 text-xs">·</span>
            <Link href="/contact" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Help
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

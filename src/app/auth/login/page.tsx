"use client";
export const dynamic = "force-dynamic";

/*
 * LaudStack — Sign In / Sign Up
 *
 * Design: Split-panel layout
 *  - Left panel: Dark slate branding with amber accents, social proof, feature list
 *  - Right panel: White form area with tab toggle, social OAuth, email/password
 *  - Inline 6-digit OTP verification step after sign-up
 *  - Responsive: stacks on mobile
 */

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  CheckCircle2, AlertCircle, RefreshCw, Star,
  Search, Shield, Sparkles, TrendingUp, Users, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { sendVerificationCode, verifyCode } from "@/app/actions/emailVerification";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/logo_dark_transparent_47bd35ed.png";

// ─── Social icons ─────────────────────────────────────────────────────────────

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── OTP 6-digit input ────────────────────────────────────────────────────────

function OTPInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const handleChange = (idx: number, char: string) => {
    const d = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = d || " ";
    onChange(next.join("").trimEnd());
    if (d && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!digits[idx] || digits[idx] === " ") {
        if (idx > 0) inputs.current[idx - 1]?.focus();
      } else {
        const next = [...digits];
        next[idx] = " ";
        onChange(next.join("").trimEnd());
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === " " ? "" : (digits[i] ?? "")}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          disabled={disabled}
          style={{ height: "52px", width: "44px" }}
          className={[
            "text-center text-lg font-bold rounded-lg border-2 transition-all outline-none",
            digits[i] && digits[i] !== " "
              ? "border-amber-400 bg-amber-50 text-slate-900"
              : "border-slate-200 bg-white text-slate-900",
            "focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// ─── Verify step ──────────────────────────────────────────────────────────────

function VerifyStep({
  email,
  supabaseId,
  onSuccess,
}: {
  email: string;
  supabaseId: string;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const codeDigits = code.replace(/\s/g, "").length;

  const handleVerify = async () => {
    if (codeDigits !== 6) { setError("Please enter all 6 digits."); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await verifyCode({ email, supabaseId, code: code.replace(/\s/g, "") });
      if (result.success) {
        setVerified(true);
        setTimeout(onSuccess, 1400);
      } else {
        setError(result.error ?? "Invalid or expired code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await sendVerificationCode({ email, supabaseId });
      setCooldown(60);
      toast.success("New code sent to your inbox.");
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">Email verified!</h3>
        <p className="text-slate-500 text-sm">Signing you in now…</p>
        <div className="flex justify-center mt-5">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-7">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1.5">Check your email</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          We sent a 6-digit verification code to
          <br />
          <span className="font-semibold text-slate-700">{email}</span>
        </p>
      </div>

      <div className="mb-5">
        <OTPInput value={code} onChange={setCode} disabled={loading} />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={loading || codeDigits !== 6}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        style={{
          background: codeDigits === 6 ? "#F59E0B" : "#E2E8F0",
          color: codeDigits === 6 ? "#1E293B" : "#94A3B8",
        }}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
        ) : (
          <>Verify Email <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        Didn&apos;t receive it?{" "}
        {cooldown > 0 ? (
          <span className="text-slate-400">Resend in {cooldown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-amber-600 font-semibold hover:text-amber-700 inline-flex items-center gap-1"
          >
            {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
            Resend code
          </button>
        )}
      </p>

      <p className="text-center text-xs text-slate-400 mt-4">
        Code expires in 15 minutes.{" "}
        <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
          Use a different email
        </Link>
      </p>
    </div>
  );
}

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
  const [oauthLoading, setOauthLoading] = useState<"google" | "linkedin" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingSupabaseId, setPendingSupabaseId] = useState("");

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithLinkedIn } = useAuth();
  const isSignUp = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }
    if (isSignUp && !firstName.trim()) { setError("First name is required."); return; }
    if (isSignUp && !lastName.trim()) { setError("Last name is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        const result = await signUpWithEmail(email, password, firstName.trim(), lastName.trim()) as { error: string | null; supabaseId?: string };
        if (result.error) { setError(result.error); return; }
        await sendVerificationCode({ email, supabaseId: result.supabaseId ?? "" });
        setPendingEmail(email);
        setPendingSupabaseId(result.supabaseId ?? "");
        setOtpStep(true);
      } else {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) { setError(signInError); return; }
        toast.success("Welcome back!");
        router.push(returnUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setOauthLoading("google");
    try { await signInWithGoogle(); }
    catch { toast.error("Google sign-in failed. Please try again."); setOauthLoading(null); }
  };

  const handleLinkedIn = async () => {
    setOauthLoading("linkedin");
    try { await signInWithLinkedIn(); }
    catch { toast.error("LinkedIn sign-in failed. Please try again."); setOauthLoading(null); }
  };

  if (otpStep) {
    return (
      <VerifyStep
        email={pendingEmail}
        supabaseId={pendingSupabaseId}
        onSuccess={() => router.push(returnUrl)}
      />
    );
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-slate-500">
          {isSignUp
            ? "Join 12,000+ professionals discovering the best stacks"
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
          <p className="text-center text-xs text-slate-400 leading-relaxed">
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
        <span className="text-xs text-slate-400 font-medium">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Social buttons — icon only */}
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={handleGoogle}
          disabled={!!oauthLoading || loading}
          className="w-[72px] h-[72px] flex items-center justify-center border-2 border-slate-200 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60 shadow-sm"
          title="Sign in with Google"
        >
          {oauthLoading === "google"
            ? <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            : <GoogleIcon className="w-10 h-10 shrink-0" />}
        </button>
        <button
          onClick={handleLinkedIn}
          disabled={!!oauthLoading || loading}
          className="w-[72px] h-[72px] flex items-center justify-center border-2 border-[#0A66C2]/30 rounded-2xl bg-white hover:bg-blue-50 hover:border-[#0A66C2]/50 transition-all disabled:opacity-60 shadow-sm"
          title="Sign in with LinkedIn"
        >
          {oauthLoading === "linkedin"
            ? <div className="w-6 h-6 border-2 border-[#0A66C2]/30 border-t-[#0A66C2] rounded-full animate-spin" />
            : <LinkedInIcon className="w-10 h-10 text-[#0A66C2] shrink-0" />}
        </button>
      </div>
    </div>
  );
}

// ─── Left Branding Panel ─────────────────────────────────────────────────────

function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden min-h-0">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:32px_32px]" />
      {/* Amber glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-3xl" />

      {/* Value proposition */}
      <div className="relative z-10 space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
            The Trusted Source<br />
            for <span className="text-amber-400">SaaS & AI</span><br />
            Tools.
          </h1>
          <p className="text-slate-400 mt-5 text-[15px] leading-relaxed max-w-sm">
            Join 12,000+ professionals who discover, compare, and review the stacks their business actually needs.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-3.5">
          {[
            { icon: Search, text: "Browse 95+ curated SaaS & AI stacks" },
            { icon: Star, text: "Read verified reviews from real users" },
            { icon: TrendingUp, text: "Track rising stacks and new launches" },
            { icon: Shield, text: "Exclusive deals and founder insights" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-sm text-slate-300 font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-2">
              {[11, 12, 13, 14, 15].map(i => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/32?img=${i}`}
                  alt=""
                  className="w-7 h-7 rounded-full border-2 border-slate-900"
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            &ldquo;LaudStack helped us find the perfect project management tool in minutes. The verified reviews saved us weeks of trial and error.&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-bold text-white">Sarah Chen</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">VP of Engineering, TechCorp</span>
          </div>
        </div>
      </div>

      {/* Bottom — Trust indicators */}
      <div className="relative z-10 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">12,000+ users</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">98% verified reviews</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">SOC 2 compliant</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — matches main site header, no menu items */}
      <header
        className="w-full border-b border-white/10 shrink-0"
        style={{ background: '#0F1629' }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-[64px] sm:h-[72px]">
            <Link href="/" className="flex items-center shrink-0 h-9 sm:h-10">
              <img
                src="/logo-dark-transparent.png"
                alt="LaudStack"
                className="h-9 sm:h-10 w-auto"
              />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
      {/* Left — Branding panel */}
      <BrandingPanel />

      {/* Right — Form panel */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Form area */}
        <main className="flex-1 flex items-center justify-center px-6 py-8 sm:py-12">
          <div className="w-full max-w-[420px]">

            {/* Card */}
            <div className="bg-white lg:bg-slate-50/50 lg:border lg:border-slate-200 lg:rounded-2xl lg:p-8 lg:shadow-sm">
              <Suspense fallback={
                <div className="flex items-center justify-center py-16">
                  <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <AuthForm />
              </Suspense>
            </div>

            {/* Footer links */}
            <div className="flex items-center justify-center gap-4 mt-8">
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
      </div>
    </div>
  );
}

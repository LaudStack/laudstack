"use client";

export const dynamic = 'force-dynamic';

/*
 * LaudStack — Password Reset Flow
 *
 * Two entry points:
 *   1. User visits /auth/reset-password → enters email → Supabase sends reset link
 *   2. User clicks reset link → Supabase redirects to /api/auth/callback → then to /auth/reset-password?stage=reset
 *      (The callback exchanges the code for a session, so the user is now authenticated)
 *
 * Stage flow: request → sent → reset (new password form) → done
 *
 * Security:
 *   - Client-side cooldown on reset request (60s)
 *   - Password complexity: min 8 chars, uppercase, lowercase, number
 *   - Session verification before showing reset form
 *   - Redirects to dashboard after reset (user is already authenticated)
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock, Mail, Eye, EyeOff, CheckCircle2, ArrowRight, Shield,
  KeyRound, AlertCircle, Check, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Stage = 'request' | 'sent' | 'reset' | 'verifying' | 'invalid' | 'done';

// Module-level singleton — prevents creating a new client on every render
let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null;
function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabaseClient;
}

// ─── Password requirements ─────────────────────────────────────────────────

interface PasswordCheck {
  label: string;
  met: boolean;
}

function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'One number (0-9)', met: /[0-9]/.test(password) },
  ];
}

function allChecksMet(password: string): boolean {
  return getPasswordChecks(password).every(c => c.met);
}

function PasswordRequirements({ password }: { password: string }) {
  const checks = getPasswordChecks(password);
  if (password.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-1.5">
      {checks.map(({ label, met }) => (
        <div key={label} className="flex items-center gap-2">
          {met ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          )}
          <span className={`text-xs ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Password strength bar ──────────────────────────────────────────────────

function getPasswordStrength(password: string) {
  if (password.length === 0) return null;
  const checks = getPasswordChecks(password);
  const metCount = checks.filter(c => c.met).length;

  if (metCount <= 1) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4', textColor: 'text-red-500' };
  if (metCount === 2) return { label: 'Fair', color: 'bg-orange-400', width: 'w-2/4', textColor: 'text-orange-500' };
  if (metCount === 3) return { label: 'Good', color: 'bg-amber-400', width: 'w-3/4', textColor: 'text-amber-500' };
  // All 4 met + extra length/special chars = Strong
  if (password.length >= 12 && /[^a-zA-Z0-9]/.test(password)) {
    return { label: 'Strong', color: 'bg-green-400', width: 'w-full', textColor: 'text-green-500' };
  }
  return { label: 'Good', color: 'bg-amber-400', width: 'w-3/4', textColor: 'text-amber-500' };
}

// ─── Main form ──────────────────────────────────────────────────────────────

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // If stage=reset is in the URL, start by verifying the session first
  const hasResetParam = searchParams?.get('stage') === 'reset';

  const [stage, setStage] = useState<Stage>(hasResetParam ? 'verifying' : 'request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const supabase = getSupabaseClient();

  // Cooldown timer for reset request
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Verify session when arriving with stage=reset
  const verifySession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStage('reset');
      } else {
        setStage('invalid');
      }
    } catch {
      setStage('invalid');
    }
  }, [supabase]);

  useEffect(() => {
    if (stage === 'verifying') {
      verifySession();
    }
  }, [stage, verifySession]);

  // Listen for PASSWORD_RECOVERY event from Supabase (when user clicks reset link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStage('reset');
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent('/auth/reset-password?stage=reset')}`,
      });
      if (resetError) {
        // Don't reveal whether the email exists — show success regardless for security
        // Supabase may return "User not found" but we still show the "sent" stage
        if (resetError.message.toLowerCase().includes('rate') || resetError.message.toLowerCase().includes('limit')) {
          setError('Too many requests. Please wait a few minutes and try again.');
          toast.error('Too many requests. Please wait a few minutes.');
        } else {
          // For security, don't reveal if email exists or not
          setStage('sent');
          setCooldown(60);
        }
      } else {
        setStage('sent');
        setCooldown(60);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allChecksMet(password)) {
      toast.error('Please meet all password requirements');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        // Handle specific Supabase errors
        if (updateError.message.includes('same_password')) {
          setError('New password must be different from your current password.');
          toast.error('Please choose a different password');
        } else if (updateError.message.includes('session')) {
          setError('Your reset session has expired. Please request a new reset link.');
          toast.error('Session expired');
          setTimeout(() => setStage('request'), 2000);
        } else {
          setError(updateError.message);
          toast.error(updateError.message);
        }
      } else {
        setStage('done');
        // User is already authenticated after password reset — redirect to dashboard
        setTimeout(() => router.push('/dashboard'), 3000);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-md">
      {/* Stage: Verifying session */}
      {stage === 'verifying' && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Verifying your reset link...</p>
        </div>
      )}

      {/* Stage: Invalid / expired link */}
      {stage === 'invalid' && (
        <>
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Link expired or invalid</h1>
            <p className="text-slate-600 leading-relaxed">
              This password reset link has expired or is no longer valid. Please request a new one.
            </p>
          </div>
          <button
            onClick={() => { setStage('request'); setError(null); }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-400/25"
          >
            <ArrowRight className="w-4 h-4" /> Request New Reset Link
          </button>
          <div className="text-center mt-6">
            <Link href="/auth/login">
              <span className="text-slate-500 text-sm hover:text-slate-600 transition-colors cursor-pointer">
                ← Back to Sign In
              </span>
            </Link>
          </div>
        </>
      )}

      {/* Stage: Request reset */}
      {stage === 'request' && (
        <>
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-amber-500" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Forgot your password?</h1>
            <p className="text-slate-600 leading-relaxed">
              No worries. Enter your email and we&apos;ll send you a secure link to reset your password.
            </p>
          </div>
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-400/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <><ArrowRight className="w-4 h-4" /> Send Reset Link</>
              )}
            </button>
          </form>
          <div className="text-center mt-6">
            <Link href="/auth/login">
              <span className="text-slate-500 text-sm hover:text-slate-600 transition-colors cursor-pointer">
                ← Back to Sign In
              </span>
            </Link>
          </div>
        </>
      )}

      {/* Stage: Email sent */}
      {stage === 'sent' && (
        <>
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <Mail className="w-9 h-9 text-amber-500" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Check your inbox</h1>
            <p className="text-slate-600 leading-relaxed">
              If an account exists for <strong className="text-slate-700">{email}</strong>, we&apos;ve sent a password reset link. The link expires in 1 hour.
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mb-6 space-y-3">
            {[
              { step: '1', text: 'Open the email from LaudStack', done: true },
              { step: '2', text: 'Click "Reset my password"', done: false },
              { step: '3', text: 'Choose a new secure password', done: false },
            ].map(({ step, text, done }) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  done ? 'bg-emerald-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                <span className={`text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-700 font-medium'}`}>{text}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-600 text-xs leading-relaxed">
              Didn&apos;t get the email? Check your spam folder, or{' '}
              <button
                onClick={() => { setStage('request'); setError(null); }}
                className="underline font-semibold"
              >
                try again
              </button>{' '}
              with a different address.
            </p>
          </div>
          {cooldown > 0 && (
            <p className="text-center text-xs text-slate-400">
              You can request another link in {cooldown}s
            </p>
          )}
        </>
      )}

      {/* Stage: Set new password */}
      {stage === 'reset' && (
        <>
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <Lock className="w-7 h-7 text-green-500" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Set new password</h1>
            <p className="text-slate-600">Choose a strong password you haven&apos;t used before.</p>
          </div>
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm"
                  required
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <div className={`text-xs mt-1 font-medium ${strength.textColor}`}>{strength.label}</div>
                </div>
              )}
              {/* Password requirements checklist */}
              <PasswordRequirements password={password} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                      : confirmPassword && confirmPassword === password
                        ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/20'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
                  }`}
                  required
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" /> Passwords do not match
                </p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="text-emerald-500 text-xs mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !allChecksMet(password) || password !== confirmPassword}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-400/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Update Password</>
              )}
            </button>
          </form>
        </>
      )}

      {/* Stage: Done */}
      {stage === 'done' && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Password updated!</h1>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Your password has been changed successfully. Redirecting you to your dashboard…
          </p>
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <Link href="/dashboard">
            <span className="text-amber-500 hover:text-amber-600 text-sm font-semibold cursor-pointer">
              Go to Dashboard →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20 mt-[60px] lg:mt-[64px]">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

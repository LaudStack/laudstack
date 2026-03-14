"use client";

export const dynamic = 'force-dynamic';


// ResetPassword.tsx — Password reset flow
// Design: Clean white, two-stage (request → confirmation)

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, CheckCircle2, ArrowRight, Shield, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Stage = 'request' | 'sent' | 'reset' | 'done';

export default function ResetPassword() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage('sent');
    }, 1200);
  };

  const handleSimulateLink = () => {
    setStage('reset');
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage('done');
      setTimeout(() => router.push('/auth/login'), 3000);
    }, 1200);
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' };
    if (password.length < 8) return { label: 'Fair', color: 'bg-orange-400', width: 'w-2/4' };
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Good', color: 'bg-amber-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-400', width: 'w-full' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20 mt-[72px]">
        <div className="w-full max-w-md">

          {/* Stage: Request reset */}
          {stage === 'request' && (
            <>
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                  <KeyRound className="w-7 h-7 text-amber-500" />
                </div>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-3">Forgot your password?</h1>
                <p className="text-slate-500 leading-relaxed">
                  No worries. Enter your email and we'll send you a secure link to reset your password.
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
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-400/25"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                <h1 className="text-3xl font-black text-slate-900 mb-3">Check your inbox</h1>
                <p className="text-slate-500 leading-relaxed">
                  We sent a password reset link to <strong className="text-slate-700">{email}</strong>. The link expires in 1 hour.
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
              {/* Demo shortcut */}
              <button
                onClick={handleSimulateLink}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-slate-900 font-bold py-3 px-6 rounded-xl transition-all mb-4"
              >
                <Lock className="w-4 h-4" />
                Simulate clicking the reset link (Demo)
              </button>
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-600 text-xs leading-relaxed">
                  Didn't get the email? Check your spam folder, or{' '}
                  <button onClick={() => setStage('request')} className="underline font-semibold">try again</button> with a different address.
                </p>
              </div>
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
                <h1 className="text-3xl font-black text-slate-900 mb-3">Set new password</h1>
                <p className="text-slate-500">Choose a strong password you haven't used before.</p>
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
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                      </div>
                      <div className={`text-xs mt-1 font-medium ${
                        strength.label === 'Strong' ? 'text-green-500' :
                        strength.label === 'Good' ? 'text-amber-500' :
                        strength.label === 'Fair' ? 'text-amber-500' : 'text-red-500'
                      }`}>{strength.label}</div>
                    </div>
                  )}
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
                          : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
                      }`}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-400/25"
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
              <h1 className="text-3xl font-black text-slate-900 mb-3">Password updated!</h1>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Your password has been changed successfully. Redirecting you to sign in…
              </p>
              <div className="flex justify-center mb-6">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <Link href="/auth/login">
                <span className="text-amber-500 hover:text-amber-600 text-sm font-semibold cursor-pointer">
                  Go to Sign In →
                </span>
              </Link>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}

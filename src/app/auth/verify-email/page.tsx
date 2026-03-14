"use client";

export const dynamic = 'force-dynamic';


// VerifyEmail.tsx — Email verification page
// Design: Clean white, centered, trust-building

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function VerifyEmail() {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  // Simulate cooldown timer after resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResendCount(c => c + 1);
      setCooldown(60);
      toast.success('Verification email sent! Check your inbox.');
    }, 1200);
  };

  // Simulate clicking the verify link (demo only)
  const handleSimulateVerify = () => {
    setVerified(true);
    setTimeout(() => router.push('/welcome'), 2000);
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-20 mt-[72px]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Email Verified!</h1>
            <p className="text-slate-500 mb-6">Your account is now fully activated. Redirecting you to your welcome page…</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20 mt-[72px]">
        <div className="w-full max-w-md">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                <Mail className="w-9 h-9 text-amber-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="text-slate-900 text-xs font-black">1</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-3">Check your inbox</h1>
            <p className="text-slate-500 leading-relaxed">
              We sent a verification link to your email address. Click the link to activate your LaudStack account and unlock all features.
            </p>
          </div>

          {/* Steps */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mb-6 space-y-3">
            {[
              { step: '1', text: 'Open your email inbox', done: true },
              { step: '2', text: 'Find the email from LaudStack', done: true },
              { step: '3', text: 'Click "Verify my email" button', done: false },
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

          {/* Demo verify button */}
          <button
            onClick={handleSimulateVerify}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-400/25 mb-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simulate Email Verification (Demo)
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-slate-500 text-sm mb-2">Didn't receive the email?</p>
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                cooldown > 0 || resending
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-amber-500 hover:text-amber-600'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : `Resend email${resendCount > 0 ? ` (${resendCount})` : ''}`}
            </button>
          </div>

          {/* Trust note */}
          <div className="mt-8 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-600 text-xs leading-relaxed">
              The verification link expires in 24 hours. If you didn't create a LaudStack account, you can safely ignore this email.
            </p>
          </div>

          {/* Back to sign in */}
          <div className="text-center mt-6">
            <Link href="/auth/login">
              <span className="text-slate-500 text-sm hover:text-slate-600 transition-colors cursor-pointer">
                ← Back to Sign In
              </span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

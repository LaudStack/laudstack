"use client";

/**
 * AuthGateModal — LaudStack
 * Full-featured login/signup popup modal that appears when unauthenticated
 * users try to vote, review, save, claim deals, or comment.
 *
 * Includes:
 *  - Sign In / Create Account tab toggle
 *  - Email + password form
 *  - LinkedIn OAuth button
 *  - Contextual messaging based on the action attempted
 */

import React, { useState } from "react";
import {
  X, Mail, Lock, Eye, EyeOff, User, ArrowRight,
  AlertCircle, LogIn, Star, Bookmark, Tag, MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createUserAfterSignup } from "@/app/actions/createUserAfterSignup";
import LaudIcon from "@/components/LaudIcon";

interface Props {
  open: boolean;
  onClose: () => void;
  action?: "upvote" | "laud" | "review" | "save" | "claim" | "claim_deal" | "comment" | "general";
}

const ACTION_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>; title: string; description: string }
> = {
  upvote: {
    icon: LaudIcon,
    title: "Sign in to Laud",
    description: "Join the LaudStack community to laud your favorite stacks and help others discover the best software.",
  },
  laud: {
    icon: LaudIcon,
    title: "Sign in to Laud",
    description: "Join the LaudStack community to laud your favorite stacks and help others discover the best software.",
  },
  review: {
    icon: Star,
    title: "Sign in to Write a Review",
    description: "Share your experience with the community. Sign in to write verified reviews.",
  },
  save: {
    icon: Bookmark,
    title: "Sign in to Save Tools",
    description: "Create your personal collection of tools. Sign in to bookmark and organize your favorites.",
  },
  claim: {
    icon: Tag,
    title: "Sign in to Claim This Stack",
    description: "Verify ownership of your stack and unlock Pro founder features.",
  },
  claim_deal: {
    icon: Tag,
    title: "Sign in to Claim This Deal",
    description: "Get exclusive discounts and offers. Sign in to claim deals.",
  },
  comment: {
    icon: MessageSquare,
    title: "Sign in to Comment",
    description: "Join the conversation — share your thoughts, ask questions, and engage with the community.",
  },
  general: {
    icon: LogIn,
    title: "Sign in to Continue",
    description: "Join LaudStack to access all features — laud stacks, write reviews, save favorites, and claim deals.",
  },
};

export default function AuthGateModal({ open, onClose, action = "general" }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"linkedin" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { signInWithEmail, signUpWithEmail, signInWithLinkedIn } = useAuth();
  const isSignUp = mode === "signup";

  const config = ACTION_CONFIG[action] || ACTION_CONFIG.general;
  const Icon = config.icon;

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setShowPass(false);
    setError(null);
    setLoading(false);
    setOauthLoading(null);
  };

  const handleClose = () => {
    resetForm();
    setMode("signin");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

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
        try {
          await createUserAfterSignup({
            supabaseId: result.supabaseId,
            email: cleanEmail,
            firstName: cleanFirst,
            lastName: cleanLast,
          });
        } catch (err) {
          console.error("[Signup] Failed to create DB user:", err);
        }
        toast.success("Account created! Welcome to LaudStack.");
        handleClose();
        router.push("/onboarding");
      } else {
        const { error: signInError } = await signInWithEmail(cleanEmail, cleanPassword);
        if (signInError) {
          if (signInError.toLowerCase().includes("invalid") || signInError.toLowerCase().includes("credentials")) {
            setError("Invalid email or password. Please try again.");
          } else {
            setError(signInError);
          }
          return;
        }
        toast.success("Welcome back!");
        handleClose();
        router.refresh();
      }
    } catch (err) {
      console.error("[Auth] Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedIn = async () => {
    setOauthLoading("linkedin");
    try {
      await signInWithLinkedIn();
    } catch {
      toast.error("LinkedIn sign-in failed. Please try again.");
      setOauthLoading(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — contextual icon + close */}
        <div className="px-6 pt-5 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Icon style={{ width: "18px", height: "18px", color: "#D97706" }} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">{config.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug max-w-[280px]">{config.description}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-6">
          {/* Tab toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
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
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* LinkedIn OAuth */}
          <button
            onClick={handleLinkedIn}
            disabled={!!oauthLoading || loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60 shadow-sm mb-4"
          >
            {oauthLoading === "linkedin" ? (
              <div className="w-4 h-4 border-2 border-[#0A66C2]/30 border-t-[#0A66C2] rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-sm font-semibold text-slate-700">Continue with LinkedIn</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white transition-all"
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white transition-all"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-600">Password</label>
                {!isSignUp && (
                  <Link href="/auth/reset-password" className="text-[11px] font-semibold text-amber-600 hover:text-amber-700" onClick={handleClose}>
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Min. 8 characters" : "••••••••"}
                  className="w-full pl-8 pr-9 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-white transition-all"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-slate-900 transition-all disabled:opacity-50 hover:brightness-105"
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
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 mt-3 leading-relaxed">
            {isSignUp ? (
              <>
                By creating an account you agree to our{" "}
                <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-semibold" onClick={handleClose}>Terms</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-semibold" onClick={handleClose}>Privacy Policy</Link>.
              </>
            ) : (
              <>Free forever. No credit card required.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

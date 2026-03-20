"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield, Lock, Mail, Eye, EyeOff, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, Check, X, KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { validateInviteToken, acceptAdminInvite } from "@/app/actions/admin-invites";

const ROLE_LABELS: Record<string, string> = {
  customer_rep: "Customer Rep",
  manager: "Manager",
  admin: "Admin",
  super_admin: "Super Admin",
};

function passwordStrength(pw: string): { score: number; checks: { label: string; met: boolean }[] } {
  const checks = [
    { label: "At least 8 characters", met: pw.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(pw) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(pw) },
    { label: "Contains a number", met: /[0-9]/.test(pw) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(pw) },
  ];
  return { score: checks.filter((c) => c.met).length, checks };
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;

  const [stage, setStage] = useState<"loading" | "invalid" | "signup" | "processing" | "done">("loading");
  const [error, setError] = useState("");
  const [invite, setInvite] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError("No invite token provided.");
      setStage("invalid");
      return;
    }

    (async () => {
      try {
        const result = await validateInviteToken(token);
        if (!result.valid) {
          setError(result.error || "Invalid invite.");
          setStage("invalid");
        } else {
          setInvite(result.invite);
          setStage("signup");
        }
      } catch (err: any) {
        setError(err.message || "Failed to validate invite.");
        setStage("invalid");
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite || !token) return;

    // Validate
    const { score } = passwordStrength(password);
    if (score < 4) {
      toast.error("Password is too weak. Please meet at least 4 requirements.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setSubmitting(true);
    setStage("processing");

    try {
      // Step 1: Sign up with Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (signUpError) {
        // If user already exists, try signing in
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: invite.email,
            password,
          });

          if (signInError) {
            toast.error("Account exists. Please sign in with your existing password, or use a different email.");
            setStage("signup");
            setSubmitting(false);
            return;
          }

          // Accept invite with existing user
          await acceptAdminInvite(token, signInData.user.id);
          setStage("done");
          setSubmitting(false);
          return;
        }

        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error("Failed to create account.");
      }

      // Step 2: Accept the invite (assign role in our DB)
      await acceptAdminInvite(token, signUpData.user.id);

      setStage("done");
    } catch (err: any) {
      console.error("Invite acceptance error:", err);
      toast.error(err.message || "Failed to accept invite.");
      setStage("signup");
    }

    setSubmitting(false);
  };

  const { score, checks } = passwordStrength(password);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-medium">Validating your invite...</p>
        </div>
      </div>
    );
  }

  // ─── Invalid ──────────────────────────────────────────────────────────────
  if (stage === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Invite</h1>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // ─── Done ─────────────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Welcome to the Team!</h1>
          <p className="text-slate-600 text-sm mb-2">
            Your account has been set up as <strong className="text-amber-600">{ROLE_LABELS[invite?.role] || invite?.role}</strong>.
          </p>
          <p className="text-slate-500 text-xs mb-6">You now have access to the admin panel.</p>
          <button
            onClick={() => router.push("/ops-console/gate")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Go to Admin Panel <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Processing ───────────────────────────────────────────────────────────
  if (stage === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-medium">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // ─── Signup form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Join LaudStack Admin</h1>
          <p className="text-slate-600 text-sm">
            Invited by <strong>{invite?.inviterName}</strong> as{" "}
            <span className="text-amber-600 font-semibold">{ROLE_LABELS[invite?.role] || invite?.role}</span>
          </p>
        </div>

        {/* Message from inviter */}
        {invite?.message && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Message from {invite.inviterName}</p>
            <p className="text-sm text-amber-900 italic">&ldquo;{invite.message}&rdquo;</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-6 space-y-5">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={invite?.email || ""}
                disabled
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength indicator */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= score
                          ? score <= 2
                            ? "bg-red-400"
                            : score <= 3
                            ? "bg-amber-400"
                            : "bg-green-400"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      {c.met ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <X className="w-3 h-3 text-slate-300" />
                      )}
                      <span className={`text-xs ${c.met ? "text-green-600" : "text-slate-400"}`}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200"
                }`}
              />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || score < 4 || password !== confirmPassword || !name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Setting up...
              </>
            ) : (
              <>
                Accept Invite & Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Expiration notice */}
        <p className="text-center text-xs text-slate-500 mt-4">
          This invite expires on{" "}
          {invite?.expiresAt
            ? new Date(invite.expiresAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "N/A"}
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}

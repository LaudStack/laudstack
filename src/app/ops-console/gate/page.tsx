"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import { isStaffRole } from "@/lib/permissions";

export default function AdminGate() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithEmail } = useAuth();
  const { dbUser, loading: dbLoading } = useDbUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already authenticated as admin
  useEffect(() => {
    if (!authLoading && !dbLoading && user && dbUser) {
      if (isStaffRole(dbUser.role)) {
        router.push("/ops-console/dashboard");
      }
    }
  }, [authLoading, dbLoading, user, dbUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      setError("Please enter your credentials");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Step 1: Authenticate with Supabase — get the user directly from the response
      const result = await signInWithEmail(cleanEmail, cleanPassword);
      if (result.error) {
        setError("Invalid credentials.");
        setLoading(false);
        return;
      }

      // The signInWithEmail now returns the user object directly from the Supabase response
      const signedInUser = result.user;
      if (!signedInUser) {
        setError("Authentication failed. No user returned.");
        setLoading(false);
        return;
      }

      // Step 2: Verify admin role via API route using the user ID from sign-in response
      const verifyRes = await fetch("/api/auth/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.authorized) {
        // Sign out if not admin
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        setError("Access denied. Insufficient privileges.");
        setLoading(false);
        return;
      }

      router.push("/ops-console/dashboard");
    } catch (err) {
      console.error("[Gate Error]", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)] bg-[size:40px_40px] pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-lg font-bold text-white">Secure Access</h1>
            <p className="text-sm text-slate-600 mt-1">Authorized personnel only</p>
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full h-11 px-4 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50 transition-all"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-11 px-4 pr-11 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50 transition-all"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-semibold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import { completeOnboarding } from "@/app/actions/user";
import { toast } from "sonner";
import {
  User, Briefcase, Building2, Target, ArrowRight,
  CheckCircle2, Sparkles, ChevronRight, Loader2
} from "lucide-react";

const USE_CASES = [
  { value: "discover", label: "Discover new stacks", icon: "🔍" },
  { value: "review", label: "Write reviews", icon: "⭐" },
  { value: "compare", label: "Compare tools", icon: "📊" },
  { value: "launch", label: "Launch my tool", icon: "🚀" },
  { value: "deals", label: "Find deals", icon: "💰" },
  { value: "research", label: "Market research", icon: "📈" },
];

const REFERRAL_SOURCES = [
  { value: "google", label: "Google Search" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "friend", label: "Friend / Colleague" },
  { value: "producthunt", label: "Product Hunt" },
  { value: "other", label: "Other" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { dbUser, loading: dbLoading } = useDbUser();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [headline, setHeadline] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [referralSource, setReferralSource] = useState("");

  // Pre-fill from existing data
  useEffect(() => {
    if (dbUser) {
      if (dbUser.firstName) setFirstName(dbUser.firstName);
      if (dbUser.lastName) setLastName(dbUser.lastName);
      if (dbUser.headline) setHeadline(dbUser.headline);
      if (dbUser.jobTitle) setJobTitle(dbUser.jobTitle ?? "");
      if (dbUser.company) setCompany(dbUser.company ?? "");
    }
  }, [dbUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // Redirect if already completed onboarding
  useEffect(() => {
    if (!dbLoading && dbUser?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [dbLoading, dbUser, router]);

  const handleComplete = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }
    setSaving(true);
    try {
      await completeOnboarding({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        headline: headline.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        company: company.trim() || undefined,
        useCase: useCase || undefined,
        referralSource: referralSource || undefined,
      });
      toast.success("Welcome to LaudStack!");
      router.push("/welcome");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-slate-900 font-black text-lg tracking-tight">LaudStack</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s < step
                      ? "bg-amber-400 text-white"
                      : s === step
                      ? "bg-amber-400 text-white ring-4 ring-amber-100"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 ${s < step ? "bg-amber-400" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Name & Headline */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                Let&apos;s set up your profile
              </h1>
              <p className="text-slate-500 text-sm">
                Tell us a bit about yourself so others can find and connect with you.
              </p>
            </div>

            {/* Preview avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-amber-400/20">
                {initials}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Product Designer at Acme"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">Shown on your public profile</p>
            </div>

            <button
              onClick={() => {
                if (!firstName.trim() || !lastName.trim()) {
                  toast.error("Please enter your first and last name");
                  return;
                }
                setStep(2);
              }}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-400/20"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (!firstName.trim() || !lastName.trim()) {
                  toast.error("Please enter your first and last name");
                  return;
                }
                handleComplete();
              }}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 2: Professional Info */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                What do you do?
              </h1>
              <p className="text-slate-500 text-sm">
                This helps us personalize your experience.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 inline mr-1" />
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Product Manager, Founder, Developer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                <Building2 className="w-3.5 h-3.5 inline mr-1" />
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Inc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                <Target className="w-3.5 h-3.5 inline mr-1" />
                What brings you to LaudStack?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {USE_CASES.map((uc) => (
                  <button
                    key={uc.value}
                    onClick={() => setUseCase(uc.value)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                      useCase === uc.value
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span>{uc.icon}</span>
                    <span>{uc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-400/20"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                One last thing
              </h1>
              <p className="text-slate-500 text-sm">
                How did you hear about us? This helps us grow.
              </p>
            </div>

            <div className="space-y-2">
              {REFERRAL_SOURCES.map((src) => (
                <button
                  key={src.value}
                  onClick={() => setReferralSource(src.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    referralSource === src.value
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{src.label}</span>
                  {referralSource === src.value && (
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Your Profile Preview
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 font-bold text-sm truncate">
                    {firstName} {lastName}
                  </p>
                  <p className="text-slate-500 text-xs truncate">
                    {headline || [jobTitle, company].filter(Boolean).join(" at ") || "LaudStack Member"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-400/20 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Complete Setup <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

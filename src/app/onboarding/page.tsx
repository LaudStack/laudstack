"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import { completeOnboarding } from "@/app/actions/user";
import { toast } from "sonner";
import {
  User, Briefcase, Building2, Target, ArrowRight,
  CheckCircle2, ChevronRight, Loader2, Camera,
  Upload, X, MapPin
} from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/logo_dark_transparent_47bd35ed.png";

const TOTAL_STEPS = 4;

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

  // Photo upload state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location state
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("");
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);

  // Pre-fill from existing data (LinkedIn data flows through auth callback → DB)
  useEffect(() => {
    if (dbUser) {
      if (dbUser.firstName) setFirstName(dbUser.firstName);
      if (dbUser.lastName) setLastName(dbUser.lastName);
      if (dbUser.headline) setHeadline(dbUser.headline);
      if (dbUser.jobTitle) setJobTitle(dbUser.jobTitle ?? "");
      if (dbUser.company) setCompany(dbUser.company ?? "");
      if (dbUser.avatarUrl) setAvatarUrl(dbUser.avatarUrl);
      if (dbUser.city) setCity(dbUser.city ?? "");
      if (dbUser.state) setStateRegion(dbUser.state ?? "");
      if (dbUser.country) setCountry(dbUser.country ?? "");
    }
  }, [dbUser]);

  // Auto-detect location via IP on mount
  useEffect(() => {
    if (locationDetected) return;
    // Only auto-detect if no location data exists
    if (city || stateRegion || country) return;
    
    const detectLocation = async () => {
      setLocationDetecting(true);
      try {
        // Try ip-api.com (free, no key required, 45 req/min)
        const res = await fetch("https://ip-api.com/json/?fields=city,regionName,country", {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.city) setCity(data.city);
          if (data.regionName) setStateRegion(data.regionName);
          if (data.country) setCountry(data.country);
          setLocationDetected(true);
        }
      } catch {
        // Silently fail — location is optional
        console.log("[Onboarding] IP location detection failed (non-critical)");
      } finally {
        setLocationDetecting(false);
      }
    };
    detectLocation();
  }, [locationDetected, city, stateRegion, country]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // Redirect staff/admin users to admin panel
  useEffect(() => {
    if (dbUser) {
      const staffRoles = ["customer_rep", "moderator", "analyst", "manager", "admin", "super_admin"];
      if (staffRoles.includes(dbUser.role ?? "")) {
        router.push("/ops-console/dashboard");
        return;
      }
    }
  }, [dbUser, router]);

  // Redirect if already completed onboarding
  useEffect(() => {
    if (!dbLoading && dbUser?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [dbLoading, dbUser, router]);

  // ─── Photo upload handler ──────────────────────────────────────────────
  const handleFileUpload = useCallback(async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const { url } = await res.json();
      setAvatarUrl(url);
      toast.success("Photo uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // ─── Complete onboarding ───────────────────────────────────────────────
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
        avatarUrl: avatarUrl || undefined,
        city: city.trim() || undefined,
        state: stateRegion.trim() || undefined,
        country: country.trim() || undefined,
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
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img
              src={LOGO_URL}
              alt="LaudStack"
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-8">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
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
                {s < TOTAL_STEPS && (
                  <div className={`w-10 h-0.5 ${s < step ? "bg-amber-400" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            Step 1: Name & Headline
        ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                Let&apos;s set up your profile
              </h1>
              <p className="text-slate-600 text-sm">
                Tell us a bit about yourself so others can find and connect with you.
              </p>
            </div>

            {/* Preview avatar */}
            <div className="flex justify-center mb-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-amber-400/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-amber-400/20">
                  {initials}
                </div>
              )}
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
              <p className="text-xs text-slate-500 mt-1">Shown on your public profile</p>
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
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            Step 2: Profile Photo
        ═══════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                Add a profile photo
              </h1>
              <p className="text-slate-600 text-sm">
                Profiles with photos get 3x more engagement. You can always change it later.
              </p>
            </div>

            {/* Photo upload area */}
            <div className="flex flex-col items-center gap-6">
              {/* Current photo or placeholder */}
              <div className="relative group">
                {avatarUrl ? (
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt="Profile photo"
                      className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                    />
                    <button
                      onClick={() => setAvatarUrl(null)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragOver
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50"
                    }`}
                  >
                    {avatarUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    ) : (
                      <>
                        <Camera className="w-7 h-7 text-slate-400 mb-1.5" />
                        <span className="text-xs text-slate-500 font-medium">Upload</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Drop zone / upload button */}
              {!avatarUrl && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`w-full p-6 rounded-2xl border-2 border-dashed text-center transition-all ${
                    dragOver
                      ? "border-amber-400 bg-amber-50"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-1">
                    Drag and drop your photo here, or{" "}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-amber-500 font-semibold hover:text-amber-600"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-slate-400">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex gap-3 mt-4">
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
                {avatarUrl ? "Continue" : "Skip for now"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            Step 3: Professional Info & Location
        ═══════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                What do you do?
              </h1>
              <p className="text-slate-600 text-sm">
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

            {/* Location — auto-detected */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                Location
                {locationDetecting && (
                  <span className="ml-2 text-amber-500 font-normal">
                    <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                    Detecting...
                  </span>
                )}
                {locationDetected && !locationDetecting && (
                  <span className="ml-2 text-green-500 font-normal text-[10px]">Auto-detected</span>
                )}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                />
                <input
                  type="text"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  placeholder="State"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">We auto-detect your location. Feel free to edit.</p>
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
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-400/20"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            Step 4: Referral Source & Final
        ═══════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                One last thing
              </h1>
              <p className="text-slate-600 text-sm">
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

            {/* Profile Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Your Profile Preview
              </p>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-slate-900 font-bold text-sm truncate">
                    {firstName} {lastName}
                  </p>
                  <p className="text-slate-500 text-xs truncate">
                    {headline || [jobTitle, company].filter(Boolean).join(" at ") || "LaudStack Member"}
                  </p>
                  {(city || country) && (
                    <p className="text-slate-400 text-xs truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {[city, stateRegion, country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
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

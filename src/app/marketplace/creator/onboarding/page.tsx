"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Rocket, CreditCard, Link2, CheckCircle, ArrowRight, ArrowLeft,
  Loader2, DollarSign, Shield, Users, TrendingUp, Store, Zap,
  ChevronRight, AlertCircle, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailVerificationModal from "@/components/EmailVerificationModal";

type Step = "intro" | "payment" | "stripe-connect" | "complete";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "intro", label: "Get Started", icon: Rocket },
  { id: "payment", label: "Onboarding Fee", icon: CreditCard },
  { id: "stripe-connect", label: "Payment Setup", icon: Link2 },
  { id: "complete", label: "Complete", icon: CheckCircle },
];

function CreatorOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const { dbUser, loading: dbLoading } = useDbUser();

  const stepParam = searchParams?.get("step") as Step | null;
  const paymentStatus = searchParams?.get("payment") ?? null;
  const refreshConnect = searchParams?.get("refresh") ?? null;

  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectStatus, setConnectStatus] = useState<{
    hasAccount: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  } | null>(null);

  // Determine initial step based on user state and URL params
  useEffect(() => {
    if (dbLoading || !dbUser) return;

    // If already a creator, redirect to dashboard
    if (dbUser.isMarketplaceCreator) {
      router.replace("/dashboard/creator");
      return;
    }

    // If returning from Stripe payment
    if (paymentStatus === "success" && stepParam === "stripe-connect") {
      setCurrentStep("stripe-connect");
      return;
    }

    // If returning from Stripe Connect onboarding
    if (stepParam === "complete") {
      setCurrentStep("complete");
      return;
    }

    // If URL has a step param
    if (stepParam && STEPS.some(s => s.id === stepParam)) {
      setCurrentStep(stepParam);
      return;
    }

    // Check if onboarding fee is already paid
    if (dbUser.creatorOnboardingStripeSessionId) {
      setCurrentStep("stripe-connect");
    }
  }, [dbUser, dbLoading, stepParam, paymentStatus, router]);

  // Check Stripe Connect status when on that step
  useEffect(() => {
    if (currentStep !== "stripe-connect" && currentStep !== "complete") return;

    const checkConnect = async () => {
      try {
        const res = await fetch("/api/stripe/connect-onboarding");
        if (res.ok) {
          const data = await res.json();
          setConnectStatus(data);

          // If fully onboarded, move to complete
          if (data.chargesEnabled && data.payoutsEnabled) {
            setCurrentStep("complete");
          }
        }
      } catch {
        console.error("Failed to check Connect status");
      }
    };

    checkConnect();
  }, [currentStep]);

  // Refresh Connect link if needed
  useEffect(() => {
    if (refreshConnect === "true" && currentStep === "stripe-connect") {
      toast.info("Your Stripe session expired. Please continue setup.");
    }
  }, [refreshConnect, currentStep]);

  const handlePayOnboardingFee = useCallback(async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/stripe/marketplace-onboarding", { method: "POST" });
      const data = await res.json();
      if (data.error === "EMAIL_NOT_VERIFIED") {
        setShowVerifyModal(true);
        setIsProcessing(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start payment");
        setIsProcessing(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  }, []);

  const handleStartStripeConnect = useCallback(async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/stripe/connect-onboarding", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start Stripe Connect setup");
        setIsProcessing(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  }, []);

  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <Store className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to become a Creator</h2>
            <p className="text-slate-500 mb-6">You need to be signed in to start selling on the LaudStack Marketplace.</p>
            <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors">
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <EmailVerificationModal
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={() => {
          setShowVerifyModal(false);
          handlePayOnboardingFee();
        }}
        actionLabel="become a marketplace creator"
      />
      <div style={{ height: "72px", flexShrink: 0 }} />

      <div className="flex-1 py-10 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === currentStepIndex;
              const isComplete = i < currentStepIndex;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isComplete ? "bg-green-500 border-green-500 text-white" :
                      isActive ? "bg-amber-500 border-amber-500 text-white" :
                      "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {isComplete ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? "text-amber-600" : isComplete ? "text-green-600" : "text-slate-400"
                    }`}>{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 mt-[-18px] ${
                      i < currentStepIndex ? "bg-green-400" : "bg-slate-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          {currentStep === "intro" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Become a Marketplace Creator</h1>
                <p className="text-slate-500 text-lg max-w-xl mx-auto">
                  Sell templates, SaaS boilerplates, micro-SaaS products, full apps, automation tools, and startup assets to thousands of builders.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: DollarSign, title: "Earn 88% of every sale", desc: "Low 12% platform commission. You keep the majority." },
                  { icon: Users, title: "Reach thousands of builders", desc: "Access our growing community of developers and founders." },
                  { icon: Shield, title: "Secure payments via Stripe", desc: "Stripe Connect handles payouts directly to your bank." },
                  { icon: TrendingUp, title: "Boost your products", desc: "Promote listings with featured placements and boosts." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8 text-center">
                <p className="text-sm text-amber-700 font-medium mb-1">One-time onboarding fee</p>
                <p className="text-4xl font-bold text-amber-600">$39</p>
                <p className="text-xs text-amber-600 mt-1">Lifetime access. No monthly fees. No hidden costs.</p>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">What you can sell:</h3>
                <div className="flex flex-wrap gap-2">
                  {["Templates", "SaaS Boilerplates", "Micro-SaaS", "Full Apps", "Automation Tools", "Startup Assets"].map(cat => (
                    <span key={cat} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{cat}</span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentStep("payment")}
                className="w-full py-3.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentStep === "payment" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10">
              <button onClick={() => setCurrentStep("intro")} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700 mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Pay Onboarding Fee</h2>
                <p className="text-slate-600">One-time payment of <strong className="text-amber-600">$39</strong> to activate your creator account.</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">What you get:</h3>
                <ul className="space-y-2">
                  {[
                    "Lifetime creator account access",
                    "Unlimited product listings",
                    "Stripe Connect payouts (88% of every sale)",
                    "Creator dashboard with analytics",
                    "Make Offer negotiation system for high-value products",
                    "Product boost and promotion tools",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handlePayOnboardingFee}
                disabled={isProcessing}
                className="w-full py-3.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Pay $39 &amp; Continue</>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-3">
                Secure payment powered by Stripe. You&apos;ll be redirected to complete payment.
              </p>
            </div>
          )}

          {currentStep === "stripe-connect" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Up Stripe Connect</h2>
                <p className="text-slate-600">Connect your Stripe account to receive payouts from sales.</p>
              </div>

              {connectStatus?.chargesEnabled && connectStatus?.payoutsEnabled ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-semibold">Stripe Connect is set up!</p>
                  <p className="text-green-600 text-sm mt-1">Your account is ready to receive payments.</p>
                </div>
              ) : connectStatus?.hasAccount && !connectStatus?.chargesEnabled ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-700 font-semibold text-sm">Setup incomplete</p>
                      <p className="text-amber-600 text-xs mt-1">Please complete your Stripe Connect onboarding to start receiving payments.</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">How it works:</h3>
                <ul className="space-y-2">
                  {[
                    "You'll be redirected to Stripe to set up your Express account",
                    "Provide your business/personal details and bank account",
                    "Once verified, you'll receive 88% of every sale directly",
                    "Payouts are processed automatically by Stripe",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={connectStatus?.chargesEnabled ? () => setCurrentStep("complete") : handleStartStripeConnect}
                disabled={isProcessing}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe...</>
                ) : connectStatus?.chargesEnabled ? (
                  <><CheckCircle className="w-4 h-4" /> Continue to Dashboard</>
                ) : connectStatus?.hasAccount ? (
                  <><ExternalLink className="w-4 h-4" /> Continue Stripe Setup</>
                ) : (
                  <><Link2 className="w-4 h-4" /> Set Up Stripe Connect</>
                )}
              </button>
            </div>
          )}

          {currentStep === "complete" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">You&apos;re All Set!</h2>
              <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                Your creator account is active. Start listing your products on the LaudStack Marketplace.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard/creator"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <Store className="w-4 h-4" /> Go to Creator Dashboard
                </Link>
                <Link
                  href="/marketplace/submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Zap className="w-4 h-4" /> List Your First Product
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── Suspense wrapper required for useSearchParams ────────────────────────────
export default function CreatorOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CreatorOnboardingContent />
    </Suspense>
  );
}

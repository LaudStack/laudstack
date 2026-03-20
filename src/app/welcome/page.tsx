"use client";

// Welcome.tsx — Post-onboarding page
// Design: Clean, celebratory, action-oriented — gets users to their first value quickly

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Star, Bookmark, Rocket, Search, ArrowRight,
  ChevronRight, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/logo_dark_transparent_47bd35ed.png";

const ONBOARDING_STEPS = [
  {
    id: "explore",
    icon: Search,
    title: "Explore stacks",
    description:
      "Browse SaaS and AI stacks across 15 categories. Use Cmd+K to search instantly.",
    cta: "Browse Stacks",
    href: "/tools",
    color: "text-sky-500",
    bg: "bg-sky-50",
    border: "border-sky-100",
  },
  {
    id: "save",
    icon: Bookmark,
    title: "Save your favourites",
    description:
      "Bookmark stacks you want to try later. Your saved list is always one click away.",
    cta: "View Saved",
    href: "/saved",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    id: "review",
    icon: Star,
    title: "Write your first review",
    description:
      "Share your experience with a stack you've used. Your review helps thousands of buyers.",
    cta: "Browse to Review",
    href: "/tools",
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    id: "launch",
    icon: Rocket,
    title: "Launch your stack",
    description:
      "Are you a founder? Launch your AI or SaaS stack and reach thousands of buyers.",
    cta: "Go to LaunchPad",
    href: "/launchpad",
    color: "text-green-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
];

export default function Welcome() {
  const { user } = useAuth();
  const { dbUser } = useDbUser();
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const firstName =
    dbUser?.firstName ||
    (
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User"
    )
      ?.split(" ")[0] || "there";

  const avatarUrl = dbUser?.avatarUrl || user?.user_metadata?.avatar_url;

  const markDone = (id: string) => {
    setCompletedSteps((prev) => new Set(Array.from(prev).concat(id)));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 mt-[60px] lg:mt-[64px]">
        {/* ── Hero ── */}
        <div className="relative bg-gradient-to-br from-slate-50 via-white to-amber-50/30 border-b border-slate-200 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_60%)]" />
          <div className="max-w-4xl mx-auto px-4 py-16 text-center relative">
            {/* Avatar or confetti */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={firstName}
                className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6 shadow-lg shadow-amber-400/15 border-2 border-white"
              />
            ) : (
              <div className="text-3xl sm:text-5xl mb-6">🎉</div>
            )}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Account Activated
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
              Welcome to LaudStack,
              <br />
              <span className="text-amber-500">{firstName}!</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
              You&apos;re now part of a growing community of buyers, founders,
              and reviewers shaping the future of SaaS &amp; AI.
            </p>
          </div>
        </div>

        {/* ── Onboarding checklist ── */}
        <div className="max-w-4xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Get started in 4 steps
            </h2>
            <p className="text-slate-600">
              Complete these to get the most out of LaudStack.
            </p>
            {completedSteps.size > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-3 bg-emerald-50 border border-emerald-100 text-green-600 text-sm font-semibold px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completedSteps.size} of {ONBOARDING_STEPS.length} completed
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ONBOARDING_STEPS.map((step) => {
              const Icon = step.icon;
              const done = completedSteps.has(step.id);
              return (
                <div
                  key={step.id}
                  className={`relative border rounded-2xl p-6 transition-all duration-200 ${
                    done
                      ? "border-emerald-200 bg-emerald-50/50"
                      : `${step.border} ${step.bg} hover:shadow-md`
                  }`}
                >
                  {done && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      done
                        ? "bg-emerald-100"
                        : "bg-white border border-slate-200"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${done ? "text-green-500" : step.color}`}
                    />
                  </div>
                  <h3
                    className={`font-bold text-lg mb-1.5 ${
                      done ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed mb-4 ${
                      done ? "text-green-600/80" : "text-slate-500"
                    }`}
                  >
                    {step.description}
                  </p>
                  {!done && (
                    <Link href={step.href}>
                      <button
                        onClick={() => markDone(step.id)}
                        className={`inline-flex items-center gap-1.5 text-sm font-bold ${step.color} hover:opacity-80 transition-opacity`}
                      >
                        {step.cta} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  )}
                  {done && (
                    <span className="text-green-600 text-sm font-semibold">
                      Done
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Go to dashboard CTA */}
          <div className="mt-10 text-center">
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-400/25">
                Go to my Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <p className="text-slate-500 text-sm mt-3">
              Or{" "}
              <Link href="/">
                <span className="text-amber-500 hover:text-amber-600 font-semibold cursor-pointer">
                  explore the homepage
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

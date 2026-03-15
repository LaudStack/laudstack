"use client";
/**
 * Stack Finder — LaudStack Guided Comparison Engine
 *
 * A multi-step form that matches users to the best AI & SaaS tools
 * based on their use case, team, budget, and priorities.
 *
 * Design: Enterprise-grade, clean white, G2-inspired, amber accent.
 */
import { useState, useTransition, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass, ArrowRight, ArrowLeft, ChevronUp, Star,
  Check, Sparkles, Shield, TrendingUp, Zap, Heart,
  DollarSign, Users, Building2, Briefcase, Search,
  RotateCcw, ExternalLink, Filter, Loader2, CheckCircle2,
  Award, Gem, Rocket, Target, Crown, Eye
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoWithFallback from "@/components/LogoWithFallback";
import { CATEGORY_META } from "@/lib/categories";
import { findMatchingStacks, type StackFinderInput, type StackFinderResult, type StackFinderResponse } from "@/app/actions/stack-finder";
import type { Tool } from "@/lib/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Use Case", icon: Target },
  { id: 2, label: "Your Team", icon: Users },
  { id: 3, label: "Budget", icon: DollarSign },
  { id: 4, label: "Priorities", icon: Sparkles },
];

const BUSINESS_TYPES = [
  { value: "startup", label: "Startup", icon: Rocket, desc: "Early-stage or growth company" },
  { value: "small_business", label: "Small Business", icon: Building2, desc: "Established small company" },
  { value: "mid_market", label: "Mid-Market", icon: Briefcase, desc: "50-500 employees" },
  { value: "enterprise", label: "Enterprise", icon: Crown, desc: "500+ employees" },
  { value: "freelancer", label: "Freelancer / Solo", icon: Users, desc: "Independent professional" },
  { value: "agency", label: "Agency", icon: Gem, desc: "Service agency or consultancy" },
  { value: "nonprofit", label: "Non-Profit", icon: Heart, desc: "Non-profit organization" },
];

const TEAM_SIZES = [
  { value: "1", label: "Just me", desc: "Solo user" },
  { value: "2_10", label: "2 – 10", desc: "Small team" },
  { value: "11_50", label: "11 – 50", desc: "Growing team" },
  { value: "51_200", label: "51 – 200", desc: "Mid-size org" },
  { value: "200_plus", label: "200+", desc: "Large org" },
];

const BUDGET_OPTIONS = [
  { value: "free_only", label: "Free only", desc: "No budget for tools" },
  { value: "under_50", label: "Under $50/mo", desc: "Lean budget" },
  { value: "50_200", label: "$50 – $200/mo", desc: "Standard budget" },
  { value: "200_500", label: "$200 – $500/mo", desc: "Growth budget" },
  { value: "500_plus", label: "$500+/mo", desc: "Enterprise budget" },
  { value: "no_limit", label: "No budget limit", desc: "Best tool wins" },
];

const PRICING_MODELS = [
  { value: "Free", label: "Free" },
  { value: "Freemium", label: "Freemium" },
  { value: "Free Trial", label: "Free Trial" },
  { value: "Paid", label: "Paid" },
  { value: "Open Source", label: "Open Source" },
];

const PRIORITIES = [
  { value: "community_trust", label: "Community Trust", icon: Star, desc: "Highest rated by users" },
  { value: "popularity", label: "Most Popular", icon: Heart, desc: "Most lauded by community" },
  { value: "new_innovative", label: "New & Innovative", icon: Zap, desc: "Recently launched" },
  { value: "verified_established", label: "Verified & Established", icon: Shield, desc: "Proven track record" },
  { value: "best_value", label: "Best Value", icon: DollarSign, desc: "Maximum value for money" },
  { value: "feature_rich", label: "Feature Rich", icon: Gem, desc: "Most capabilities" },
];

const RESULT_SORT_OPTIONS = [
  { value: "match", label: "Best Match" },
  { value: "rating", label: "Top Rated" },
  { value: "lauds", label: "Most Lauded" },
  { value: "newest", label: "Newest" },
];

// ─── Progress Bar ────────────────────────────────────────────────────────────

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i + 1 === currentStep;
          const isComplete = i + 1 < currentStep;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isComplete
                    ? "bg-amber-500 text-white"
                    : isActive
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:block transition-colors ${
                  isActive ? "text-slate-900" : isComplete ? "text-amber-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`hidden sm:block w-12 lg:w-20 h-0.5 mx-2 transition-colors duration-300 ${
                    isComplete ? "bg-amber-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1: Use Case ────────────────────────────────────────────────────────

function StepUseCase({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (cat: string) => void;
}) {
  const categories = CATEGORY_META.filter(c => c.name !== "All" && c.name !== "Other");

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          What are you looking for?
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Select one or more categories that match your needs
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(cat => {
          const isSelected = selected.includes(cat.name);
          return (
            <button
              key={cat.name}
              onClick={() => onToggle(cat.name)}
              className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-xl mb-1.5 block">{cat.icon}</span>
              <span className={`text-sm font-bold block ${isSelected ? "text-amber-800" : "text-slate-800"}`}>
                {cat.name}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block leading-tight">
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Team ────────────────────────────────────────────────────────────

function StepTeam({
  businessType,
  teamSize,
  onBusinessType,
  onTeamSize,
}: {
  businessType: string;
  teamSize: string;
  onBusinessType: (v: string) => void;
  onTeamSize: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Tell us about your team
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          This helps us recommend stacks that fit your scale
        </p>
      </div>

      {/* Business Type */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Business Type
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BUSINESS_TYPES.map(bt => {
            const Icon = bt.icon;
            const isSelected = businessType === bt.value;
            return (
              <button
                key={bt.value}
                onClick={() => onBusinessType(bt.value)}
                className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-amber-600" : "text-slate-400"}`} />
                <span className={`text-sm font-bold block ${isSelected ? "text-amber-800" : "text-slate-800"}`}>
                  {bt.label}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{bt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Size */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Team Size
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {TEAM_SIZES.map(ts => {
            const isSelected = teamSize === ts.value;
            return (
              <button
                key={ts.value}
                onClick={() => onTeamSize(ts.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <span className={`text-lg font-extrabold block ${isSelected ? "text-amber-700" : "text-slate-800"}`}>
                  {ts.label}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{ts.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Budget ──────────────────────────────────────────────────────────

function StepBudget({
  budget,
  pricingPreferences,
  onBudget,
  onTogglePricing,
}: {
  budget: string;
  pricingPreferences: string[];
  onBudget: (v: string) => void;
  onTogglePricing: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          What&apos;s your budget?
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          We&apos;ll find stacks that fit your budget range
        </p>
      </div>

      {/* Budget Range */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Monthly Budget
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map(bo => {
            const isSelected = budget === bo.value;
            return (
              <button
                key={bo.value}
                onClick={() => onBudget(bo.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className={`text-sm font-bold block ${isSelected ? "text-amber-800" : "text-slate-800"}`}>
                  {bo.label}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{bo.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Model Preferences */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Pricing Model Preference <span className="text-slate-400 normal-case font-medium">(optional)</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRICING_MODELS.map(pm => {
            const isSelected = pricingPreferences.includes(pm.value);
            return (
              <button
                key={pm.value}
                onClick={() => onTogglePricing(pm.value)}
                className={`px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                {pm.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Priorities ──────────────────────────────────────────────────────

function StepPriorities({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          What matters most to you?
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Select up to 3 priorities to fine-tune your results
          <span className="text-slate-400 ml-1">(optional)</span>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {PRIORITIES.map(p => {
          const Icon = p.icon;
          const isSelected = selected.includes(p.value);
          const isDisabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={p.value}
              onClick={() => !isDisabled && onToggle(p.value)}
              disabled={isDisabled}
              className={`group relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                isDisabled
                  ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                  : isSelected
                  ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100 cursor-pointer"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm cursor-pointer"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-amber-600" : "text-slate-400"}`} />
              <span className={`text-sm font-bold block mb-0.5 ${isSelected ? "text-amber-800" : "text-slate-800"}`}>
                {p.label}
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-tight">{p.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Match Badge ─────────────────────────────────────────────────────────────

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 60
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${color}`}>
      <Target className="w-3 h-3" />
      {score}% Match
    </span>
  );
}

// ─── Result Card ─────────────────────────────────────────────────────────────

function ResultCard({ result, rank }: { result: StackFinderResult; rank: number }) {
  const { tool, matchScore, matchReasons } = result;
  const router = useRouter();

  return (
    <div
      className="group bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:border-amber-200 cursor-pointer"
      onClick={() => router.push(`/tools/${tool.slug}`)}
    >
      <div className="flex items-start gap-4">
        {/* Rank number */}
        <div className="hidden sm:flex flex-col items-center gap-1 pt-1">
          <span className={`text-lg font-extrabold ${rank <= 3 ? "text-amber-500" : "text-slate-300"}`}>
            #{rank}
          </span>
        </div>

        {/* Logo */}
        <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-10 h-10 object-contain" fallbackSize="text-xl" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                  {tool.name}
                </h3>
                {tool.is_verified && (
                  <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
                <MatchBadge score={matchScore} />
              </div>
              <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{tool.tagline}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-amber-500 flex-shrink-0 mt-1 transition-colors" />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-900">
                {tool.average_rating > 0 ? tool.average_rating.toFixed(1) : "N/A"}
              </span>
              {tool.review_count > 0 && (
                <span className="text-xs text-slate-400 font-medium">({tool.review_count})</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-bold text-slate-700">{tool.upvote_count}</span>
              <span className="text-xs text-slate-400 font-medium">Lauds</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                tool.pricing_model === "Free" || tool.pricing_model === "Open Source"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : tool.pricing_model === "Freemium"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {tool.pricing_model}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
              {tool.category}
            </span>
          </div>

          {/* Match reasons */}
          {matchReasons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {matchReasons.map((reason, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Results Section ─────────────────────────────────────────────────────────

function ResultsSection({
  response,
  onRefine,
}: {
  response: StackFinderResponse;
  onRefine: () => void;
}) {
  const [sortBy, setSortBy] = useState("match");

  const sortedResults = useMemo(() => {
    const results = [...response.results];
    switch (sortBy) {
      case "rating":
        results.sort((a, b) => b.tool.average_rating - a.tool.average_rating);
        break;
      case "lauds":
        results.sort((a, b) => b.tool.upvote_count - a.tool.upvote_count);
        break;
      case "newest":
        results.sort((a, b) => new Date(b.tool.launched_at).getTime() - new Date(a.tool.launched_at).getTime());
        break;
      default: // "match" — already sorted by matchScore
        break;
    }
    return results;
  }, [response.results, sortBy]);

  return (
    <div>
      {/* Results header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {response.totalMatched > 0
              ? `We found ${response.totalMatched} stack${response.totalMatched !== 1 ? "s" : ""} for you`
              : "No stacks matched your criteria"}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {response.totalMatched > 0
              ? `Showing the top ${response.results.length} results ranked by match score`
              : "Try broadening your categories or budget range"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefine}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refine Search
          </button>
        </div>
      </div>

      {/* Sort bar */}
      {response.results.length > 0 && (
        <div className="flex items-center gap-2 mb-5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
          {RESULT_SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === opt.value
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Results grid */}
      {sortedResults.length > 0 ? (
        <div className="space-y-3">
          {sortedResults.map((result, i) => (
            <ResultCard key={result.tool.id} result={result} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-extrabold text-slate-700 mb-2">No matching stacks found</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Try selecting more categories, expanding your budget range, or removing pricing model filters to see more results.
          </p>
          <button
            onClick={onRefine}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Adjust Your Criteria
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function StackFinderPage() {
  // Form state
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [businessType, setBusinessType] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [budget, setBudget] = useState("");
  const [pricingPreferences, setPricingPreferences] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  // Results state
  const [response, setResponse] = useState<StackFinderResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Handlers
  const toggleCategory = useCallback((cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const togglePricing = useCallback((pm: string) => {
    setPricingPreferences(prev =>
      prev.includes(pm) ? prev.filter(p => p !== pm) : [...prev, pm]
    );
  }, []);

  const togglePriority = useCallback((p: string) => {
    setPriorities(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : prev.length < 3 ? [...prev, p] : prev
    );
  }, []);

  const canProceed = () => {
    switch (step) {
      case 1: return categories.length > 0;
      case 2: return businessType !== "" && teamSize !== "";
      case 3: return budget !== "";
      case 4: return true; // optional step
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const input: StackFinderInput = {
      categories,
      businessType,
      teamSize,
      budget,
      pricingPreferences,
      priorities,
    };

    startTransition(async () => {
      const result = await findMatchingStacks(input);
      setResponse(result);
      setShowResults(true);
    });
  };

  const handleRefine = () => {
    setShowResults(false);
    setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b border-slate-200 pt-[84px] pb-8">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-5">
            <Link href="/" className="text-xs text-slate-400 no-underline font-medium hover:text-slate-600 transition-colors">
              Home
            </Link>
            <span className="text-[11px] text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-semibold">Stack Finder</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Stack Finder
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Answer a few questions and we&apos;ll match you with the best stacks for your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="flex-1 py-8 sm:py-10">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {showResults && response ? (
            <ResultsSection response={response} onRefine={handleRefine} />
          ) : isPending ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-200 mb-5">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Finding your perfect stacks...</h3>
              <p className="text-sm text-slate-500 font-medium">
                Analyzing {categories.length} categor{categories.length !== 1 ? "ies" : "y"} across our database
              </p>
            </div>
          ) : (
            <>
              <ProgressBar currentStep={step} totalSteps={4} />

              {/* Step content */}
              <div className="max-w-4xl mx-auto">
                {step === 1 && (
                  <StepUseCase selected={categories} onToggle={toggleCategory} />
                )}
                {step === 2 && (
                  <StepTeam
                    businessType={businessType}
                    teamSize={teamSize}
                    onBusinessType={setBusinessType}
                    onTeamSize={setTeamSize}
                  />
                )}
                {step === 3 && (
                  <StepBudget
                    budget={budget}
                    pricingPreferences={pricingPreferences}
                    onBudget={setBudget}
                    onTogglePricing={togglePricing}
                  />
                )}
                {step === 4 && (
                  <StepPriorities selected={priorities} onToggle={togglePriority} />
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleBack}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      step === 1
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="flex items-center gap-3">
                    {step === 4 && (
                      <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Skip & Find Stacks
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                        canProceed()
                          ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200 cursor-pointer"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {step === 4 ? (
                        <>
                          Find My Stacks
                          <Sparkles className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

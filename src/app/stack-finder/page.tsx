"use client";
/**
 * Stack Finder — LaudStack Guided Comparison Engine
 *
 * Mobile-first: one question at a time, auto-advance on single-select,
 * scroll-to-top on every transition, smooth back navigation.
 *
 * Design: Enterprise-grade, clean white, amber accent, no gradients.
 */
import { useState, useTransition, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass, ArrowRight, ArrowLeft, ChevronUp, Star,
  Check, Sparkles, Shield, Zap, Heart,
  DollarSign, Users, Building2, Briefcase, Search,
  RotateCcw, ExternalLink, Filter, Loader2, CheckCircle2,
  Gem, Rocket, Target, Crown
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoWithFallback from "@/components/LogoWithFallback";
import { CATEGORY_META } from "@/lib/categories";
import {
  findMatchingStacks,
  type StackFinderInput,
  type StackFinderResult,
  type StackFinderResponse,
} from "@/app/actions/stack-finder";

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Sub-steps: the form is broken into 6 micro-steps so that on mobile
 * each screen shows exactly one question. On desktop the visual grouping
 * still makes sense because the progress bar maps to 4 logical phases.
 *
 * Sub-step mapping:
 *   1 → Use Case (multi-select categories)
 *   2 → Business Type (single-select, auto-advance)
 *   3 → Team Size (single-select, auto-advance)
 *   4 → Budget (single-select, auto-advance)
 *   5 → Pricing Preferences (multi-select, optional)
 *   6 → Priorities (multi-select, optional)
 */
const TOTAL_SUB_STEPS = 6;

/** Maps sub-step → visual progress phase (1-4) for the progress bar */
function subStepToPhase(sub: number): number {
  if (sub <= 1) return 1;
  if (sub <= 3) return 2;
  if (sub <= 5) return 3;
  return 4;
}

const PHASE_LABELS = [
  { id: 1, label: "Use Case", icon: Target },
  { id: 2, label: "Your Team", icon: Users },
  { id: 3, label: "Budget", icon: DollarSign },
  { id: 4, label: "Priorities", icon: Sparkles },
];

const BUSINESS_TYPES = [
  { value: "startup", label: "Startup", icon: Rocket, desc: "Early-stage or growth company" },
  { value: "small_business", label: "Small Business", icon: Building2, desc: "Established small company" },
  { value: "mid_market", label: "Mid-Market", icon: Briefcase, desc: "50–500 employees" },
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

// ─── Scroll helper ──────────────────────────────────────────────────────────

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

function ProgressBar({ currentPhase }: { currentPhase: number }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-10">
      <div className="flex items-center justify-between">
        {PHASE_LABELS.map((phase, i) => {
          const StepIcon = phase.icon;
          const isActive = phase.id === currentPhase;
          const isComplete = phase.id < currentPhase;
          return (
            <div key={phase.id} className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isComplete
                    ? "bg-amber-500 text-white"
                    : isActive
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {isComplete ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <StepIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-semibold hidden sm:block transition-colors ${
                  isActive ? "text-slate-900" : isComplete ? "text-amber-600" : "text-slate-400"
                }`}
              >
                {phase.label}
              </span>
              {i < PHASE_LABELS.length - 1 && (
                <div
                  className={`w-6 sm:w-12 lg:w-20 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
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

// ─── Question Header ────────────────────────────────────────────────────────

function QuestionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5 sm:mb-2">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>
    </div>
  );
}

// ─── Sub-step 1: Use Case ───────────────────────────────────────────────────

function StepUseCase({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (cat: string) => void;
}) {
  const categories = CATEGORY_META.filter((c) => c.name !== "All" && c.name !== "Other");

  return (
    <div>
      <QuestionHeader
        title="What are you looking for?"
        subtitle="Select one or more categories that match your needs"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const isSelected = selected.includes(cat.name);
          return (
            <button
              key={cat.name}
              onClick={() => onToggle(cat.name)}
              className={`group relative p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
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
              <span className="text-lg sm:text-xl mb-1 sm:mb-1.5 block">{cat.icon}</span>
              <span className={`text-xs sm:text-sm font-bold block ${isSelected ? "text-amber-800" : "text-slate-800"}`}>
                {cat.name}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 block leading-tight">
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-step 2: Business Type (single-select, auto-advance) ────────────────

function StepBusinessType({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <QuestionHeader
        title="What type of organization?"
        subtitle="This helps us recommend stacks that fit your scale"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 max-w-3xl mx-auto">
        {BUSINESS_TYPES.map((bt) => {
          const Icon = bt.icon;
          const isSelected = selected === bt.value;
          return (
            <button
              key={bt.value}
              onClick={() => onSelect(bt.value)}
              className={`group relative p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
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
  );
}

// ─── Sub-step 3: Team Size (single-select, auto-advance) ────────────────────

function StepTeamSize({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <QuestionHeader
        title="How big is your team?"
        subtitle="We'll tailor results to your team's size"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 max-w-3xl mx-auto">
        {TEAM_SIZES.map((ts) => {
          const isSelected = selected === ts.value;
          return (
            <button
              key={ts.value}
              onClick={() => onSelect(ts.value)}
              className={`p-4 sm:p-5 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <span className={`text-base sm:text-lg font-extrabold block ${isSelected ? "text-amber-700" : "text-slate-800"}`}>
                {ts.label}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{ts.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-step 4: Budget (single-select, auto-advance) ───────────────────────

function StepBudget({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <QuestionHeader
        title="What's your monthly budget?"
        subtitle="We'll find stacks that fit your budget range"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 max-w-3xl mx-auto">
        {BUDGET_OPTIONS.map((bo) => {
          const isSelected = selected === bo.value;
          return (
            <button
              key={bo.value}
              onClick={() => onSelect(bo.value)}
              className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <span className={`text-sm font-bold block ${isSelected ? "text-amber-800" : "text-slate-800"}`}>
                {bo.label}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{bo.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-step 5: Pricing Preferences (multi-select, optional) ───────────────

function StepPricingPrefs({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <QuestionHeader
        title="Any pricing model preference?"
        subtitle="Filter by pricing type — or skip to see all"
      />
      <div className="flex flex-wrap gap-2.5 justify-center max-w-xl mx-auto">
        {PRICING_MODELS.map((pm) => {
          const isSelected = selected.includes(pm.value);
          return (
            <button
              key={pm.value}
              onClick={() => onToggle(pm.value)}
              className={`px-5 py-3 rounded-full border-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
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
      <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
        This is optional — leave unselected to see all pricing models
      </p>
    </div>
  );
}

// ─── Sub-step 6: Priorities (multi-select, optional) ────────────────────────

function StepPriorities({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <QuestionHeader
        title="What matters most to you?"
        subtitle="Select up to 3 priorities to fine-tune results (optional)"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 max-w-3xl mx-auto">
        {PRIORITIES.map((p) => {
          const Icon = p.icon;
          const isSelected = selected.includes(p.value);
          const isDisabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={p.value}
              onClick={() => !isDisabled && onToggle(p.value)}
              disabled={isDisabled}
              className={`group relative p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 ${
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
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 ${isSelected ? "text-amber-600" : "text-slate-400"}`} />
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
    <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-extrabold border ${color}`}>
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
      className="group bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:border-amber-200 cursor-pointer"
      onClick={() => router.push(`/tools/${tool.slug}`)}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Rank number */}
        <div className="flex flex-col items-center gap-1 pt-0.5 sm:pt-1">
          <span className={`text-base sm:text-lg font-extrabold ${rank <= 3 ? "text-amber-500" : "text-slate-300"}`}>
            #{rank}
          </span>
        </div>

        {/* Logo */}
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" fallbackSize="text-lg sm:text-xl" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                  {tool.name}
                </h3>
                {tool.is_verified && (
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                )}
                <MatchBadge score={matchScore} />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-1">{tool.tagline}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:text-amber-500 flex-shrink-0 mt-0.5 sm:mt-1 transition-colors" />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-2.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {tool.average_rating > 0 ? tool.average_rating.toFixed(1) : "N/A"}
              </span>
              {tool.review_count > 0 && (
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">({tool.review_count})</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-700">{tool.upvote_count}</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Lauds</span>
            </div>
            <span
              className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-md border ${
                tool.pricing_model === "Free" || tool.pricing_model === "Open Source"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : tool.pricing_model === "Freemium"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {tool.pricing_model}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 sm:px-2.5 py-0.5 rounded-md border border-slate-200">
              {tool.category}
            </span>
          </div>

          {/* Match reasons */}
          {matchReasons.length > 0 && (
            <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
              {matchReasons.map((reason, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 sm:px-2 py-0.5 rounded-md"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
        results.sort(
          (a, b) =>
            new Date(b.tool.launched_at).getTime() -
            new Date(a.tool.launched_at).getTime()
        );
        break;
      default:
        break;
    }
    return results;
  }, [response.results, sortBy]);

  return (
    <div>
      {/* Results header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {response.totalMatched > 0
              ? `We found ${response.totalMatched} stack${response.totalMatched !== 1 ? "s" : ""} for you`
              : "No stacks matched your criteria"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {response.totalMatched > 0
              ? `Showing the top ${response.results.length} results ranked by match score`
              : "Try broadening your categories or budget range"}
          </p>
        </div>
        <button
          onClick={onRefine}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refine Search
        </button>
      </div>

      {/* Sort bar */}
      {response.results.length > 0 && (
        <div className="flex items-center gap-2 mb-4 sm:mb-5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Sort:</span>
          {RESULT_SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
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

      {/* Results list */}
      {sortedResults.length > 0 ? (
        <div className="space-y-2.5 sm:space-y-3">
          {sortedResults.map((result, i) => (
            <ResultCard key={result.tool.id} result={result} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-slate-200">
          <Search className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-extrabold text-slate-700 mb-2">No matching stacks found</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-5 sm:mb-6 max-w-md mx-auto px-4">
            Try selecting more categories, expanding your budget range, or removing pricing model filters.
          </p>
          <button
            onClick={onRefine}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors cursor-pointer"
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
  // Sub-step state (1-6)
  const [subStep, setSubStep] = useState(1);

  // Form state
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

  // Ref for auto-advance timeout
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  // Scroll to top on every sub-step change
  useEffect(() => {
    scrollToTop();
  }, [subStep, showResults]);

  // ── Navigation helpers ──────────────────────────────────────────────────

  const goToSubStep = useCallback((target: number) => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    setSubStep(target);
  }, []);

  const goNext = useCallback(() => {
    if (subStep < TOTAL_SUB_STEPS) {
      goToSubStep(subStep + 1);
    } else {
      handleSubmit();
    }
  }, [subStep]);

  const goBack = useCallback(() => {
    if (subStep > 1) goToSubStep(subStep - 1);
  }, [subStep, goToSubStep]);

  /**
   * Auto-advance after a single-select choice.
   * Adds a short delay so the user sees their selection highlight.
   */
  const autoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      setSubStep((prev) => Math.min(prev + 1, TOTAL_SUB_STEPS));
    }, 350);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────

  const toggleCategory = useCallback((cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const selectBusinessType = useCallback(
    (v: string) => {
      setBusinessType(v);
      autoAdvance();
    },
    [autoAdvance]
  );

  const selectTeamSize = useCallback(
    (v: string) => {
      setTeamSize(v);
      autoAdvance();
    },
    [autoAdvance]
  );

  const selectBudget = useCallback(
    (v: string) => {
      setBudget(v);
      autoAdvance();
    },
    [autoAdvance]
  );

  const togglePricing = useCallback((pm: string) => {
    setPricingPreferences((prev) =>
      prev.includes(pm) ? prev.filter((p) => p !== pm) : [...prev, pm]
    );
  }, []);

  const togglePriority = useCallback((p: string) => {
    setPriorities((prev) =>
      prev.includes(p)
        ? prev.filter((x) => x !== p)
        : prev.length < 3
        ? [...prev, p]
        : prev
    );
  }, []);

  const canProceed = (): boolean => {
    switch (subStep) {
      case 1:
        return categories.length > 0;
      case 2:
        return businessType !== "";
      case 3:
        return teamSize !== "";
      case 4:
        return budget !== "";
      case 5:
        return true; // optional
      case 6:
        return true; // optional
      default:
        return false;
    }
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
    setSubStep(1);
  };

  // ── Determine button labels ─────────────────────────────────────────────

  const isOptionalStep = subStep === 5 || subStep === 6;
  const isFinalStep = subStep === TOTAL_SUB_STEPS;
  const currentPhase = subStepToPhase(subStep);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero header */}
      <section className="bg-white border-b border-slate-200 pt-[84px] pb-6 sm:pb-8">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-4 sm:mb-5">
            <Link
              href="/"
              className="text-xs text-slate-400 no-underline font-medium hover:text-slate-600 transition-colors"
            >
              Home
            </Link>
            <span className="text-[11px] text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-semibold">Stack Finder</span>
          </nav>

          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                Stack Finder
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Answer a few questions and we&apos;ll match you with the best stacks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="flex-1 py-6 sm:py-8 lg:py-10">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {showResults && response ? (
            <ResultsSection response={response} onRefine={handleRefine} />
          ) : isPending ? (
            <div className="text-center py-16 sm:py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 border border-amber-200 mb-4 sm:mb-5">
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 animate-spin" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                Finding your perfect stacks...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Analyzing {categories.length} categor{categories.length !== 1 ? "ies" : "y"} across our database
              </p>
            </div>
          ) : (
            <>
              <ProgressBar currentPhase={currentPhase} />

              {/* Step content — one question at a time */}
              <div className="max-w-4xl mx-auto">
                {subStep === 1 && (
                  <StepUseCase selected={categories} onToggle={toggleCategory} />
                )}
                {subStep === 2 && (
                  <StepBusinessType selected={businessType} onSelect={selectBusinessType} />
                )}
                {subStep === 3 && (
                  <StepTeamSize selected={teamSize} onSelect={selectTeamSize} />
                )}
                {subStep === 4 && (
                  <StepBudget selected={budget} onSelect={selectBudget} />
                )}
                {subStep === 5 && (
                  <StepPricingPrefs selected={pricingPreferences} onToggle={togglePricing} />
                )}
                {subStep === 6 && (
                  <StepPriorities selected={priorities} onToggle={togglePriority} />
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-100">
                  <button
                    onClick={goBack}
                    disabled={subStep === 1}
                    className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      subStep === 1
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Skip button for optional steps */}
                    {isOptionalStep && (
                      <button
                        onClick={isFinalStep ? handleSubmit : goNext}
                        className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        {isFinalStep ? "Skip & Find Stacks" : "Skip"}
                      </button>
                    )}

                    {/* Continue / Find My Stacks button */}
                    <button
                      onClick={isFinalStep ? handleSubmit : goNext}
                      disabled={!canProceed()}
                      className={`flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all ${
                        canProceed()
                          ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200 cursor-pointer"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {isFinalStep ? (
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

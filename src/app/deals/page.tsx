"use client";



/*
 * LaudStack — Deals Page
 * Design: white bg (#FAFAFA), amber accents, rose urgency, no gradients
 * Layout: PageHero → Deal of the Day spotlight → filter bar → deals grid
 * Features: live countdown, dual filters + sort, URL persistence,
 *           claim progress, coupon copy, launch deal modal
 * 
 * DATA: Fetches real deals from Supabase via getActiveDeals() server action.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Tag, Clock, Zap, Star, ExternalLink, Crown, Flame,
  CheckCircle, Gift, Shield, TrendingUp, Users, Timer,
  Copy, Check, SlidersHorizontal, X, ArrowUpRight, Percent,
  Building2, Globe, ChevronRight, Sparkles, BadgePercent,
  Trophy, Bolt, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useAuth } from '@/hooks/useAuth';
import AuthGateModal from '@/components/AuthGateModal';
import { getActiveDeals } from '@/app/actions/public';

// ── Types ─────────────────────────────────────────────────────────────────────
type DealType = 'all' | 'lifetime' | 'discount' | 'free-trial' | 'exclusive';

/** Shape returned by getActiveDeals() server action */
type DbDeal = Awaited<ReturnType<typeof getActiveDeals>>[number];

/** UI-level deal shape used by components on this page */
interface Deal {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  type: Exclude<DealType, 'all'>;
  originalPrice: string;
  dealPrice: string;
  discount: string;
  code: string;
  expiresAt: string;
  claimed: number;
  maxClaims: number;
  rating: number;
  reviews: number;
  badge: string | null;
  badgeColor: string | null;
  features: string[];
  logo: string;
  logoColor: string;
  logoTextColor?: string;
  url?: string;
  featured?: boolean;
  dealOfDay?: boolean;
}

// ── Map DB deal to UI deal ───────────────────────────────────────────────────
function mapDbDealToUiDeal(d: DbDeal, index: number): Deal {
  const pct = d.discountPercent ?? 0;
  // Determine deal type from discount percentage
  let type: Exclude<DealType, 'all'> = 'discount';
  let badge: string | null = null;
  let badgeColor: string | null = null;
  if (pct >= 100) {
    type = 'lifetime';
    badge = 'Lifetime';
    badgeColor = 'purple';
  } else if (pct >= 40) {
    badge = 'Hot Deal';
    badgeColor = 'amber';
  }

  // Determine urgency
  const expiresAt = d.expiresAt ? new Date(d.expiresAt).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();
  const timeLeft = new Date(expiresAt).getTime() - Date.now();
  if (timeLeft > 0 && timeLeft < 3 * 86400000) {
    badge = 'Ending Soon';
    badgeColor = 'rose';
  }

  // First deal is "deal of the day"
  const isDealOfDay = index === 0;

  // Generate logo letter from tool name
  const logoLetter = (d.toolName ?? d.title ?? 'D').charAt(0).toUpperCase();

  // Color palette for logos based on category
  const colorPalette = [
    { bg: '#171717', text: '#ffffff' },
    { bg: '#5E6AD2', text: '#ffffff' },
    { bg: '#625DF5', text: '#ffffff' },
    { bg: '#0099FF', text: '#ffffff' },
    { bg: '#7C3AED', text: '#ffffff' },
    { bg: '#4353FF', text: '#ffffff' },
    { bg: '#FCB400', text: '#1a1a1a' },
    { bg: '#F24E1E', text: '#ffffff' },
    { bg: '#FF4A00', text: '#ffffff' },
    { bg: '#00C2A8', text: '#ffffff' },
    { bg: '#DC2626', text: '#ffffff' },
    { bg: '#1F8DED', text: '#ffffff' },
  ];
  const colorIdx = (d.id ?? index) % colorPalette.length;
  const palette = colorPalette[colorIdx];

  return {
    id: String(d.id),
    name: d.toolName ?? d.title ?? 'Unnamed Deal',
    tagline: d.toolTagline ?? d.title ?? '',
    description: d.description ?? `Get ${pct}% off this tool with an exclusive LaudStack deal.`,
    category: d.toolCategory ?? 'SaaS',
    type,
    originalPrice: '', // DB doesn't store original price
    dealPrice: pct > 0 ? `${pct}% OFF` : 'Special Offer',
    discount: pct > 0 ? `${pct}% OFF` : 'Deal',
    code: d.couponCode ?? '',
    expiresAt,
    claimed: d.claimCount ?? 0,
    maxClaims: d.maxClaims ?? 1000,
    rating: d.toolRating ?? 0,
    reviews: d.toolReviewCount ?? 0,
    badge,
    badgeColor,
    features: [],
    logo: d.toolLogo ? '' : logoLetter,
    logoColor: palette.bg,
    logoTextColor: palette.text,
    url: d.dealUrl ?? undefined,
    featured: isDealOfDay,
    dealOfDay: isDealOfDay,
    // Store toolLogo for image rendering
    ...(d.toolLogo ? { _logoUrl: d.toolLogo } : {}),
  } as Deal & { _logoUrl?: string };
}

// ── Deal type filter options ─────────────────────────────────────────────────
const DEAL_TYPES: { id: DealType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'all',        label: 'All Deals',       icon: Tag,          color: '' },
  { id: 'lifetime',   label: 'Lifetime',         icon: Crown,        color: 'text-purple-600' },
  { id: 'exclusive',  label: 'Exclusive',        icon: Bolt,         color: 'text-amber-600' },
  { id: 'discount',   label: 'Discounts',        icon: BadgePercent, color: 'text-emerald-600' },
  { id: 'free-trial', label: 'Extended Trials',  icon: Gift,         color: 'text-sky-600' },
];

const TOOL_CATEGORIES = [
  'All Categories', 'AI Productivity', 'AI Video', 'Automation',
  'Communication', 'CRM', 'Design', 'Forms', 'Marketing',
  'No-Code', 'Productivity', 'Project Management',
];

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(expiresAt: string) {
  const getRemaining = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      total:   diff,
    };
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [getRemaining]);
  return remaining;
}

// ── Countdown display ──────────────────────────────────────────────────────────
function CountdownPill({ expiresAt, large = false }: { expiresAt: string; large?: boolean }) {
  const { days, hours, minutes, seconds, total } = useCountdown(expiresAt);
  const isUrgent = total > 0 && total < 3 * 86400000;
  const expired  = total <= 0;

  if (expired) return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
      Expired
    </span>
  );

  const urgentCls = isUrgent ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600';

  if (!large) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold border px-2.5 py-1 rounded-full ${urgentCls}`}>
        <Timer className="w-3 h-3" />
        {days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`} left
      </span>
    );
  }

  const seg = (val: number, lbl: string) => (
    <div className="flex flex-col items-center min-w-[40px]">
      <span className={`text-2xl font-black tabular-nums leading-none ${isUrgent ? 'text-rose-600' : 'text-slate-900'}`}>
        {String(val).padStart(2, '0')}
      </span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lbl}</span>
    </div>
  );

  return (
    <div className={`inline-flex items-center gap-1 border rounded-xl px-4 py-2.5 ${urgentCls}`}>
      <Timer className={`w-4 h-4 mr-1 ${isUrgent ? 'text-rose-500' : 'text-slate-400'}`} />
      {days > 0 && <>{seg(days, 'days')}<span className="text-slate-300 font-bold text-lg mx-1">:</span></>}
      {seg(hours, 'hrs')}
      <span className="text-slate-300 font-bold text-lg mx-1">:</span>
      {seg(minutes, 'min')}
      <span className="text-slate-300 font-bold text-lg mx-1">:</span>
      {seg(seconds, 'sec')}
    </div>
  );
}

// ── Logo component (supports both image URLs and letter fallbacks) ────────────
function DealLogo({ deal, size = 52 }: { deal: Deal & { _logoUrl?: string }; size?: number }) {
  const logoUrl = (deal as any)._logoUrl;
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={deal.name}
        className="rounded-2xl border border-black/10 object-cover shadow-[0_2px_8px_rgba(15,23,42,0.10)]"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-black border border-black/10 shrink-0 shadow-[0_2px_8px_rgba(15,23,42,0.10)]"
      style={{
        width: size, height: size,
        background: deal.logoColor, color: deal.logoTextColor || '#fff',
        fontSize: size * 0.38,
      }}
    >
      {deal.logo}
    </div>
  );
}

// ── Deal of the Day Spotlight ──────────────────────────────────────────────────
function DealOfDaySpotlight({ deal }: { deal: Deal }) {
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const claimedPct = deal.maxClaims > 0 ? Math.min(100, Math.round((deal.claimed / deal.maxClaims) * 100)) : 0;
  const urgentPct  = claimedPct >= 90;

  const handleCopy = () => {
    if (!deal.code) return;
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    navigator.clipboard.writeText(deal.code).then(() => {
      setCopied(true);
      toast.success(`Code "${deal.code}" copied to clipboard!`);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 border border-amber-200">
          <Trophy className="w-4 h-4 text-amber-600" />
        </div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Deal of the Day</h2>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
          Exclusive · Limited slots
        </span>
      </div>

      {/* Spotlight card */}
      <div className="bg-white border-2 border-amber-200 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(245,158,11,0.10)]">

        {/* Top banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Today&apos;s featured deal — exclusively negotiated for LaudStack members</span>
          </div>
          <CountdownPill expiresAt={deal.expiresAt} />
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left: tool info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-5 mb-5">
                {/* Logo */}
                <DealLogo deal={deal as any} size={64} />
                {/* Name + tagline */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{deal.name}</h3>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                      {deal.discount}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-2">{deal.tagline}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{deal.category}</span>
                    {deal.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-slate-800">{deal.rating.toFixed(1)}</span>
                        <span className="text-xs text-slate-400">({deal.reviews.toLocaleString()} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{deal.description}</p>

              {/* Features (if any) */}
              {deal.features.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {deal.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Claim progress */}
              {deal.maxClaims > 0 && (
                <>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      <span className={urgentPct ? 'text-rose-600' : 'text-slate-700'}>{deal.claimed.toLocaleString()}</span> / {deal.maxClaims.toLocaleString()} claimed
                    </span>
                    <span className={`text-xs font-bold ${urgentPct ? 'text-rose-600' : 'text-slate-500'}`}>{claimedPct}% claimed</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${urgentPct ? 'bg-red-400' : claimedPct >= 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${claimedPct}%` }}
                    />
                  </div>
                  {urgentPct && (
                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Only {deal.maxClaims - deal.claimed} slots remaining!
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Right: pricing + CTA */}
            <div className="lg:w-72 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                {/* Pricing */}
                <div className="mb-5">
                  {deal.originalPrice && (
                    <div className="text-xs font-semibold text-slate-400 line-through mb-1">{deal.originalPrice}</div>
                  )}
                  <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{deal.dealPrice}</div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                    <BadgePercent className="w-3 h-3" />
                    {deal.discount} savings
                  </div>
                </div>

                {/* Countdown */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deal expires in</p>
                  <CountdownPill expiresAt={deal.expiresAt} large />
                </div>

                {/* Coupon code */}
                {deal.code && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Coupon code</p>
                    <button
                      onClick={handleCopy}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed font-mono text-sm font-bold transition-all ${
                        copied
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span>{deal.code}</span>
                      {copied
                        ? <Check className="w-4 h-4 text-emerald-500" />
                        : <Copy className="w-4 h-4 text-slate-400" />
                      }
                    </button>
                  </div>
                )}

                {/* CTA */}
                <a
                  href={deal.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all bg-amber-500 text-slate-900 hover:bg-amber-400"
                >
                  Get This Deal
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <p className="text-center text-xs text-slate-400 mt-2.5">No credit card required to claim</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthGateModal open={showAuthModal} onClose={() => setShowAuthModal(false)} action="claim" />
    </section>
  );
}

// ── Deal Card ──────────────────────────────────────────────────────────────────
function DealCard({ deal, featured }: { deal: Deal; featured?: boolean }) {
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { total } = useCountdown(deal.expiresAt);
  const claimedPct = deal.maxClaims > 0 ? Math.min(100, Math.round((deal.claimed / deal.maxClaims) * 100)) : 0;
  const isUrgent   = total > 0 && total < 3 * 86400000;
  const isExpired  = total <= 0;

  const handleCopy = () => {
    if (!deal.code) return;
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    navigator.clipboard.writeText(deal.code).then(() => {
      setCopied(true);
      toast.success(`Code "${deal.code}" copied!`);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const badgeCls =
    deal.type === 'lifetime'   ? 'bg-purple-50 text-purple-600 border border-purple-200' :
    deal.type === 'free-trial' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
    deal.type === 'exclusive'  ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  const progressColor = claimedPct >= 90 ? 'bg-red-400' : claimedPct >= 60 ? 'bg-amber-400' : 'bg-emerald-400';

  const borderCls = isUrgent ? 'border-red-200' : featured ? 'border-amber-200' : 'border-gray-200 hover:border-slate-300';
  const shadowCls = featured ? 'shadow-[0_4px_16px_rgba(245,158,11,0.10)]' : 'shadow-sm';

  return (
    <div
      className={`bg-white rounded-2xl border-[1.5px] ${borderCls} ${shadowCls} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col h-full`}
    >
      {/* Urgency / featured banner */}
      {isUrgent && !isExpired && (
        <div className="px-4 py-1.5 bg-rose-50 border-b border-rose-200 flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-rose-500" />
          <span className="text-[11px] font-bold text-rose-700">Ending soon — grab it before it&apos;s gone!</span>
        </div>
      )}
      {featured && !isUrgent && (
        <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center gap-1.5">
          <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
          <span className="text-[11px] font-bold text-amber-800">Featured · Exclusive to LaudStack</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">

        {/* ── Header row ── */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <DealLogo deal={deal as any} size={52} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight">{deal.name}</h3>
              {deal.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>
                  {deal.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-1 leading-snug truncate">
              {deal.tagline}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200">
                {deal.category}
              </span>
              {deal.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-bold text-gray-700">{deal.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400">({deal.reviews.toLocaleString()})</span>
                </div>
              )}
            </div>
          </div>

          {/* Discount badge */}
          <div className={`${badgeCls} px-2.5 py-1 rounded-lg font-black text-xs shrink-0 text-center leading-tight`}>
            {deal.discount}
          </div>
        </div>

        {/* ── Pricing row ── */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-3.5">
          <div>
            {deal.originalPrice && (
              <div className="text-[10px] text-slate-400 line-through mb-px">{deal.originalPrice}</div>
            )}
            <div className="text-xl font-black text-slate-900 tracking-tight leading-none">{deal.dealPrice}</div>
          </div>
          <CountdownPill expiresAt={deal.expiresAt} />
        </div>

        {/* ── Features ── */}
        {deal.features.length > 0 && (
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 mb-3.5">
            {deal.features.map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-[11px] text-slate-500 font-medium">{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Claim progress ── */}
        {deal.maxClaims > 0 && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-semibold">
                {deal.claimed.toLocaleString()} / {deal.maxClaims.toLocaleString()} claimed
              </span>
              <span className={`text-[10px] font-bold ${claimedPct >= 90 ? 'text-red-400' : 'text-slate-400'}`}>{claimedPct}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${progressColor} rounded-full transition-all duration-500`} style={{ width: `${claimedPct}%` }} />
            </div>
          </div>
        )}

        {/* ── Action row ── */}
        <div className="flex gap-2 mt-auto">
          {deal.code ? (
            <button
              onClick={handleCopy}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border-[1.5px] border-dashed cursor-pointer transition-all font-mono ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-300 text-slate-500 hover:border-slate-400'
              }`}
            >
              {copied
                ? <><Check className="w-3 h-3" /> Copied!</>
                : <><Copy className="w-3 h-3" /> {deal.code}</>
              }
            </button>
          ) : (
            <div className="flex-1" />
          )}

          <button
            onClick={() => window.open(deal.url || '#', '_blank', 'noopener,noreferrer')}
            className="py-2 px-4 rounded-lg font-extrabold text-xs flex items-center gap-1 bg-amber-500 text-slate-900 hover:bg-amber-400 transition-all shadow-[0_2px_8px_rgba(245,158,11,0.25)] shrink-0"
          >
            Get Deal <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      <AuthGateModal open={showAuthModal} onClose={() => setShowAuthModal(false)} action="claim" />
    </div>
  );
}

// ── Launch a Deal Modal ────────────────────────────────────────────────────────
function LaunchDealModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    toolName: '', toolUrl: '', email: '', discount: '', code: '',
    expiresAt: '', description: '', category: 'AI Productivity',
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Deal submitted! Our team will review it within 48 hours.');
    onClose();
  };

  const inputCls = 'w-full pl-9 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-slate-200 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-colors';
  const selectCls = 'w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-slate-200 text-sm text-slate-900 outline-none bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-colors';

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[9999] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-5"
    >
      <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 pt-4 pb-3.5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Gift className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Launch a Deal</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Share a deal with the community</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer shrink-0 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-4 py-3 border-b border-slate-50 flex gap-1.5">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-0.5 rounded-full transition-colors ${s <= step ? 'bg-amber-500' : 'bg-slate-200'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 flex flex-col gap-4">
            {step === 1 ? (
              <>
                <p className="text-sm text-slate-500">Tell us about the product and the deal you want to share.</p>
                {[
                  { key: 'toolName', label: 'Tool Name *', placeholder: 'e.g. Notion, Linear, Figma', icon: Building2, type: 'text', required: true },
                  { key: 'toolUrl',  label: 'Tool Website *', placeholder: 'https://yourtool.com', icon: Globe, type: 'url', required: true },
                ].map(({ key, label, placeholder, icon: Icon, type, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        required={required} type={type}
                        value={(form as any)[key]} onChange={e => update(key, e.target.value)}
                        placeholder={placeholder}
                        className={inputCls}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => update('category', e.target.value)}
                    className={selectCls}>
                    {TOOL_CATEGORIES.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500">Now tell us the deal details and how to reach you.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'discount', label: 'Discount *', placeholder: '50% OFF', icon: Percent, required: true },
                    { key: 'code',     label: 'Coupon Code', placeholder: 'LAUDSTACK20', icon: Tag, required: false },
                  ].map(({ key, label, placeholder, icon: Icon, required }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input required={required} value={(form as any)[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder}
                          className={inputCls} />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Expiry Date *</label>
                  <input required type="date" value={form.expiresAt} onChange={e => update('expiresAt', e.target.value)}
                    className={selectCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
                    placeholder="What makes this deal special?"
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-slate-200 text-sm text-slate-900 outline-none resize-y focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Email *</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@company.com"
                      className={inputCls} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-7 py-4 border-t border-slate-100 flex justify-between gap-3">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-lg border-[1.5px] border-slate-200 bg-white text-sm font-bold text-gray-700 cursor-pointer hover:bg-slate-50 transition-colors">
                Back
              </button>
            )}
            {step === 1 ? (
              <button type="button" onClick={() => { if (!form.toolName || !form.toolUrl) { toast.error('Please fill in all required fields.'); return; } setStep(2); }}
                className="ml-auto px-6 py-2.5 rounded-lg bg-amber-500 text-sm font-extrabold text-slate-900 cursor-pointer flex items-center gap-1.5 hover:bg-amber-400 transition-colors">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button type="submit"
                className="ml-auto px-6 py-2.5 rounded-lg bg-amber-500 text-sm font-extrabold text-slate-900 cursor-pointer flex items-center gap-1.5 hover:bg-amber-400 transition-colors">
                Launch Deal <CheckCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Deals() {
  const router = useRouter();
  const pathname = usePathname();

  // ── Fetch deals from DB ──
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveDeals()
      .then(dbDeals => {
        const mapped = dbDeals.map((d, i) => mapDbDealToUiDeal(d, i));
        setAllDeals(mapped);
      })
      .catch(() => {
        toast.error('Failed to load deals');
      })
      .finally(() => setLoading(false));
  }, []);

  const parseParams = () => {
    const p = new URLSearchParams(window.location.search);
    return {
      type:     (p.get('type') as DealType) || 'all',
      category: p.get('category') || 'All Categories',
      sort:     p.get('sort') || 'featured',
    };
  };

  const [activeType,     setActiveType]     = useState<DealType>(() => parseParams().type);
  const [activeCategory, setActiveCategory] = useState(() => parseParams().category);
  const [sort,           setSort]           = useState(() => parseParams().sort);
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);
  const [showSubmit,     setShowSubmit]     = useState(false);

  // URL → state
  useEffect(() => {
    setSyncingFromUrl(true);
    const p = parseParams();
    setActiveType(p.type);
    setActiveCategory(p.category);
    setSort(p.sort);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [pathname]);

  // state → URL
  useEffect(() => {
    if (syncingFromUrl) return;
    const params = new URLSearchParams();
    if (activeType !== 'all')                params.set('type', activeType);
    if (activeCategory !== 'All Categories') params.set('category', activeCategory);
    if (sort !== 'featured')                 params.set('sort', sort);
    const qs = params.toString();
    router.replace(qs ? `/deals?${qs}` : '/deals');
  }, [activeType, activeCategory, sort, syncingFromUrl, router]);

  const hasFilters = activeType !== 'all' || activeCategory !== 'All Categories';

  const filtered = useMemo(() => allDeals
    .filter(d => activeType === 'all' || d.type === activeType)
    .filter(d => activeCategory === 'All Categories' || d.category === activeCategory)
    .sort((a, b) => {
      if (sort === 'expiry')    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      if (sort === 'discount')  return (parseInt(b.discount) || 0) - (parseInt(a.discount) || 0);
      if (sort === 'rating')    return b.rating - a.rating;
      const fa = a.featured ? 0 : 1, fb = b.featured ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    }), [allDeals, activeType, activeCategory, sort]);

  const dealOfDay    = allDeals.find(d => d.dealOfDay);
  const lifetimeDeals = allDeals.filter(d => d.type === 'lifetime');
  const hasUrgent    = filtered.some(d => { const t = new Date(d.expiresAt).getTime() - Date.now(); return t > 0 && t < 3 * 86400000; });
  const maxDiscount  = allDeals.reduce((max, d) => Math.max(max, parseInt(d.discount) || 0), 0);

  const clearFilters = () => { setActiveType('all'); setActiveCategory('All Categories'); setSort('featured'); };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Exclusive SaaS Deals"
        title="Save on the products your team uses"
        subtitle="Exclusive discounts, lifetime deals, and extended trials negotiated by LaudStack for our community."
        accent="amber"
        layout="split"
        size="md"
      />

      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium">Loading deals...</p>
          </div>
        )}

        {/* ── Content (only when loaded) ── */}
        {!loading && (
          <>
            {/* ── Empty state when no deals in DB ── */}
            {allDeals.length === 0 && (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl mb-12">
                <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">No active deals right now</h3>
                <p className="text-slate-500 text-sm mb-4">Check back soon — new deals are added every week.</p>
                <button
                  onClick={() => setShowSubmit(true)}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors"
                >
                  Submit a Deal
                </button>
              </div>
            )}

            {allDeals.length > 0 && (
              <>
                {/* ── Deal of the Day (only when no filters active) ── */}
                {!hasFilters && dealOfDay && <DealOfDaySpotlight deal={dealOfDay} />}

                {/* ── Lifetime Deals spotlight (only when no filters active) ── */}
                {!hasFilters && lifetimeDeals.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 border border-purple-200">
                        <Crown className="w-4 h-4 text-purple-600" />
                      </div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Lifetime Deals</h2>
                      <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">
                        Pay once · Use forever
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {lifetimeDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
                    </div>
                  </section>
                )}

                {/* ── Filter bar ── */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
                  <div className="flex flex-wrap gap-3 items-center">

                    {/* Deal type pills */}
                    <div className="flex flex-wrap gap-2">
                      {DEAL_TYPES.map(({ id, label, icon: Icon, color }) => (
                        <button
                          key={id}
                          onClick={() => setActiveType(id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                            activeType === id
                              ? 'bg-amber-500 text-white shadow-sm'
                              : `bg-gray-100 hover:bg-gray-200 ${color || 'text-slate-600'}`
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="hidden sm:block w-px bg-gray-200 self-stretch mx-1" />

                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
                      <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}
                        className="text-sm font-medium text-slate-700 bg-gray-100 border-0 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer">
                        {TOOL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <select value={sort} onChange={e => setSort(e.target.value)}
                        className="text-sm font-medium text-slate-700 bg-gray-100 border-0 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer">
                        <option value="featured">Featured first</option>
                        <option value="expiry">Expiring soonest</option>
                        <option value="discount">Biggest discount</option>
                        <option value="rating">Highest rated</option>
                      </select>
                    </div>

                    {hasFilters && (
                      <button onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-all ml-auto">
                        <X className="h-3.5 w-3.5" /> Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Results header ── */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-slate-500 font-medium">
                    {filtered.length} deal{filtered.length !== 1 ? 's' : ''}
                    {hasFilters && <span className="text-amber-600 font-bold"> · filtered</span>}
                  </p>
                  {hasUrgent && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                      <Flame className="w-3 h-3" />
                      Some deals expire in &lt; 3 days
                    </span>
                  )}
                </div>

                {/* ── Deals grid ── */}
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                    {filtered.map(deal => (
                      <DealCard key={deal.id} deal={deal} featured={!!deal.featured && !hasFilters} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl mb-12">
                    <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No deals match these filters</h3>
                    <p className="text-slate-500 text-sm mb-4">Try a different deal type or category.</p>
                    <button onClick={clearFilters} className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors">
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Trust strip ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {[
                { icon: Shield,     color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', title: 'Verified Deals',       desc: 'Every deal is verified directly with the vendor before listing.' },
                { icon: Users,      color: 'text-sky-500',     bg: 'bg-sky-50',     border: 'border-sky-100',     title: 'Community Negotiated', desc: 'Our growing community gives us leverage to negotiate better rates.' },
                { icon: TrendingUp, color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100',   title: 'Updated Weekly',       desc: 'New deals added every week. Subscribe to get notified first.' },
              ].map(({ icon: Icon, color, bg, border, title, desc }) => (
                <div key={title} className={`bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4`}>
                  <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4.5 h-4.5 ${color}`} />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold text-sm mb-1">{title}</div>
                    <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Launch a Deal CTA ── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">For Founders</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Have a deal to share?</h3>
                <p className="text-slate-500 text-sm">Launch a deal for your tool and reach 12,000+ potential customers.</p>
              </div>
              <button
                onClick={() => setShowSubmit(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0 shadow-[0_2px_12px_rgba(245,158,11,0.25)]"
              >
                <Gift className="w-4 h-4" />
                Launch a Deal
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
      {showSubmit && <LaunchDealModal onClose={() => setShowSubmit(false)} />}
    </div>
  );
}

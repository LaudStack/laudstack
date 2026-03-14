"use client";

export const dynamic = 'force-dynamic';


/*
 * LaudStack — Deals Page
 * Design: white bg (#FAFAFA), amber accents, rose urgency, no gradients
 * Layout: PageHero → Deal of the Day spotlight → filter bar → deals grid
 * Features: live countdown, dual filters + sort, URL persistence,
 *           claim progress, coupon copy, launch deal modal
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Tag, Clock, Zap, Star, ExternalLink, Crown, Flame,
  CheckCircle, Gift, Shield, TrendingUp, Users, Timer,
  Copy, Check, SlidersHorizontal, X, ArrowUpRight, Percent,
  Building2, Globe, ChevronRight, Sparkles, BadgePercent,
  Trophy, Bolt,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useAuth } from '@/hooks/useAuth';
import AuthGateModal from '@/components/AuthGateModal';

// ── Types ─────────────────────────────────────────────────────────────────────
type DealType = 'all' | 'lifetime' | 'discount' | 'free-trial' | 'exclusive';

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

// ── Deal data ─────────────────────────────────────────────────────────────────
const DEALS: Deal[] = [
  {
    id: 'd1',
    name: 'Notion AI',
    tagline: 'All-in-one workspace with AI writing assistant',
    description: 'Notion AI supercharges your workspace with smart writing, summarization, and action-item extraction — all inside the product your team already uses.',
    category: 'AI Productivity',
    type: 'exclusive',
    originalPrice: '$16/mo',
    dealPrice: '$8/mo',
    discount: '50% OFF',
    code: 'LAUDSTACK50',
    expiresAt: '2026-03-31T23:59:59Z',
    claimed: 1240,
    maxClaims: 2000,
    rating: 4.8,
    reviews: 2840,
    badge: 'Exclusive',
    badgeColor: 'amber',
    features: ['Unlimited AI writes', 'Team collaboration', 'API access', 'Priority support'],
    logo: 'N',
    logoColor: '#171717',
    logoTextColor: '#ffffff',
    featured: true,
    dealOfDay: true,
  },
  {
    id: 'd2',
    name: 'Linear',
    tagline: 'Issue tracking built for modern software teams',
    description: 'Linear is the project management tool loved by high-performance engineering teams. Pay once, use forever with this exclusive lifetime deal.',
    category: 'Project Management',
    type: 'lifetime',
    originalPrice: '$8/mo',
    dealPrice: '$149 once',
    discount: 'LIFETIME',
    code: 'LAUD-LINEAR',
    expiresAt: '2026-04-15T23:59:59Z',
    claimed: 890,
    maxClaims: 1500,
    rating: 4.9,
    reviews: 1920,
    badge: 'Lifetime',
    badgeColor: 'purple',
    features: ['Unlimited projects', 'Unlimited members', 'All integrations', 'Lifetime updates'],
    logo: 'L',
    logoColor: '#5E6AD2',
    logoTextColor: '#ffffff',
    featured: true,
  },
  {
    id: 'd3',
    name: 'Loom',
    tagline: 'Async video messaging for teams',
    description: 'Replace meetings with quick video messages. Loom\'s extended trial gives you 3 months to experience the full power of async communication.',
    category: 'Communication',
    type: 'free-trial',
    originalPrice: '$12.50/mo',
    dealPrice: '90 days free',
    discount: '3× Trial',
    code: 'LAUDLOOM90',
    expiresAt: '2026-05-01T23:59:59Z',
    claimed: 3200,
    maxClaims: 5000,
    rating: 4.7,
    reviews: 3100,
    badge: 'Extended Trial',
    badgeColor: 'sky',
    features: ['Unlimited recordings', 'HD quality', 'Custom branding', 'Analytics'],
    logo: 'L',
    logoColor: '#625DF5',
    logoTextColor: '#ffffff',
  },
  {
    id: 'd4',
    name: 'Framer',
    tagline: 'Design and publish websites without code',
    description: 'Framer is the fastest way to design and ship stunning websites. This deal is ending soon — grab 50% off before it\'s gone.',
    category: 'Design',
    type: 'discount',
    originalPrice: '$30/mo',
    dealPrice: '$15/mo',
    discount: '50% OFF',
    code: 'LAUDFRAMER',
    expiresAt: '2026-03-20T23:59:59Z',
    claimed: 670,
    maxClaims: 1000,
    rating: 4.8,
    reviews: 1450,
    badge: 'Ending Soon',
    badgeColor: 'rose',
    features: ['Custom domains', 'CMS', 'E-commerce', 'Analytics'],
    logo: 'F',
    logoColor: '#0099FF',
    logoTextColor: '#ffffff',
  },
  {
    id: 'd5',
    name: 'Descript',
    tagline: 'Video and podcast editing with AI transcription',
    description: 'Edit video like a doc. Descript\'s AI removes filler words, transcribes instantly, and lets you overdub your own voice.',
    category: 'AI Video',
    type: 'lifetime',
    originalPrice: '$24/mo',
    dealPrice: '$299 once',
    discount: 'LIFETIME',
    code: 'LAUD-DESCRIPT',
    expiresAt: '2026-04-30T23:59:59Z',
    claimed: 420,
    maxClaims: 800,
    rating: 4.7,
    reviews: 980,
    badge: 'Lifetime',
    badgeColor: 'purple',
    features: ['Unlimited projects', 'AI transcription', 'Screen recording', 'Overdub AI'],
    logo: 'D',
    logoColor: '#7C3AED',
    logoTextColor: '#ffffff',
  },
  {
    id: 'd6',
    name: 'Webflow',
    tagline: 'Visual web development platform',
    description: 'Build production-ready websites visually. Webflow gives designers full code-level control without writing a single line.',
    category: 'No-Code',
    type: 'exclusive',
    originalPrice: '$23/mo',
    dealPrice: '$14/mo',
    discount: '40% OFF',
    code: 'LAUDWF40',
    expiresAt: '2026-03-28T23:59:59Z',
    claimed: 1100,
    maxClaims: 2000,
    rating: 4.6,
    reviews: 2200,
    badge: 'Exclusive',
    badgeColor: 'amber',
    features: ['Custom domains', 'CMS', 'E-commerce', 'Hosting'],
    logo: 'W',
    logoColor: '#4353FF',
    logoTextColor: '#ffffff',
  },
  {
    id: 'd7',
    name: 'Airtable',
    tagline: 'Spreadsheet-database hybrid for teams',
    description: 'Airtable combines the simplicity of a spreadsheet with the power of a database. 60 days free to explore every feature.',
    category: 'Productivity',
    type: 'free-trial',
    originalPrice: '$20/mo',
    dealPrice: '60 days free',
    discount: '2× Trial',
    code: 'LAUDAIR60',
    expiresAt: '2026-05-15T23:59:59Z',
    claimed: 2800,
    maxClaims: 5000,
    rating: 4.5,
    reviews: 1800,
    badge: 'Extended Trial',
    badgeColor: 'sky',
    features: ['Unlimited bases', 'Automations', 'API access', 'Integrations'],
    logo: 'A',
    logoColor: '#FCB400',
    logoTextColor: '#1a1a1a',
  },
  {
    id: 'd8',
    name: 'Typeform',
    tagline: 'Engaging forms and surveys that people love',
    description: 'Typeform turns boring forms into conversations. Higher completion rates, better data, and a beautiful experience.',
    category: 'Forms',
    type: 'discount',
    originalPrice: '$25/mo',
    dealPrice: '$12.50/mo',
    discount: '50% OFF',
    code: 'LAUDTYPE50',
    expiresAt: '2026-04-10T23:59:59Z',
    claimed: 560,
    maxClaims: 1200,
    rating: 4.6,
    reviews: 1340,
    badge: null,
    badgeColor: null,
    features: ['Unlimited responses', 'Logic jumps', 'Integrations', 'Analytics'],
    logo: 'T',
    logoColor: '#262627',
    logoTextColor: '#ffffff',
  },
  {
    id: 'd9',
    name: 'Figma',
    tagline: 'Collaborative interface design tool',
    description: 'The industry-standard design tool. Figma\'s real-time collaboration makes it the go-to for product teams worldwide.',
    category: 'Design',
    type: 'discount',
    originalPrice: '$15/mo',
    dealPrice: '$9/mo',
    discount: '40% OFF',
    code: 'LAUDFIG40',
    expiresAt: '2026-04-05T23:59:59Z',
    claimed: 2100,
    maxClaims: 3000,
    rating: 4.9,
    reviews: 5200,
    badge: 'Popular',
    badgeColor: 'sky',
    features: ['Unlimited projects', 'Dev mode', 'Plugins', 'Version history'],
    logo: 'F',
    logoColor: '#F24E1E',
    logoTextColor: '#ffffff',
  },
  {
    id: 'd10',
    name: 'Zapier',
    tagline: 'Automate workflows between 6,000+ apps',
    description: 'Connect your apps and automate workflows in minutes. Zapier\'s exclusive LaudStack deal gives you 41% off the Pro plan.',
    category: 'Automation',
    type: 'exclusive',
    originalPrice: '$49/mo',
    dealPrice: '$29/mo',
    discount: '41% OFF',
    code: 'LAUDZAP41',
    expiresAt: '2026-03-25T23:59:59Z',
    claimed: 780,
    maxClaims: 1500,
    rating: 4.7,
    reviews: 4100,
    badge: 'Exclusive',
    badgeColor: 'amber',
    features: ['Unlimited Zaps', '5,000 tasks/mo', 'Multi-step Zaps', 'Premium apps'],
    logo: 'Z',
    logoColor: '#FF4A00',
    logoTextColor: '#ffffff',
  },
  {
    id: 'd11',
    name: 'Intercom',
    tagline: 'AI-first customer service platform',
    description: 'Intercom\'s AI inbox resolves 50% of support questions automatically. Extended 45-day trial — no credit card needed.',
    category: 'CRM',
    type: 'free-trial',
    originalPrice: '$74/mo',
    dealPrice: '45 days free',
    discount: '1.5× Trial',
    code: 'LAUDINTER45',
    expiresAt: '2026-05-20T23:59:59Z',
    claimed: 1400,
    maxClaims: 3000,
    rating: 4.5,
    reviews: 2800,
    badge: 'Extended Trial',
    badgeColor: 'sky',
    features: ['AI inbox', 'Live chat', 'Help center', 'Product tours'],
    logo: 'I',
    logoColor: '#1F8DED',
    logoTextColor: '#ffffff',
  },
  {
    id: 'd12',
    name: 'Surfer SEO',
    tagline: 'AI-powered content optimization for SEO',
    description: 'Surfer SEO analyzes top-ranking pages and tells you exactly what to write. Lifetime access — pay once, rank forever.',
    category: 'Marketing',
    type: 'lifetime',
    originalPrice: '$89/mo',
    dealPrice: '$499 once',
    discount: 'LIFETIME',
    code: 'LAUDSURF499',
    expiresAt: '2026-04-20T23:59:59Z',
    claimed: 310,
    maxClaims: 600,
    rating: 4.6,
    reviews: 1100,
    badge: 'Lifetime',
    badgeColor: 'purple',
    features: ['Unlimited audits', 'Content editor', 'SERP analyzer', 'Keyword research'],
    logo: 'S',
    logoColor: '#00C2A8',
    logoTextColor: '#ffffff',
  },
];

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

// ── Deal of the Day Spotlight ──────────────────────────────────────────────────
function DealOfDaySpotlight({ deal }: { deal: Deal }) {
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const claimedPct = Math.min(100, Math.round((deal.claimed / deal.maxClaims) * 100));
  const urgentPct  = claimedPct >= 90;

  const handleCopy = () => {
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
      <div className="bg-white border-2 border-amber-200 rounded-2xl overflow-hidden"
           style={{ boxShadow: '0 4px 24px rgba(245,158,11,0.10)' }}>

        {/* Top banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Today's featured deal — exclusively negotiated for LaudStack members</span>
          </div>
          <CountdownPill expiresAt={deal.expiresAt} />
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left: tool info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-5 mb-5">
                {/* Logo */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 border border-black/10"
                     style={{ background: deal.logoColor, color: deal.logoTextColor || '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
                  {deal.logo}
                </div>
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
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-slate-800">{deal.rating}</span>
                      <span className="text-xs text-slate-400">({deal.reviews.toLocaleString()} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{deal.description}</p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {deal.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {/* Claim progress */}
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  <span className={urgentPct ? 'text-rose-600' : 'text-slate-700'}>{deal.claimed.toLocaleString()}</span> / {deal.maxClaims.toLocaleString()} claimed
                </span>
                <span className={`text-xs font-bold ${urgentPct ? 'text-rose-600' : 'text-slate-500'}`}>{claimedPct}% claimed</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${claimedPct}%`, background: urgentPct ? '#F87171' : claimedPct >= 60 ? '#FBBF24' : '#34D399' }}
                />
              </div>
              {urgentPct && (
                <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Only {deal.maxClaims - deal.claimed} slots remaining!
                </p>
              )}
            </div>

            {/* Right: pricing + CTA */}
            <div className="lg:w-72 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                {/* Pricing */}
                <div className="mb-5">
                  <div className="text-xs font-semibold text-slate-400 line-through mb-1">{deal.originalPrice}</div>
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
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed font-mono text-sm font-bold transition-all"
                      style={{
                        borderColor: copied ? '#86EFAC' : '#CBD5E1',
                        background: copied ? '#F0FDF4' : '#fff',
                        color: copied ? '#15803D' : '#334155',
                      }}
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
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all"
                  style={{ background: '#F59E0B', color: '#0A0A0A' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FBBF24')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
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
  const [hovered, setHovered] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { total } = useCountdown(deal.expiresAt);
  const claimedPct = Math.min(100, Math.round((deal.claimed / deal.maxClaims) * 100));
  const isUrgent   = total > 0 && total < 3 * 86400000;
  const isExpired  = total <= 0;

  const handleCopy = () => {
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

  // Badge styles
  const badgeStyle: React.CSSProperties =
    deal.type === 'lifetime'   ? { background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' } :
    deal.type === 'free-trial' ? { background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD' } :
    deal.type === 'exclusive'  ? { background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' } :
                                 { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' };

  const progressColor = claimedPct >= 90 ? '#F87171' : claimedPct >= 60 ? '#FBBF24' : '#34D399';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1.5px solid',
        borderColor: isUrgent ? '#FECACA' : featured ? '#FDE68A' : hovered ? '#CBD5E1' : '#E8EDF2',
        boxShadow: hovered
          ? '0 12px 36px rgba(15,23,42,0.10)'
          : featured
          ? '0 4px 16px rgba(245,158,11,0.10)'
          : '0 1px 4px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Urgency / featured banner */}
      {isUrgent && !isExpired && (
        <div style={{ padding: '7px 18px', background: '#FFF1F2', borderBottom: '1px solid #FECDD3', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flame style={{ width: 12, height: 12, color: '#F43F5E' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#BE123C' }}>Ending soon — grab it before it's gone!</span>
        </div>
      )}
      {featured && !isUrgent && (
        <div style={{ padding: '7px 18px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Star style={{ width: 11, height: 11, color: '#D97706', fill: '#D97706' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Featured · Exclusive to LaudStack</span>
        </div>
      )}

      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ── Header row ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          {/* Logo */}
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 20, border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(15,23,42,0.10)',
            background: deal.logoColor, color: deal.logoTextColor || '#fff',
          }}>
            {deal.logo}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.015em' }}>{deal.name}</h3>
              {deal.badge && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, ...badgeStyle }}>
                  {deal.badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 5px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {deal.tagline}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>
                {deal.category}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Star style={{ width: 10, height: 10, fill: '#FBBF24', color: '#FBBF24' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{deal.rating}</span>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>({deal.reviews.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* Discount badge */}
          <div style={{
            ...badgeStyle,
            padding: '5px 10px', borderRadius: 10, fontWeight: 900, fontSize: 12,
            flexShrink: 0, textAlign: 'center', lineHeight: 1.3,
          }}>
            {deal.discount}
          </div>
        </div>

        {/* ── Pricing row ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', background: '#F8FAFC', borderRadius: 12,
          border: '1px solid #F1F5F9', marginBottom: 14,
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#94A3B8', textDecoration: 'line-through', marginBottom: 1 }}>{deal.originalPrice}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>{deal.dealPrice}</div>
          </div>
          <CountdownPill expiresAt={deal.expiresAt} />
        </div>

        {/* ── Features ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 10px', marginBottom: 14 }}>
          {deal.features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle style={{ width: 12, height: 12, color: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* ── Claim progress ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
              {deal.claimed.toLocaleString()} / {deal.maxClaims.toLocaleString()} claimed
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: claimedPct >= 90 ? '#F87171' : '#94A3B8' }}>{claimedPct}%</span>
          </div>
          <div style={{ height: 4, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${claimedPct}%`, background: progressColor, borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* ── Action row ── */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          {/* Copy code */}
          <button
            onClick={handleCopy}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 10, fontWeight: 700, fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              border: '1.5px dashed', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'monospace',
              background: copied ? '#F0FDF4' : '#F8FAFC',
              borderColor: copied ? '#BBF7D0' : '#CBD5E1',
              color: copied ? '#15803D' : '#475569',
            }}
          >
            {copied
              ? <><Check style={{ width: 12, height: 12 }} /> Copied!</>
              : <><Copy style={{ width: 12, height: 12 }} /> {deal.code || 'No code'}</>
            }
          </button>

          {/* Get deal */}
          <button
            onClick={() => window.open(deal.url || '#', '_blank', 'noopener,noreferrer')}
            style={{
              padding: '9px 16px', borderRadius: 10, fontWeight: 800, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#F59E0B', color: '#0A0A0A', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FBBF24'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F59E0B'; }}
          >
            Get Deal <ArrowUpRight style={{ width: 12, height: 12 }} />
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

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(15,23,42,0.18)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift style={{ width: 14, height: 14, color: '#D97706' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Launch a Deal</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Share a deal with the community</h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X style={{ width: 15, height: 15, color: '#64748B' }} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC', display: 'flex', gap: 6 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 99, background: s <= step ? '#F59E0B' : '#E2E8F0', transition: 'background 0.2s' }} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {step === 1 ? (
              <>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Tell us about the product and the deal you want to share.</p>
                {[
                  { key: 'toolName', label: 'Tool Name *', placeholder: 'e.g. Notion, Linear, Figma', icon: Building2, type: 'text', required: true },
                  { key: 'toolUrl',  label: 'Tool Website *', placeholder: 'https://yourtool.com', icon: Globe, type: 'url', required: true },
                ].map(({ key, label, placeholder, icon: Icon, type, required }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8' }} />
                      <input
                        required={required} type={type}
                        value={(form as any)[key]} onChange={e => update(key, e.target.value)}
                        placeholder={placeholder}
                        style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Category *</label>
                  <select value={form.category} onChange={e => update('category', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    {TOOL_CATEGORIES.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Now tell us the deal details and how to reach you.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { key: 'discount', label: 'Discount *', placeholder: '50% OFF', icon: Percent, required: true },
                    { key: 'code',     label: 'Coupon Code', placeholder: 'LAUDSTACK20', icon: Tag, required: false },
                  ].map(({ key, label, placeholder, icon: Icon, required }) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8' }} />
                        <input required={required} value={(form as any)[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder}
                          style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Expiry Date *</label>
                  <input required type="date" value={form.expiresAt} onChange={e => update('expiresAt', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
                    placeholder="What makes this deal special?"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Your Email *</label>
                  <div style={{ position: 'relative' }}>
                    <ExternalLink style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8' }} />
                    <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@company.com"
                      style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 28px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
                Back
              </button>
            )}
            {step === 1 ? (
              <button type="button" onClick={() => { if (!form.toolName || !form.toolUrl) { toast.error('Please fill in all required fields.'); return; } setStep(2); }}
                style={{ marginLeft: 'auto', padding: '10px 24px', borderRadius: 10, background: '#F59E0B', border: 'none', fontSize: 13, fontWeight: 800, color: '#0A0A0A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                Next <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            ) : (
              <button type="submit"
                style={{ marginLeft: 'auto', padding: '10px 24px', borderRadius: 10, background: '#F59E0B', border: 'none', fontSize: 13, fontWeight: 800, color: '#0A0A0A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                Launch Deal <CheckCircle style={{ width: 14, height: 14 }} />
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
  }, [activeType, activeCategory, sort, syncingFromUrl]);

  const hasFilters = activeType !== 'all' || activeCategory !== 'All Categories';

  const filtered = useMemo(() => DEALS
    .filter(d => activeType === 'all' || d.type === activeType)
    .filter(d => activeCategory === 'All Categories' || d.category === activeCategory)
    .sort((a, b) => {
      if (sort === 'expiry')    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      if (sort === 'discount')  return (parseInt(b.discount) || 0) - (parseInt(a.discount) || 0);
      if (sort === 'rating')    return b.rating - a.rating;
      const fa = a.featured ? 0 : 1, fb = b.featured ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    }), [activeType, activeCategory, sort]);

  const dealOfDay    = DEALS.find(d => d.dealOfDay);
  const lifetimeDeals = DEALS.filter(d => d.type === 'lifetime');
  const hasUrgent    = filtered.some(d => { const t = new Date(d.expiresAt).getTime() - Date.now(); return t > 0 && t < 3 * 86400000; });

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
        stats={[
          { value: String(DEALS.length),         label: 'Active Deals' },
          { value: String(lifetimeDeals.length),  label: 'Lifetime Deals' },
          { value: 'Up to 50%',                   label: 'Max Discount' },
          { value: '12k+',                        label: 'Members Saved' },
        ]}
      />

      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Deal of the Day (only when no filters active) ── */}
        {!hasFilters && dealOfDay && <DealOfDaySpotlight deal={dealOfDay} />}

        {/* ── Lifetime Deals spotlight (only when no filters active) ── */}
        {!hasFilters && (
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
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
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
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0"
            style={{ boxShadow: '0 2px 12px rgba(245,158,11,0.25)' }}
          >
            <Gift className="w-4 h-4" />
            Launch a Deal
          </button>
        </div>
      </div>

      <Footer />
      {showSubmit && <LaunchDealModal onClose={() => setShowSubmit(false)} />}
    </div>
  );
}

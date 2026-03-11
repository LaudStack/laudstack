/*
 * LaudStack — SaaS Deals Page
 * Design: white bg, amber accents, rose urgency indicators, no gradients
 * Features: live countdown timers, dual filters (type + category), URL persistence,
 *           claim progress bars, copy-to-clipboard coupon codes, deal spotlight
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Tag, Clock, Zap, Star, ExternalLink, Crown, Flame,
  CheckCircle, Gift, Shield, TrendingUp, Users, Timer,
  Copy, Check, SlidersHorizontal, X
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

// ── Types ────────────────────────────────────────────────────────────────────
type DealType = 'all' | 'lifetime' | 'discount' | 'free-trial' | 'exclusive';

interface Deal {
  id: string;
  name: string;
  tagline: string;
  category: string;
  type: Exclude<DealType, 'all'>;
  originalPrice: string;
  dealPrice: string;
  discount: string;
  code: string;
  expiresAt: string; // ISO date string
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
}

// ── Deal data — expiry dates set relative to Mar 11 2026 ─────────────────────
const DEALS: Deal[] = [
  {
    id: 'd1',
    name: 'Notion AI',
    tagline: 'All-in-one workspace with AI writing assistant',
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
  },
  {
    id: 'd2',
    name: 'Linear',
    tagline: 'Issue tracking built for modern software teams',
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

const DEAL_TYPES: { id: DealType; label: string; icon: React.ElementType }[] = [
  { id: 'all',        label: 'All Deals',       icon: Tag },
  { id: 'lifetime',   label: 'Lifetime',         icon: Crown },
  { id: 'exclusive',  label: 'Exclusive',        icon: Zap },
  { id: 'discount',   label: 'Discounts',        icon: TrendingUp },
  { id: 'free-trial', label: 'Extended Trials',  icon: Gift },
];

const TOOL_CATEGORIES = [
  'All Categories',
  'AI Productivity',
  'AI Video',
  'Automation',
  'Communication',
  'CRM',
  'Design',
  'Forms',
  'Marketing',
  'No-Code',
  'Productivity',
  'Project Management',
];

const BADGE_STYLES: Record<string, string> = {
  amber:  'bg-amber-50 text-amber-700 border border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  sky:    'bg-sky-50 text-sky-700 border border-sky-200',
  rose:   'bg-rose-50 text-rose-700 border border-rose-200',
};

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(expiresAt: string) {
  const getRemaining = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, total: diff };
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [getRemaining]);

  return remaining;
}

// ── Countdown display ─────────────────────────────────────────────────────────
function Countdown({ expiresAt, compact = false }: { expiresAt: string; compact?: boolean }) {
  const { days, hours, minutes, seconds, total } = useCountdown(expiresAt);
  const isUrgent = total > 0 && total < 3 * 24 * 60 * 60 * 1000; // < 3 days
  const expired  = total <= 0;

  if (expired) {
    return <span className="text-xs font-bold text-slate-400">Expired</span>;
  }

  if (compact) {
    return (
      <span className={`text-xs font-bold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>
        {days > 0 ? `${days}d ${hours}h left` : `${hours}h ${minutes}m left`}
      </span>
    );
  }

  const unit = (val: number, label: string) => (
    <div className="flex flex-col items-center">
      <span className={`text-base font-black tabular-nums leading-none ${isUrgent ? 'text-rose-600' : 'text-slate-900'}`}>
        {String(val).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  );

  return (
    <div className={`flex items-end gap-1.5 ${isUrgent ? 'text-rose-600' : ''}`}>
      <Timer className={`w-3.5 h-3.5 mb-0.5 ${isUrgent ? 'text-rose-500' : 'text-slate-400'}`} />
      {days > 0 && <>{unit(days, 'days')}<span className="text-slate-300 font-bold text-sm mb-0.5">:</span></>}
      {unit(hours, 'hrs')}
      <span className="text-slate-300 font-bold text-sm mb-0.5">:</span>
      {unit(minutes, 'min')}
      <span className="text-slate-300 font-bold text-sm mb-0.5">:</span>
      {unit(seconds, 'sec')}
    </div>
  );
}

// ── Deal card ─────────────────────────────────────────────────────────────────
function DealCard({ deal, featured = false }: { deal: Deal; featured?: boolean }) {
  const [copied, setCopied] = useState(false);
  const { total } = useCountdown(deal.expiresAt);
  const claimedPct = Math.min(100, Math.round((deal.claimed / deal.maxClaims) * 100));
  const isUrgent   = total > 0 && total < 3 * 24 * 60 * 60 * 1000;
  const isExpired  = total <= 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(deal.code).then(() => {
      setCopied(true);
      toast.success(`Code "${deal.code}" copied!`);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const progressColor =
    claimedPct >= 90 ? 'bg-rose-400' :
    claimedPct >= 60 ? 'bg-amber-400' :
    'bg-emerald-400';

  return (
    <div className={`bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
      featured
        ? 'border-2 border-amber-400 shadow-lg shadow-amber-500/10'
        : isUrgent
        ? 'border border-rose-200 hover:border-rose-300 hover:shadow-md'
        : 'border border-gray-200 hover:border-amber-400/50 hover:shadow-md'
    }`}>

      {/* Urgency banner */}
      {isUrgent && !isExpired && (
        <div className="bg-rose-50 border-b border-rose-100 px-4 py-2 flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="text-rose-600 text-xs font-bold">Ending soon — don't miss this deal!</span>
        </div>
      )}
      {featured && !isUrgent && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />
          <span className="text-amber-700 text-xs font-bold">Featured Deal — Exclusive to LaudStack</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col gap-4">

        {/* Header row */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 border border-black/10"
            style={{ background: deal.logoColor, color: deal.logoTextColor || '#fff' }}
          >
            {deal.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-slate-900 font-bold text-sm">{deal.name}</h3>
              {deal.badge && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[deal.badgeColor!] || BADGE_STYLES.amber}`}>
                  {deal.badge}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5 leading-snug line-clamp-2">{deal.tagline}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {deal.category}
            </span>
          </div>
        </div>

        {/* Pricing block */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-slate-400 text-xs line-through leading-none mb-0.5">{deal.originalPrice}</div>
            <div className="text-slate-900 font-black text-xl leading-tight">{deal.dealPrice}</div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg font-black text-sm shrink-0 ${
            deal.type === 'lifetime'   ? 'bg-purple-100 text-purple-700' :
            deal.type === 'free-trial' ? 'bg-sky-100 text-sky-700' :
            deal.type === 'exclusive'  ? 'bg-amber-100 text-amber-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {deal.discount}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-between">
          <Countdown expiresAt={deal.expiresAt} />
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-slate-700 font-semibold text-xs">{deal.rating}</span>
            <span className="text-slate-400 text-xs">({deal.reviews.toLocaleString()})</span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-1.5 flex-1">
          {deal.features.map(f => (
            <div key={f} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-slate-600 text-xs">{f}</span>
            </div>
          ))}
        </div>

        {/* Claim progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 text-xs">{deal.claimed.toLocaleString()} claimed</span>
            <span className={`text-xs font-bold ${claimedPct >= 90 ? 'text-rose-600' : 'text-slate-500'}`}>
              {claimedPct}% of {deal.maxClaims.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${claimedPct}%` }} />
          </div>
        </div>

        {/* CTA row */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-50 hover:bg-gray-100 text-slate-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {copied
              ? <><Check className="w-3.5 h-3.5" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> {deal.code}</>
            }
          </button>
          <button
            onClick={() => toast.info(`Opening ${deal.name} deal page…`)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 text-slate-500 hover:text-amber-700 transition-all"
            title="Get deal"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Deals() {
  const [location, navigate] = useLocation();

  // Parse initial state from URL
  const parseParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      type:     (params.get('type') as DealType) || 'all',
      category: params.get('category') || 'All Categories',
      sort:     params.get('sort') || 'featured',
    };
  };

  const [activeType, setActiveType]         = useState<DealType>(() => parseParams().type);
  const [activeCategory, setActiveCategory] = useState(() => parseParams().category);
  const [sort, setSort]                     = useState(() => parseParams().sort);
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);

  // Sync URL → state on navigation
  useEffect(() => {
    setSyncingFromUrl(true);
    const p = parseParams();
    setActiveType(p.type);
    setActiveCategory(p.category);
    setSort(p.sort);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [location]);

  // Sync state → URL
  useEffect(() => {
    if (syncingFromUrl) return;
    const params = new URLSearchParams();
    if (activeType !== 'all')                    params.set('type', activeType);
    if (activeCategory !== 'All Categories')     params.set('category', activeCategory);
    if (sort !== 'featured')                     params.set('sort', sort);
    const qs = params.toString();
    navigate(qs ? `/deals?${qs}` : '/deals', { replace: true });
  }, [activeType, activeCategory, sort, syncingFromUrl]);

  // Filter + sort
  const filtered = DEALS
    .filter(d => activeType === 'all' || d.type === activeType)
    .filter(d => activeCategory === 'All Categories' || d.category === activeCategory)
    .sort((a, b) => {
      if (sort === 'expiry') {
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
      if (sort === 'discount') {
        const pctA = parseInt(a.discount) || 0;
        const pctB = parseInt(b.discount) || 0;
        return pctB - pctA;
      }
      if (sort === 'rating') return b.rating - a.rating;
      // featured: featured first, then by expiry
      const fa = a.featured ? 0 : 1;
      const fb = b.featured ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    });

  const lifetimeDeals = DEALS.filter(d => d.type === 'lifetime');
  const hasFilters = activeType !== 'all' || activeCategory !== 'All Categories';

  const clearFilters = () => {
    setActiveType('all');
    setActiveCategory('All Categories');
    setSort('featured');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Exclusive SaaS Deals"
        title="Save on the tools your team uses"
        subtitle="Exclusive discounts, lifetime deals, and extended trials negotiated by LaudStack for our community."
        accent="amber"
        layout="split"
        size="md"
        stats={[
          { value: String(DEALS.length),        label: 'Active Deals' },
          { value: String(lifetimeDeals.length), label: 'Lifetime Deals' },
          { value: 'Up to 50%',                  label: 'Max Discount' },
          { value: '12k+',                       label: 'Members Saved' },
        ]}
      />

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Lifetime Deals spotlight (shown when no filters active) ── */}
        {!hasFilters && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <Crown className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-black text-slate-900">Lifetime Deals</h2>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">
                Pay once, use forever
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lifetimeDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
            </div>
          </section>
        )}

        {/* ── Filters bar ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-start">

            {/* Deal type pills */}
            <div className="flex flex-wrap gap-2">
              {DEAL_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveType(id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeType === id
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-gray-200 self-stretch mx-1" />

            {/* Category select */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={activeCategory}
                onChange={e => setActiveCategory(e.target.value)}
                className="text-sm font-medium text-slate-700 bg-gray-100 border-0 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {TOOL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort select */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm font-medium text-slate-700 bg-gray-100 border-0 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="featured">Featured first</option>
                <option value="expiry">Expiring soonest</option>
                <option value="discount">Biggest discount</option>
                <option value="rating">Highest rated</option>
              </select>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-all ml-auto"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500 font-medium">
            {filtered.length} deal{filtered.length !== 1 ? 's' : ''}
            {hasFilters && <span className="text-amber-600 font-bold"> · filtered</span>}
          </p>
          {filtered.some(d => {
            const t = new Date(d.expiresAt).getTime() - Date.now();
            return t > 0 && t < 3 * 24 * 60 * 60 * 1000;
          }) && (
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
            { icon: Shield,     color: 'text-emerald-500', title: 'Verified Deals',        desc: 'Every deal is verified directly with the vendor before listing.' },
            { icon: Users,      color: 'text-sky-500',     title: 'Community Negotiated',  desc: 'Our growing community gives us leverage to negotiate better rates.' },
            { icon: TrendingUp, color: 'text-amber-500',   title: 'Updated Weekly',        desc: 'New deals added every week. Subscribe to get notified first.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
              <Icon className={`w-5 h-5 ${color} shrink-0 mt-0.5`} />
              <div>
                <div className="text-slate-900 font-bold text-sm mb-1">{title}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Submit a deal CTA ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Have a deal to share?</h3>
            <p className="text-slate-500 text-sm">Submit a deal for your tool and reach 12,000+ potential customers.</p>
          </div>
          <button
            onClick={() => toast.info('Deal submission form coming soon!')}
            className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0"
          >
            <Gift className="w-4 h-4" />
            Submit a Deal
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

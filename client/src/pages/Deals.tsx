// LaudStack — SaaS Deals Page
// Design: Dark editorial, amber accents, deal-card grid with urgency indicators

import { useState } from 'react';
import { Link } from 'wouter';
import {
  Tag, Clock, Zap, Star, ExternalLink, Crown, Flame,
  CheckCircle, ArrowRight, Gift, Shield, TrendingUp, Users
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

type DealType = 'all' | 'lifetime' | 'discount' | 'free-trial' | 'exclusive';

const DEAL_CATEGORIES: { id: DealType; label: string }[] = [
  { id: 'all', label: 'All Deals' },
  { id: 'lifetime', label: '🔑 Lifetime Deals' },
  { id: 'exclusive', label: '⭐ Exclusive' },
  { id: 'discount', label: '💸 Discounts' },
  { id: 'free-trial', label: '🎁 Extended Trials' },
];

const DEALS = [
  {
    id: 'd1',
    name: 'Notion AI',
    tagline: 'All-in-one workspace with AI writing assistant',
    category: 'AI Productivity',
    type: 'exclusive' as DealType,
    originalPrice: '$16/mo',
    dealPrice: '$8/mo',
    discount: '50% OFF',
    code: 'LAUDSTACK50',
    expires: '2026-03-31',
    daysLeft: 23,
    claimed: 1240,
    maxClaims: 2000,
    rating: 4.8,
    reviews: 2840,
    badge: 'Exclusive',
    badgeColor: 'amber',
    features: ['Unlimited AI writes', 'Team collaboration', 'API access', 'Priority support'],
    logo: 'N',
    logoColor: '#171717',
  },
  {
    id: 'd2',
    name: 'Linear',
    tagline: 'Issue tracking built for modern software teams',
    category: 'Project Management',
    type: 'lifetime' as DealType,
    originalPrice: '$8/mo',
    dealPrice: '$149 once',
    discount: 'LIFETIME',
    code: 'LAUD-LINEAR',
    expires: '2026-04-15',
    daysLeft: 38,
    claimed: 890,
    maxClaims: 1500,
    rating: 4.9,
    reviews: 1920,
    badge: 'Lifetime',
    badgeColor: 'purple',
    features: ['Unlimited projects', 'Unlimited members', 'All integrations', 'Lifetime updates'],
    logo: 'L',
    logoColor: '#5E6AD2',
  },
  {
    id: 'd3',
    name: 'Loom',
    tagline: 'Async video messaging for teams',
    category: 'Communication',
    type: 'free-trial' as DealType,
    originalPrice: '$12.50/mo',
    dealPrice: '90 days free',
    discount: '3x Trial',
    code: 'LAUDLOOM90',
    expires: '2026-05-01',
    daysLeft: 54,
    claimed: 3200,
    maxClaims: 5000,
    rating: 4.7,
    reviews: 3100,
    badge: 'Extended Trial',
    badgeColor: 'sky',
    features: ['Unlimited recordings', 'HD quality', 'Custom branding', 'Analytics'],
    logo: 'L',
    logoColor: '#625DF5',
  },
  {
    id: 'd4',
    name: 'Framer',
    tagline: 'Design and publish websites without code',
    category: 'Design',
    type: 'discount' as DealType,
    originalPrice: '$30/mo',
    dealPrice: '$15/mo',
    discount: '50% OFF',
    code: 'LAUDFRAMER',
    expires: '2026-03-20',
    daysLeft: 12,
    claimed: 670,
    maxClaims: 1000,
    rating: 4.8,
    reviews: 1450,
    badge: 'Ending Soon',
    badgeColor: 'rose',
    features: ['Custom domains', 'CMS', 'E-commerce', 'Analytics'],
    logo: 'F',
    logoColor: '#0099FF',
  },
  {
    id: 'd5',
    name: 'Descript',
    tagline: 'Video and podcast editing with AI transcription',
    category: 'AI Video',
    type: 'lifetime' as DealType,
    originalPrice: '$24/mo',
    dealPrice: '$299 once',
    discount: 'LIFETIME',
    code: 'LAUD-DESCRIPT',
    expires: '2026-04-30',
    daysLeft: 53,
    claimed: 420,
    maxClaims: 800,
    rating: 4.7,
    reviews: 980,
    badge: 'Lifetime',
    badgeColor: 'purple',
    features: ['Unlimited projects', 'AI transcription', 'Screen recording', 'Overdub AI'],
    logo: 'D',
    logoColor: '#7C3AED',
  },
  {
    id: 'd6',
    name: 'Webflow',
    tagline: 'Visual web development platform',
    category: 'No-Code',
    type: 'exclusive' as DealType,
    originalPrice: '$23/mo',
    dealPrice: '$14/mo',
    discount: '40% OFF',
    code: 'LAUDWF40',
    expires: '2026-03-28',
    daysLeft: 20,
    claimed: 1100,
    maxClaims: 2000,
    rating: 4.6,
    reviews: 2200,
    badge: 'Exclusive',
    badgeColor: 'amber',
    features: ['Custom domains', 'CMS', 'E-commerce', 'Hosting'],
    logo: 'W',
    logoColor: '#4353FF',
  },
  {
    id: 'd7',
    name: 'Airtable',
    tagline: 'Spreadsheet-database hybrid for teams',
    category: 'Productivity',
    type: 'free-trial' as DealType,
    originalPrice: '$20/mo',
    dealPrice: '60 days free',
    discount: '2x Trial',
    code: 'LAUDAIR60',
    expires: '2026-05-15',
    daysLeft: 68,
    claimed: 2800,
    maxClaims: 5000,
    rating: 4.5,
    reviews: 1800,
    badge: 'Extended Trial',
    badgeColor: 'sky',
    features: ['Unlimited bases', 'Automations', 'API access', 'Integrations'],
    logo: 'A',
    logoColor: '#FCB400',
  },
  {
    id: 'd8',
    name: 'Typeform',
    tagline: 'Engaging forms and surveys that people love',
    category: 'Forms',
    type: 'discount' as DealType,
    originalPrice: '$25/mo',
    dealPrice: '$12.50/mo',
    discount: '50% OFF',
    code: 'LAUDTYPE50',
    expires: '2026-04-10',
    daysLeft: 33,
    claimed: 560,
    maxClaims: 1200,
    rating: 4.6,
    reviews: 1340,
    badge: null,
    badgeColor: null,
    features: ['Unlimited responses', 'Logic jumps', 'Integrations', 'Analytics'],
    logo: 'T',
    logoColor: '#262627',
  },
];

const BADGE_COLORS: Record<string, string> = {
  amber: 'bg-amber-400/15 text-amber-700 border-amber-400/30',
  purple: 'bg-purple-400/15 text-purple-700 border-purple-400/30',
  sky: 'bg-sky-400/15 text-sky-700 border-sky-400/30',
  rose: 'bg-rose-400/15 text-rose-700 border-rose-400/30',
};

function DealCard({ deal }: { deal: typeof DEALS[0] }) {
  const [copied, setCopied] = useState(false);
  const claimedPct = Math.round((deal.claimed / deal.maxClaims) * 100);
  const isUrgent = deal.daysLeft <= 14;

  const handleCopy = () => {
    navigator.clipboard.writeText(deal.code).then(() => {
      setCopied(true);
      toast.success(`Code ${deal.code} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col ${isUrgent ? 'border-rose-200' : 'border-slate-200 hover:border-slate-300'}`}>
      {isUrgent && (
        <div className="bg-rose-50 border-b border-rose-100 px-4 py-2 flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-rose-600 text-xs font-bold">Expires in {deal.daysLeft} days — grab it before it's gone!</span>
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-900 font-black text-lg flex-shrink-0"
            style={{ background: deal.logoColor }}
          >
            {deal.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-slate-900 font-bold text-sm">{deal.name}</h3>
              {deal.badge && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${BADGE_COLORS[deal.badgeColor!] || BADGE_COLORS.amber}`}>
                  {deal.badge}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5 leading-snug">{deal.tagline}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs line-through">{deal.originalPrice}</div>
            <div className="text-slate-900 font-black text-lg leading-tight">{deal.dealPrice}</div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg font-black text-sm ${
            deal.type === 'lifetime' ? 'bg-purple-100 text-purple-700' :
            deal.type === 'free-trial' ? 'bg-sky-100 text-sky-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {deal.discount}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-1.5 mb-4 flex-1">
          {deal.features.map(f => (
            <div key={f} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-slate-600 text-xs">{f}</span>
            </div>
          ))}
        </div>

        {/* Claim progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-500 text-xs">{deal.claimed.toLocaleString()} claimed</span>
            <span className="text-slate-500 text-xs">{deal.maxClaims.toLocaleString()} max</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${claimedPct > 80 ? 'bg-rose-400' : claimedPct > 50 ? 'bg-amber-400' : 'bg-green-400'}`}
              style={{ width: `${claimedPct}%` }}
            />
          </div>
          <div className="text-slate-500 text-xs mt-1">{claimedPct}% claimed</div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-slate-700 font-semibold text-xs">{deal.rating}</span>
          <span className="text-slate-500 text-xs">({deal.reviews.toLocaleString()} reviews)</span>
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white hover:bg-gray-100 text-slate-900 border-transparent'
            }`}
          >
            {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Tag className="w-4 h-4" /> {deal.code}</>}
          </button>
          <button
            onClick={() => toast.info('Opening deal page...')}
            className="px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Deals() {
  const [activeType, setActiveType] = useState<DealType>('all');

  const filtered = activeType === 'all' ? DEALS : DEALS.filter(d => d.type === activeType);
  const lifetimeDeals = DEALS.filter(d => d.type === 'lifetime');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          eyebrow="Exclusive SaaS Deals"
          title="Save on the tools your team uses"
          subtitle="Exclusive discounts, lifetime deals, and extended trials negotiated by LaudStack for our community."
          accent="rose"
          badge="Live"
          layout="split"
          size="md"
          stats={[
            { value: String(DEALS.length),         label: 'Active Deals' },
            { value: String(lifetimeDeals.length),  label: 'Lifetime Deals' },
            { value: 'Up to 50%',                   label: 'Max Discount' },
            { value: '12k+',                        label: 'Members Saved' },
          ]}
        />

        <div className="max-w-[1300px] mx-auto px-4 py-8">

          {/* Lifetime Deals spotlight */}
          {activeType === 'all' && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <Crown className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-black text-slate-900">Lifetime Deals</h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">Pay once, use forever</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {lifetimeDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-6">
            {DEAL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveType(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  activeType === cat.id
                    ? 'bg-white text-slate-900 border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* All Deals Grid */}
          <div className="mb-5">
            <span className="text-slate-500 text-sm font-medium">{filtered.length} deal{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {filtered.map(deal => <DealCard key={deal.id} deal={deal} />)}
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: <Shield className="w-5 h-5 text-green-500" />, title: 'Verified Deals', desc: 'Every deal is verified directly with the vendor before listing.' },
              { icon: <Users className="w-5 h-5 text-sky-500" />, title: 'Community Negotiated', desc: 'Our growing community gives us leverage to negotiate better rates.' },
              { icon: <TrendingUp className="w-5 h-5 text-amber-500" />, title: 'Updated Weekly', desc: 'New deals added every week. Subscribe to get notified first.' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <div className="text-slate-900 font-bold text-sm mb-1">{item.title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit a deal CTA */}
          <div className="bg-white text-slate-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black mb-1">Have a deal to share?</h3>
              <p className="text-slate-500 text-sm">Submit a deal for your tool and reach 12,000+ potential customers.</p>
            </div>
            <button
              onClick={() => toast.info('Deal submission form coming soon!')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Gift className="w-4 h-4" />
              Submit a Deal
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

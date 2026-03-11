/*
 * LaudStack — SaaS Deals Page
 * Design: white bg, amber accents, rose urgency indicators, no gradients
 * Features: live countdown timers, dual filters (type + category), URL persistence,
 *           claim progress bars, copy-to-clipboard coupon codes, deal spotlight
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  Tag, Clock, Zap, Star, ExternalLink, Crown, Flame,
  CheckCircle, Gift, Shield, TrendingUp, Users, Timer,
  Copy, Check, SlidersHorizontal, X, ArrowUpRight, Percent,
  Building2, Mail, Globe, FileText
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

// ── Submit a Deal Modal ───────────────────────────────────────────────────────
function SubmitDealModal({ onClose }: { onClose: () => void }) {
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
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
        boxShadow: '0 24px 64px rgba(15,23,42,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift style={{ width: 14, height: 14, color: '#D97706' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Submit a Deal</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Share a deal with the community</h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ width: 15, height: 15, color: '#64748B' }} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '12px 28px', borderBottom: '1px solid #F8FAFC', display: 'flex', gap: 6 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 99, background: s <= step ? '#F59E0B' : '#E2E8F0', transition: 'background 0.2s' }} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {step === 1 ? (
              <>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Tell us about the tool and the deal you want to share.</p>
                {/* Tool name */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Tool Name *</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8' }} />
                    <input
                      required value={form.toolName} onChange={e => update('toolName', e.target.value)}
                      placeholder="e.g. Notion, Linear, Figma"
                      style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                {/* Tool URL */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Tool Website *</label>
                  <div style={{ position: 'relative' }}>
                    <Globe style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8' }} />
                    <input
                      required type="url" value={form.toolUrl} onChange={e => update('toolUrl', e.target.value)}
                      placeholder="https://yourtool.com"
                      style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                {/* Category */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Category *</label>
                  <select
                    value={form.category} onChange={e => update('category', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    {['AI Productivity','AI Writing','AI Image','AI Code','Marketing','Project Management','CRM','Design','Developer Tools','Communication','Analytics','Sales'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Now tell us the deal details and how to reach you.</p>
                {/* Discount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Discount *</label>
                    <div style={{ position: 'relative' }}>
                      <Percent style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8' }} />
                      <input
                        required value={form.discount} onChange={e => update('discount', e.target.value)}
                        placeholder="e.g. 50% OFF"
                        style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Coupon Code</label>
                    <div style={{ position: 'relative' }}>
                      <Tag style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8' }} />
                      <input
                        value={form.code} onChange={e => update('code', e.target.value)}
                        placeholder="LAUDSTACK20"
                        style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
                {/* Expiry */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Expiry Date *</label>
                  <input
                    required type="date" value={form.expiresAt} onChange={e => update('expiresAt', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                {/* Description */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Deal Description</label>
                  <textarea
                    value={form.description} onChange={e => update('description', e.target.value)}
                    rows={3} placeholder="What's included in this deal? Any special conditions?"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                {/* Email */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Your Email *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94A3B8' }} />
                    <input
                      required type="email" value={form.email} onChange={e => update('email', e.target.value)}
                      placeholder="you@company.com"
                      style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 28px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)} style={{ fontSize: 13, fontWeight: 700, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                ← Back
              </button>
            ) : <div />}
            {step === 1 ? (
              <button
                type="button"
                onClick={() => { if (!form.toolName || !form.toolUrl) { toast.error('Please fill in all required fields'); return; } setStep(2); }}
                style={{ padding: '10px 24px', borderRadius: 10, background: '#F59E0B', color: '#0A0A0A', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer' }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                style={{ padding: '10px 24px', borderRadius: 10, background: '#F59E0B', color: '#0A0A0A', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Gift style={{ width: 13, height: 13 }} /> Submit Deal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Deal card ─────────────────────────────────────────────────────────────────
function DealCard({ deal, featured = false }: { deal: Deal; featured?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
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

  const claimedColor = claimedPct >= 90 ? '#F87171' : claimedPct >= 60 ? '#FBBF24' : '#34D399';

  // Discount badge colours
  const discountStyle: React.CSSProperties =
    deal.type === 'lifetime'   ? { background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' } :
    deal.type === 'free-trial' ? { background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD' } :
    deal.type === 'exclusive'  ? { background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' } :
                                 { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1.5px solid',
        borderColor: featured ? '#FDE68A' : isUrgent ? '#FECACA' : hovered ? '#CBD5E1' : '#E8EDF2',
        boxShadow: featured
          ? '0 4px 20px rgba(245,158,11,0.12)'
          : hovered
          ? '0 10px 32px rgba(15,23,42,0.10)'
          : '0 1px 4px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top banner */}
      {isUrgent && !isExpired && (
        <div style={{ padding: '7px 18px', background: '#FFF1F2', borderBottom: '1px solid #FECDD3', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flame style={{ width: 13, height: 13, color: '#F43F5E' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#BE123C' }}>Ending soon — grab it before it's gone!</span>
        </div>
      )}
      {featured && !isUrgent && (
        <div style={{ padding: '7px 18px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Star style={{ width: 12, height: 12, color: '#D97706', fill: '#D97706' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Featured Deal · Exclusive to LaudStack</span>
        </div>
      )}

      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Logo */}
          <div style={{
            width: 52, height: 52, borderRadius: 13, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 20, border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
            background: deal.logoColor, color: deal.logoTextColor || '#fff',
          }}>
            {deal.logo}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.015em' }}>{deal.name}</h3>
              {deal.badge && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, ...discountStyle }}>
                  {deal.badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 6px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {deal.tagline}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>
                {deal.category}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{deal.rating}</span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>({deal.reviews.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* Discount badge */}
          <div style={{
            ...discountStyle,
            padding: '6px 12px', borderRadius: 10, fontWeight: 900, fontSize: 13,
            flexShrink: 0, textAlign: 'center', lineHeight: 1.2,
          }}>
            {deal.discount}
          </div>
        </div>

        {/* ── Pricing row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', textDecoration: 'line-through', marginBottom: 2 }}>{deal.originalPrice}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>{deal.dealPrice}</div>
          </div>
          <Countdown expiresAt={deal.expiresAt} />
        </div>

        {/* ── Features ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
          {deal.features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <CheckCircle style={{ width: 13, height: 13, color: '#22C55E', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* ── Claim progress ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 500 }}>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>{deal.claimed.toLocaleString()}</span> of {deal.maxClaims.toLocaleString()} claimed
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: claimedPct >= 90 ? '#EF4444' : '#64748B' }}>{claimedPct}%</span>
          </div>
          <div style={{ height: 5, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: claimedColor, width: `${claimedPct}%`, transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* ── CTA row ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Copy code */}
          <button
            onClick={handleCopy}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
              background: copied ? '#F0FDF4' : '#F8FAFC',
              borderColor: copied ? '#BBF7D0' : '#E2E8F0',
              color: copied ? '#15803D' : '#374151',
            }}
          >
            {copied
              ? <><Check style={{ width: 13, height: 13 }} /> Copied!</>
              : <><Copy style={{ width: 13, height: 13 }} /> {deal.code || 'No code needed'}</>
            }
          </button>
          {/* Get deal */}
          <button
            onClick={() => window.open(deal.url || '#', '_blank', 'noopener,noreferrer')}
            style={{
              padding: '10px 16px', borderRadius: 10, fontWeight: 800, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#F59E0B', color: '#0A0A0A', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FBBF24'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F59E0B'; }}
          >
            Get Deal <ArrowUpRight style={{ width: 13, height: 13 }} />
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

  const [showSubmitModal, setShowSubmitModal] = useState(false);

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
            onClick={() => setShowSubmitModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0"
          >
            <Gift className="w-4 h-4" />
            Submit a Deal
          </button>
        </div>
      </div>

      <Footer />
      {showSubmitModal && <SubmitDealModal onClose={() => setShowSubmitModal(false)} />}
    </div>
  );
}

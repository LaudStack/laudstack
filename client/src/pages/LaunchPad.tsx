/*
 * LaunchPad.tsx — LaudStack Founder Submission Page
 * Design: Clean white, enterprise-grade, G2-inspired
 * Steps:
 *   1. Tool Info      (name, tagline, website, description, logo)
 *   2. Category       (category, tags, badges)
 *   3. Pricing        (pricing model, plans)
 *   4. Media          (screenshots, demo video)
 *   5. Review & Submit
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import {
  Rocket, CheckCircle2, ArrowRight, ArrowLeft, Upload,
  Globe, Tag, DollarSign, Image, Eye, X, Plus, Trash2,
  Zap, Shield, BarChart3, Users, Star, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

// ─── Types ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'AI Writing', 'Code Editor', 'Design', 'Productivity', 'Analytics',
  'CRM', 'Marketing', 'DevTools', 'Communication', 'Finance',
  'HR & Recruiting', 'Project Management', 'Security', 'Data & BI', 'Other',
];

const PRICING_MODELS = [
  { value: 'free',       label: 'Free',            desc: 'Always free, no credit card required' },
  { value: 'freemium',   label: 'Freemium',         desc: 'Free tier + paid upgrades' },
  { value: 'paid',       label: 'Paid',             desc: 'Subscription or one-time purchase' },
  { value: 'free_trial', label: 'Free Trial',       desc: 'Trial period, then paid' },
  { value: 'open_source',label: 'Open Source',      desc: 'Free & open source' },
  { value: 'contact',    label: 'Contact for Price',desc: 'Enterprise / custom pricing' },
];

const POPULAR_TAGS = [
  'AI', 'Automation', 'No-Code', 'API', 'Collaboration', 'Analytics',
  'Open Source', 'Mobile', 'Integrations', 'Real-time', 'Security', 'B2B',
];

const STEPS = [
  { id: 1, label: 'Tool Info',   icon: Globe },
  { id: 2, label: 'Category',   icon: Tag },
  { id: 3, label: 'Pricing',    icon: DollarSign },
  { id: 4, label: 'Media',      icon: Image },
  { id: 5, label: 'Review',     icon: Eye },
];

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string;
}

interface FormData {
  // Step 1
  name: string;
  tagline: string;
  website: string;
  description: string;
  logo: string;
  launchDate: string;  // ISO date string YYYY-MM-DD
  // Step 2
  category: string;
  tags: string[];
  // Step 3
  pricingModel: string;
  plans: PricingPlan[];
  // Step 4
  screenshots: string[];
  demoVideo: string;
}

const INITIAL_FORM: FormData = {
  name: '', tagline: '', website: '', description: '', logo: '', launchDate: '',
  category: '', tags: [],
  pricingModel: '', plans: [{ name: 'Starter', price: '', period: 'month', features: '' }],
  screenshots: [''], demoVideo: '',
};

// ─── Step Components ─────────────────────────────────────────────────────────

function StepToolInfo({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const field = (key: keyof FormData, value: string) => setForm({ ...form, [key]: value });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Tool Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Tool Name <Required /></label>
          <input value={form.name} onChange={e => field('name', e.target.value)}
            placeholder="e.g. Notion, Linear, Cursor" style={inputStyle}
            onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        {/* Tagline */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Tagline <Required /></label>
          <input value={form.tagline} onChange={e => field('tagline', e.target.value)}
            placeholder="One-line pitch — what does it do?" maxLength={120} style={inputStyle}
            onFocus={focusStyle} onBlur={blurStyle} />
          <div style={charCount}>{form.tagline.length}/120</div>
        </div>
        {/* Website */}
        <div>
          <label style={labelStyle}>Website URL <Required /></label>
          <input value={form.website} onChange={e => field('website', e.target.value)}
            placeholder="https://yourtool.com" type="url" style={inputStyle}
            onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        {/* Logo URL */}
        <div>
          <label style={labelStyle}>Logo URL</label>
          <input value={form.logo} onChange={e => field('logo', e.target.value)}
            placeholder="https://yourtool.com/logo.png" style={inputStyle}
            onFocus={focusStyle} onBlur={blurStyle} />
        </div>
      </div>
      {/* Description */}
      <div>
        <label style={labelStyle}>Description <Required /></label>
        <textarea value={form.description} onChange={e => field('description', e.target.value)}
          placeholder="Describe your tool in detail — key features, use cases, who it's for, and what makes it different from alternatives."
          rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, minHeight: '120px' }}
          onFocus={focusStyle} onBlur={blurStyle} />
        <div style={charCount}>{form.description.length} chars {form.description.length < 100 ? `(${100 - form.description.length} more recommended)` : '✓'}</div>
      </div>
      {/* Launch Date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Launch Date</label>
          <input
            type="date"
            value={form.launchDate}
            onChange={e => field('launchDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Leave blank to list immediately after review</div>
        </div>
        <div>
          <label style={labelStyle}>Launch Type</label>
          <select
            value={form.launchDate ? 'scheduled' : 'immediate'}
            onChange={e => { if (e.target.value === 'immediate') field('launchDate', ''); }}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="immediate">Immediate — go live after review</option>
            <option value="scheduled">Scheduled — pick a launch date</option>
          </select>
        </div>
      </div>
      {/* Launch date info banner */}
      {form.launchDate && (
        <div style={{ padding: '12px 16px', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px' }}>📅</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', marginBottom: '2px' }}>Scheduled Launch</div>
            <div style={{ fontSize: '12px', color: '#3B82F6', lineHeight: 1.5 }}>
              Your tool will appear in the "Upcoming Launches" section and go live on{' '}
              <strong>{new Date(form.launchDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
              A countdown timer will build anticipation with the community.
            </div>
          </div>
        </div>
      )}
      {/* Logo preview */}
      {form.logo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <img src={form.logo} alt="Logo preview" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #E2E8F0' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ fontSize: '13px', color: '#64748B' }}>Logo preview</span>
        </div>
      )}
    </div>
  );
}

function StepCategory({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const toggleTag = (tag: string) => {
    const tags = form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : form.tags.length < 8 ? [...form.tags, tag] : form.tags;
    setForm({ ...form, tags });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Category */}
      <div>
        <label style={labelStyle}>Primary Category <Required /></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setForm({ ...form, category: cat })}
              style={{
                padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${form.category === cat ? '#F59E0B' : '#E2E8F0'}`,
                background: form.category === cat ? '#FFFBEB' : '#fff', color: form.category === cat ? '#B45309' : '#374151',
                fontSize: '13px', fontWeight: form.category === cat ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontFamily: 'inherit',
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* Tags */}
      <div>
        <label style={labelStyle}>Tags <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>up to 8</span></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {POPULAR_TAGS.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: `1.5px solid ${form.tags.includes(tag) ? '#F59E0B' : '#E2E8F0'}`,
                background: form.tags.includes(tag) ? '#FFFBEB' : '#F8FAFC', color: form.tags.includes(tag) ? '#B45309' : '#64748B',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              }}>
              {tag}
            </button>
          ))}
        </div>
        {form.tags.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748B' }}>
            Selected: {form.tags.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

function StepPricing({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const updatePlan = (i: number, key: keyof PricingPlan, value: string) => {
    const plans = form.plans.map((p, idx) => idx === i ? { ...p, [key]: value } : p);
    setForm({ ...form, plans });
  };
  const addPlan = () => form.plans.length < 4 && setForm({ ...form, plans: [...form.plans, { name: '', price: '', period: 'month', features: '' }] });
  const removePlan = (i: number) => setForm({ ...form, plans: form.plans.filter((_, idx) => idx !== i) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Pricing Model */}
      <div>
        <label style={labelStyle}>Pricing Model <Required /></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
          {PRICING_MODELS.map(m => (
            <button key={m.value} onClick={() => setForm({ ...form, pricingModel: m.value })}
              style={{
                padding: '12px 14px', borderRadius: '10px', border: `1.5px solid ${form.pricingModel === m.value ? '#F59E0B' : '#E2E8F0'}`,
                background: form.pricingModel === m.value ? '#FFFBEB' : '#fff', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontFamily: 'inherit',
              }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: form.pricingModel === m.value ? '#B45309' : '#171717' }}>{m.label}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Plans (shown for paid/freemium/free_trial) */}
      {['paid', 'freemium', 'free_trial'].includes(form.pricingModel) && (
        <div>
          <label style={labelStyle}>Pricing Plans</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {form.plans.map((plan, i) => (
              <div key={i} style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Plan {i + 1}</span>
                  {form.plans.length > 1 && (
                    <button onClick={() => removePlan(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', display: 'flex' }}>
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <input value={plan.name} onChange={e => updatePlan(i, 'name', e.target.value)}
                    placeholder="Plan name (e.g. Pro)" style={{ ...inputStyle, fontSize: '13px' }}
                    onFocus={focusStyle} onBlur={blurStyle} />
                  <input value={plan.price} onChange={e => updatePlan(i, 'price', e.target.value)}
                    placeholder="Price (e.g. 29)" style={{ ...inputStyle, fontSize: '13px' }}
                    onFocus={focusStyle} onBlur={blurStyle} />
                  <select value={plan.period} onChange={e => updatePlan(i, 'period', e.target.value)}
                    style={{ ...inputStyle, fontSize: '13px', cursor: 'pointer' }}>
                    <option value="month">/ month</option>
                    <option value="year">/ year</option>
                    <option value="one_time">one-time</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <input value={plan.features} onChange={e => updatePlan(i, 'features', e.target.value)}
                  placeholder="Key features (comma-separated)" style={{ ...inputStyle, fontSize: '13px' }}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            ))}
            {form.plans.length < 4 && (
              <button onClick={addPlan} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#F59E0B', background: 'none', border: '1.5px dashed #FDE68A', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add another plan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepMedia({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const updateScreenshot = (i: number, v: string) =>
    setForm({ ...form, screenshots: form.screenshots.map((s, idx) => idx === i ? v : s) });
  const addScreenshot = () => form.screenshots.length < 5 && setForm({ ...form, screenshots: [...form.screenshots, ''] });
  const removeScreenshot = (i: number) => setForm({ ...form, screenshots: form.screenshots.filter((_, idx) => idx !== i) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Screenshots */}
      <div>
        <label style={labelStyle}>Screenshot URLs <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>up to 5</span></label>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px', marginBottom: '10px' }}>
          Add URLs to screenshots hosted on your site, Imgur, or any public CDN.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {form.screenshots.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Image style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
              </div>
              <input value={s} onChange={e => updateScreenshot(i, e.target.value)}
                placeholder={`Screenshot ${i + 1} URL`} style={{ ...inputStyle, flex: 1, fontSize: '13px' }}
                onFocus={focusStyle} onBlur={blurStyle} />
              {s && (
                <img src={s} alt="" style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E2E8F0', flexShrink: 0 }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              )}
              {form.screenshots.length > 1 && (
                <button onClick={() => removeScreenshot(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', display: 'flex', flexShrink: 0 }}>
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </div>
          ))}
          {form.screenshots.length < 5 && (
            <button onClick={addScreenshot} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit', width: 'fit-content' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Add screenshot
            </button>
          )}
        </div>
      </div>

      {/* Demo Video */}
      <div>
        <label style={labelStyle}>Demo Video URL <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>optional</span></label>
        <input value={form.demoVideo} onChange={e => setForm({ ...form, demoVideo: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or Loom link" style={inputStyle}
          onFocus={focusStyle} onBlur={blurStyle} />
      </div>
    </div>
  );
}

function StepReview({ form }: { form: FormData }) {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ padding: '16px 20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{title}</div>
      {children}
    </div>
  );
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '6px' }}>
      <span style={{ fontSize: '12px', color: '#94A3B8', minWidth: '100px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#171717', wordBreak: 'break-all' }}>{value || '—'}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Section title="Tool Info">
        <Row label="Name" value={form.name} />
        <Row label="Tagline" value={form.tagline} />
        <Row label="Website" value={form.website} />
        <Row label="Description" value={form.description ? form.description.slice(0, 120) + (form.description.length > 120 ? '…' : '') : ''} />
      </Section>
      <Section title="Category & Tags">
        <Row label="Category" value={form.category} />
        <Row label="Tags" value={form.tags.join(', ')} />
      </Section>
      <Section title="Pricing">
        <Row label="Model" value={PRICING_MODELS.find(m => m.value === form.pricingModel)?.label || ''} />
        {form.plans.filter(p => p.name).map((p, i) => (
          <Row key={i} label={`Plan ${i + 1}`} value={`${p.name}${p.price ? ` — $${p.price}/${p.period}` : ''}`} />
        ))}
      </Section>
      <Section title="Media">
        <Row label="Screenshots" value={`${form.screenshots.filter(Boolean).length} added`} />
        <Row label="Demo Video" value={form.demoVideo || 'None'} />
      </Section>
      <Section title="Launch">
        <Row label="Launch Date" value={form.launchDate ? new Date(form.launchDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : 'Immediate (after review)'} />
        <Row label="Status" value={form.launchDate ? 'Scheduled — countdown will appear on Launches page' : 'Will go live within 48h of approval'} />
      </Section>
      <div style={{ padding: '14px 16px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A', display: 'flex', gap: '10px' }}>
        <Shield style={{ width: '16px', height: '16px', color: '#F59E0B', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '12px', color: '#92400E', lineHeight: 1.5, margin: 0 }}>
          By submitting, you confirm this is your tool and all information is accurate. Listings are reviewed within 48 hours. Free to list — no credit card required.
        </p>
      </div>
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1.5px solid #E2E8F0', fontSize: '14px', color: '#171717',
  outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
  fontFamily: 'inherit', background: '#fff',
};
const charCount: React.CSSProperties = {
  fontSize: '11px', color: '#94A3B8', textAlign: 'right', marginTop: '4px',
};
const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = '#F59E0B';
};
const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = '#E2E8F0';
};
const Required = () => <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>;

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(step: number, form: FormData): string | null {
  if (step === 1) {
    if (!form.name.trim()) return 'Tool name is required';
    if (!form.tagline.trim()) return 'Tagline is required';
    if (!form.website.trim()) return 'Website URL is required';
    if (!form.description.trim() || form.description.length < 50) return 'Description must be at least 50 characters';
  }
  if (step === 2) {
    if (!form.category) return 'Please select a category';
  }
  if (step === 3) {
    if (!form.pricingModel) return 'Please select a pricing model';
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LaunchPad() {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const goNext = () => {
    const err = validate(step, form);
    if (err) { toast.error(err); return; }
    setStep(s => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const goBack = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSubmit = () => {
    const err = validate(step, form);
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1500);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ textAlign: 'center', maxWidth: '520px' }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}>
              <CheckCircle2 style={{ width: '40px', height: '40px', color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#171717', marginBottom: '12px' }}>
              {form.name} is submitted! 🎉
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7, marginBottom: form.launchDate ? '16px' : '32px' }}>
              Your tool is under review. We'll notify you within 48 hours once it's approved.
              {form.launchDate ? '' : ' In the meantime, share your listing with your community to build early momentum.'}
            </p>
            {form.launchDate && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: '28px' }}>
                <span style={{ fontSize: '16px' }}>📅</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scheduled Launch</div>
                  <div style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 600 }}>
                    {new Date(form.launchDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/">
                <button style={{ padding: '12px 28px', borderRadius: '12px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
                  Back to Home
                </button>
              </Link>
              <button onClick={() => { setSubmitted(false); setStep(1); setForm(INITIAL_FORM); }}
                style={{ padding: '12px 28px', borderRadius: '12px', border: '1.5px solid #E2E8F0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Submit Another Tool
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <PageHero
        eyebrow="LaunchPad"
        title="Get your tool in front of thousands of buyers"
        subtitle="List your AI or SaaS tool on LaudStack. Free to submit — no credit card required. Listings go live within 48 hours after review."
        accent="amber"
        layout="centered"
        size="md"
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginTop: '4px' }}>
          {[
            { icon: Zap, label: '5 min setup' },
            { icon: Shield, label: 'Free to list' },
            { icon: BarChart3, label: 'Real analytics' },
            { icon: Users, label: '12,000+ buyers' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{label}</span>
            </div>
          ))}
        </div>
      </PageHero>

      {/* ── Form ── */}
      <div style={{ flex: 1, padding: '48px 24px 80px', maxWidth: '760px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '0' }}>
          {STEPS.map((s, i) => {
            const done    = step > s.id;
            const active  = step === s.id;
            const Icon    = s.icon;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? '#22C55E' : active ? '#F59E0B' : '#F1F5F9',
                    border: `2px solid ${done ? '#22C55E' : active ? '#F59E0B' : '#E2E8F0'}`,
                    transition: 'all 0.2s',
                  }}>
                    {done
                      ? <CheckCircle2 style={{ width: '16px', height: '16px', color: '#fff' }} />
                      : <Icon style={{ width: '15px', height: '15px', color: active ? '#fff' : '#94A3B8' }} />
                    }
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: active ? 700 : 500, color: active ? '#F59E0B' : done ? '#22C55E' : '#94A3B8', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: done ? '#22C55E' : '#E2E8F0', margin: '0 6px', marginBottom: '22px', transition: 'background 0.2s' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}
          >
            {/* Card Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {(() => { const Icon = STEPS[step - 1].icon; return <Icon style={{ width: '16px', height: '16px', color: '#F59E0B' }} />; })()}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step {step} of {STEPS.length}</div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#171717' }}>{STEPS[step - 1].label}</div>
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '28px' }}>
              {step === 1 && <StepToolInfo form={form} setForm={setForm} />}
              {step === 2 && <StepCategory form={form} setForm={setForm} />}
              {step === 3 && <StepPricing form={form} setForm={setForm} />}
              {step === 4 && <StepMedia form={form} setForm={setForm} />}
              {step === 5 && <StepReview form={form} />}
            </div>

            {/* Card Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA' }}>
              <button
                onClick={goBack}
                disabled={step === 1}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#fff', color: step === 1 ? '#CBD5E1' : '#374151', fontWeight: 600, fontSize: '13px', cursor: step === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{step} / {STEPS.length}</span>
                {step < 5 ? (
                  <button
                    onClick={goNext}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', borderRadius: '10px', border: 'none', background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(245,158,11,0.25)' }}
                  >
                    Continue <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', borderRadius: '10px', border: 'none', background: submitting ? '#FDE68A' : '#22C55E', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: submitting ? 'none' : '0 4px 12px rgba(16,185,129,0.3)' }}
                  >
                    <Rocket style={{ width: '14px', height: '14px' }} />
                    {submitting ? 'Submitting…' : 'Submit Tool'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}

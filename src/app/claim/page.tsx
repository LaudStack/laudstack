"use client";

export const dynamic = 'force-dynamic';


// LaudStack — Claim Your Stack Page
// Design: Dark editorial, amber accents, trust-forward verification flow

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, CheckCircle, Building2, Mail, Globe, FileText,
  ArrowRight, Zap, Star, BarChart3, MessageSquare, Crown,
  Upload, AlertCircle, Clock, Lock, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import AuthGateModal from '@/components/AuthGateModal';
import { useToolsData } from '@/hooks/useToolsData';
import { useAuth } from '@/hooks/useAuth';
import { claimExistingTool } from '@/app/actions/founder';
import { requestFounderUpgrade } from '@/app/actions/public';
import type { Tool } from '@/lib/types';

type Step = 'search' | 'verify' | 'details' | 'submitted';

const PRO_BENEFITS = [
  { icon: <BarChart3 className="w-5 h-5 text-amber-400" />, title: 'Full Analytics', desc: 'Track page views, click-throughs, review sentiment, and laud trends over time.' },
  { icon: <MessageSquare className="w-5 h-5 text-amber-400" />, title: 'Respond to Reviews', desc: 'Reply publicly to any review on your stack page with rich text formatting.' },
  { icon: <Crown className="w-5 h-5 text-amber-400" />, title: 'Verified Founder Badge', desc: 'A blue checkmark on your listing signals authenticity and builds trust with buyers.' },
  { icon: <Zap className="w-5 h-5 text-amber-400" />, title: 'Priority Review Queue', desc: 'New tool submissions reviewed within 24 hours instead of the standard 3 business days.' },
  { icon: <Star className="w-5 h-5 text-amber-400" />, title: 'Featured Placement', desc: 'Your tool gets a "Featured" badge and appears higher in category browse results.' },
  { icon: <Globe className="w-5 h-5 text-amber-400" />, title: 'Promotional Banner', desc: 'Run one promotional banner per month on your stack\'s detail page to highlight offers.' },
];

export default function ClaimTool() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  const [step, setStep] = useState<Step>('search');
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [verifyMethod, setVerifyMethod] = useState<'email' | 'dns' | 'file'>('email');
  const [founderName, setFounderName] = useState('');
  const [founderEmail, setFounderEmail] = useState('');
  const [founderRole, setFounderRole] = useState('');
  const [founderBio, setFounderBio] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [agreed, setAgreed] = useState(false);

  const filteredTools = query.length > 1
    ? allTools.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.tagline.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelectTool = (tool: Tool) => {
    if (!isAuthenticated) { setShowAuthGate(true); return; }
    setSelectedTool(tool);
    setQuery(tool.name);
    setStep('verify');
  };

  const handleVerify = () => {
    if (!verifyMethod) return;
    setStep('details');
    toast.success('Verification method selected. Complete your founder profile below.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { setShowAuthGate(true); return; }
    if (!agreed) { toast.error('Please agree to the Founder Terms to continue.'); return; }
    if (!founderName || !founderEmail || !founderRole) { toast.error('Please fill in all required fields.'); return; }
    setSubmitting(true);
    try {
      // 1. Create the actual tool claim record so admin can review it
      const toolId = selectedTool ? parseInt(selectedTool.id, 10) : 0;
      if (!toolId) { toast.error('No tool selected'); setSubmitting(false); return; }
      const claimResult = await claimExistingTool(toolId, {
        proofUrl: website || selectedTool?.website_url || '',
        message: `${founderRole} — ${founderName} (${founderEmail})${founderBio ? '\n' + founderBio : ''}`,
      });
      if (!claimResult.success) {
        toast.error(claimResult.error || 'Failed to submit claim');
        setSubmitting(false);
        return;
      }
      // 2. Also request founder upgrade so user gets founder status
      await requestFounderUpgrade({
        founderBio: founderBio || `${founderRole} at ${selectedTool?.name || 'a product'}`,
        founderWebsite: website || selectedTool?.website_url || '',
      });
      setStep('submitted');
      toast.success('Claim received! We\'ll review it within 2 business days.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <AuthGateModal open={showAuthGate} onClose={() => setShowAuthGate(false)} action="claim" />
      <div className="flex-1">
        <PageHero
          eyebrow="Verified Founder Program"
          title="Claim your stack on LaudStack"
          subtitle="Verify ownership, respond to reviews, access analytics, and unlock Pro founder features."
          accent="amber"
          layout="centered"
          size="sm"
        />

        <div className="max-w-[1300px] mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left: Claim form */}
            <div className="lg:col-span-2">

              {/* Progress steps */}
              <div className="flex items-center gap-2 mb-8">
                {(['search', 'verify', 'details'] as Step[]).map((s, i) => {
                  const stepIndex = ['search', 'verify', 'details', 'submitted'].indexOf(step);
                  const thisIndex = i;
                  const done = stepIndex > thisIndex;
                  const active = stepIndex === thisIndex;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        done ? 'bg-green-400 text-slate-900' : active ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-500'
                      }`}>
                        {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-xs font-semibold capitalize hidden sm:block ${active ? 'text-slate-900' : done ? 'text-green-500' : 'text-slate-600'}`}>
                        {s === 'search' ? 'Find Tool' : s === 'verify' ? 'Verify Ownership' : 'Founder Profile'}
                      </span>
                      {i < 2 && <div className={`h-px w-8 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Search */}
              {step === 'search' && (
                <div className="bg-white/60 border border-gray-300/60 rounded-2xl p-6">
                  <h2 className="text-xl font-black text-slate-900 mb-2">Find your stack</h2>
                  <p className="text-slate-500 text-sm mb-6">Search for your stack on LaudStack.</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search by tool name..."
                      className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    {filteredTools.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-100 border border-gray-300 rounded-xl overflow-hidden z-10 shadow-xl">
                        {filteredTools.map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => handleSelectTool(tool)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-200 transition-colors text-left"
                          >
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-black text-amber-400 flex-shrink-0">
                              {tool.name[0]}
                            </div>
                            <div>
                              <div className="text-slate-900 text-sm font-semibold">{tool.name}</div>
                              <div className="text-slate-500 text-xs">{tool.category}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {query.length > 1 && filteredTools.length === 0 && (
                    <div className="mt-4 p-4 bg-gray-100/60 border border-gray-300/40 rounded-xl text-center">
                      <p className="text-slate-500 text-sm mb-3">Product not found on LaudStack?</p>
                      <Link href="/launchpad">
                        <button className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                          Launch Your Tool →
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Verify */}
              {step === 'verify' && selectedTool && (
                <div className="bg-white/60 border border-gray-300/60 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6 p-3 bg-gray-100/60 rounded-xl border border-gray-300/40">
                    <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center text-amber-400 font-black text-lg">
                      {selectedTool.name[0]}
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-sm">{selectedTool.name}</div>
                      <div className="text-slate-500 text-xs">{selectedTool.category} · {selectedTool.pricing_model}</div>
                    </div>
                    <button onClick={() => { setStep('search'); setSelectedTool(null); setQuery(''); }} className="ml-auto text-slate-500 hover:text-slate-900 text-xs font-semibold">Change</button>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">Verify ownership</h2>
                  <p className="text-slate-500 text-sm mb-6">Choose how you'd like to prove you own or represent this product.</p>
                  <div className="space-y-3 mb-6">
                    {([
                      { id: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email verification', desc: `Receive a verification code at an @yourdomain.com address` },
                      { id: 'dns', icon: <Globe className="w-4 h-4" />, label: 'DNS record', desc: 'Add a TXT record to your domain\'s DNS settings' },
                      { id: 'file', icon: <FileText className="w-4 h-4" />, label: 'HTML file upload', desc: 'Upload a verification file to your website\'s root directory' },
                    ] as const).map(opt => (
                      <label key={opt.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        verifyMethod === opt.id ? 'border-amber-400/60 bg-amber-400/5' : 'border-gray-300/60 hover:border-gray-400'
                      }`}>
                        <input type="radio" name="verify" value={opt.id} checked={verifyMethod === opt.id} onChange={() => setVerifyMethod(opt.id)} className="mt-0.5 accent-amber-400" />
                        <div className={`mt-0.5 ${verifyMethod === opt.id ? 'text-amber-400' : 'text-slate-500'}`}>{opt.icon}</div>
                        <div>
                          <div className="text-slate-900 text-sm font-semibold">{opt.label}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button onClick={handleVerify} className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl text-sm transition-colors">
                    Continue with {verifyMethod === 'email' ? 'Email' : verifyMethod === 'dns' ? 'DNS' : 'File Upload'} →
                  </button>
                </div>
              )}

              {/* Step 3: Founder Details */}
              {step === 'details' && (
                <form onSubmit={handleSubmit} className="bg-white/60 border border-gray-300/60 rounded-2xl p-6">
                  <h2 className="text-xl font-black text-slate-900 mb-2">Founder profile</h2>
                  <p className="text-slate-500 text-sm mb-6">Tell us about yourself. This information will be reviewed by our team.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Full Name *</label>
                      <input value={founderName} onChange={e => setFounderName(e.target.value)} required placeholder="Alex Rivera" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Work Email *</label>
                      <input value={founderEmail} onChange={e => setFounderEmail(e.target.value)} required type="email" placeholder="alex@yourtool.com" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Role / Title *</label>
                      <input value={founderRole} onChange={e => setFounderRole(e.target.value)} required placeholder="Co-founder & CEO" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Tool Website</label>
                      <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourtool.com" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-slate-500 text-xs font-semibold mb-1.5 block">LinkedIn Profile</label>
                    <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                  </div>
                  <div className="mb-6">
                    <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Brief Bio (optional)</label>
                    <textarea value={founderBio} onChange={e => setFounderBio(e.target.value)} rows={3} placeholder="Tell us about your background and why you built this product..." className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none" />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer mb-6">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-amber-400" />
                    <span className="text-slate-500 text-xs leading-relaxed">
                      I confirm I am authorized to represent this product and agree to the{' '}
                      <Link href="/trust"><span className="text-amber-400 underline">Founder Terms</span></Link>{' '}
                      and{' '}
                      <Link href="/trust"><span className="text-amber-400 underline">Trust Framework</span></Link>.
                    </span>
                  </label>
                  <button type="submit" disabled={submitting} className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Claim for Review →'}
                  </button>
                </form>
              )}

              {/* Step 4: Received */}
              {step === 'submitted' && (
                <div className="bg-white/60 border border-green-500/30 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-400/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Claim received!</h2>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                    Our team will review your claim within 2 business days. You'll receive an email at <strong className="text-slate-900">{founderEmail}</strong> with the outcome.
                  </p>
                  <div className="flex items-center gap-2 bg-gray-100/60 border border-gray-300/40 rounded-xl px-4 py-3 text-sm text-slate-500 mb-6 justify-center">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Estimated review time: <strong className="text-slate-900 ml-1">1–2 business days</strong>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard/founder">
                      <button className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                        Go to Founder Dashboard
                      </button>
                    </Link>
                    <Link href="/pricing">
                      <button className="bg-gray-100 hover:bg-gray-200 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors border border-gray-300">
                        View Pro Features
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Pro Benefits sidebar */}
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-amber-400/10 to-transparent border border-amber-400/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-xs font-black uppercase tracking-wider">Pro Founder Benefits</span>
                </div>
                <div className="space-y-4">
                  {PRO_BENEFITS.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{b.icon}</div>
                      <div>
                        <div className="text-slate-900 text-sm font-bold">{b.title}</div>
                        <div className="text-slate-500 text-xs leading-relaxed mt-0.5">{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-amber-400/20">
                  <Link href="/pricing?tab=founders">
                    <button className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-colors">
                      View Pro Pricing →
                    </button>
                  </Link>
                </div>
              </div>

              <div className="bg-white/60 border border-gray-300/60 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Verification Process</span>
                </div>
                <ol className="space-y-2">
                  {['Find your stack on LaudStack', 'Choose a verification method', 'Complete your founder profile', 'Our team reviews in 1–2 days', 'Get your Verified badge'].map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                      <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-slate-500 font-bold flex-shrink-0 mt-0.5 text-[10px]">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-white/60 border border-gray-300/60 rounded-2xl p-5">
                <AlertCircle className="w-4 h-4 text-amber-400 mb-2" />
                <p className="text-slate-500 text-xs leading-relaxed">
                  Claiming a product is free. Pro Founder features are available with a{' '}
                  <Link href="/pricing"><span className="text-amber-400 underline">Pro Listing subscription</span></Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

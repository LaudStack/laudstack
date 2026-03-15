"use client";

/**
 * Contact — LaudStack
 * Polished light-theme contact page with native select dropdown for Topic.
 */

import { useState } from 'react';
import {
  Mail, MessageSquare, Zap, Shield, Users,
  ChevronRight, CheckCircle2, Clock, ChevronDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

// ─── Topic options ─────────────────────────────────────────────────────────
const CONTACT_TOPICS = [
  { value: '', label: 'Select a topic…', disabled: true },
  { value: 'general', label: 'General Inquiry' },
  { value: 'launch', label: 'Launch / Update a Stack' },
  { value: 'trust', label: 'Report a Listing or Review' },
  { value: 'partnership', label: 'Partnership or Press' },
  { value: 'support', label: 'Account Support' },
  { value: 'deals', label: 'Deals & Promotions' },
  { value: 'templates', label: 'Templates Marketplace' },
  { value: 'other', label: 'Other' },
];

// ─── FAQ ───────────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'How do I launch my stack on LaudStack?',
    a: 'Use the LaunchPad — our guided submission flow. It takes about 5 minutes and our team reviews every submission within 3 business days.',
  },
  {
    q: 'How long does the review process take?',
    a: 'Most submissions are reviewed within 3 business days. Pro submissions are prioritised and typically reviewed within 24 hours.',
  },
  {
    q: 'Can I respond to reviews of my stack?',
    a: "Yes. Verified founders can respond publicly to any review on their stack's page. We encourage constructive, professional responses.",
  },
  {
    q: 'How do I report a fake review?',
    a: 'Use the flag icon on any review, or contact us directly via this form with the "Report a Listing or Review" topic. We investigate all reports within 48 hours.',
  },
  {
    q: 'Do you offer sponsored placements?',
    a: 'No. We do not sell placements in search results or category pages. All rankings are algorithmic. We offer Pro listings that include enhanced profiles and priority review, but these do not affect ranking position.',
  },
];

// ─── Response time rows ────────────────────────────────────────────────────
const RESPONSE_TIMES = [
  { label: 'General inquiries', time: '2 business days', highlight: false },
  { label: 'Stack submissions', time: '3 business days', highlight: false },
  { label: 'Trust & safety reports', time: '48 hours', highlight: false },
  { label: 'Pro support', time: '24 hours', highlight: true },
];

// ─── Input base styles ─────────────────────────────────────────────────────
const inputCls =
  'w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all';

export default function Contact() {
  const [topic, setTopic] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err: { message?: string }) =>
      toast.error(err.message || 'Failed to send message. Please try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!topic) {
      toast.error('Please select a topic.');
      return;
    }
    contactMutation.mutate({ name: name.trim(), email: email.trim(), topic, message: message.trim() });
  };

  const resetForm = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setMessage('');
    setTopic('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PageHero
          eyebrow="Get in Touch"
          title="Contact LaudStack"
          subtitle="Have a question, want to launch a stack, or need to report something? We read every message and respond within 2 business days."
          accent="amber"
          layout="default"
          size="sm"
        />

        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid md:grid-cols-5 gap-8 lg:gap-10 items-start">

            {/* ── FORM ──────────────────────────────────────────────────── */}
            <div className="md:col-span-3">
              {submitted ? (
                /* Success state */
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center"
                  style={{ boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
                  <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Message received!
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm mx-auto">
                    Thanks for reaching out. We&apos;ll get back to you at{' '}
                    <strong className="text-slate-800 font-semibold">{email}</strong>{' '}
                    within 2 business days.
                  </p>
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Send another message <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Form */
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-5"
                  style={{ boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}
                  noValidate
                >
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
                      Send us a message
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      All fields marked <span className="text-red-500">*</span> are required.
                    </p>
                  </div>

                  {/* Topic dropdown */}
                  <div>
                    <label htmlFor="contact-topic" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="contact-topic"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        required
                        className="w-full appearance-none bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all cursor-pointer"
                        style={{ color: topic === '' ? '#94A3B8' : '#0F172A' }}
                      >
                        {CONTACT_TOPICS.map(t => (
                          <option
                            key={t.value}
                            value={t.value}
                            disabled={t.disabled}
                            style={{ color: '#0F172A' }}
                          >
                            {t.label}
                          </option>
                        ))}
                      </select>
                      {/* Custom chevron */}
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Your name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jane Smith"
                      maxLength={120}
                      autoComplete="name"
                      className={inputCls}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      maxLength={254}
                      autoComplete="email"
                      className={inputCls}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us how we can help…"
                      rows={5}
                      maxLength={3000}
                      className={`${inputCls} resize-none`}
                    />
                    <p className="text-[11px] text-slate-400 mt-1 text-right">
                      {message.length} / 3000
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-6 py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm"
                    style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.25)' }}
                  >
                    {contactMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Mail className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* ── SIDEBAR ───────────────────────────────────────────────── */}
            <div className="md:col-span-2 flex flex-col gap-5">

              {/* Quick links */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6"
                style={{ boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Quick Links</h3>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'Launch a Stack', href: '/launchpad', icon: <Zap className="w-4 h-4 text-amber-500 shrink-0" /> },
                    { label: 'Trust Framework', href: '/trust', icon: <Shield className="w-4 h-4 text-green-500 shrink-0" /> },
                    { label: 'About LaudStack', href: '/about', icon: <Users className="w-4 h-4 text-sky-500 shrink-0" /> },
                    { label: 'Browse Stacks', href: '/tools', icon: <MessageSquare className="w-4 h-4 text-purple-500 shrink-0" /> },
                  ].map(link => (
                    <a key={link.label} href={link.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all no-underline group">
                      {link.icon}
                      <span className="flex-1">{link.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Response times */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6"
                style={{ boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Response Times</h3>
                <div className="flex flex-col gap-3">
                  {RESPONSE_TIMES.map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="text-[13px] text-slate-500">{row.label}</span>
                      </div>
                      <span className={`text-[13px] font-semibold whitespace-nowrap ${row.highlight ? 'text-amber-600' : 'text-slate-800'}`}>
                        {row.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct email */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-amber-900 mb-0.5">Prefer email?</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Reach us directly at{' '}
                      <a href="mailto:hello@laudstack.com" className="font-bold underline underline-offset-2 text-amber-800 hover:text-amber-900 transition-colors">
                        hello@laudstack.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── FAQ ─────────────────────────────────────────────────────── */}
          <div className="mt-14 sm:mt-16">
            <div className="mb-6">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">FAQ</p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
                Frequently Asked Questions
              </h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {FAQ.map((item, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all"
                  style={{ boxShadow: openFaq === i ? '0 2px 12px rgba(15,23,42,0.06)' : '0 1px 4px rgba(15,23,42,0.03)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left bg-transparent border-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                    <ChevronDown
                      className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200"
                      style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 sm:px-6 pb-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500 leading-relaxed pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

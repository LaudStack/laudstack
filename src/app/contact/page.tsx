"use client";




// LaudStack — Contact Page
// Design: Dark editorial, amber accents, clean form layout

import { useState } from 'react';
import { Mail, MessageSquare, Zap, Shield, Users, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

const CONTACT_TOPICS = [
  { value: 'general', label: 'General Inquiry', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'launch', label: 'Launch / Update a Tool', icon: <Zap className="w-4 h-4" /> },
  { value: 'trust', label: 'Report a Listing or Review', icon: <Shield className="w-4 h-4" /> },
  { value: 'partnership', label: 'Partnership or Press', icon: <Users className="w-4 h-4" /> },
  { value: 'support', label: 'Account Support', icon: <Mail className="w-4 h-4" /> },
];

const FAQ = [
  {
    q: 'How do I launch my tool to LaudStack?',
    a: 'Use the LaunchPad — our guided submission flow. It takes about 5 minutes and our team reviews every submission within 3 business days.',
  },
  {
    q: 'How long does the review process take?',
    a: 'Most submissions are reviewed within 3 business days. Pro submissions are prioritized and typically reviewed within 24 hours.',
  },
  {
    q: 'Can I respond to reviews of my tool?',
    a: 'Yes. Verified founders can respond publicly to any review on their tool\'s page. We encourage constructive, professional responses.',
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

export default function Contact() {
  const [topic, setTopic] = useState('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Message sent! We\'ll get back to you within 2 business days.');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to send message. Please try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    contactMutation.mutate({ name, email, topic, message });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
      <PageHero
        eyebrow="Get in Touch"
        title="Contact LaudStack"
        subtitle="Have a question, want to launch a product, or need to report something? We read every message and respond within 2 business days."
        accent="amber"
        layout="default"
        size="sm"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="bg-white border border-green-500/30 rounded-2xl p-10 text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-slate-900 font-black text-2xl mb-2">Message received!</h2>
                <p className="text-slate-500 mb-6">
                  Thanks for reaching out. We'll get back to you at <strong className="text-slate-900">{email}</strong> within 2 business days.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMessage(''); }}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
                <h2 className="text-slate-900 font-bold text-xl">Send us a message</h2>

                {/* Topic */}
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-2">Topic</label>
                  <div className="grid grid-cols-1 gap-2">
                    {CONTACT_TOPICS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTopic(t.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                          topic === t.value
                            ? 'bg-amber-400/10 border border-amber-400/40 text-amber-400'
                            : 'bg-gray-100 border border-gray-300 text-slate-600 hover:border-gray-400'
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-2">Your name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full bg-gray-100 border border-gray-300 text-slate-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-2">Email address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full bg-gray-100 border border-gray-300 text-slate-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-2">Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className="w-full bg-gray-100 border border-gray-300 text-slate-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                  {!contactMutation.isPending && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick links */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-slate-900 font-bold mb-4">Quick links</h3>
              <div className="space-y-3">
                {[
                  { label: 'Launch a Product', href: '/launchpad', icon: <Zap className="w-4 h-4 text-amber-400" /> },
                  { label: 'Trust Framework', href: '/trust', icon: <Shield className="w-4 h-4 text-green-500" /> },
                  { label: 'About LaudStack', href: '/about', icon: <Users className="w-4 h-4 text-sky-400" /> },
                ].map((link) => (
                  <a key={link.label} href={link.href} className="flex items-center gap-3 text-slate-600 hover:text-slate-900 text-sm transition-colors group">
                    {link.icon}
                    <span>{link.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-600 group-hover:text-slate-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-slate-900 font-bold mb-3">Response times</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">General inquiries</span>
                  <span className="text-slate-900 font-medium">2 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tool submissions</span>
                  <span className="text-slate-900 font-medium">3 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trust reports</span>
                  <span className="text-slate-900 font-medium">48 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pro support</span>
                  <span className="text-amber-400 font-medium">24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-100/50 transition-colors"
                >
                  <span className="text-slate-900 font-medium text-sm">{item.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-slate-500 text-sm leading-relaxed border-t border-gray-200">
                    <div className="pt-3">{item.a}</div>
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

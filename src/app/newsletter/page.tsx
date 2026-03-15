"use client";



// LaudStack — Newsletter Landing Page
// Sign-up form wired to tRPC newsletter.subscribe, digest preview, subscriber social proof

import { useState } from 'react';
import {
  Mail, Sparkles, TrendingUp, Star, Zap, CheckCircle,
  ArrowRight, Users, Clock, BookOpen, Flame
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

const BENEFITS = [
  {
    icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
    title: 'Weekly Rising Stacks',
    desc: 'The 5 fastest-rising tools ranked by community momentum — curated every Monday.',
  },
  {
    icon: <Star className="w-5 h-5 text-amber-500" />,
    title: "Editor's Spotlight",
    desc: 'One hand-picked tool each week with a deep editorial review from the LaudStack team.',
  },
  {
    icon: <Flame className="w-5 h-5 text-amber-500" />,
    title: 'Fresh Launches',
    desc: 'New tools launched by founders this week — be the first to discover and review them.',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-amber-500" />,
    title: 'Community Insights',
    desc: 'Top reviews, founder stories, and community picks — the signal from 12,000+ practitioners.',
  },
];

const SAMPLE_DIGEST = [
  {
    rank: 1,
    badge: '🚀 Rocket',
    badgeColor: '#F59E0B',
    name: 'Notion AI',
    category: 'Productivity',
    tagline: 'AI-powered workspace that writes, edits, and summarises your docs.',
    rating: 4.8,
    change: '+24 ranks this week',
  },
  {
    rank: 2,
    badge: '🔥 Hot',
    badgeColor: '#EF4444',
    name: 'Linear',
    category: 'Project Management',
    tagline: 'The issue tracker built for high-performance engineering teams.',
    rating: 4.9,
    change: '+18 ranks this week',
  },
  {
    rank: 3,
    badge: '📈 Rising',
    badgeColor: '#22C55E',
    name: 'Raycast',
    category: 'Developer Tools',
    tagline: 'Supercharged productivity tool for Mac with AI built in.',
    rating: 4.7,
    change: '+12 ranks this week',
  },
];

const SOCIAL_PROOF = [
  { name: 'Sarah K.', role: 'Product Manager', quote: 'The only newsletter I actually open every Monday. The rising picks are always spot-on.' },
  { name: 'James T.', role: 'Founder, SaaS startup', quote: 'Got 200 sign-ups in a week after being featured in the LaudStack digest. Incredible ROI.' },
  { name: 'Priya M.', role: 'Engineering Lead', quote: 'Saves me hours of research every week. The editor\'s spotlight alone is worth the subscribe.' },
];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success('You\'re subscribed! Check your inbox for a welcome email.');
      setEmail('');
    },
    onError: (err) => {
      if (err.message.includes('already subscribed')) {
        toast.info('You\'re already subscribed — thanks for being part of the community!');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    subscribe.mutate({ email: email.trim() });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          eyebrow="LaudStack Weekly"
          title="The best SaaS & AI stacks, curated every Monday."
          subtitle="Join 12,000+ professionals who start their week with the LaudStack digest — rising stacks, editor picks, fresh launches, and community insights in one email."
          accent="amber"
          layout="centered"
          size="md"
        />

        {/* Sign-up form — hero CTA */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-6 py-12 text-center">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={subscribe.isPending}
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                {subscribe.isPending ? 'Subscribing…' : 'Subscribe Free'}
                {!subscribe.isPending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            <div className="flex items-center justify-center gap-5 mt-5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" />
                No spam, ever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Unsubscribe any time
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '12,000+', label: 'Subscribers', icon: <Users className="w-5 h-5 text-amber-500" /> },
              { value: 'Every Monday', label: 'Delivery', icon: <Clock className="w-5 h-5 text-amber-500" /> },
              { value: '68%', label: 'Open Rate', icon: <Mail className="w-5 h-5 text-amber-500" /> },
              { value: '5 min', label: 'Read Time', icon: <BookOpen className="w-5 h-5 text-amber-500" /> },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </section>

          {/* What's inside */}
          <section>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-semibold mb-3">
                <Sparkles className="w-4 h-4" />
                What's Inside
              </div>
              <h2 className="text-3xl font-black text-slate-900">Every edition includes</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {BENEFITS.map(b => (
                <div key={b.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    {b.icon}
                    <h3 className="font-bold text-slate-900">{b.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Sample digest preview */}
          <section>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-semibold mb-3">
                <Zap className="w-4 h-4" />
                Sample Edition
              </div>
              <h2 className="text-3xl font-black text-slate-900">This week's rising picks</h2>
              <p className="text-slate-500 mt-2 text-sm">A preview of what lands in your inbox every Monday.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* Email header mock */}
              <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">LaudStack Weekly</div>
                  <div className="text-xs text-slate-500">digest@laudstack.com · Monday, 9:00 AM</div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 border-l-2 border-amber-400 pl-4 italic">
                  "This week's top movers — ranked by community momentum, verified reviews, and rank-position gain."
                </p>
                {SAMPLE_DIGEST.map(tool => (
                  <div key={tool.name} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 text-sm font-black text-amber-600">
                      {tool.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{tool.name}</span>
                        <span className="text-xs text-slate-400">{tool.category}</span>
                        <span className="text-xs font-semibold" style={{ color: tool.badgeColor }}>{tool.badge}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{tool.tagline}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {tool.rating}
                        </span>
                        <span className="text-green-600 font-semibold">{tool.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900">What readers say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {SOCIAL_PROOF.map(t => (
                <div key={t.name} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-xs font-bold text-amber-600">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center">
            <Mail className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-3">Join 12,000+ professionals</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
              Get the LaudStack Weekly digest in your inbox every Monday. Free, always.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="submit"
                disabled={subscribe.isPending}
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                {subscribe.isPending ? 'Subscribing…' : 'Subscribe'}
                {!subscribe.isPending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}

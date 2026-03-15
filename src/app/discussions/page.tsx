"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { MessageSquare, Bell, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

export default function Discussions() {
  const [email, setEmail] = useState('');
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success('You\'ll be notified when Discussions launches!');
      setEmail('');
    },
    onError: (err: any) => {
      if (err.message.includes('already subscribed')) {
        toast.info('You\'re already on the list — we\'ll notify you when it launches!');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    },
  });

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    subscribe.mutate({ email: trimmed });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Coming Soon"
        title="Community Discussions"
        subtitle="A dedicated space for founders, developers, and SaaS enthusiasts to share insights, ask questions, and connect with the LaudStack community."
        accent="amber"
        layout="centered"
        size="md"
      />

      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-12">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-amber-600" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            We&apos;re building something great
          </h2>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
            Discussions will be a place to share tool recommendations, get feedback on your stack, 
            and connect with other professionals. Sign up below to be the first to know when it launches.
          </p>

          <form onSubmit={handleNotify} className="flex gap-2 max-w-md mx-auto mb-6">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={subscribe.isPending}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-60"
            >
              <Bell className="w-3.5 h-3.5" />
              {subscribe.isPending ? 'Subscribing...' : 'Notify Me'}
            </button>
          </form>

          <p className="text-xs text-slate-400">
            No spam. We&apos;ll only email you when Discussions is ready.
          </p>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-sm text-slate-500 mb-4">In the meantime, explore what&apos;s already live:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="/community-voting" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-slate-600 hover:border-amber-500 hover:text-amber-700 transition-all">
                Community Voting <ArrowRight className="w-3 h-3" />
              </a>
              <a href="/community-picks" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-slate-600 hover:border-amber-500 hover:text-amber-700 transition-all">
                Community Picks <ArrowRight className="w-3 h-3" />
              </a>
              <a href="/trending" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-slate-600 hover:border-amber-500 hover:text-amber-700 transition-all">
                Trending <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

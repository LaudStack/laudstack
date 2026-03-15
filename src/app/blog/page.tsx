"use client";




// Design: LaudStack dark-slate + amber accent. Blog index with featured hero and article grid.
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { Calendar, Clock, Tag, ArrowRight, User, BookOpen, TrendingUp, Lightbulb, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { ARTICLES, CATEGORIES, formatDate } from '@/data/blogData';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'All': BookOpen,
  'AI Tools': Zap,
  'Comparisons': TrendingUp,
  'Guides': Lightbulb,
  'Industry': Star,
  'LaudStack': Tag,
};

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [subEmail, setSubEmail] = useState('');
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => { toast.success('Subscribed! Check your inbox.'); setSubEmail(''); },
    onError: (err: any) => toast.error(err.message || 'Subscribe failed'),
  });

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  const featured = ARTICLES.find(a => a.featured);
  const rest = filtered.filter(a => !a.featured || activeCategory !== 'All');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="LaudStack Blog"
        title="Insights for the Modern Software Buyer"
        subtitle="In-depth reviews, comparisons, and guides to help you make smarter decisions about SaaS and AI stacks."
        accent="amber"
        layout="split"
        size="md"
      >
        {/* Article category quick-links */}
        <div className="flex flex-col gap-1.5 shrink-0 min-w-[180px]">
          {CATEGORIES.filter(c => c !== 'All').map(cat => {
            const Icon = CATEGORY_ICONS[cat] || BookOpen;
            const count = ARTICLES.filter(a => a.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all text-left border ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  {cat}
                </span>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-px rounded-full">{count}</span>
              </button>
            );
          })}
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Featured Article */}
        {featured && activeCategory === 'All' && (
          <Link href={`/blog/${featured.slug}`}>
            <div className="group relative rounded-2xl overflow-hidden border border-gray-200 cursor-pointer mb-12 hover:border-amber-500/40 transition-all duration-300">
              <div className="absolute inset-0">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/85" />
              </div>
              <div className="relative p-8 md:p-12 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wide">Spotlight</span>
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-slate-600 text-xs font-medium">{featured.category}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-slate-500 text-base mb-6 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="text-slate-600 font-medium">{featured.author}</span>
                    <span>· {featured.authorRole}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featured.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featured.readTime}
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-amber-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || BookOpen;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-white border border-gray-200 text-slate-500 hover:text-slate-900 hover:border-gray-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat}
              </button>
            );
          })}
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`}>
              <article className="group bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/40 hover:bg-gray-100/80 transition-all duration-200 h-full flex flex-col">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-xs font-medium text-slate-500">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">{article.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-600">{article.author[0]}</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{article.author}</div>
                        <div className="text-xs text-slate-500">{formatDate(article.date)}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {rest.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No articles in this category yet</h3>
            <p className="text-slate-500 text-sm">Check back soon — we publish new content weekly.</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Get the Weekly Digest</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            New tool reviews, comparison guides, and industry insights — delivered every Tuesday.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); const trimmed = subEmail.trim(); if (!trimmed) return; subscribeMutation.mutate({ email: trimmed, source: 'blog' }); }}
            className="flex items-center gap-3 max-w-sm mx-auto"
          >
            <input
              type="email"
              value={subEmail}
              onChange={e => setSubEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-slate-900 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-500"
              required
            />
            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

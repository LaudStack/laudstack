// Design: LaudStack dark-slate + amber accent. New Launches with launch dates and badges.
// Layout: Hero + grid of recently launched tools sorted by launch date.

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MOCK_TOOLS } from '@/lib/mockData';
import { Zap, Star, ThumbsUp, MessageSquare, ChevronRight, Calendar, Rocket, Shield, ExternalLink } from 'lucide-react';

const CATEGORY_OPTIONS = ['All Categories', 'AI Writing', 'AI Image', 'AI Video', 'AI Code', 'AI Productivity', 'Design', 'Marketing', 'Developer Tools'];

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function isNew(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}

export default function NewLaunches() {
  const [, navigate] = useLocation();
  const [category, setCategory] = useState('All Categories');
  const [pricingFilter, setPricingFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const sortedTools = useMemo(() => {
    let tools = [...MOCK_TOOLS];

    if (category !== 'All Categories') {
      tools = tools.filter(t => t.category === category);
    }

    if (pricingFilter) {
      tools = tools.filter(t => t.pricing_model === pricingFilter);
    }

    // Sort by launched_at descending (newest first)
    tools.sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());

    return tools;
  }, [category, pricingFilter]);

  const newCount = sortedTools.filter(t => isNew(t.launched_at)).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <Zap className="h-3 w-3" /> New Launches
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
            Recently Added Tools
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            The freshest AI & SaaS tools added to LaudStack — sorted by launch date, newest first.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="bg-gray-100/60 border border-gray-300 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400">{newCount}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">This Month</div>
            </div>
            <div className="bg-gray-100/60 border border-gray-300 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{sortedTools.length}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">Total Tools</div>
            </div>
            <div className="bg-gray-100/60 border border-gray-300 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-slate-900">Weekly</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">New Additions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            >
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={pricingFilter}
              onChange={e => setPricingFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Pricing</option>
              {['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="text-sm text-slate-500">
              <span className="text-slate-900 font-bold">{sortedTools.length}</span> tools
            </span>
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-xs font-bold transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-xs font-bold transition-colors ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Tool grid/list */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTools.map((tool, i) => (
              <div
                key={tool.id}
                onClick={() => navigate(`/tools/${tool.slug}`)}
                className="group bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-amber-500/50 hover:bg-gray-100/80 transition-all duration-200"
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                    {tool.logo_url ? (
                      <img src={tool.logo_url} alt={tool.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-lg font-black text-amber-400">{tool.name[0]}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isNew(tool.launched_at) && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-400">
                        NEW
                      </span>
                    )}
                    <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full bg-gray-100">
                      {tool.pricing_model}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-400 transition-colors mb-1">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{tool.tagline}</p>

                {/* Category */}
                <span className="inline-block text-xs text-slate-500 bg-gray-100 px-2 py-0.5 rounded-full mb-4">
                  {tool.category}
                </span>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-slate-900">{tool.average_rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">({tool.review_count})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {timeAgo(tool.launched_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTools.map((tool, i) => (
              <div
                key={tool.id}
                onClick={() => navigate(`/tools/${tool.slug}`)}
                className="group bg-white border border-gray-200 rounded-xl px-5 py-4 cursor-pointer hover:border-amber-500/40 hover:bg-gray-100/80 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-7 h-7 object-contain" />
                  ) : (
                    <span className="text-sm font-black text-amber-400">{tool.name[0]}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-amber-400 transition-colors">{tool.name}</span>
                    {isNew(tool.launched_at) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-400">NEW</span>
                    )}
                    {tool.is_verified && <Shield className="h-3.5 w-3.5 text-blue-400" />}
                    <span className="text-xs text-slate-500 bg-gray-100 px-2 py-0.5 rounded-full">{tool.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{tool.tagline}</p>
                </div>

                <div className="shrink-0 flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-slate-900">{tool.average_rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 justify-end">
                      <Calendar className="h-3 w-3" />
                      {timeAgo(tool.launched_at)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedTools.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No tools match these filters</h3>
            <p className="text-slate-500 text-sm">Try adjusting the category or pricing filter</p>
          </div>
        )}

        {/* Submit CTA */}
        <div className="mt-12 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-8 text-center">
          <Rocket className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Have a tool to launch?</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            Submit your AI or SaaS tool to LaudStack and get discovered by thousands of professionals.
          </p>
          <button
            onClick={() => navigate('/launchpad')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            <Rocket className="h-4 w-4" />
            Launch Your Tool
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

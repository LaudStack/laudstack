// Design: LaudStack dark-slate + amber accent. Full directory with sidebar filters.
// Layout: Left filter sidebar (fixed) + right scrollable tool grid.

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { MOCK_TOOLS, CATEGORIES } from '@/lib/mockData';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Grid3X3, List } from 'lucide-react';
import { toast } from 'sonner';

const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'];
const SORT_OPTIONS = [
  { value: 'rank_score', label: 'Top Ranked' },
      { value: 'average_rating', label: 'Highest Rated' },
      { value: 'review_count', label: 'Most Reviewed' },
      { value: 'upvote_count', label: 'Most Upvoted' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'A–Z' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 4.5, label: '4.5★ & above' },
  { value: 4, label: '4.0★ & above' },
  { value: 3.5, label: '3.5★ & above' },
];

export default function AllTools() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rank_score');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [catExpanded, setCatExpanded] = useState(true);
  const [pricingExpanded, setPricingExpanded] = useState(true);
  const [ratingExpanded, setRatingExpanded] = useState(true);

  const filtered = useMemo(() => {
    let tools = [...MOCK_TOOLS];

    if (search.trim()) {
      const q = search.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      tools = tools.filter(t => selectedCategories.includes(t.category));
    }

    if (selectedPricing.length > 0) {
      tools = tools.filter(t => selectedPricing.includes(t.pricing_model));
    }

    if (minRating > 0) {
      tools = tools.filter(t => (t.average_rating || 0) >= minRating);
    }

    tools.sort((a, b) => {
      switch (sortBy) {
        case 'average_rating': return (b.average_rating || 0) - (a.average_rating || 0);
        case 'review_count': return (b.review_count || 0) - (a.review_count || 0);
        case 'upvote_count': return (b.upvote_count || 0) - (a.upvote_count || 0);
        case 'newest': return new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime();
        case 'name': return a.name.localeCompare(b.name);
        default: return (b.rank_score || 0) - (a.rank_score || 0);
      }
    });

    return tools;
  }, [search, selectedCategories, selectedPricing, minRating, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const togglePricing = (p: string) => {
    setSelectedPricing(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const clearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedPricing([]);
    setMinRating(0);
    setSortBy('rank_score');
  };

  const hasFilters = selectedCategories.length > 0 || selectedPricing.length > 0 || minRating > 0 || search.trim();

  // Category counts
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_TOOLS.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, []);

  const categoryNames = useMemo(() => CATEGORIES.map(c => c.name), []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Directory</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">All Tools</h1>
              <p className="text-slate-400 mt-1 text-sm">
                {MOCK_TOOLS.length} AI & SaaS tools, verified and ranked by the community
              </p>
            </div>
            {/* Search bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'w-64 shrink-0' : 'w-0 overflow-hidden'} transition-all duration-300`}>
            <div className="sticky top-24 space-y-1">

              {/* Sidebar header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Filters</span>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setCatExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <span>Category</span>
                  {catExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                </button>
                {catExpanded && (
                  <div className="px-3 pb-3 space-y-0.5 max-h-64 overflow-y-auto">
                    {categoryNames.map(cat => (
                      <label key={cat} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="accent-amber-500 w-3.5 h-3.5"
                          />
                          <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{cat}</span>
                        </div>
                        <span className="text-xs text-slate-500">{catCounts[cat] || 0}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing filter */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setPricingExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <span>Pricing</span>
                  {pricingExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                </button>
                {pricingExpanded && (
                  <div className="px-3 pb-3 space-y-0.5">
                    {PRICING_OPTIONS.map(p => (
                      <label key={p} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedPricing.includes(p)}
                          onChange={() => togglePricing(p)}
                          className="accent-amber-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{p}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating filter */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setRatingExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <span>Min Rating</span>
                  {ratingExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                </button>
                {ratingExpanded && (
                  <div className="px-3 pb-3 space-y-0.5">
                    {RATING_OPTIONS.map(r => (
                      <label key={r.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer group">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === r.value}
                          onChange={() => setMinRating(r.value)}
                          className="accent-amber-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{r.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {sidebarOpen ? 'Hide' : 'Show'} Filters
                </button>
                <span className="text-sm text-slate-400">
                  <span className="text-white font-bold">{filtered.length}</span> tools
                  {hasFilters && <span className="text-amber-400 ml-1">(filtered)</span>}
                </span>
                {/* Active filter chips */}
                {selectedCategories.map(cat => (
                  <span key={cat} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs text-amber-300 font-medium">
                    {cat}
                    <button onClick={() => toggleCategory(cat)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {selectedPricing.map(p => (
                  <span key={p} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-xs text-blue-300 font-medium">
                    {p}
                    <button onClick={() => togglePricing(p)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {SORT_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {/* View toggle */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'} transition-colors`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tool grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2">No tools found</h3>
                <p className="text-slate-400 text-sm mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearAll} className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-400 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
              }>
                {filtered.map((tool, i) => (
                  <div
                    key={tool.id}
                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

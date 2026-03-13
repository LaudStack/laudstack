// Design: LaudStack dark-slate + amber accent. Full product catalog with sidebar filters.
// Layout: Left filter sidebar (fixed) + right scrollable tool grid.

import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import ToolCard from '@/components/ToolCard';
import { CATEGORY_DEFS as CATEGORIES } from '@/lib/categories';
import { trpc } from '@/lib/trpc';
import { stacksToTools } from '@/lib/stackAdapter';
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

// Badge display labels
const BADGE_LABELS: Record<string, string> = {
  editors_pick: "Editor's Pick",
  top_rated: 'Top Rated',
  featured: 'Featured',
  verified: 'Verified',
  new_launch: 'New Launch',
  trending: 'Trending',
  pro_founder: 'Pro Founder',
  community_pick: 'Community Pick',
  best_value: 'Best Value',
  laudstack_pick: 'LaudStack Pick',
};

// Helper: parse all filter params from a URLSearchParams object
function parseParams(params: URLSearchParams) {
  const cat = params.get('category');
  const pricing = params.get('pricing');
  const rating = params.get('rating');
  const sort = params.get('sort');
  const q = params.get('q');
  const badge = params.get('badge');
  return {
    categories: cat ? decodeURIComponent(cat).split(',').map(c => c.trim()).filter(Boolean) : [],
    pricing: pricing ? decodeURIComponent(pricing).split(',').map(p => p.trim()).filter(Boolean) : [],
    rating: rating ? parseFloat(rating) : 0,
    sort: sort || 'rank_score',
    search: q ? decodeURIComponent(q) : '',
    badge: badge || '',
  };
}

export default function AllTools() {
  const [location, navigate] = useLocation();

  // Initialise all filter state from URL params on first render
  const initialParams = useMemo(() => parseParams(new URLSearchParams(window.location.search)), []);

  const [search, setSearch] = useState(initialParams.search);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialParams.categories);
  const [selectedPricing, setSelectedPricing] = useState<string[]>(initialParams.pricing);
  const [minRating, setMinRating] = useState(initialParams.rating);
  const [sortBy, setSortBy] = useState(initialParams.sort);
  const [activeBadge, setActiveBadge] = useState(initialParams.badge);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [catExpanded, setCatExpanded] = useState(true);
  const [pricingExpanded, setPricingExpanded] = useState(true);
  const [ratingExpanded, setRatingExpanded] = useState(true);
  const [badgeExpanded, setBadgeExpanded] = useState(true);
  // Track whether we're currently syncing FROM the URL to avoid loops
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);

  // ── Outbound: write filter state → URL whenever filters change ──────────────
  useEffect(() => {
    if (syncingFromUrl) return;
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (selectedPricing.length > 0) params.set('pricing', selectedPricing.join(','));
    if (minRating > 0) params.set('rating', String(minRating));
    if (sortBy !== 'rank_score') params.set('sort', sortBy);
    if (search.trim()) params.set('q', search.trim());
    if (activeBadge) params.set('badge', activeBadge);
    const qs = params.toString();
    const newPath = qs ? `/tools?${qs}` : '/tools';
    // Only push if the URL actually changed to avoid history spam
    if (window.location.pathname + window.location.search !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [selectedCategories, selectedPricing, minRating, sortBy, search, activeBadge]);

  // ── Inbound: read URL → filter state when location changes externally ───────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Only re-apply if there are actual filter params (e.g. back-link navigation)
    if (!params.toString()) return;
    const parsed = parseParams(params);
    setSyncingFromUrl(true);
    setSelectedCategories(parsed.categories);
    setSelectedPricing(parsed.pricing);
    setMinRating(parsed.rating);
    setSortBy(parsed.sort);
    setSearch(parsed.search);
    setActiveBadge(parsed.badge);
    // Release the sync lock after state has been applied
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [location]);

  // Map frontend sort values to backend sort enum
  const sortMap: Record<string, string> = {
    rank_score: 'rank', average_rating: 'top_rated', review_count: 'most_reviewed',
    upvote_count: 'most_lauded', newest: 'newest', name: 'rank',
  };
  const { data: stackData } = trpc.stacks.list.useQuery({
    status: 'published',
    search: search.trim() || undefined,
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    pricingModel: selectedPricing.length === 1 ? selectedPricing[0] : undefined,
    sort: (sortMap[sortBy] ?? 'rank') as any,
    limit: 100,
  });
  const filtered = useMemo(() => {
    let tools = stacksToTools((stackData?.items ?? []) as any[]);
    // Client-side secondary filters the backend doesn't handle
    if (selectedCategories.length > 1) {
      tools = tools.filter(t => selectedCategories.includes(t.category));
    }
    if (selectedPricing.length > 1) {
      tools = tools.filter(t => selectedPricing.includes(t.pricing_model));
    }
    if (minRating > 0) {
      tools = tools.filter(t => (t.average_rating || 0) >= minRating);
    }
    if (activeBadge) {
      tools = tools.filter(t => (t.badges || []).includes(activeBadge as any));
    }
    if (sortBy === 'name') {
      tools.sort((a, b) => a.name.localeCompare(b.name));
    }
    return tools;
  }, [stackData, selectedCategories, selectedPricing, minRating, sortBy, activeBadge]);

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
    setActiveBadge('');
  };

  const hasFilters = selectedCategories.length > 0 || selectedPricing.length > 0 || minRating > 0 || search.trim() || !!activeBadge;

  // Category counts from current data
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const tools = stacksToTools((stackData?.items ?? []) as any[]);
    tools.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [stackData]);

  // Badge counts from current data
  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const tools = stacksToTools((stackData?.items ?? []) as any[]);
    tools.forEach(t => {
      (t.badges || []).forEach(b => { counts[b] = (counts[b] || 0) + 1; });
    });
    return counts;
  }, [stackData]);

  // Only show badges that have at least one tool
  const availableBadges = useMemo(() =>
    Object.entries(BADGE_LABELS)
      .filter(([key]) => (badgeCounts[key] || 0) > 0)
      .sort((a, b) => (badgeCounts[b[0]] || 0) - (badgeCounts[a[0]] || 0)),
  [badgeCounts]);

  const categoryNames = useMemo(() => CATEGORIES.map(c => c.name), []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="Product Catalog"
        title="All Tools"
        subtitle={`Discover ${stackData?.total ?? 0} AI & SaaS tools, verified and ranked by the community.`}
        accent="amber"
        layout="default"
        size="md"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '260px', background: '#F9FAFB', border: '1px solid #E5E7EB',
                  borderRadius: '10px', padding: '10px 12px 10px 36px', fontSize: '13px',
                  color: '#111827', outline: 'none', fontFamily: 'inherit',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                  <X style={{ width: '13px', height: '13px' }} />
                </button>
              )}
            </div>
          </div>
        }
      >
        {/* Category quick-filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>Browse:</span>
          {CATEGORIES.filter(c => c.name !== 'All').slice(0, 10).map(cat => (
            <button
              key={cat.name}
              onClick={() => toggleCategory(cat.name)}
              style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: selectedCategories.includes(cat.name) ? '#F59E0B' : '#F3F4F6',
                color: selectedCategories.includes(cat.name) ? '#000' : '#374151',
                border: selectedCategories.includes(cat.name) ? '1px solid #F59E0B' : '1px solid #E5E7EB',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#EF4444', border: '1px solid #FECACA' }}
            >
              Clear
            </button>
          )}
        </div>
      </PageHero>

      <div className="flex-1 max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'w-64 shrink-0' : 'w-0 overflow-hidden'} transition-all duration-300`}>
            <div className="sticky top-24 space-y-1">

              {/* Sidebar header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Filters</span>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setCatExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-900 hover:bg-gray-100 transition-colors"
                >
                  <span>Category</span>
                  {catExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {catExpanded && (
                  <div className="px-3 pb-3 space-y-0.5 max-h-64 overflow-y-auto">
                    {categoryNames.map(cat => (
                      <label key={cat} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="accent-amber-500 w-3.5 h-3.5"
                          />
                          <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{cat}</span>
                        </div>
                        <span className="text-xs text-slate-500">{catCounts[cat] || 0}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing filter */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setPricingExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-900 hover:bg-gray-100 transition-colors"
                >
                  <span>Pricing</span>
                  {pricingExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {pricingExpanded && (
                  <div className="px-3 pb-3 space-y-0.5">
                    {PRICING_OPTIONS.map(p => (
                      <label key={p} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedPricing.includes(p)}
                          onChange={() => togglePricing(p)}
                          className="accent-amber-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{p}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Badge filter */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setBadgeExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-900 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>Badges</span>
                    {activeBadge && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Badge filter active" />
                    )}
                  </div>
                  {badgeExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {badgeExpanded && (
                  <div className="px-3 pb-3 space-y-0.5">
                    {/* "Any badge" option to clear */}
                    <label className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="badge"
                          checked={activeBadge === ''}
                          onChange={() => setActiveBadge('')}
                          className="accent-amber-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">Any badge</span>
                      </div>
                      <span className="text-xs text-slate-400">{stackData?.total ?? 0}</span>
                    </label>
                    {availableBadges.map(([key, label]) => {
                      const count = badgeCounts[key] || 0;
                      const isActive = activeBadge === key;
                      // Pick a subtle accent colour per badge type
                      const dotColor =
                        key === 'editors_pick'   ? '#7C3AED' :
                        key === 'top_rated'       ? '#D97706' :
                        key === 'featured'        ? '#1D4ED8' :
                        key === 'verified'        ? '#15803D' :
                        key === 'new_launch'      ? '#0369A1' :
                        key === 'trending'        ? '#C2410C' :
                        key === 'pro_founder'     ? '#F59E0B' :
                        key === 'community_pick'  ? '#BE123C' :
                        key === 'best_value'      ? '#15803D' :
                        '#D97706';
                      return (
                        <label key={key} className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg cursor-pointer group transition-colors ${
                          isActive ? 'bg-amber-50' : 'hover:bg-gray-100'
                        }`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="badge"
                              checked={isActive}
                              onChange={() => setActiveBadge(isActive ? '' : key)}
                              className="accent-amber-500 w-3.5 h-3.5"
                            />
                            <span
                              style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, display: 'inline-block' }}
                            />
                            <span className={`text-xs transition-colors ${
                              isActive ? 'text-amber-700 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                            }`}>{label}</span>
                          </div>
                          <span className="text-xs text-slate-400">{count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rating filter */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setRatingExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-900 hover:bg-gray-100 transition-colors"
                >
                  <span>Min Rating</span>
                  {ratingExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>
                {ratingExpanded && (
                  <div className="px-3 pb-3 space-y-0.5">
                    {RATING_OPTIONS.map(r => (
                      <label key={r.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer group">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === r.value}
                          onChange={() => setMinRating(r.value)}
                          className="accent-amber-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{r.label}</span>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:border-gray-400 transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {sidebarOpen ? 'Hide' : 'Show'} Filters
                </button>
                <span className="text-sm text-slate-500">
                  <span className="text-slate-900 font-bold">{filtered.length}</span> tools
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
                {activeBadge && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-xs text-purple-300 font-medium">
                    🏅 {BADGE_LABELS[activeBadge] || activeBadge}
                    <button onClick={() => setActiveBadge('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  {SORT_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {/* View toggle */}
                <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-white'} transition-colors`}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-white'} transition-colors`}
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
                <h3 className="text-xl font-bold text-slate-900 mb-2">No tools found</h3>
                <p className="text-slate-500 text-sm mb-6">Try adjusting your filters or search term</p>
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

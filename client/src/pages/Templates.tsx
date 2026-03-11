// LaudStack — Template Marketplace
// Design: Dark editorial, amber accents, product-card grid

import { useState } from 'react';
import { Link } from 'wouter';
import {
  Search, Star, Download, Eye, Filter, Tag, Zap, Crown,
  ArrowRight, ShoppingCart, CheckCircle, Package, TrendingUp,
  Code, Palette, BarChart3, FileText, Mail, Globe, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: <Layers className="w-4 h-4" /> },
  { id: 'saas', label: 'SaaS Starter', icon: <Code className="w-4 h-4" /> },
  { id: 'landing', label: 'Landing Pages', icon: <Globe className="w-4 h-4" /> },
  { id: 'dashboard', label: 'Dashboards', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'email', label: 'Email Templates', icon: <Mail className="w-4 h-4" /> },
  { id: 'docs', label: 'Documentation', icon: <FileText className="w-4 h-4" /> },
  { id: 'design', label: 'Design Systems', icon: <Palette className="w-4 h-4" /> },
];

const TEMPLATES = [
  {
    id: 't1',
    name: 'SaaS Boilerplate Pro',
    author: 'LaudStack Team',
    category: 'saas',
    price: 79,
    originalPrice: 129,
    rating: 4.9,
    reviews: 142,
    downloads: 1840,
    tags: ['Next.js', 'Stripe', 'Auth', 'Postgres'],
    description: 'Full-stack SaaS starter with auth, billing, team workspaces, and admin panel. Ship your SaaS in days, not months.',
    badge: 'Bestseller',
    badgeColor: 'amber',
    preview: '#171717',
    featured: true,
  },
  {
    id: 't2',
    name: 'Analytics Dashboard UI',
    author: 'DesignForge',
    category: 'dashboard',
    price: 49,
    originalPrice: null,
    rating: 4.8,
    reviews: 98,
    downloads: 1120,
    tags: ['React', 'Recharts', 'Tailwind', 'Dark Mode'],
    description: 'Beautiful analytics dashboard with 20+ chart types, KPI cards, data tables, and a full dark/light theme.',
    badge: 'New',
    badgeColor: 'emerald',
    preview: '#171717',
    featured: false,
  },
  {
    id: 't3',
    name: 'Product Landing Page Kit',
    author: 'PixelCraft',
    category: 'landing',
    price: 39,
    originalPrice: 59,
    rating: 4.7,
    reviews: 67,
    downloads: 890,
    tags: ['HTML', 'CSS', 'Animations', 'SEO'],
    description: '12 conversion-optimized landing page sections. Hero, features, pricing, testimonials, FAQ, and CTA blocks.',
    badge: null,
    badgeColor: null,
    preview: '#FFFBEB',
    featured: false,
  },
  {
    id: 't4',
    name: 'Email Template Bundle',
    author: 'MailCraft Studio',
    category: 'email',
    price: 29,
    originalPrice: null,
    rating: 4.6,
    reviews: 54,
    downloads: 760,
    tags: ['HTML Email', 'Responsive', 'Dark Mode', '25 Templates'],
    description: '25 responsive email templates: welcome, onboarding, transactional, newsletters, and re-engagement flows.',
    badge: null,
    badgeColor: null,
    preview: '#F0FDF4',
    featured: false,
  },
  {
    id: 't5',
    name: 'Developer Docs Template',
    author: 'DocuFlow',
    category: 'docs',
    price: 0,
    originalPrice: null,
    rating: 4.5,
    reviews: 43,
    downloads: 2100,
    tags: ['MDX', 'Next.js', 'Search', 'Versioning'],
    description: 'Open-source documentation site template with full-text search, versioning, dark mode, and API reference pages.',
    badge: 'Free',
    badgeColor: 'sky',
    preview: '#F8FAFC',
    featured: false,
  },
  {
    id: 't6',
    name: 'Design System Starter',
    author: 'LaudStack Team',
    category: 'design',
    price: 59,
    originalPrice: 89,
    rating: 4.8,
    reviews: 76,
    downloads: 940,
    tags: ['Figma', 'Tokens', '200+ Components', 'Dark Mode'],
    description: 'Production-ready design system with 200+ components, design tokens, accessibility guidelines, and Figma source files.',
    badge: 'Pro',
    badgeColor: 'purple',
    preview: '#171717',
    featured: true,
  },
  {
    id: 't7',
    name: 'Multi-tenant SaaS UI',
    author: 'BuildFast',
    category: 'saas',
    price: 99,
    originalPrice: 149,
    rating: 4.9,
    reviews: 88,
    downloads: 670,
    tags: ['React', 'Multi-tenant', 'RBAC', 'Billing'],
    description: 'Enterprise-grade multi-tenant SaaS UI with role-based access control, organization management, and billing portal.',
    badge: 'Premium',
    badgeColor: 'amber',
    preview: '#171717',
    featured: false,
  },
  {
    id: 't8',
    name: 'Startup Landing Page',
    author: 'LaunchKit',
    category: 'landing',
    price: 0,
    originalPrice: null,
    rating: 4.4,
    reviews: 112,
    downloads: 3200,
    tags: ['React', 'Tailwind', 'Framer Motion', 'Free'],
    description: 'Clean, modern startup landing page with animated hero, feature grid, testimonials, and newsletter signup.',
    badge: 'Free',
    badgeColor: 'sky',
    preview: '#FFFBEB',
    featured: false,
  },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const BADGE_COLORS: Record<string, string> = {
  amber: 'bg-amber-400/15 text-amber-600 border-amber-400/30',
  emerald: 'bg-green-400/15 text-green-600 border-green-500/30',
  sky: 'bg-sky-400/15 text-sky-600 border-sky-400/30',
  purple: 'bg-purple-400/15 text-purple-600 border-purple-400/30',
};

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [query, setQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const filtered = TEMPLATES
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
    .filter(t => priceFilter === 'all' || (priceFilter === 'free' ? t.price === 0 : t.price > 0))
    .filter(t => !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'popular') return b.downloads - a.downloads;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const handlePurchase = (template: typeof TEMPLATES[0]) => {
    if (template.price === 0) {
      toast.success(`${template.name} downloaded! Check your email for the download link.`);
    } else {
      toast.info('Stripe checkout coming soon — sign up to be notified when the marketplace launches!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          eyebrow="Template Marketplace"
          title="Ship faster with premium templates"
          subtitle="Production-ready templates for SaaS, dashboards, landing pages, and more. Built by the community, vetted by LaudStack."
          accent="blue"
          stats={[
            { value: `${TEMPLATES.length}+`,                              label: 'Templates' },
            { value: String(TEMPLATES.filter(t => t.price === 0).length), label: 'Free' },
            { value: '4.7★',                                              label: 'Avg Rating' },
            { value: '2.4k+',                                              label: 'Downloads' },
          ]}
        />

        <div className="max-w-[1300px] mx-auto px-4 py-8">

          {/* Search + Sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Category + Price filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-white text-slate-900 border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              {(['all', 'free', 'paid'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border capitalize ${
                    priceFilter === p
                      ? 'bg-amber-400 text-slate-900 border-amber-400'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                  }`}
                >
                  {p === 'all' ? 'All Prices' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-slate-500 text-sm font-medium">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Template Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No templates match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filtered.map(template => (
                <div key={template.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all group flex flex-col">
                  {/* Preview */}
                  <div
                    className="h-36 relative flex items-center justify-center"
                    style={{ background: template.preview }}
                  >
                    {template.badge && (
                      <div className="absolute top-3 left-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${BADGE_COLORS[template.badgeColor!] || BADGE_COLORS.amber}`}>
                          {template.badge}
                        </span>
                      </div>
                    )}
                    {template.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-amber-400 text-slate-900 text-xs font-black px-2 py-0.5 rounded-full">⭐ Featured</span>
                      </div>
                    )}
                    <div className="text-4xl font-black opacity-10 text-slate-900 select-none">{template.name[0]}</div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-slate-900 font-bold text-sm leading-tight">{template.name}</h3>
                      <div className="text-right flex-shrink-0">
                        {template.price === 0 ? (
                          <span className="text-green-600 font-black text-sm">Free</span>
                        ) : (
                          <div>
                            <span className="text-slate-900 font-black text-sm">${template.price}</span>
                            {template.originalPrice && (
                              <span className="text-slate-500 text-xs line-through ml-1">${template.originalPrice}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed mb-3 flex-1">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-medium">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-700">{template.rating}</span>
                        <span>({template.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{template.downloads.toLocaleString()}</span>
                      </div>
                      <span className="text-slate-500">by {template.author}</span>
                    </div>
                    <button
                      onClick={() => handlePurchase(template)}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        template.price === 0
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-white hover:bg-gray-100 text-slate-900'
                      }`}
                    >
                      {template.price === 0 ? (
                        <><Download className="w-4 h-4" /> Download Free</>
                      ) : (
                        <><ShoppingCart className="w-4 h-4" /> Buy for ${template.price}</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sell your template CTA */}
          <div className="bg-white text-slate-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-xl font-black mb-1">Sell your templates on LaudStack</h3>
              <p className="text-slate-500 text-sm">Reach 12,000+ developers and founders. Keep 80% of every sale.</p>
            </div>
            <button
              onClick={() => toast.info('Seller program launching soon — join the waitlist!')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Zap className="w-4 h-4" />
              Become a Seller
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

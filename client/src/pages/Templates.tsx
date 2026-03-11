/*
 * LaudStack — Template Marketplace
 * Design: white bg, amber accents, slate text, no gradients
 * Features: category pills, price/sort filters, search, URL persistence,
 *           preview thumbnails (Unsplash), live preview links, featured spotlight
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  Search, Star, Download, Eye, Zap, Crown,
  ArrowRight, ShoppingCart, Package, Code,
  Palette, BarChart3, FileText, Mail, Globe, Layers,
  X, ExternalLink, CheckCircle, Users
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

// ── Types ────────────────────────────────────────────────────────────────────
type PriceFilter = 'all' | 'free' | 'paid';

interface Template {
  id: string;
  name: string;
  author: string;
  authorAvatar: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  downloads: number;
  tags: string[];
  description: string;
  badge: string | null;
  badgeColor: string | null;
  previewImage: string;   // Unsplash URL
  previewUrl: string;     // live demo link
  featured?: boolean;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',       label: 'All Templates',   icon: Layers },
  { id: 'saas',      label: 'SaaS Starter',    icon: Code },
  { id: 'landing',   label: 'Landing Pages',   icon: Globe },
  { id: 'dashboard', label: 'Dashboards',      icon: BarChart3 },
  { id: 'email',     label: 'Email Templates', icon: Mail },
  { id: 'docs',      label: 'Documentation',   icon: FileText },
  { id: 'design',    label: 'Design Systems',  icon: Palette },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest',  label: 'Newest' },
  { value: 'rating',  label: 'Highest Rated' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

const BADGE_STYLES: Record<string, string> = {
  amber:   'bg-amber-50 text-amber-700 border border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  sky:     'bg-sky-50 text-sky-700 border border-sky-200',
  purple:  'bg-purple-50 text-purple-700 border border-purple-200',
  rose:    'bg-rose-50 text-rose-700 border border-rose-200',
};

const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'SaaS Boilerplate Pro',
    author: 'LaudStack Team',
    authorAvatar: 'L',
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
    previewImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/saas-boilerplate',
    featured: true,
  },
  {
    id: 't2',
    name: 'Analytics Dashboard UI',
    author: 'DesignForge',
    authorAvatar: 'D',
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
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/analytics-dashboard',
    featured: true,
  },
  {
    id: 't3',
    name: 'Product Landing Page Kit',
    author: 'PixelCraft',
    authorAvatar: 'P',
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
    previewImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/landing-kit',
  },
  {
    id: 't4',
    name: 'Email Template Bundle',
    author: 'MailCraft Studio',
    authorAvatar: 'M',
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
    previewImage: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/email-bundle',
  },
  {
    id: 't5',
    name: 'Developer Docs Template',
    author: 'DocuFlow',
    authorAvatar: 'D',
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
    previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/docs-template',
  },
  {
    id: 't6',
    name: 'Design System Starter',
    author: 'LaudStack Team',
    authorAvatar: 'L',
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
    previewImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/design-system',
    featured: true,
  },
  {
    id: 't7',
    name: 'Multi-tenant SaaS UI',
    author: 'BuildFast',
    authorAvatar: 'B',
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
    previewImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/multi-tenant',
  },
  {
    id: 't8',
    name: 'Startup Landing Page',
    author: 'LaunchKit',
    authorAvatar: 'L',
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
    previewImage: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/startup-landing',
  },
  {
    id: 't9',
    name: 'CRM Dashboard',
    author: 'AppForge',
    authorAvatar: 'A',
    category: 'dashboard',
    price: 69,
    originalPrice: 99,
    rating: 4.7,
    reviews: 61,
    downloads: 530,
    tags: ['React', 'TypeScript', 'Zustand', 'REST API'],
    description: 'Full-featured CRM dashboard with pipeline views, contact management, activity feeds, and reporting charts.',
    badge: null,
    badgeColor: null,
    previewImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/crm-dashboard',
  },
  {
    id: 't10',
    name: 'Blog & Content Site',
    author: 'ContentKit',
    authorAvatar: 'C',
    category: 'docs',
    price: 0,
    originalPrice: null,
    rating: 4.3,
    reviews: 89,
    downloads: 2800,
    tags: ['Next.js', 'MDX', 'RSS', 'SEO'],
    description: 'SEO-optimized blog template with MDX support, RSS feed, tag filtering, author pages, and reading time.',
    badge: 'Free',
    badgeColor: 'sky',
    previewImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/blog-template',
  },
  {
    id: 't11',
    name: 'SaaS Marketing Site',
    author: 'GrowthLab',
    authorAvatar: 'G',
    category: 'landing',
    price: 49,
    originalPrice: null,
    rating: 4.6,
    reviews: 55,
    downloads: 720,
    tags: ['Next.js', 'Tailwind', 'Animations', 'Blog'],
    description: 'Complete SaaS marketing website with homepage, pricing, blog, changelog, and legal pages. Fully responsive.',
    badge: null,
    badgeColor: null,
    previewImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/saas-marketing',
  },
  {
    id: 't12',
    name: 'Icon & Illustration Pack',
    author: 'PixelCraft',
    authorAvatar: 'P',
    category: 'design',
    price: 19,
    originalPrice: null,
    rating: 4.5,
    reviews: 130,
    downloads: 4100,
    tags: ['SVG', 'Figma', '500+ Icons', 'MIT License'],
    description: '500+ hand-crafted SVG icons and 80 illustrations in consistent style. Figma source files included.',
    badge: 'Popular',
    badgeColor: 'rose',
    previewImage: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&q=80',
    previewUrl: 'https://demo.laudstack.com/icon-pack',
  },
];

// ── URL helpers ───────────────────────────────────────────────────────────────
function parseUrlFilters() {
  const p = new URLSearchParams(window.location.search);
  return {
    category:  p.get('cat') || 'all',
    price:     (p.get('price') as PriceFilter) || 'all',
    sort:      p.get('sort') || 'popular',
    query:     p.get('q') || '',
  };
}

// ── Template card ─────────────────────────────────────────────────────────────
function TemplateCard({ template, onPreview }: { template: Template; onPreview: (t: Template) => void }) {
  const handlePurchase = () => {
    if (template.price === 0) {
      toast.success(`${template.name} is free! Opening download page…`);
      window.open(template.previewUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Stripe checkout coming soon — join the waitlist to be notified!');
    }
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-amber-400/50 hover:shadow-lg transition-all duration-200 flex flex-col">

      {/* Preview thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={template.previewImage}
          alt={`${template.name} preview`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            onClick={() => onPreview(template)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => window.open(template.previewUrl, '_blank', 'noopener,noreferrer')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Live Demo
          </button>
        </div>

        {/* Badges */}
        {template.badge && (
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[template.badgeColor!] || BADGE_STYLES.amber}`}>
              {template.badge}
            </span>
          </div>
        )}
        {template.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" /> Featured
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col gap-3">

        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-slate-900 font-bold text-sm leading-snug group-hover:text-amber-600 transition-colors">
            {template.name}
          </h3>
          <div className="text-right shrink-0">
            {template.price === 0 ? (
              <span className="text-emerald-600 font-black text-sm">Free</span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-slate-900 font-black text-sm">${template.price}</span>
                {template.originalPrice && (
                  <span className="text-slate-400 text-xs line-through">${template.originalPrice}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-xs leading-relaxed flex-1 line-clamp-2">{template.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-gray-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-md font-medium border border-gray-200">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-[11px] text-slate-400 font-medium px-1">+{template.tags.length - 3}</span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700">{template.rating}</span>
            <span>({template.reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{template.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <span className="text-[9px] font-black text-amber-700">{template.authorAvatar}</span>
            </div>
            <span className="truncate max-w-[80px]">{template.author}</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onPreview(template)}
            className="flex-1 py-2 rounded-xl border border-gray-200 hover:border-amber-400 text-slate-600 hover:text-amber-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={handlePurchase}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              template.price === 0
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-amber-500 hover:bg-amber-400 text-white'
            }`}
          >
            {template.price === 0
              ? <><Download className="w-3.5 h-3.5" /> Download</>
              : <><ShoppingCart className="w-3.5 h-3.5" /> Buy ${template.price}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({ template, onClose }: { template: Template; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-slate-900 font-bold text-base">{template.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5">by {template.author}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={template.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Live Demo
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Preview image */}
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={template.previewImage}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="px-6 py-5 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{template.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {template.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-medium border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="shrink-0 sm:w-48 space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900">{template.rating}</span>
              <span className="text-slate-500 text-sm">({template.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Download className="w-4 h-4" />
              {template.downloads.toLocaleString()} downloads
            </div>
            <div className="pt-2">
              {template.price === 0 ? (
                <span className="text-2xl font-black text-emerald-600">Free</span>
              ) : (
                <div>
                  <span className="text-2xl font-black text-slate-900">${template.price}</span>
                  {template.originalPrice && (
                    <span className="text-slate-400 text-sm line-through ml-2">${template.originalPrice}</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                onClose();
                if (template.price === 0) {
                  toast.success(`${template.name} is free! Opening download page…`);
                  window.open(template.previewUrl, '_blank', 'noopener,noreferrer');
                } else {
                  toast.info('Stripe checkout coming soon!');
                }
              }}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                template.price === 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-white'
              }`}
            >
              {template.price === 0
                ? <><Download className="w-4 h-4" /> Download Free</>
                : <><ShoppingCart className="w-4 h-4" /> Buy for ${template.price}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Templates() {
  const [location, navigate] = useLocation();
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const initial = parseUrlFilters();
  const [selectedCategory, setSelectedCategory] = useState(initial.category);
  const [priceFilter, setPriceFilter]           = useState<PriceFilter>(initial.price);
  const [sortBy, setSortBy]                     = useState(initial.sort);
  const [query, setQuery]                       = useState(initial.query);

  // Inbound: URL → state
  useEffect(() => {
    setSyncingFromUrl(true);
    const f = parseUrlFilters();
    setSelectedCategory(f.category);
    setPriceFilter(f.price);
    setSortBy(f.sort);
    setQuery(f.query);
    setTimeout(() => setSyncingFromUrl(false), 0);
  }, [location]);

  // Outbound: state → URL (omit defaults)
  useEffect(() => {
    if (syncingFromUrl) return;
    const p = new URLSearchParams();
    if (selectedCategory !== 'all')  p.set('cat', selectedCategory);
    if (priceFilter !== 'all')       p.set('price', priceFilter);
    if (sortBy !== 'popular')        p.set('sort', sortBy);
    if (query.trim())                p.set('q', query.trim());
    const qs = p.toString();
    navigate(qs ? `/templates?${qs}` : '/templates', { replace: true });
  }, [selectedCategory, priceFilter, sortBy, query, syncingFromUrl]);

  const filtered = useMemo(() => {
    return TEMPLATES
      .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
      .filter(t => priceFilter === 'all' || (priceFilter === 'free' ? t.price === 0 : t.price > 0))
      .filter(t => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return t.name.toLowerCase().includes(q) ||
               t.description.toLowerCase().includes(q) ||
               t.tags.some(tag => tag.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (sortBy === 'popular')    return b.downloads - a.downloads;
        if (sortBy === 'newest')     return b.id.localeCompare(a.id);
        if (sortBy === 'rating')     return b.rating - a.rating;
        if (sortBy === 'price-asc')  return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [selectedCategory, priceFilter, sortBy, query]);

  const featuredTemplates = TEMPLATES.filter(t => t.featured);
  const hasFilters = selectedCategory !== 'all' || priceFilter !== 'all' || query.trim() !== '';

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceFilter('all');
    setSortBy('popular');
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {previewTemplate && (
        <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}

      <PageHero
        eyebrow="Template Marketplace"
        title="Ship faster with premium templates"
        subtitle="Production-ready templates for SaaS, dashboards, landing pages, and more. Built by the community, vetted by LaudStack."
        accent="amber"
        layout="centered"
        size="md"
      >
        {/* Category pills inside hero */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: selectedCategory === id ? '#F59E0B' : '#fff',
                color: selectedCategory === id ? '#fff' : '#374151',
                border: selectedCategory === id ? '1px solid #F59E0B' : '1px solid #E5E7EB',
                boxShadow: selectedCategory === id ? '0 2px 8px rgba(245,158,11,0.3)' : 'none',
              }}
            >
              <Icon style={{ width: '13px', height: '13px' }} />
              {label}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Featured spotlight ── */}
        {!hasFilters && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-black text-slate-900">Featured Templates</h2>
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                Staff picks
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredTemplates.map(t => (
                <TemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} />
              ))}
            </div>
          </section>
        )}

        {/* ── Filter bar ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search templates, tags…"
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Price filter */}
            <div className="flex gap-1.5">
              {(['all', 'free', 'paid'] as PriceFilter[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                    priceFilter === p
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                  }`}
                >
                  {p === 'all' ? 'All Prices' : p === 'free' ? '🆓 Free' : '💳 Paid'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-gray-100 border-0 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-all ml-auto"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500 font-medium">
            {filtered.length} template{filtered.length !== 1 ? 's' : ''}
            {hasFilters && <span className="text-amber-600 font-bold"> · filtered</span>}
          </p>
        </div>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filtered.map(t => (
              <TemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl mb-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No templates match your filters</h3>
            <p className="text-slate-500 text-sm mb-4">Try a different category, price range, or search term.</p>
            <button onClick={clearFilters} className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors">
              Clear Filters
            </button>
          </div>
        )}

        {/* ── Trust strip ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            { icon: CheckCircle, color: 'text-emerald-500', title: 'Quality Vetted',       desc: 'Every template is reviewed by the LaudStack team before listing.' },
            { icon: Users,       color: 'text-sky-500',     title: 'Community Trusted',    desc: 'Rated and reviewed by thousands of developers and founders.' },
            { icon: Zap,         color: 'text-amber-500',   title: 'Ready to Ship',        desc: 'All templates include documentation and setup instructions.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
              <Icon className={`w-5 h-5 ${color} shrink-0 mt-0.5`} />
              <div>
                <div className="text-slate-900 font-bold text-sm mb-1">{title}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sell your template CTA ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Sell your templates on LaudStack</h3>
            <p className="text-slate-500 text-sm">Reach 12,000+ developers and founders. Keep 80% of every sale.</p>
          </div>
          <button
            onClick={() => toast.info('Seller program launching soon — join the waitlist!')}
            className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0"
          >
            <Zap className="w-4 h-4" />
            Become a Seller
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

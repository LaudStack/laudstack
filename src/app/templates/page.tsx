"use client";



/*
 * LaudStack — Template Marketplace
 * Design: white bg, amber accents, slate text, no gradients
 * Features: category pills, price/sort filters, search, URL persistence,
 *           polished preview modal (Overview/Reviews tabs), full-screen live preview,
 *           add-to-cart with cart drawer, multi-step checkout (Cart → Billing → Confirmation)
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Star, Download, Eye, Zap, Crown,
  ShoppingCart, Package, Code,
  Palette, BarChart3, FileText, Mail, Globe, Layers,
  X, ExternalLink, CheckCircle, Users, ArrowLeft, ArrowRight,
  Monitor, Smartphone, Tablet, RefreshCw, Lock, CreditCard,
  Check, Trash2, Plus, Minus, ChevronRight, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

// ── Types ────────────────────────────────────────────────────────────────────
type PriceFilter = 'all' | 'free' | 'paid';
type PreviewTab = 'overview' | 'reviews';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type CheckoutStep = 'cart' | 'billing' | 'confirmation';

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
  longDescription: string;
  badge: string | null;
  badgeColor: string | null;
  previewImage: string;
  screenshots: string[];
  previewUrl: string;
  featured?: boolean;
  techStack: string[];
  includes: string[];
  mockReviews: { author: string; avatar: string; rating: number; comment: string; date: string }[];
}

interface CartItem {
  template: Template;
  qty: number;
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
  { value: 'popular',    label: 'Most Popular' },
  { value: 'newest',     label: 'Newest' },
  { value: 'rating',     label: 'Highest Rated' },
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

const MOCK_REVIEWS = [
  { author: 'Alex Chen', avatar: 'A', rating: 5, comment: 'Saved me weeks of setup time. The code quality is excellent and documentation is thorough.', date: 'Feb 2026' },
  { author: 'Sarah Kim', avatar: 'S', rating: 5, comment: 'Best purchase I made this year. Deployed to production in 2 days.', date: 'Jan 2026' },
  { author: 'Marcus Webb', avatar: 'M', rating: 4, comment: 'Great template overall. Would love more customization options for the auth flow.', date: 'Jan 2026' },
  { author: 'Priya Nair', avatar: 'P', rating: 5, comment: 'The design system alone is worth the price. Very well structured.', date: 'Dec 2025' },
];

const TEMPLATES: Template[] = [
  {
    id: 't1', name: 'SaaS Boilerplate Pro', author: 'LaudStack Team', authorAvatar: 'L',
    category: 'saas', price: 79, originalPrice: 129, rating: 4.9, reviews: 142, downloads: 1840,
    tags: ['Next.js', 'Stripe', 'Auth', 'Postgres'],
    description: 'Full-stack SaaS starter with auth, billing, team workspaces, and admin panel. Ship your SaaS in days, not months.',
    longDescription: 'The most complete SaaS boilerplate on the market. Includes Next.js 14 App Router, Supabase auth, Stripe billing with webhooks, team workspaces with role-based access, admin panel, email notifications, and a polished marketing site. Everything you need to launch a production-ready SaaS product.',
    badge: 'Bestseller', badgeColor: 'amber',
    previewImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
    ],
    previewUrl: 'https://demo.laudstack.com/saas-boilerplate', featured: true,
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Stripe', 'Prisma'],
    includes: ['Source code', 'Documentation', 'Video walkthrough', '6 months updates', 'Discord support'],
    mockReviews: MOCK_REVIEWS,
  },
  {
    id: 't2', name: 'Analytics Dashboard UI', author: 'DesignForge', authorAvatar: 'D',
    category: 'dashboard', price: 49, originalPrice: null, rating: 4.8, reviews: 98, downloads: 1120,
    tags: ['React', 'Recharts', 'Tailwind', 'Dark Mode'],
    description: 'Beautiful analytics dashboard with 20+ chart types, KPI cards, data tables, and a full dark/light theme.',
    longDescription: 'A production-ready analytics dashboard template built with React and Recharts. Includes 20+ chart types (line, bar, area, pie, funnel, scatter), KPI cards with trend indicators, sortable data tables, date range pickers, and a complete dark/light theme system. Fully responsive and accessible.',
    badge: 'New', badgeColor: 'emerald',
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    ],
    previewUrl: 'https://demo.laudstack.com/analytics-dashboard', featured: true,
    techStack: ['React 18', 'TypeScript', 'Recharts', 'Tailwind CSS', 'Zustand'],
    includes: ['Source code', 'Figma design file', 'Documentation', '3 months updates'],
    mockReviews: MOCK_REVIEWS.slice(0, 3),
  },
  {
    id: 't3', name: 'Product Landing Page Kit', author: 'PixelCraft', authorAvatar: 'P',
    category: 'landing', price: 39, originalPrice: 59, rating: 4.7, reviews: 67, downloads: 890,
    tags: ['HTML', 'CSS', 'Animations', 'SEO'],
    description: '12 conversion-optimized landing page sections. Hero, features, pricing, testimonials, FAQ, and CTA blocks.',
    longDescription: 'A comprehensive landing page kit with 12 fully customizable sections. Each section is conversion-optimized based on A/B test data. Includes animated hero, feature grid, social proof, pricing table, FAQ accordion, and multiple CTA variants. Ships with SEO meta tags and schema markup.',
    badge: null, badgeColor: null,
    previewImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/landing-kit',
    techStack: ['HTML5', 'CSS3', 'Vanilla JS', 'GSAP'],
    includes: ['Source code', '12 sections', 'Documentation', 'Lifetime updates'],
    mockReviews: MOCK_REVIEWS.slice(1, 3),
  },
  {
    id: 't4', name: 'Email Template Bundle', author: 'MailCraft Studio', authorAvatar: 'M',
    category: 'email', price: 29, originalPrice: null, rating: 4.6, reviews: 54, downloads: 760,
    tags: ['HTML Email', 'Responsive', 'Dark Mode', '25 Templates'],
    description: '25 responsive email templates: welcome, onboarding, transactional, newsletters, and re-engagement flows.',
    longDescription: '25 hand-crafted HTML email templates tested across 40+ email clients. Includes welcome series, onboarding flows, transactional emails, weekly newsletters, and re-engagement campaigns. All templates support dark mode and are fully responsive on mobile.',
    badge: null, badgeColor: null,
    previewImage: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/email-bundle',
    techStack: ['HTML Email', 'Inline CSS', 'MJML'],
    includes: ['25 templates', 'MJML source files', 'Documentation', 'Litmus test results'],
    mockReviews: MOCK_REVIEWS.slice(0, 2),
  },
  {
    id: 't5', name: 'Developer Docs Template', author: 'DocuFlow', authorAvatar: 'D',
    category: 'docs', price: 0, originalPrice: null, rating: 4.5, reviews: 43, downloads: 2100,
    tags: ['MDX', 'Next.js', 'Search', 'Versioning'],
    description: 'Open-source documentation site template with full-text search, versioning, dark mode, and API reference pages.',
    longDescription: 'A free, open-source documentation template built with Next.js and MDX. Features full-text search powered by Algolia, version switcher, dark mode, API reference pages with code samples, and a sidebar navigation. Deploy to Vercel in one click.',
    badge: 'Free', badgeColor: 'sky',
    previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/docs-template',
    techStack: ['Next.js', 'MDX', 'Algolia', 'Tailwind CSS'],
    includes: ['Source code', 'Documentation', 'Community support'],
    mockReviews: MOCK_REVIEWS.slice(2),
  },
  {
    id: 't6', name: 'Design System Starter', author: 'LaudStack Team', authorAvatar: 'L',
    category: 'design', price: 59, originalPrice: 89, rating: 4.8, reviews: 76, downloads: 940,
    tags: ['Figma', 'Tokens', '200+ Components', 'Dark Mode'],
    description: 'Production-ready design system with 200+ components, design tokens, accessibility guidelines, and Figma source files.',
    longDescription: 'A comprehensive design system with 200+ production-ready components, a complete design token system, accessibility guidelines, and Figma source files. Built on Radix UI primitives with Tailwind CSS. Includes light and dark themes, motion guidelines, and a Storybook instance.',
    badge: 'Pro', badgeColor: 'purple',
    previewImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/design-system', featured: true,
    techStack: ['React', 'Radix UI', 'Tailwind CSS', 'Storybook', 'Figma'],
    includes: ['Source code', 'Figma file', 'Storybook', 'Documentation', '12 months updates'],
    mockReviews: MOCK_REVIEWS,
  },
  {
    id: 't7', name: 'Multi-tenant SaaS UI', author: 'BuildFast', authorAvatar: 'B',
    category: 'saas', price: 99, originalPrice: 149, rating: 4.9, reviews: 88, downloads: 670,
    tags: ['React', 'Multi-tenant', 'RBAC', 'Billing'],
    description: 'Enterprise-grade multi-tenant SaaS UI with role-based access control, organization management, and billing portal.',
    longDescription: 'Enterprise-grade multi-tenant SaaS UI template. Includes organization management, role-based access control (owner, admin, member), billing portal with Stripe, audit logs, SSO-ready auth, and a comprehensive settings panel. Built for B2B SaaS products.',
    badge: 'Premium', badgeColor: 'amber',
    previewImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/multi-tenant',
    techStack: ['React', 'TypeScript', 'Stripe', 'Tailwind CSS', 'Zustand'],
    includes: ['Source code', 'Documentation', 'Video walkthrough', '12 months updates', 'Priority support'],
    mockReviews: MOCK_REVIEWS,
  },
  {
    id: 't8', name: 'Startup Landing Page', author: 'LaunchKit', authorAvatar: 'L',
    category: 'landing', price: 0, originalPrice: null, rating: 4.4, reviews: 112, downloads: 3200,
    tags: ['React', 'Tailwind', 'Framer Motion', 'Free'],
    description: 'Clean, modern startup landing page with animated hero, feature grid, testimonials, and newsletter signup.',
    longDescription: 'A free, open-source startup landing page template. Features an animated hero section, feature grid with icons, social proof strip, testimonials carousel, pricing table, and newsletter signup. Built with React, Tailwind CSS, and Framer Motion for smooth animations.',
    badge: 'Free', badgeColor: 'sky',
    previewImage: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/startup-landing',
    techStack: ['React', 'Tailwind CSS', 'Framer Motion'],
    includes: ['Source code', 'Documentation', 'Community support'],
    mockReviews: MOCK_REVIEWS.slice(0, 3),
  },
  {
    id: 't9', name: 'CRM Dashboard', author: 'AppForge', authorAvatar: 'A',
    category: 'dashboard', price: 69, originalPrice: 99, rating: 4.7, reviews: 61, downloads: 530,
    tags: ['React', 'TypeScript', 'Zustand', 'REST API'],
    description: 'Full-featured CRM dashboard with pipeline views, contact management, activity feeds, and reporting charts.',
    longDescription: 'A full-featured CRM dashboard template with Kanban pipeline views, contact and company management, activity timeline, email tracking, reporting charts, and a task manager. Built with React, TypeScript, and Zustand. Includes a mock REST API for easy backend integration.',
    badge: null, badgeColor: null,
    previewImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/crm-dashboard',
    techStack: ['React', 'TypeScript', 'Zustand', 'Recharts', 'Tailwind CSS'],
    includes: ['Source code', 'API mock', 'Documentation', '6 months updates'],
    mockReviews: MOCK_REVIEWS.slice(1),
  },
  {
    id: 't10', name: 'Blog & Content Site', author: 'ContentKit', authorAvatar: 'C',
    category: 'docs', price: 0, originalPrice: null, rating: 4.3, reviews: 89, downloads: 2800,
    tags: ['Next.js', 'MDX', 'RSS', 'SEO'],
    description: 'SEO-optimized blog template with MDX support, RSS feed, tag filtering, author pages, and reading time.',
    longDescription: 'A free, SEO-optimized blog template built with Next.js and MDX. Features tag filtering, author pages, reading time estimates, RSS feed, Open Graph meta tags, and a newsletter signup. Scores 100 on Lighthouse. Deploy to Vercel in one click.',
    badge: 'Free', badgeColor: 'sky',
    previewImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/blog-template',
    techStack: ['Next.js', 'MDX', 'Tailwind CSS'],
    includes: ['Source code', 'Documentation', 'Community support'],
    mockReviews: MOCK_REVIEWS.slice(0, 2),
  },
  {
    id: 't11', name: 'SaaS Marketing Site', author: 'GrowthLab', authorAvatar: 'G',
    category: 'landing', price: 49, originalPrice: null, rating: 4.6, reviews: 55, downloads: 720,
    tags: ['Next.js', 'Tailwind', 'Animations', 'Blog'],
    description: 'Complete SaaS marketing website with homepage, pricing, blog, changelog, and legal pages. Fully responsive.',
    longDescription: 'A complete SaaS marketing website template with homepage, pricing page, blog with MDX, changelog, about, and legal pages. Features smooth scroll animations, a sticky header, mobile-first responsive design, and SEO optimization. Ready to deploy on Vercel.',
    badge: null, badgeColor: null,
    previewImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/saas-marketing',
    techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'MDX'],
    includes: ['Source code', 'Documentation', '3 months updates'],
    mockReviews: MOCK_REVIEWS.slice(2),
  },
  {
    id: 't12', name: 'Icon & Illustration Pack', author: 'PixelCraft', authorAvatar: 'P',
    category: 'design', price: 19, originalPrice: null, rating: 4.5, reviews: 130, downloads: 4100,
    tags: ['SVG', 'Figma', '500+ Icons', 'MIT License'],
    description: '500+ hand-crafted SVG icons and 80 illustrations in consistent style. Figma source files included.',
    longDescription: '500+ hand-crafted SVG icons and 80 illustrations in a consistent, modern style. Available in multiple formats (SVG, PNG, Figma). MIT licensed for commercial use. Includes a React component library for easy integration. Updated monthly with new icons.',
    badge: 'Popular', badgeColor: 'rose',
    previewImage: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80',
    screenshots: ['https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80'],
    previewUrl: 'https://demo.laudstack.com/icon-pack',
    techStack: ['SVG', 'React', 'Figma'],
    includes: ['500+ SVG icons', '80 illustrations', 'Figma source', 'React library', 'Lifetime updates'],
    mockReviews: MOCK_REVIEWS,
  },
];

// ── URL helpers ───────────────────────────────────────────────────────────────
function parseUrlFilters() {
  const p = new URLSearchParams(window.location.search);
  return {
    category: p.get('cat') || 'all',
    price:    (p.get('price') as PriceFilter) || 'all',
    sort:     p.get('sort') || 'popular',
    query:    p.get('q') ? decodeURIComponent(p.get('q')!) : '',
  };
}

// ── Star row ──────────────────────────────────────────────────────────────────
function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────
function TemplateCard({
  template,
  onPreview,
  onAddToCart,
  inCart,
}: {
  template: Template;
  onPreview: (t: Template) => void;
  onAddToCart: (t: Template) => void;
  inCart: boolean;
}) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-amber-400/60 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col">

      {/* Preview thumbnail */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
        <img
          src={template.previewImage}
          alt={`${template.name} preview`}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-400"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-slate-900/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2.5">
          <button
            onClick={() => onPreview(template)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-gray-50 transition-colors shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={() => window.open(template.previewUrl, '_blank', 'noopener,noreferrer')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-400 transition-colors shadow-lg"
          >
            <Monitor className="w-3.5 h-3.5" /> Live Demo
          </button>
        </div>
        {/* Badges */}
        {template.badge && (
          <div className="absolute top-3 left-3">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[template.badgeColor!] || BADGE_STYLES.amber}`}>
              {template.badge}
            </span>
          </div>
        )}
        {template.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Crown className="w-2.5 h-2.5" /> Featured
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-slate-900 font-bold text-sm leading-snug group-hover:text-amber-600 transition-colors line-clamp-2 flex-1">
            {template.name}
          </h3>
          <div className="text-right shrink-0 ml-2">
            {template.price === 0 ? (
              <span className="text-emerald-600 font-black text-sm">Free</span>
            ) : (
              <div className="flex items-baseline gap-1 justify-end">
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
            <span key={tag} className="bg-gray-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-gray-200">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium px-1 self-center">+{template.tags.length - 3}</span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <StarRow rating={template.rating} />
            <span className="font-bold text-slate-700 ml-1">{template.rating}</span>
            <span className="text-slate-400">({template.reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{template.downloads.toLocaleString()}</span>
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
          {template.price === 0 ? (
            <button
              onClick={() => { toast.success(`Downloading ${template.name}…`); window.open(template.previewUrl, '_blank'); }}
              className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(template)}
              className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                inCart
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-500 hover:bg-amber-400 text-white'
              }`}
            >
              {inCart ? <><Check className="w-3.5 h-3.5" /> In Cart</> : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({
  template,
  onClose,
  onAddToCart,
  onLivePreview,
  inCart,
}: {
  template: Template;
  onClose: () => void;
  onAddToCart: (t: Template) => void;
  onLivePreview: (t: Template) => void;
  inCart: boolean;
}) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('overview');
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const discount = template.originalPrice
    ? Math.round((1 - template.price / template.originalPrice) * 100)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: '900px', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-amber-700">{template.authorAvatar}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 font-bold text-sm truncate">{template.name}</h3>
              <p className="text-slate-400 text-xs">by {template.author}</p>
            </div>
            {template.badge && (
              <span className={`hidden sm:inline text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${BADGE_STYLES[template.badgeColor!] || BADGE_STYLES.amber}`}>
                {template.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={() => onLivePreview(template)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-slate-700 font-bold text-xs hover:border-amber-400 hover:text-amber-700 transition-colors"
            >
              <Monitor className="w-3.5 h-3.5" /> Live Preview
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Screenshot */}
          <div className="relative bg-gray-50" style={{ aspectRatio: '16/7' }}>
            <img
              src={template.screenshots[activeScreenshot] || template.previewImage}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            {template.screenshots.length > 1 && (
              <>
                <button
                  onClick={() => setActiveScreenshot(i => Math.max(0, i - 1))}
                  disabled={activeScreenshot === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center shadow-md disabled:opacity-30 hover:bg-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={() => setActiveScreenshot(i => Math.min(template.screenshots.length - 1, i + 1))}
                  disabled={activeScreenshot === template.screenshots.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center shadow-md disabled:opacity-30 hover:bg-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-slate-700" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {template.screenshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveScreenshot(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeScreenshot ? 'bg-white w-4' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 px-6">
            <div className="flex gap-0">
              {(['overview', 'reviews'] as PreviewTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-bold capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'reviews' ? `Reviews (${template.mockReviews.length})` : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Left: description + includes + tech */}
                <div className="sm:col-span-2 space-y-5">
                  <p className="text-slate-600 text-sm leading-relaxed">{template.longDescription}</p>

                  <div>
                    <h4 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-3">What's Included</h4>
                    <ul className="space-y-1.5">
                      {template.includes.map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {template.techStack.map(tech => (
                        <span key={tech} className="bg-slate-50 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-slate-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {template.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-medium border border-gray-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: price + stats + CTA */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                    {/* Price */}
                    <div className="mb-4">
                      {template.price === 0 ? (
                        <span className="text-3xl font-black text-emerald-600">Free</span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900">${template.price}</span>
                          {template.originalPrice && (
                            <>
                              <span className="text-slate-400 text-base line-through">${template.originalPrice}</span>
                              <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-200">
                                -{discount}%
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <p className="text-slate-400 text-xs mt-1">One-time purchase · Lifetime access</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-2 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <StarRow rating={template.rating} />
                        </div>
                        <div className="text-xs font-bold text-slate-900">{template.rating}</div>
                        <div className="text-[10px] text-slate-400">{template.reviews} reviews</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-xl border border-gray-200">
                        <Download className="w-4 h-4 text-slate-400 mx-auto mb-0.5" />
                        <div className="text-xs font-bold text-slate-900">{template.downloads.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">downloads</div>
                      </div>
                    </div>

                    {/* CTAs */}
                    {template.price === 0 ? (
                      <button
                        onClick={() => { toast.success(`Downloading ${template.name}…`); window.open(template.previewUrl, '_blank'); }}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download Free
                      </button>
                    ) : (
                      <button
                        onClick={() => { onAddToCart(template); onClose(); }}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                          inCart
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-500 hover:bg-amber-400 text-white'
                        }`}
                      >
                        {inCart ? <><Check className="w-4 h-4" /> Added to Cart</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart — ${template.price}</>}
                      </button>
                    )}

                    <button
                      onClick={() => onLivePreview(template)}
                      className="w-full mt-2 py-2.5 rounded-xl border border-gray-200 text-slate-600 hover:border-amber-400 hover:text-amber-700 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Monitor className="w-4 h-4" /> Full Live Preview
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="space-y-2">
                    {[
                      { icon: Shield, text: 'Secure checkout' },
                      { icon: RefreshCw, text: '30-day refund policy' },
                      { icon: Lock, text: 'Lifetime access' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating summary */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="text-center">
                    <div className="text-4xl font-black text-slate-900">{template.rating}</div>
                    <StarRow rating={template.rating} size="md" />
                    <div className="text-xs text-slate-400 mt-1">{template.reviews} reviews</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(s => {
                      const pct = s === 5 ? 70 : s === 4 ? 20 : s === 3 ? 7 : s === 2 ? 2 : 1;
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-2">{s}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-6">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual reviews */}
                <div className="space-y-4">
                  {template.mockReviews.map((review, i) => (
                    <div key={i} className="p-4 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                          <span className="text-xs font-black text-amber-700">{review.avatar}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{review.author}</div>
                          <div className="flex items-center gap-2">
                            <StarRow rating={review.rating} />
                            <span className="text-xs text-slate-400">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Live Preview Modal ────────────────────────────────────────────────────────
function LivePreviewModal({
  template,
  onClose,
  onAddToCart,
  inCart,
}: {
  template: Template;
  onClose: () => void;
  onAddToCart: (t: Template) => void;
  inCart: boolean;
}) {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const viewportWidths: Record<ViewportMode, string> = {
    desktop: '100%',
    tablet:  '768px',
    mobile:  '375px',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
          </button>
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5 min-w-[280px]">
            <Lock className="w-3 h-3 text-slate-400" />
            <span className="text-slate-300 text-xs font-mono truncate">{template.previewUrl}</span>
          </div>
          <button
            onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 800); }}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>

        {/* Viewport toggles */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {([
            { mode: 'desktop' as ViewportMode, icon: Monitor },
            { mode: 'tablet'  as ViewportMode, icon: Tablet },
            { mode: 'mobile'  as ViewportMode, icon: Smartphone },
          ]).map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewport(mode)}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                viewport === mode ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Right: template name + CTA */}
        <div className="flex items-center gap-2">
          <span className="hidden md:block text-slate-300 text-xs font-semibold truncate max-w-[160px]">{template.name}</span>
          {template.price === 0 ? (
            <button
              onClick={() => { toast.success(`Downloading ${template.name}…`); window.open(template.previewUrl, '_blank'); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Free Download
            </button>
          ) : (
            <button
              onClick={() => { onAddToCart(template); onClose(); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                inCart
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-white'
              }`}
            >
              {inCart ? <><Check className="w-3.5 h-3.5" /> In Cart</> : <><ShoppingCart className="w-3.5 h-3.5" /> ${template.price}</>}
            </button>
          )}
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-slate-800 flex items-start justify-center p-4">
        <div
          className="bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 relative"
          style={{ width: viewportWidths[viewport], maxWidth: '100%', minHeight: '400px' }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-500 text-sm">Loading preview…</span>
              </div>
            </div>
          )}
          <img
            src={template.previewImage}
            alt={template.name}
            className="w-full object-cover"
            style={{ minHeight: '600px' }}
            onLoad={() => setIsLoading(false)}
          />
          {/* Overlay note */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            Static preview · <a href={template.previewUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Open live demo ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cart Drawer ───────────────────────────────────────────────────────────────
function CartDrawer({
  items,
  onClose,
  onRemove,
  onCheckout,
}: {
  items: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  const total = items.reduce((s, i) => s + i.template.price * i.qty, 0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] z-50 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            <h2 className="text-slate-900 font-bold text-base">Cart</h2>
            <span className="bg-amber-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Your cart is empty</p>
              <p className="text-slate-400 text-xs mt-1">Add templates to get started</p>
            </div>
          ) : (
            items.map(({ template }) => (
              <div key={template.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <img src={template.previewImage} alt={template.name} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-bold text-sm truncate">{template.name}</p>
                  <p className="text-slate-400 text-xs">{template.author}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-amber-600 font-black text-sm">${template.price}</span>
                    <button
                      onClick={() => onRemove(template.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium text-sm">Subtotal</span>
              <span className="text-slate-900 font-black text-lg">${total}</span>
            </div>
            <p className="text-slate-400 text-xs">One-time purchase · Lifetime access · 30-day refund</p>
            <button
              onClick={onCheckout}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Checkout — ${total}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({
  items,
  onClose,
  onSuccess,
}: {
  items: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [form, setForm] = useState({ name: '', email: '', card: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);
  const total = items.reduce((s, i) => s + i.template.price * i.qty, 0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && step !== 'confirmation') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, step]);

  const handlePay = () => {
    if (!form.name || !form.email || !form.card || !form.expiry || !form.cvv) {
      toast.error('Please fill in all fields');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('confirmation');
      onSuccess();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={step !== 'confirmation' ? onClose : undefined}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: '520px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Step indicator */}
        {step !== 'confirmation' && (
          <div className="flex items-center px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1">
              {(['cart', 'billing'] as CheckoutStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${step === s ? 'text-amber-600' : 'text-slate-400'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-slate-400'}`}>
                      {i + 1}
                    </div>
                    <span className="capitalize hidden sm:block">{s === 'cart' ? 'Review Order' : 'Payment'}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        )}

        {/* Step: Cart review */}
        {step === 'cart' && (
          <div className="p-6 space-y-5">
            <h3 className="text-slate-900 font-bold text-base">Review your order</h3>
            <div className="space-y-3">
              {items.map(({ template }) => (
                <div key={template.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <img src={template.previewImage} alt={template.name} className="w-12 h-9 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-bold text-sm truncate">{template.name}</p>
                    <p className="text-slate-400 text-xs">by {template.author}</p>
                  </div>
                  <span className="text-slate-900 font-black text-sm shrink-0">${template.price}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <span className="text-slate-600 font-medium text-sm">Total</span>
              <span className="text-slate-900 font-black text-xl">${total}</span>
            </div>
            <div className="space-y-2 text-xs text-slate-500">
              {[
                { icon: Shield, text: '30-day money-back guarantee' },
                { icon: Lock, text: 'Secure SSL checkout' },
                { icon: CheckCircle, text: 'Instant download after purchase' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-emerald-500" /> {text}
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('billing')}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Continue to Payment <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step: Billing */}
        {step === 'billing' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('cart')} className="text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-slate-900 font-bold text-base">Payment details</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Card number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.card}
                    onChange={e => setForm(f => ({ ...f, card: e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Expiry</label>
                  <input
                    type="text"
                    value={form.expiry}
                    onChange={e => setForm(f => ({ ...f, expiry: e.target.value.replace(/\D/g,'').slice(0,4).replace(/(.{2})/,'$1/') }))}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">CVV</label>
                  <input
                    type="text"
                    value={form.cvv}
                    onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                    placeholder="123"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-amber-700 text-xs font-medium">This is a demo checkout. No real payment is processed.</p>
            </div>

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
              ) : (
                <><Lock className="w-4 h-4" /> Pay ${total}</>
              )}
            </button>
          </div>
        )}

        {/* Step: Confirmation */}
        {step === 'confirmation' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-xl mb-1">Purchase complete!</h3>
              <p className="text-slate-500 text-sm">
                Your templates are ready. A download link has been sent to <strong>{form.email || 'your email'}</strong>.
              </p>
            </div>
            <div className="space-y-2">
              {items.map(({ template }) => (
                <div key={template.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-left">
                  <img src={template.previewImage} alt={template.name} className="w-10 h-8 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-bold text-sm truncate">{template.name}</p>
                  </div>
                  <button
                    onClick={() => window.open(template.previewUrl, '_blank')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1 shrink-0"
                  >
                    Download <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Templates() {
  const router = useRouter();
  const pathname = usePathname();
  const [syncingFromUrl, setSyncingFromUrl] = useState(false);

  // Modal states
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [livePreviewTemplate, setLivePreviewTemplate] = useState<Template | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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
  }, [pathname]);

  // Outbound: state → URL (omit defaults)
  useEffect(() => {
    if (syncingFromUrl) return;
    const p = new URLSearchParams();
    if (selectedCategory !== 'all')  p.set('cat', selectedCategory);
    if (priceFilter !== 'all')       p.set('price', priceFilter);
    if (sortBy !== 'popular')        p.set('sort', sortBy);
    if (query.trim())                p.set('q', query.trim());
    const qs = p.toString();
    router.replace(qs ? `/templates?${qs}` : '/templates');
  }, [selectedCategory, priceFilter, sortBy, query, syncingFromUrl]);

  const addToCart = (template: Template) => {
    setCartItems(prev => {
      if (prev.find(i => i.template.id === template.id)) return prev;
      toast.success(`${template.name} added to cart`, { action: { label: 'View Cart', onClick: () => setShowCart(true) } });
      return [...prev, { template, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.template.id !== id));
  };

  const isInCart = (id: string) => cartItems.some(i => i.template.id === id);

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

      {/* Modals */}
      {previewTemplate && !livePreviewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onAddToCart={addToCart}
          onLivePreview={t => { setPreviewTemplate(null); setLivePreviewTemplate(t); }}
          inCart={isInCart(previewTemplate.id)}
        />
      )}
      {livePreviewTemplate && (
        <LivePreviewModal
          template={livePreviewTemplate}
          onClose={() => setLivePreviewTemplate(null)}
          onAddToCart={addToCart}
          inCart={isInCart(livePreviewTemplate.id)}
        />
      )}
      {showCart && !showCheckout && (
        <CartDrawer
          items={cartItems}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        />
      )}
      {showCheckout && (
        <CheckoutModal
          items={cartItems}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => setCartItems([])}
        />
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
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold cursor-pointer transition-all border ${
                selectedCategory === id
                  ? 'bg-amber-500 text-white border-amber-500 shadow-[0_2px_8px_rgba(245,158,11,0.3)]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-[13px] h-[13px]" />
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
                <TemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} onAddToCart={addToCart} inCart={isInCart(t.id)} />
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
                    priceFilter === p ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
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
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Cart button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-amber-400 text-slate-600 hover:text-amber-700 font-bold text-sm transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
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
          {cartItems.length > 0 && (
            <button
              onClick={() => setShowCheckout(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition-colors"
            >
              <Lock className="w-3.5 h-3.5" /> Checkout (${cartItems.reduce((s, i) => s + i.template.price, 0)})
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filtered.map(t => (
              <TemplateCard key={t.id} template={t} onPreview={setPreviewTemplate} onAddToCart={addToCart} inCart={isInCart(t.id)} />
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
            { icon: CheckCircle, color: 'text-emerald-500', title: 'Quality Vetted',    desc: 'Every template is reviewed by the LaudStack team before listing.' },
            { icon: Users,       color: 'text-sky-500',     title: 'Community Trusted', desc: 'Rated and reviewed by thousands of developers and founders.' },
            { icon: Zap,         color: 'text-amber-500',   title: 'Ready to Ship',     desc: 'All templates include documentation and setup instructions.' },
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
            <Zap className="w-4 h-4" /> Become a Seller
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

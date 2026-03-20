"use client";

/*
 * LaudStack Homepage — 100% Aggregator X Template Match
 *
 * Exact template values (extracted via getComputedStyle):
 * - Container: max-width 1268px, padding 0 24px
 * - Hero card: bg #ECF2FF, radius 24px, padding 72px 44px, width 1217px, height ~376px
 * - Hero uses 3-col grid inside: 265px | 544px | 265px, gap 28px
 * - Primary blue: #5178FF, Dark text: #0C1830, Gray text: #475569
 * - Featured card: 831px, height ~148px, padding 28px 40px, radius 18px, border #FBBF24, bg #FFFBEB
 * - Latest card: 831px, height ~146px, padding 28px 40px, radius 18px, border #ECF2FF, bg #FFFFFF
 * - Card shadow: rgba(36,65,122,0.08) 0px 0px 2px, rgba(36,65,122,0.08) 0px 2px 6px
 * - Card internal grid: 554px | 171px, gap 20px 24px
 * - Card icon: 80x80px
 * - Card gap (between cards): 20px
 * - Sidebar: 312px wide, position sticky, top 24px
 * - Submit CTA: bg #ECF2FF (light blue!), radius 18px, padding 42px 30px
 * - Next button: bg #5178FF, border #5178FF, color white, radius 96px, padding 12px 20px
 * - Section spacing: padding-bottom 120px
 * - Dual CTA: 2-col grid, each 594.5px, gap 24px 28px, radius 24px, padding 50px 38px
 * - Collection: 3-col grid, each 387px, gap 28px, radius 24px, height ~421px
 * - Articles: 2-col grid 298px | 823px, gap 28px 96px, section bg #F8FAFC, padding 120px 0
 * - Browse all buttons: font 12px weight 500, padding 14px 20px, radius 48px, border #0C1830
 */

import { useState, useRef, useEffect } from 'react';
import {
  Search, ArrowRight, ChevronRight, ChevronLeft,
  Star,
  Sparkles, Trophy, Mail, TrendingUp,
  Briefcase, Palette, Code, BarChart3,
  Rocket, PenLine, MessageSquarePlus
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LogoWithFallback from '@/components/LogoWithFallback';

import { useRouter } from 'next/navigation';
import { useToolsData } from '@/hooks/useToolsData';
import { trpc } from '@/lib/trpc/client';

// ─── Static data ───────────────────────────────────────────────────────────
const CURATED_COLLECTIONS = [
  {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/collection-ai-tools-GzgTBFqygE6xZ7HMxbuap3.webp',
    title: 'Best AI Tools in 2026',
    description: 'The most powerful AI tools for writing, coding, design, and automation.',
    stackCount: 24,
    href: '/c/ai-productivity-tools',
  },
  {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/collection-developer-tools-9oktgCpHNWk6DZ4w6B47PS.webp',
    title: 'Best Developer Tools',
    description: 'IDEs, CI/CD, APIs, and platforms that help developers ship faster.',
    stackCount: 18,
    href: '/c/developer-tools-tools',
  },
  {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/collection-marketing-tools-ZXLo9gmgJFe2bBGMeJBP7e.webp',
    title: 'Best Marketing Tools',
    description: 'SEO, analytics, email, and growth tools to scale your marketing.',
    stackCount: 15,
    href: '/c/marketing-tools',
  },
  {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/collection-design-tools-3fwfuFVPWJ8JExpcRvt6cM.webp',
    title: 'Best Design Tools',
    description: 'UI/UX, prototyping, and creative tools for designers and teams.',
    stackCount: 12,
    href: '/c/design-tools',
  },
  {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/collection-productivity-tools-fgHhSzDrpyLNDDfBhVEgiZ.webp',
    title: 'Best Productivity Tools',
    description: 'Task management, note-taking, and workflow tools to get more done.',
    stackCount: 20,
    href: '/c/ai-productivity-tools',
  },
  {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/collection-startup-tools-g8BstAFcNsFs9uz5ZWwzUH.webp',
    title: 'Best Tools for Startups',
    description: 'Essential tools every startup needs to launch, grow, and scale.',
    stackCount: 16,
    href: '/categories',
  },
  {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/collection-sales-tools-BqVZd9K7oYKvfbZz3RgZFR.webp',
    title: 'Best Sales & CRM Tools',
    description: 'CRM, outreach, and pipeline tools to close more deals.',
    stackCount: 10,
    href: '/c/crm-tools',
  },
  {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/collection-analytics-tools-GadZ2L5oYgDBXBATfMAX5p.webp',
    title: 'Best Analytics Tools',
    description: 'Data analytics, dashboards, and BI tools for data-driven decisions.',
    stackCount: 11,
    href: '/c/ai-analytics-tools',
  },
];

const SIDEBAR_CATEGORIES = [
  { name: 'AI Productivity', icon: Briefcase, desc: 'Automate workflows and boost output' },
  { name: 'Design', icon: Palette, desc: 'Creative and visual design tools' },
  { name: 'Developer Tools', icon: Code, desc: 'Build and ship software faster' },
  { name: 'Marketing', icon: BarChart3, desc: 'Grow your audience and revenue' },
];

const CATEGORY_COLORS: Record<string, { dot: string; text: string }> = {
  'AI Productivity': { dot: '#D97706', text: '#92400E' },
  'AI Writing': { dot: '#D97706', text: '#92400E' },
  'AI Image': { dot: '#EF4444', text: '#DC2626' },
  'AI Video': { dot: '#8B5CF6', text: '#7C3AED' },
  'AI Audio': { dot: '#EC4899', text: '#DB2777' },
  'AI Code': { dot: '#0C1830', text: '#1E3A5F' },
  'AI Analytics': { dot: '#16A34A', text: '#15803D' },
  'Design': { dot: '#EF4444', text: '#DC2626' },
  'Marketing': { dot: '#D97706', text: '#92400E' },
  'Developer Tools': { dot: '#0C1830', text: '#1E3A5F' },
  'Project Management': { dot: '#D97706', text: '#92400E' },
  'Customer Support': { dot: '#16A34A', text: '#15803D' },
  'CRM': { dot: '#16A34A', text: '#15803D' },
  'Sales': { dot: '#D97706', text: '#92400E' },
  'HR & Recruiting': { dot: '#8B5CF6', text: '#7C3AED' },
  'Finance': { dot: '#16A34A', text: '#15803D' },
  'Security': { dot: '#EF4444', text: '#DC2626' },
  'E-commerce': { dot: '#D97706', text: '#92400E' },
  'Education': { dot: '#8B5CF6', text: '#7C3AED' },
};

function getCatColor(cat: string) {
  return CATEGORY_COLORS[cat] || { dot: '#94A3B8', text: '#475569' };
}

// ─── Shared card shadow ───
const cardShadow = 'rgba(36, 65, 122, 0.08) 0px 0px 2px 0px, rgba(36, 65, 122, 0.08) 0px 2px 6px 0px';

// ─── Product Card Component (used for both Spotlight and Latest) ───
function ProductCard({
  tool,
  variant,
}: {
  tool: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    logo_url: string;
    website_url: string;
    review_count?: number;
    upvote_count?: number;
    isSponsored?: boolean;
  };
  variant: 'featured' | 'latest';
}) {
  const catColor = getCatColor(tool.category);
  const isFeatured = variant === 'featured';
  const isSponsored = tool.isSponsored ?? false;

  return (
    <div
      className="p-4 lg:p-[28px_40px]"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '12px 24px',
        alignItems: 'center',
        background: isFeatured ? '#FFFBEB' : '#FFFFFF',
        borderRadius: '18px',
        border: `1px solid ${isFeatured ? '#FBBF24' : '#ECF2FF'}`,
        boxShadow: cardShadow,
        transition: 'border-color 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        if (!isFeatured) (e.currentTarget as HTMLDivElement).style.borderColor = '#D6E2FF';
      }}
      onMouseLeave={e => {
        if (!isFeatured) (e.currentTarget as HTMLDivElement).style.borderColor = '#ECF2FF';
      }}
    >
      {/* Left: logo + content — clickable link to tool page */}
      <Link href={`/tools/${tool.slug}`} className="flex items-center gap-3 lg:gap-5 no-underline" style={{ minWidth: 0 }}>
        {/* Logo — 56x56 on mobile, 80x80 on desktop */}
        <div
          className="shrink-0 rounded-xl lg:rounded-2xl overflow-hidden flex items-center justify-center w-14 h-14 lg:w-20 lg:h-20"
          style={{ background: '#ECF2FF' }}
        >
          <LogoWithFallback
            src={tool.logo_url}
            alt={tool.name}
            size={56}
            className="rounded-xl object-contain w-10 h-10 lg:w-14 lg:h-14"
          />
        </div>

        {/* Text content */}
        <div style={{ minWidth: 0 }}>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] lg:text-[18px]" style={{ fontWeight: 700, color: '#0C1830', margin: 0 }}>
              {tool.name}
            </h3>
            {isSponsored && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#D97706',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  flexShrink: 0,
                  lineHeight: '14px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                }}
              >
                Sponsored
              </span>
            )}
          </div>
          <p className="line-clamp-1 text-[13px] lg:text-[14px]" style={{ color: '#475569', fontWeight: 400, margin: '0 0 6px', lineHeight: '20px' }}>
            {tool.description}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: catColor.dot }} />
            <span className="text-[12px] lg:text-[14px]" style={{ fontWeight: 500, color: catColor.text }}>{tool.category}</span>
          </div>
        </div>
      </Link>

      {/* Right: Comment + Laud buttons */}
      <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
        {/* Comment button — exact PH: 48x48 rounded-xl, 2px border, speech bubble SVG 14x14, count 14px/600 */}
        <Link
          href={`/tools/${tool.slug}#reviews`}
          style={{ textDecoration: 'none' }}
        >
          <div
            className="flex flex-col items-center justify-center w-10 h-10 lg:w-12 lg:h-12"
            style={{
              borderRadius: '12px',
              border: '2px solid #E2E8F0',
              background: '#FFFFFF',
              gap: '3px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#D97706';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 14 14">
              <path
                stroke="#334155"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12.25 6.708a4.958 4.958 0 0 1-6.74 4.629 2 2 0 0 0-.192-.068.5.5 0 0 0-.11-.014 1.4 1.4 0 0 0-.176.012l-2.987.309c-.285.03-.427.044-.511-.007a.3.3 0 0 1-.137-.204c-.015-.097.053-.223.19-.475l.953-1.766c.079-.146.118-.218.136-.288a.5.5 0 0 0 .016-.19c-.006-.072-.037-.166-.1-.353a4.958 4.958 0 1 1 9.658-1.585"
              />
            </svg>
            <p className="text-[12px] lg:text-[14px]" style={{ fontWeight: 600, lineHeight: 1, color: '#334155', margin: 0 }}>
              {tool.review_count ?? 0}
            </p>
          </div>
        </Link>

        {/* Laud button — PH-style: rounded triangle SVG */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toast.info('Sign in to Laud this stack');
          }}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <div
            className="flex flex-col items-center justify-center w-10 h-10 lg:w-12 lg:h-12"
            style={{
              borderRadius: '12px',
              border: '2px solid #E2E8F0',
              background: '#FFFFFF',
              gap: '3px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#D97706';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 16 16">
              <path
                fill="#FFFFFF"
                stroke="#334155"
                strokeWidth="1.5"
                d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z"
              />
            </svg>
            <p className="text-[12px] lg:text-[14px]" style={{ fontWeight: 600, lineHeight: 1, color: '#334155', margin: 0 }}>
              {tool.upvote_count ?? 0}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Home() {
  const { tools: allTools, leaderboard, loading: toolsLoading } = useToolsData();

  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');


  const router = useRouter();
  const collectionsScrollRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push('/search');
  };

  // Newsletter
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess(data) {
      if (data.alreadySubscribed) toast.info("You're already subscribed!");
      else toast.success("You're subscribed! Check your inbox.");
      setNewsletterEmail('');
    },
    onError(err) { toast.error(err.message || 'Something went wrong.'); },
  });

  const handleNewsletterSubscribe = () => {
    const trimmed = newsletterEmail.trim();
    if (!trimmed || !trimmed.includes('@')) { toast.error('Please enter a valid email.'); return; }
    subscribeMutation.mutate({ email: trimmed, source: 'homepage_sidebar' });
  };

  // Featured stacks — fetched from /api/featured-stacks (real promotions + admin-featured)
  const [featuredStacks, setFeaturedStacks] = useState<Array<{ id: string; name: string; slug: string; description: string; category: string; logo_url: string; website_url: string; review_count?: number; upvote_count?: number; isSponsored?: boolean }>>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    fetch('/api/featured-stacks?context=home&limit=5')
      .then(r => r.json())
      .then(data => {
        setFeaturedStacks(data.stacks ?? []);
        setFeaturedLoading(false);
      })
      .catch(() => {
        // Fallback: use top-ranked from allTools
        setFeaturedStacks(
          [...allTools]
            .sort((a, b) => (b.rank_score ?? 0) - (a.rank_score ?? 0))
            .slice(0, 5)
        );
        setFeaturedLoading(false);
      });
  }, [allTools]);

  // Latest stacks — capped at exactly 15
  const latestStacks = [...allTools]
    .sort((a, b) => new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime());

  const visibleLatest = latestStacks.slice(0, 15);

  const scrollCollections = (dir: 'left' | 'right') => {
    if (collectionsScrollRef.current) {
      collectionsScrollRef.current.scrollBy({ left: dir === 'left' ? -380 : 380, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <Navbar />
      {/* Spacer for fixed double-header navbar: 72px top bar + 56px nav bar = 128px on desktop, 60px on mobile */}
      <div className="h-[60px] lg:h-[128px]" />

      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO — Polished rounded card with 3-column grid
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pt-4 pb-10 lg:pt-8 lg:pb-[120px]">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div
            className="relative overflow-hidden px-5 py-10 lg:px-11 lg:py-[72px]"
            style={{
              background: '#1E3A5F',
              borderRadius: '24px',
            }}
          >
            {/* Polished vertical stripes decoration — Flippa-style */}
            <div className="hidden lg:block">
              {/* Vertical stripes across the background */}
              <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                {/* Left side stripes */}
                <div className="absolute" style={{ left: '5%', top: '0', width: '2px', height: '100%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ left: '8%', top: '0', width: '1px', height: '100%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ left: '12%', top: '0', width: '3px', height: '100%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ left: '16%', top: '0', width: '1px', height: '100%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ left: '20%', top: '0', width: '2px', height: '100%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                
                {/* Center stripes */}
                <div className="absolute" style={{ left: '35%', top: '0', width: '2px', height: '100%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ left: '50%', top: '0', width: '1px', height: '100%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ left: '65%', top: '0', width: '2px', height: '100%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                
                {/* Right side stripes */}
                <div className="absolute" style={{ right: '20%', top: '0', width: '2px', height: '100%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ right: '16%', top: '0', width: '1px', height: '100%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ right: '12%', top: '0', width: '3px', height: '100%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ right: '8%', top: '0', width: '1px', height: '100%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div className="absolute" style={{ right: '5%', top: '0', width: '2px', height: '100%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Centered content — single column, no side cards */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <h1
                className="text-[26px] sm:text-[40px] lg:text-[48px] font-extrabold leading-[1.1] tracking-tight mb-3 lg:mb-5"
                style={{ color: '#FFFFFF', letterSpacing: '-0.02em', textAlign: 'center' }}
              >
                Discover, Review &amp; Launch<br />
                <span style={{ color: '#D97706' }}>SaaS &amp; AI Tools</span>
              </h1>
              <p
                className="text-[14px] sm:text-[16px] leading-relaxed max-w-[520px] mx-auto hidden sm:block"
                style={{ color: '#E2E8F0', textAlign: 'center' }}
              >
                Where founders launch stacks, the community gives lauds, and builders discover the best tools and deals.
              </p>

              {/* Search bar — clean white pill */}
              <div
                className="flex items-center mx-auto mt-5 lg:mt-7"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '96px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 16px rgba(36, 65, 122, 0.1)',
                  padding: '5px 5px 5px 20px',
                  maxWidth: '480px',
                }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: '#94A3B8', marginRight: '10px' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search stacks, tools, categories..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    color: '#1E3A5F',
                    minWidth: 0,
                  }}
                  className="placeholder-slate-400"
                />
                <button
                  onClick={handleSearch}
                  style={{
                    background: '#D97706',
                    color: '#FFFFFF',
                    borderRadius: '96px',
                    fontSize: '13px',
                    fontWeight: 700,
                    padding: '11px 24px',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#B45309';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(81, 120, 255, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#B45309';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Search
                </button>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          1b. MOBILE CATEGORY PILLS — Capterra-style horizontal scroll
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="block lg:hidden pb-6 -mt-4">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
          <h3 className="text-[15px] font-bold mb-3" style={{ color: '#0C1830' }}>Explore categories</h3>
          <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {[
              { name: 'AI Productivity', icon: Briefcase, href: '/c/ai-productivity-tools' },
              { name: 'Developer Tools', icon: Code, href: '/c/developer-tools-tools' },
              { name: 'Marketing', icon: BarChart3, href: '/c/marketing-tools' },
              { name: 'Design', icon: Palette, href: '/c/design-tools' },
              { name: 'CRM', icon: Star, href: '/c/crm-tools' },
              { name: 'Analytics', icon: TrendingUp, href: '/c/ai-analytics-tools' },
            ].map(cat => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center gap-2 shrink-0"
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  whiteSpace: 'nowrap',
                }}
              >
                <cat.icon className="w-4 h-4" style={{ color: '#D97706' }} />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2 + 3. SPOTLIGHT + LATEST STACKS with STICKY SIDEBAR
          Template: Featured + Latest share the same section with a sticky sidebar
          Main column + 312px sidebar, sidebar sticky top 24px
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pb-12 lg:pb-[120px]">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 312px',
              gap: '28px',
            }}
            className="max-lg:!grid-cols-1"
          >
            {/* ── Main column: Spotlight + Latest ── */}
            <div>
              {/* Featured Stacks (real promoted/admin-featured stacks) */}
              <h2 className="text-[22px] lg:text-[30px]" style={{ fontWeight: 700, color: '#0C1830', marginBottom: '16px' }}>
                Featured stacks
              </h2>
              <div className="flex flex-col" style={{ gap: '12px', marginBottom: '40px' }}>
                {featuredLoading ? (
                  // Skeleton loading state
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse p-4 lg:p-[28px_40px]"
                      style={{
                        borderRadius: '18px',
                        border: '1px solid #FBBF24',
                        background: '#FFFBEB',
                        boxShadow: cardShadow,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#FDE68A', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ width: '60%', height: '18px', borderRadius: '6px', background: '#FDE68A', marginBottom: '8px' }} />
                          <div style={{ width: '90%', height: '14px', borderRadius: '4px', background: '#FEF3C7' }} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  featuredStacks.map((tool) => (
                    <ProductCard key={tool.id} tool={tool} variant="featured" />
                  ))
                )}
              </div>

              {/* Latest Stacks */}
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <h2 className="text-[22px] lg:text-[30px]" style={{ fontWeight: 700, color: '#0C1830', margin: 0 }}>
                  Latest stacks
                </h2>
                <Link
                  href="/categories"
                  className="flex items-center gap-1.5 hidden sm:flex"
                  style={{
                    background: 'transparent',
                    color: '#0C1830',
                    border: '1px solid #0C1830',
                    borderRadius: '48px',
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '14px 20px',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0C1830'; e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0C1830'; }}
                >
                  Browse all stacks
                </Link>
              </div>

              <div className="flex flex-col" style={{ gap: '12px' }}>
                {visibleLatest.map((tool) => (
                  <ProductCard key={tool.id} tool={tool} variant="latest" />
                ))}
              </div>

              {/* View all Stacks button */}
              <div className="flex justify-center" style={{ marginTop: '28px' }}>
                <Link
                  href="/categories"
                  className="flex items-center gap-2"
                  style={{
                    background: '#D97706',
                    color: '#FFFFFF',
                    border: '1px solid #D97706',
                    borderRadius: '96px',
                    fontSize: '13px',
                    fontWeight: 700,
                    padding: '14px 28px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#B45309';
                    e.currentTarget.style.borderColor = '#D97706';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(81, 120, 255, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#B45309';
                    e.currentTarget.style.borderColor = '#D97706';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  View all Stacks <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* ── Sidebar: sticky on desktop, inline on mobile ── */}
            <div className="block">
              <div className="lg:sticky lg:top-[152px]">

                {/* ═══════════════════════════════════════════
                    1. TOP RATED — Polished Leaderboard Card
                    ═══════════════════════════════════════════ */}
                <div
                  style={{
                    borderRadius: '18px',
                    border: '1.5px solid #D6E2FF',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    background: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(36, 65, 122, 0.10), 0 0 0 1px rgba(81, 120, 255, 0.04)',
                  }}
                >
                  {/* Header with icon */}
                  <div
                    className="flex items-center justify-between"
                    style={{
                      padding: '16px 18px',
                      borderBottom: '1.5px solid #D6E2FF',
                      background: '#ECF2FF',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
                        }}
                      >
                        <Trophy className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0C1830', margin: 0, letterSpacing: '-0.01em' }}>
                        Top Rated
                      </h3>
                    </div>
                    <Link
                      href="/top-rated"
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0C1830',
                        textDecoration: 'none',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      View all
                    </Link>
                  </div>

                  {/* Leaderboard entries */}
                  {(leaderboard.length > 0 ? leaderboard.slice(0, 5) : allTools.slice(0, 5)).map((entry, i) => {
                    const item = 'tool_id' in entry
                      ? entry
                      : { tool_id: entry.id, name: entry.name, slug: entry.slug, logo_url: entry.logo_url, average_rating: entry.average_rating ?? 0, review_count: entry.review_count ?? 0 };
                    const rank = i + 1;
                    const isLast = i === Math.min((leaderboard.length > 0 ? leaderboard.length : allTools.length), 5) - 1;

                    // Medal colors for top 3
                    const medalColors: Record<number, { bg: string; text: string; border: string }> = {
                      1: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
                      2: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
                      3: { bg: '#FFFBEB', text: '#92400E', border: '#FFFBEB' },
                    };
                    const medal = medalColors[rank];

                    return (
                      <Link
                        key={item.tool_id}
                        href={`/tools/${item.slug}`}
                        className="flex items-center gap-3"
                        style={{
                          padding: '12px 18px',
                          textDecoration: 'none',
                          borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F5F8FF')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Rank badge */}
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '7px',
                            background: medal ? medal.bg : '#F8FAFC',
                            color: medal ? medal.text : '#64748B',
                            border: `1px solid ${medal ? medal.border : '#E2E8F0'}`,
                            fontSize: '11px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            lineHeight: 1,
                          }}
                        >
                          {rank}
                        </span>

                        {/* Logo */}
                        <div
                          className="shrink-0 rounded-[10px] overflow-hidden flex items-center justify-center"
                          style={{
                            width: '34px',
                            height: '34px',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <LogoWithFallback
                            src={item.logo_url}
                            alt={item.name}
                            size={24}
                            className="rounded-lg object-contain"
                          />
                        </div>

                        {/* Name + rating row */}
                        <div className="flex-1 min-w-0">
                          <p className="line-clamp-1" style={{ fontSize: '13px', fontWeight: 600, color: '#0C1830', margin: 0, lineHeight: '18px' }}>
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1" style={{ marginTop: '3px' }}>
                            <div className="flex items-center">
                              {[1,2,3,4,5].map(s => (
                                <Star
                                  key={s}
                                  className="w-2.5 h-2.5"
                                  style={{
                                    color: s <= Math.round(item.average_rating) ? '#FBBF24' : '#E2E8F0',
                                    fill: s <= Math.round(item.average_rating) ? '#FBBF24' : '#E2E8F0',
                                  }}
                                />
                              ))}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginLeft: '2px' }}>
                              {item.average_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Review count pill */}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#64748B',
                            background: '#F1F5F9',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            flexShrink: 0,
                            lineHeight: '16px',
                          }}
                        >
                          {item.review_count}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* ═══════════════════════════════════════════
                    2. LAUNCH CTA — Dark Premium Card (hidden on mobile)
                    ═══════════════════════════════════════════ */}
                <div
                  className="hidden lg:block"
                  style={{
                    borderRadius: '18px',
                    padding: '32px 24px',
                    marginBottom: '20px',
                    background: '#1E3A5F',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative glow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-40px',
                      right: '-40px',
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '-20px',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Content */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Icon row */}
                    <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: '#D97706',
                        }}
                      >
                        <Rocket className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#FBBF24', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                          For Founders
                        </p>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px', lineHeight: '28px', letterSpacing: '-0.01em' }}>
                      Launch your stack
                    </h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '20px', margin: '0 0 24px' }}>
                      Get discovered by thousands of builders. Collect verified reviews and climb the rankings.
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" style={{ color: '#FBBF24', fill: '#FBBF24' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Free to list</span>
                      </div>
                      <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }} />
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: '#16A34A' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Verified in 24h</span>
                      </div>
                    </div>

                    <Link
                      href="/launchpad"
                      className="flex items-center justify-center gap-2"
                      style={{
                        width: '100%',
                        background: '#D97706',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 700,
                        padding: '13px 24px',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        border: 'none',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#D97706';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(217, 119, 6, 0.35)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#D97706';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Launch now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>



                {/* ═══════════════════════════════════════════
                    3. NEWSLETTER — Clean Subscription Card
                    ═══════════════════════════════════════════ */}
                <div
                  style={{
                    borderRadius: '18px',
                    border: '1.5px solid #D6E2FF',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(36, 65, 122, 0.10), 0 0 0 1px rgba(81, 120, 255, 0.04)',
                  }}
                >
                  {/* Header band */}
                  <div
                    style={{
                      padding: '16px 18px',
                      borderBottom: '1.5px solid #D6E2FF',
                      background: '#ECF2FF',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: '#0C1830',
                        }}
                      >
                        <Mail className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0C1830', margin: 0, letterSpacing: '-0.01em' }}>
                        Weekly Picks
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '18px' }}>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '20px', margin: '0 0 16px' }}>
                      The best new SaaS and AI stacks, handpicked by our editors. Every Thursday.
                    </p>

                    {/* Email input — full width stacked */}
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={e => setNewsletterEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleNewsletterSubscribe()}
                        placeholder="you@company.com"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #E2E8F0',
                          fontSize: '13px',
                          color: '#0C1830',
                          background: '#FFFFFF',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          boxSizing: 'border-box' as const,
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#D97706')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                        disabled={subscribeMutation.isPending}
                      />
                      <button
                        onClick={handleNewsletterSubscribe}
                        disabled={subscribeMutation.isPending}
                        className="flex items-center justify-center gap-2"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          background: '#0C1830',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#1E293B';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#0C1830';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
                        {!subscribeMutation.isPending && <Sparkles className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Trust line */}
                    <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '12px', margin: '12px 0 0', lineHeight: '16px', textAlign: 'center' as const }}>
                      Join our weekly digest. Unsubscribe anytime.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. DUAL CTA CARDS — Polished modern design
          Light: Launch your Stack | Dark: Write a Review
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pb-12 lg:pb-[120px]">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-7"
          >
            {/* Launch CTA — Light card */}
            <div
              className="relative overflow-hidden group p-7 lg:p-12"
              style={{
                background: '#ECF2FF',
                borderRadius: '24px',
                border: '1px solid #D6E2FF',
                transition: 'box-shadow 0.3s, transform 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(81, 120, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Decorative elements */}
              <div className="absolute" style={{ top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: '#D97706', opacity: 0.05 }} />
              <div className="absolute" style={{ bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: '#D97706', opacity: 0.04 }} />

              <div className="relative z-10">
                {/* Label */}
                <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: '#D97706',
                    }}
                  >
                    <Rocket className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0C1830', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                    For Founders
                  </span>
                </div>

                <h3 className="text-[20px] lg:text-[26px]" style={{ fontWeight: 800, color: '#0C1830', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: '1.25' }}>
                  Launch your Stack
                </h3>
                <p className="text-[13px] lg:text-[15px]" style={{ color: '#475569', lineHeight: '22px', margin: '0 0 20px', maxWidth: '380px' }}>
                  Get your product discovered by thousands of builders and buyers. Collect verified reviews and climb the rankings.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4" style={{ marginBottom: '28px' }}>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" style={{ color: '#FBBF24', fill: '#FBBF24' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Free to list</span>
                  </div>
                  <div style={{ width: '1px', height: '16px', background: '#CBD5E1' }} />
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: '#16A34A' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Verified in 24h</span>
                  </div>
                </div>

                <Link
                  href="/launchpad"
                  className="inline-flex items-center gap-2"
                  style={{
                    background: '#0C1830',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '14px 28px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#1E293B';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(12, 24, 48, 0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#0C1830';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Launch now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Review CTA — Navy card */}
            <div
              className="relative overflow-hidden group p-7 lg:p-12"
              style={{
                background: '#1E3A5F',
                borderRadius: '24px',
                border: '1px solid rgba(30, 58, 95, 0.3)',
                transition: 'box-shadow 0.3s, transform 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(30, 58, 95, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Decorative elements */}
              <div className="absolute" style={{ top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: '#D97706', opacity: 0.1 }} />
              <div className="absolute" style={{ bottom: '-60px', left: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(253,181,42,0.08)', pointerEvents: 'none' }} />

              <div className="relative z-10">
                {/* Label */}
                <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: '#D97706',
                    }}
                  >
                    <PenLine className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#FBBF24', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                    For Users
                  </span>
                </div>
                <h3 className="text-[20px] lg:text-[26px]" style={{ fontWeight: 800, color: '#FFFFFF', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: '1.25' }}>
                  Write a Review
                </h3>
                <p className="text-[13px] lg:text-[15px]" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '22px', margin: '0 0 20px', maxWidth: '380px' }}>
                  Share your honest experience with the stacks you use. Help the community make better decisions and earn reviewer badges.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4" style={{ marginBottom: '28px' }}>
                  <div className="flex items-center gap-1.5">
                    <MessageSquarePlus className="w-3.5 h-3.5" style={{ color: '#D97706' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Write reviews</span>
                  </div>
                  <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" style={{ color: '#FBBF24', fill: '#FBBF24' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Earn badges</span>
                  </div>
                </div>

                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2"
                  style={{
                    background: '#D97706',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '14px 28px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    border: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#B45309';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(217, 119, 6, 0.35)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#B45309';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Write a review <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. COLLECTIONS CURATED BY OUR TEAM — Horizontal scroll
          8 cards with custom images, side-scroll effect
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 lg:py-[120px]" style={{ background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '40px',
              gap: '16px',
              flexWrap: 'wrap' as const,
            }}
          >
            <div>
              <h2 className="text-[22px] lg:text-[30px]" style={{ fontWeight: 800, color: '#0C1830', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Collections curated by our team
              </h2>
              <p className="text-[13px] lg:text-[15px] hidden sm:block" style={{ color: '#475569', lineHeight: '24px', margin: 0 }}>
                Hand-picked Best SaaS Tools lists to help you find the right stack for every use case.
              </p>
            </div>

            {/* Scroll controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCollections('left')}
                className="flex items-center justify-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0C1830'; e.currentTarget.style.borderColor = '#0C1830'; (e.currentTarget.firstChild as SVGElement).style.color = '#FFFFFF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; (e.currentTarget.firstChild as SVGElement).style.color = '#0C1830'; }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: '#0C1830', transition: 'color 0.15s' }} />
              </button>
              <button
                onClick={() => scrollCollections('right')}
                className="flex items-center justify-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#0C1830',
                  border: '1px solid #0C1830',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1E293B'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0C1830'; }}
              >
                <ChevronRight className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              </button>
            </div>
          </div>

          {/* Scrollable cards row */}
          <div className="relative">
            <div
              ref={collectionsScrollRef}
              className="flex gap-6 overflow-x-auto pb-4"
              style={{ scrollbarWidth: 'none', scrollBehavior: 'smooth' }}
            >
              {CURATED_COLLECTIONS.map((col, i) => (
                <Link
                  key={i}
                  href={col.href}
                  className="group shrink-0 w-[260px] lg:w-[320px]"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #ECF2FF',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    transition: 'box-shadow 0.25s, transform 0.25s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(36, 65, 122, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  <div
                    className="h-[150px] lg:h-[200px]"
                    style={{
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={col.image}
                      alt={col.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s',
                      }}
                      className="group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ padding: '22px 24px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0C1830', margin: '0 0 6px', lineHeight: '24px' }}>
                      {col.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '20px', margin: '0 0 16px' }}>
                      {col.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                        {col.stackCount} stacks
                      </span>
                      <span className="inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ fontSize: '13px', fontWeight: 600, color: '#0C1830' }}>
                        Browse <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

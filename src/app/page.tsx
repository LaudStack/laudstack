
'use client';

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
    href: '/c/developer-tools',
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

// ─── Tool card component ────────────────────────────────────────────────────
function ToolCard({ tool, isSponsored = false }: { tool: any; isSponsored?: boolean }) {
  const categoryColors: { [key: string]: { dot: string; text: string; bg: string } } = {
    'AI & Automation': { dot: '#D97706', text: '#B45309', bg: '#FFFBEB' },
    'Developer Tools': { dot: '#3B82F6', text: '#1E40AF', bg: '#EFF6FF' },
    'Design & Creative': { dot: '#EC4899', text: '#BE185D', bg: '#FCE7F3' },
    'Marketing & Analytics': { dot: '#10B981', text: '#065F46', bg: '#ECFDF5' },
    'Productivity': { dot: '#8B5CF6', text: '#5B21B6', bg: '#F5F3FF' },
    'Sales & CRM': { dot: '#F59E0B', text: '#92400E', bg: '#FFFBEB' },
    'Finance & Accounting': { dot: '#06B6D4', text: '#164E63', bg: '#ECFDFD' },
    'HR & People': { dot: '#EF4444', text: '#7F1D1D', bg: '#FEE2E2' },
  };

  const catColor = categoryColors[tool.category] || { dot: '#6B7280', text: '#374151', bg: '#F3F4F6' };

  return (
    <Link href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
      <div
        className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg transition-all hover:bg-slate-50"
        style={{ cursor: 'pointer' }}
      >
        {/* Left: Logo */}
        <div className="shrink-0">
          <LogoWithFallback
            src={tool.logo_url}
            alt={tool.name}
            size={40}
            className="rounded-lg"
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
      </div>

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
    </Link>
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
            {/* Premium sleek decorative elements */}
            <div className="hidden lg:block">
              {/* Soft gradient glow accents — premium amber/gold tint */}
              <div className="absolute" style={{ top: '-5%', left: '8%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,183,11,0.18) 0%, rgba(217,183,11,0.06) 45%, transparent 100%)', filter: 'blur(45px)', pointerEvents: 'none' }} />
              <div className="absolute" style={{ bottom: '-12%', right: '10%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,183,11,0.14) 0%, rgba(217,183,11,0.04) 55%, transparent 100%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
              
              {/* Geometric accent lines — premium thin gradient strokes */}
              <div className="absolute" style={{ top: '12%', left: '6%', width: '140px', height: '1.5px', background: 'linear-gradient(90deg, rgba(217,183,11,0.2) 0%, rgba(217,183,11,0.05) 100%)', pointerEvents: 'none' }} />
              <div className="absolute" style={{ top: '38%', right: '10%', width: '120px', height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(217,183,11,0.14) 100%)', pointerEvents: 'none' }} />
              <div className="absolute" style={{ bottom: '28%', left: '12%', width: '160px', height: '1.5px', background: 'linear-gradient(90deg, rgba(217,183,11,0.16) 0%, rgba(217,183,11,0.02) 100%)', pointerEvents: 'none' }} />
              
              {/* Subtle circular accents with soft borders and inner glow */}
              <div className="absolute" style={{ top: '18%', right: '18%', width: '70px', height: '70px', borderRadius: '50%', border: '1.5px solid rgba(217,183,11,0.15)', background: 'rgba(217,183,11,0.04)', boxShadow: 'inset 0 0 25px rgba(217,183,11,0.12), 0 0 30px rgba(217,183,11,0.08)', pointerEvents: 'none' }} />
              <div className="absolute" style={{ bottom: '32%', left: '8%', width: '50px', height: '50px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', boxShadow: 'inset 0 0 15px rgba(217,183,11,0.06)', pointerEvents: 'none' }} />
              <div className="absolute" style={{ top: '55%', right: '3%', width: '95px', height: '95px', borderRadius: '50%', border: '1.5px solid rgba(217,183,11,0.12)', background: 'rgba(217,183,11,0.05)', boxShadow: 'inset 0 0 20px rgba(217,183,11,0.1)', pointerEvents: 'none' }} />
              
              {/* Premium decorative swirl stripes — flowing curves */}
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }} preserveAspectRatio="none" viewBox="0 0 1200 400">
                <defs>
                  <linearGradient id="swirl1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(217,183,11,0.18)" />
                    <stop offset="50%" stopColor="rgba(217,183,11,0.06)" />
                    <stop offset="100%" stopColor="rgba(217,183,11,0.12)" />
                  </linearGradient>
                  <linearGradient id="swirl2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.03)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                  </linearGradient>
                  <linearGradient id="swirl3" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(217,183,11,0.14)" />
                    <stop offset="45%" stopColor="rgba(217,183,11,0.03)" />
                    <stop offset="100%" stopColor="rgba(217,183,11,0.12)" />
                  </linearGradient>
                </defs>
                {/* Left swirl curves */}
                <path d="M 120 0 Q 100 100, 120 200 T 120 400" stroke="url(#swirl1)" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 310 0 Q 290 120, 310 240 T 310 400" stroke="url(#swirl2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Center swirl curves */}
                <path d="M 600 0 Q 580 110, 600 220 T 600 400" stroke="url(#swirl3)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 620 0 Q 640 100, 620 200 T 620 400" stroke="url(#swirl1)" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Right swirl curves */}
                <path d="M 890 0 Q 910 120, 890 240 T 890 400" stroke="url(#swirl2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M 1080 0 Q 1100 100, 1080 200 T 1080 400" stroke="url(#swirl1)" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Additional flowing accent swirls */}
                <path d="M 200 0 Q 220 150, 200 300 T 200 400" stroke="url(#swirl2)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
                <path d="M 1000 0 Q 980 140, 1000 280 T 1000 400" stroke="url(#swirl2)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
              </svg>
              
              {/* Diagonal accent elements for depth and sophistication */}
              <div className="absolute" style={{ top: '8%', left: '4%', width: '170px', height: '1.5px', background: 'linear-gradient(45deg, rgba(217,183,11,0.12) 0%, transparent 100%)', transform: 'rotate(-18deg)', pointerEvents: 'none' }} />
              <div className="absolute" style={{ bottom: '18%', right: '6%', width: '140px', height: '1px', background: 'linear-gradient(45deg, transparent 0%, rgba(217,183,11,0.1) 100%)', transform: 'rotate(22deg)', pointerEvents: 'none' }} />
              
              {/* Premium accent dots with glow */}
              <div className="absolute" style={{ top: '6%', left: '5%', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(217,183,11,0.3)', boxShadow: '0 0 16px rgba(217,183,11,0.35)', pointerEvents: 'none' }} />
              <div className="absolute" style={{ bottom: '10%', right: '9%', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', boxShadow: '0 0 10px rgba(217,183,11,0.15)', pointerEvents: 'none' }} />
              <div className="absolute" style={{ top: '45%', right: '15%', width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(217,183,11,0.25)', boxShadow: '0 0 8px rgba(217,183,11,0.2)', pointerEvents: 'none' }} />
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
                    e.currentTarget.style.background = '#D97706';
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
          2. FEATURED & LATEST — Two-column grid
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', paddingBottom: '120px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 28px', maxWidth: '100%' }}>
            {/* FEATURED — Left column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0C1830', margin: 0 }}>Featured</h2>
                <Link href="/editors-picks" style={{ fontSize: '12px', fontWeight: 500, color: '#D97706', textDecoration: 'none' }}>
                  View all →
                </Link>
              </div>

              {/* Featured stacks — vertical stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {featuredLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Loading...</div>
                ) : featuredStacks.length > 0 ? (
                  featuredStacks.map(tool => (
                    <div
                      key={tool.id}
                      style={{
                        padding: '28px 40px',
                        borderRadius: '18px',
                        background: '#FFFBEB',
                        border: '1px solid #FBBF24',
                        boxShadow: 'rgba(36, 65, 122, 0.08) 0px 0px 2px, rgba(36, 65, 122, 0.08) 0px 2px 6px',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '24px',
                        alignItems: 'center',
                      }}
                    >
                      <ToolCard tool={tool} isSponsored={tool.isSponsored} />
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No featured stacks</div>
                )}
              </div>
            </div>

            {/* LATEST — Right column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0C1830', margin: 0 }}>Latest Launches</h2>
                <Link href="/launches" style={{ fontSize: '12px', fontWeight: 500, color: '#D97706', textDecoration: 'none' }}>
                  View all →
                </Link>
              </div>

              {/* Latest stacks — vertical stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {toolsLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Loading...</div>
                ) : visibleLatest.length > 0 ? (
                  visibleLatest.slice(0, 5).map(tool => (
                    <div
                      key={tool.id}
                      style={{
                        padding: '28px 40px',
                        borderRadius: '18px',
                        background: '#FFFFFF',
                        border: '1px solid #ECF2FF',
                        boxShadow: 'rgba(36, 65, 122, 0.08) 0px 0px 2px, rgba(36, 65, 122, 0.08) 0px 2px 6px',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '24px',
                        alignItems: 'center',
                      }}
                    >
                      <ToolCard tool={tool} />
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No recent launches</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. COLLECTIONS — 3-column carousel
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', paddingBottom: '120px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0C1830', margin: 0 }}>Collections curated by our team</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => scrollCollections('left')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#D97706';
                  e.currentTarget.style.background = '#FFFBEB';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <ChevronLeft style={{ width: '20px', height: '20px', color: '#0C1830' }} />
              </button>
              <button
                onClick={() => scrollCollections('right')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#D97706';
                  e.currentTarget.style.background = '#FFFBEB';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <ChevronRight style={{ width: '20px', height: '20px', color: '#0C1830' }} />
              </button>
            </div>
          </div>

          {/* Collections carousel */}
          <div
            ref={collectionsScrollRef}
            style={{
              display: 'flex',
              gap: '28px',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="no-scrollbar"
          >
            {CURATED_COLLECTIONS.map(collection => (
              <Link key={collection.href} href={collection.href} style={{ textDecoration: 'none', minWidth: '387px' }}>
                <div
                  style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    height: '421px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: 'rgba(36, 65, 122, 0.08) 0px 0px 2px, rgba(36, 65, 122, 0.08) 0px 2px 6px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'rgba(36, 65, 122, 0.15) 0px 8px 16px';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'rgba(36, 65, 122, 0.08) 0px 0px 2px, rgba(36, 65, 122, 0.08) 0px 2px 6px';
                  }}
                >
                  <img src={collection.image} alt={collection.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0C1830', margin: '0 0 8px', lineHeight: 1.3 }}>
                      {collection.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px', lineHeight: 1.5 }}>
                      {collection.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706' }}>
                        {collection.stackCount} stacks
                      </span>
                      <ArrowRight style={{ width: '16px', height: '16px', color: '#D97706' }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/**
 * ToolDetail.tsx — LaudStack Tool Detail Page
 * Design: Clean white, enterprise-grade, G2-inspired
 * Sections:
 *   1. Breadcrumb + Back
 *   2. Tool Hero Header (logo, name, tagline, badges, CTA, upvote)
 *   3. Overview Tab / Description
 *   4. Ratings Summary + Star Breakdown
 *   5. Reviews List (with verified badge, pros/cons, founder reply)
 *   6. Write a Review CTA
 *   7. Related Tools
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Star, ExternalLink, ChevronUp, ShieldCheck, ArrowLeft,
  ThumbsUp, MessageSquare, ChevronRight, Flame, Sparkles,
  Globe, Tag, Calendar, Award, CheckCircle2, AlertCircle,
  Quote, Building2, User2, GitCompareArrows, Bookmark
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import WriteReviewModal from '@/components/WriteReviewModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCompare } from '@/contexts/CompareContext';
import { useSavedTools } from '@/hooks/useSavedTools';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { MOCK_TOOLS, MOCK_REVIEWS } from '@/lib/mockData';
import type { Tool, Review } from '@/lib/types';
import { getToolExtras } from '@/lib/toolExtras';

// ─── Helpers ────────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  top_rated:      { label: 'Top Rated',      bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
  featured:       { label: 'Featured',       bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  editors_pick:   { label: "Editor's Pick",  bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  trending:       { label: 'Trending',        bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  new_launch:     { label: 'New Launch',      bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  community_pick: { label: 'Community Pick',  bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  best_value:     { label: 'Best Value',      bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  laudstack_pick: { label: 'LaudStack Pick',  bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  verified:       { label: 'Verified',        bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  pro_founder:    { label: 'Pro Founder',     bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF' },
};

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          style={{
            width: size, height: size,
            fill: i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0',
            color: i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0',
          }}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, width: '40px', textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#F1F5F9', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#F59E0B', borderRadius: '4px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, width: '28px', flexShrink: 0 }}>{count}</span>
    </div>
  );
}

// ─── Expanded mock reviews for tools without reviews ─────────────────────────
function getToolReviews(toolId: string): Review[] {
  const base = MOCK_REVIEWS.filter(r => r.tool_id === toolId);
  if (base.length > 0) return base;

  // Generate plausible reviews for any tool
  const tool = MOCK_TOOLS.find(t => t.id === toolId);
  if (!tool) return [];

  return [
    {
      id: `${toolId}-r1`, tool_id: toolId, user_id: 'u10', rating: 5,
      title: `${tool.name} has become essential to my workflow`,
      body: `I've been using ${tool.name} for about 6 months and it's genuinely transformed how I work. The quality is consistently high and the team ships updates regularly. Highly recommend to anyone in this space.`,
      pros: 'Reliable, well-designed, great support',
      cons: 'Pricing could be more flexible for small teams',
      use_case: 'Daily professional use',
      is_verified_purchase: true, helpful_count: 34,
      created_at: '2026-02-20',
      user: { id: 'u10', name: 'Alex Morgan', role: 'Product Manager', company: 'TechCorp' },
    },
    {
      id: `${toolId}-r2`, tool_id: toolId, user_id: 'u11', rating: 4,
      title: 'Solid product, minor rough edges',
      body: `${tool.name} delivers on its core promise. The main features work well and the onboarding is smooth. A few edge cases could be handled better but overall it's a strong product.`,
      pros: 'Core features are excellent, fast and reliable',
      cons: 'Some advanced features feel incomplete',
      is_verified_purchase: true, helpful_count: 21,
      created_at: '2026-02-10',
      user: { id: 'u11', name: 'Jordan Lee', role: 'Senior Engineer', company: 'BuildFast' },
    },
    {
      id: `${toolId}-r3`, tool_id: toolId, user_id: 'u12', rating: 5,
      title: 'Best in class for this category',
      body: `We evaluated 5 alternatives before choosing ${tool.name}. It came out ahead on every metric that mattered to us — quality, reliability, and support responsiveness.`,
      pros: 'Best-in-class quality, excellent documentation',
      cons: 'Learning curve for advanced features',
      is_verified_purchase: true, helpful_count: 18,
      created_at: '2026-01-28',
      user: { id: 'u12', name: 'Sam Patel', role: 'CTO', company: 'Launchly' },
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { recordVisit } = useRecentlyViewed();
  const { toggle: compareToggle, isSelected: isComparing, canAdd: canCompare } = useCompare();
  const { isSaved, toggle: toggleSave } = useSavedTools();

  // Record this tool as visited whenever the slug changes
  useEffect(() => {
    if (slug) recordVisit(slug);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});
  const [reviewOpen, setReviewOpen] = useState(false);

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      navigate(`/signin?return=/tools/${slug}`);
      toast.info('Sign in to write a review');
      return;
    }
    setReviewOpen(true);
  };

  const tool = MOCK_TOOLS.find(t => t.slug === slug);

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '80px 24px' }}>
          <AlertCircle style={{ width: '48px', height: '48px', color: '#94A3B8' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#171717', margin: 0 }}>Tool not found</h1>
          <p style={{ color: '#64748B', margin: 0 }}>The tool you're looking for doesn't exist or has been removed.</p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: '#F59E0B', textDecoration: 'none' }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to homepage
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const reviews = getToolReviews(tool.id);
  const relatedTools = MOCK_TOOLS.filter(t => t.category === tool.category && t.id !== tool.id).slice(0, 4);
  const extras = getToolExtras(tool.slug, tool.name, tool.pricing_model);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  // Rating breakdown (simulated from average)
  const totalReviews = Math.max(reviews.length, tool.review_count);
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => {
    const base = star === Math.round(tool.average_rating) ? 0.45
      : star === Math.round(tool.average_rating) - 1 ? 0.30
      : star === Math.round(tool.average_rating) + 1 ? 0.15
      : 0.05;
    return { star, count: Math.round(totalReviews * base) };
  });

  const handleUpvote = () => {
    if (upvoted) return;
    setUpvoted(true);
    setUpvoteCount(c => c + 1);
    toast.success(`Upvoted ${tool.name}!`);
  };

  const handleHelpful = (reviewId: string) => {
    if (helpfulMap[reviewId]) return;
    setHelpfulMap(m => ({ ...m, [reviewId]: true }));
    toast.success('Marked as helpful');
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <PageHero
        eyebrow={tool.category}
        title={tool.name}
        subtitle={tool.tagline}
        accent="amber"
        layout="split"
        size="sm"
        backLink={{ href: `/tools?category=${encodeURIComponent(tool.category)}`, label: `Back to ${tool.category}` }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {tool.is_verified && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
              <ShieldCheck style={{ width: '11px', height: '11px' }} /> Verified
            </span>
          )}
          {tool.badges.slice(0, 3).map(b => {
            const cfg = BADGE_CONFIG[b];
            if (!cfg) return null;
            return (
              <span key={b} style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.label}
              </span>
            );
          })}
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
            {tool.average_rating.toFixed(1)} ★ &nbsp;({tool.review_count.toLocaleString()} reviews)
          </span>
        </div>
      </PageHero>

      {/* ══ TOOL HERO HEADER ════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '40px 0 36px' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Logo */}
            <div style={{ width: '88px', height: '88px', borderRadius: '20px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 16px rgba(15,23,42,0.08)' }}>
              <img
                src={tool.logo_url}
                alt={tool.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={e => {
                  const t = e.currentTarget;
                  t.style.display = 'none';
                  const p = t.parentElement;
                  if (p) {
                    p.style.background = '#F1F5F9';
                    p.style.display = 'flex';
                    p.style.alignItems = 'center';
                    p.style.justifyContent = 'center';
                    p.innerHTML = `<span style="font-size:28px;font-weight:800;color:#64748B">${tool.name.charAt(0)}</span>`;
                  }
                }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              {/* Badges row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {tool.is_verified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '100px', background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                    <ShieldCheck style={{ width: '10px', height: '10px' }} /> Verified
                  </span>
                )}
                {tool.badges.slice(0, 3).map(b => {
                  const cfg = BADGE_CONFIG[b];
                  if (!cfg) return null;
                  return (
                    <span key={b} style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '100px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                  );
                })}
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '100px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}>
                  {tool.category}
                </span>
              </div>

              {/* Name + tagline */}
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: '#171717', margin: '0 0 6px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {tool.name}
              </h1>
              <p style={{ fontSize: '16px', color: '#475569', fontWeight: 500, margin: '0 0 16px', lineHeight: 1.5 }}>{tool.tagline}</p>

              {/* Rating row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarRating rating={tool.average_rating} size={18} />
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#171717' }}>{tool.average_rating.toFixed(1)}</span>
                  <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>({tool.review_count.toLocaleString()} reviews)</span>
                </div>
                <div style={{ width: '1px', height: '18px', background: '#E2E8F0' }} />
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                  <strong style={{ color: '#171717' }}>{(tool.upvote_count + upvoteCount).toLocaleString()}</strong> upvotes
                </span>
                <div style={{ width: '1px', height: '18px', background: '#E2E8F0' }} />
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                  <strong style={{ color: '#171717' }}>{tool.pricing_model}</strong>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 800, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.35)', transition: 'all 0.2s ease', letterSpacing: '-0.01em' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.45)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,158,11,0.35)')}
              >
                Visit {tool.name} <ExternalLink style={{ width: '14px', height: '14px' }} />
              </a>
              <button
                onClick={handleUpvote}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: '12px',
                  border: upvoted ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
                  background: upvoted ? '#FFFBEB' : '#FFFFFF',
                  color: upvoted ? '#B45309' : '#374151',
                  fontWeight: 700, fontSize: '14px', cursor: upvoted ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronUp style={{ width: '16px', height: '16px' }} />
                {upvoted ? 'Upvoted' : 'Upvote'}
              </button>
              {/* Compare toggle */}
              <button
                onClick={() => {
                  if (!isComparing(tool.id) && !canCompare) {
                    toast.error('You can compare up to 3 tools at a time');
                    return;
                  }
                  compareToggle(tool);
                  if (!isComparing(tool.id)) toast.success(`${tool.name} added to comparison`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: '12px',
                  border: isComparing(tool.id) ? '1.5px solid #BFDBFE' : '1.5px solid #E2E8F0',
                  background: isComparing(tool.id) ? '#EFF6FF' : '#FFFFFF',
                  color: isComparing(tool.id) ? '#1D4ED8' : '#374151',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (!isComparing(tool.id)) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#BFDBFE'; (e.currentTarget as HTMLButtonElement).style.color = '#1D4ED8'; (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF'; } }}
                onMouseLeave={e => { if (!isComparing(tool.id)) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; } }}
              >
                <GitCompareArrows style={{ width: '15px', height: '15px' }} />
                {isComparing(tool.id) ? 'Comparing' : 'Compare'}
              </button>
              {/* Bookmark / Save */}
              <button
                onClick={() => {
                  toggleSave(tool.id);
                  toast.success(isSaved(tool.id) ? `Removed ${tool.name} from saved` : `Saved ${tool.name}!`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: '12px',
                  border: isSaved(tool.id) ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
                  background: isSaved(tool.id) ? '#FFFBEB' : '#FFFFFF',
                  color: isSaved(tool.id) ? '#B45309' : '#374151',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (!isSaved(tool.id)) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B'; (e.currentTarget as HTMLButtonElement).style.color = '#B45309'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB'; } }}
                onMouseLeave={e => { if (!isSaved(tool.id)) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; } }}
              >
                <Bookmark style={{ width: '15px', height: '15px', fill: isSaved(tool.id) ? '#F59E0B' : 'none' }} />
                {isSaved(tool.id) ? 'Saved' : 'Save'}
              </button>
              {/* Write a Review — auth-gated */}
              <button
                onClick={handleWriteReview}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#374151',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B';
                  (e.currentTarget as HTMLButtonElement).style.color = '#B45309';
                  (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
                  (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                  (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                }}
              >
                <MessageSquare style={{ width: '15px', height: '15px' }} />
                Write a Review
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MAIN CONTENT ════════════════════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10" style={{ padding: '40px 40px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

          {/* Overview */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: '0 0 16px', letterSpacing: '-0.02em' }}>About {tool.name}</h2>
            <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.75, margin: '0 0 20px' }}>{tool.description}</p>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tool.tags.map(tag => (
                <span key={tag} style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── SCREENSHOT GALLERY ──────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>Screenshots</h2>
            </div>
            {/* Main screenshot */}
            <div style={{ position: 'relative', background: '#0F172A', aspectRatio: '16/9', overflow: 'hidden' }}>
              <img
                src={extras.screenshots[activeScreenshot]?.url}
                alt={extras.screenshots[activeScreenshot]?.caption}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
              />
              {/* Caption overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(to top, rgba(15,23,42,0.85), transparent)' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#E2E8F0' }}>{extras.screenshots[activeScreenshot]?.caption}</p>
              </div>
              {/* Prev/Next arrows */}
              {extras.screenshots.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveScreenshot(i => (i - 1 + extras.screenshots.length) % extras.screenshots.length)}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                  >‹</button>
                  <button
                    onClick={() => setActiveScreenshot(i => (i + 1) % extras.screenshots.length)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                  >›</button>
                </>
              )}
            </div>
            {/* Thumbnail strip */}
            {extras.screenshots.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', padding: '14px 20px', overflowX: 'auto' }}>
                {extras.screenshots.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScreenshot(i)}
                    style={{ flexShrink: 0, width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: i === activeScreenshot ? '2px solid #F59E0B' : '2px solid transparent', cursor: 'pointer', transition: 'border-color 0.15s', padding: 0 }}
                  >
                    <img src={s.url} alt={s.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: i === activeScreenshot ? 1 : 0.6, transition: 'opacity 0.15s' }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── KEY FEATURES ────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.07 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px 32px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: '0 0 24px', letterSpacing: '-0.02em' }}>Key Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {extras.features.map((feat, i) => (
                <div key={i} style={{ padding: '18px 20px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#FDE68A'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(245,158,11,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>{feat.icon}</div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#171717', margin: '0 0 6px' }}>{feat.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{feat.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── PRICING TABLE ───────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.09 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px 32px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>Pricing</h2>
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                View full pricing <ExternalLink style={{ width: '11px', height: '11px' }} />
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(extras.pricing_tiers.length, 3)}, 1fr)`, gap: '14px', overflowX: 'auto' }}>
              {extras.pricing_tiers.map((tier, i) => (
                <div key={i} style={{
                  borderRadius: '14px',
                  border: tier.highlighted ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  padding: '22px 20px',
                  background: tier.highlighted ? '#FFFBEB' : '#F8FAFC',
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  boxShadow: tier.highlighted ? '0 4px 16px rgba(245,158,11,0.15)' : 'none',
                }}>
                  {tier.badge && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#F59E0B', color: '#0A0A0A', fontSize: '11px', fontWeight: 800, padding: '3px 12px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                      {tier.badge}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{tier.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 900, color: '#171717', letterSpacing: '-0.03em' }}>{tier.price}</span>
                      {tier.period && <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{tier.period}</span>}
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0', lineHeight: 1.5 }}>{tier.description}</p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tier.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: tier.highlighted ? '#B45309' : '#15803D', flexShrink: 0, marginTop: '1px' }} />
                        <span style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                      textDecoration: 'none', transition: 'all 0.15s',
                      background: tier.highlighted ? '#F59E0B' : '#FFFFFF',
                      color: tier.highlighted ? '#0A0A0A' : '#374151',
                      border: tier.highlighted ? 'none' : '1.5px solid #E2E8F0',
                      boxShadow: tier.highlighted ? '0 3px 10px rgba(245,158,11,0.3)' : 'none',
                    }}
                    onMouseEnter={e => { if (tier.highlighted) (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 5px 16px rgba(245,158,11,0.4)'; else { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#F59E0B'; (e.currentTarget as HTMLAnchorElement).style.color = '#B45309'; } }}
                    onMouseLeave={e => { if (tier.highlighted) (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 3px 10px rgba(245,158,11,0.3)'; else { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; } }}
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '14px', textAlign: 'center' }}>
              Pricing shown is indicative. Visit {tool.name}'s website for the latest pricing.
            </p>
          </motion.div>

          {/* Ratings Summary */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>Ratings & Reviews</h2>
              <button
                onClick={handleWriteReview}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: isAuthenticated ? '#F59E0B' : '#F8FAFC', color: isAuthenticated ? '#0A0A0A' : '#374151', fontWeight: 700, fontSize: '13px', border: isAuthenticated ? 'none' : '1.5px solid #E2E8F0', cursor: 'pointer', boxShadow: isAuthenticated ? '0 3px 10px rgba(245,158,11,0.25)' : 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-1px)'; b.style.boxShadow = isAuthenticated ? '0 5px 16px rgba(245,158,11,0.35)' : '0 2px 8px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(0)'; b.style.boxShadow = isAuthenticated ? '0 3px 10px rgba(245,158,11,0.25)' : 'none'; }}
              >
                <MessageSquare style={{ width: '13px', height: '13px' }} />
                {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
              {/* Big score */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '56px', fontWeight: 900, color: '#171717', lineHeight: 1, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.04em' }}>
                  {tool.average_rating.toFixed(1)}
                </div>
                <StarRating rating={tool.average_rating} size={20} />
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', fontWeight: 500 }}>{tool.review_count.toLocaleString()} reviews</div>
              </div>

              {/* Bar chart */}
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ratingBreakdown.map(({ star, count }) => (
                  <RatingBar key={star} label={`${star} ★`} count={count} total={totalReviews} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Reviews List */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>
                Community Reviews
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {reviews.map((review, i) => (
                <div key={review.id} style={{ padding: '28px 32px', borderBottom: i < reviews.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                  {/* Reviewer header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `hsl(${(review.user?.name.charCodeAt(0) ?? 65) * 7}, 55%, 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>{review.user?.name.charAt(0) ?? '?'}</span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#171717' }}>{review.user?.name}</span>
                          {review.is_verified_purchase && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                              <CheckCircle2 style={{ width: '9px', height: '9px' }} /> Verified
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                          {review.user?.role}{review.user?.company ? ` · ${review.user.company}` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <StarRating rating={review.rating} size={14} />
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{formatDate(review.created_at)}</span>
                    </div>
                  </div>

                  {/* Review title + body */}
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#171717', margin: '0 0 8px', lineHeight: 1.4 }}>{review.title}</h3>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: '0 0 16px' }}>{review.body}</p>

                  {/* Pros / Cons */}
                  {(review.pros || review.cons) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      {review.pros && (
                        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Pros</div>
                          <p style={{ fontSize: '13px', color: '#166534', margin: 0, lineHeight: 1.5 }}>{review.pros}</p>
                        </div>
                      )}
                      {review.cons && (
                        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#FFF1F2', border: '1px solid #FECDD3' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#BE123C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Cons</div>
                          <p style={{ fontSize: '13px', color: '#9F1239', margin: 0, lineHeight: 1.5 }}>{review.cons}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Helpful */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => handleHelpful(review.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: helpfulMap[review.id] ? '#15803D' : '#64748B', background: helpfulMap[review.id] ? '#F0FDF4' : 'none', border: helpfulMap[review.id] ? '1px solid #BBF7D0' : '1px solid #E2E8F0', padding: '5px 10px', borderRadius: '8px', cursor: helpfulMap[review.id] ? 'default' : 'pointer', transition: 'all 0.15s' }}
                    >
                      <ThumbsUp style={{ width: '12px', height: '12px' }} />
                      Helpful ({review.helpful_count + (helpfulMap[review.id] ? 1 : 0)})
                    </button>
                  </div>

                  {/* Founder reply */}
                  {review.founder_reply && (
                    <div style={{ marginTop: '16px', padding: '16px 18px', borderRadius: '12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '3px solid #F59E0B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Building2 style={{ width: '14px', height: '14px', color: '#B45309' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309' }}>Founder Reply</span>
                        <span style={{ fontSize: '11px', color: '#92400E' }}>· {formatDate(review.founder_reply.created_at)}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.6, margin: 0 }}>{review.founder_reply.body}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Write a review CTA */}
            <div style={{ padding: '24px 32px', background: '#FFFBEB', borderTop: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#171717', margin: '0 0 2px' }}>Have experience with {tool.name}?</p>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  {isAuthenticated
                    ? 'Share your honest review and help others make informed decisions.'
                    : 'Sign in to share your honest review and help others make informed decisions.'}
                </p>
              </div>
              <button
                onClick={handleWriteReview}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '10px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.3)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 18px rgba(245,158,11,0.4)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
              >
                <MessageSquare style={{ width: '14px', height: '14px' }} />
                {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '88px' }}>

          {/* Tool Details Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 800, color: '#171717', margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tool Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: Tag, label: 'Category', value: tool.category },
                { icon: Globe, label: 'Pricing', value: tool.pricing_model },
                { icon: Calendar, label: 'Launched', value: new Date(tool.launched_at).getFullYear().toString() },
                { icon: Award, label: 'Rank Score', value: tool.rank_score.toLocaleString() },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: '13px', height: '13px', color: '#64748B' }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#171717' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '11px', borderRadius: '10px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 800, fontSize: '13px', textDecoration: 'none', boxShadow: '0 3px 10px rgba(245,158,11,0.3)', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 5px 16px rgba(245,158,11,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 3px 10px rgba(245,158,11,0.3)')}
              >
                Visit Website <ExternalLink style={{ width: '13px', height: '13px' }} />
              </a>
            </div>
          </motion.div>

          {/* Founder CTA */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}
            style={{ background: '#171717', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(15,23,42,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <User2 style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>For Founders</span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px', lineHeight: 1.3 }}>Is this your tool?</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 16px' }}>Claim your listing to respond to reviews, add a banner, and access analytics.</p>
            <button
              onClick={() => toast.info('LaunchPad coming soon!')}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#F59E0B', color: '#171717', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FBBF24')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
            >
              Claim This Listing
            </button>
          </motion.div>

          {/* Share */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#171717', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Share</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Twitter / X', 'LinkedIn', 'Copy Link'].map(platform => (
                <button
                  key={platform}
                  onClick={() => toast.success(`${platform} share coming soon!`)}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '11px', fontWeight: 700, color: '#475569', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B'; (e.currentTarget as HTMLButtonElement).style.color = '#B45309'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
                >
                  {platform}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ RELATED TOOLS ═══════════════════════════════════════════════════ */}
      {relatedTools.length > 0 && (
        <section style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '56px 0' }}>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '10px' }}>
                  <Sparkles style={{ width: '11px', height: '11px', color: '#64748B' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Related Tools</span>
                </div>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '22px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>
                  More tools in {tool.category}
                </h2>
              </div>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: '#B45309', textDecoration: 'none' }}>
                Browse all <ChevronRight style={{ width: '13px', height: '13px' }} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
              {relatedTools.map((related, i) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <Link href={`/tools/${related.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div
                      style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(15,23,42,0.10)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#CBD5E1'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={related.logo_url} alt={related.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={e => { const t = e.currentTarget; t.style.display = 'none'; const p = t.parentElement; if (p) { p.style.display = 'flex'; p.style.alignItems = 'center'; p.style.justifyContent = 'center'; p.innerHTML = `<span style="font-size:14px;font-weight:800;color:#64748B">${related.name.charAt(0)}</span>`; } }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '14px', fontWeight: 800, color: '#171717', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{related.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star style={{ width: '11px', height: '11px', fill: '#FBBF24', color: '#FBBF24' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{related.average_rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{related.tagline}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <WriteReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        toolName={tool.name}
        toolLogo={tool.logo_url}
      />
    </div>
  );
}

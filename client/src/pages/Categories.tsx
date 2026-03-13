import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { CATEGORIES } from '@/lib/mockData';
import { trpc } from '@/lib/trpc';
import { stacksToTools } from '@/lib/stackAdapter';

// Accent colors per category (excluding "All")
const CATEGORY_ACCENTS: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  'AI Productivity': { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', iconBg: '#FEF3C7' },
  'AI Writing':      { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', iconBg: '#DBEAFE' },
  'AI Image':        { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239', iconBg: '#FFE4E6' },
  'AI Video':        { bg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6', iconBg: '#EDE9FE' },
  'AI Audio':        { bg: '#FDF4FF', border: '#F5D0FE', text: '#86198F', iconBg: '#FAE8FF' },
  'AI Code':         { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', iconBg: '#D1FAE5' },
  'AI Analytics':    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', iconBg: '#DBEAFE' },
  'Design':          { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', iconBg: '#FFEDD5' },
  'Marketing':       { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', iconBg: '#FEE2E2' },
  'Developer Tools': { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', iconBg: '#DCFCE7' },
  'Project Management': { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', iconBg: '#FEF3C7' },
  'Customer Support':   { bg: '#F0F9FF', border: '#BAE6FD', text: '#075985', iconBg: '#E0F2FE' },
  'CRM':             { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', iconBg: '#FFEDD5' },
  'Sales':           { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', iconBg: '#D1FAE5' },
};

const DEFAULT_ACCENT = { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', iconBg: '#F1F5F9' };

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, navigate] = useLocation();

  // Filter categories (exclude "All") and search
  const categories = useMemo(() => {
    const cats = CATEGORIES.filter(c => c.name !== 'All');
    if (!searchQuery.trim()) return cats;
    const q = searchQuery.toLowerCase();
    return cats.filter(c =>
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const { data: stackData } = trpc.stacks.list.useQuery({ status: 'published', limit: 100 });
  const allTools = stacksToTools((stackData?.items ?? []) as any[]);

  // Get top 3 tool logos per category
  const topToolsByCategory = useMemo(() => {
    const map: Record<string, { name: string; logo: string }[]> = {};
    for (const cat of CATEGORIES) {
      if (cat.name === 'All') continue;
      const tools = allTools
        .filter(t => t.category === cat.name)
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 3)
        .map(t => ({ name: t.name, logo: t.logo_url }));
      map[cat.name] = tools;
    }
    return map;
  }, [stackData]);

  const totalTools = stackData?.total ?? 0;
  const totalCategories = CATEGORIES.filter(c => c.name !== 'All').length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <Navbar />
      <div style={{ height: '72px', flexShrink: 0 }} />

      {/* ── Page Header ── */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '56px 0 48px' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '560px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '100px', background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: '18px' }}>
                <Layers style={{ width: '12px', height: '12px', color: '#D97706' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Categories</span>
              </div>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 900, color: '#171717', letterSpacing: '-0.025em', margin: '0 0 12px', lineHeight: 1.15 }}>
                Browse by Category
              </h1>
              <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.65, margin: 0, fontWeight: 400 }}>
                Explore {totalTools} verified tools across {totalCategories} categories. Find the perfect AI and SaaS tools for your workflow.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '24px', flexShrink: 0, paddingTop: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#171717', fontFamily: "'Inter', sans-serif" }}>{totalCategories}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Categories</div>
              </div>
              <div style={{ width: '1px', background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#171717', fontFamily: "'Inter', sans-serif" }}>{totalTools}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tools</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ marginTop: '28px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <Search style={{ width: '16px', height: '16px', color: '#94A3B8', marginLeft: '14px', flexShrink: 0 }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                style={{ flex: 1, padding: '12px 14px', fontSize: '14px', color: '#171717', border: 'none', outline: 'none', background: 'transparent' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Grid ── */}
      <section style={{ padding: '56px 0 80px' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#94A3B8' }}>
              <p style={{ fontSize: '16px', fontWeight: 500 }}>No categories match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                style={{ marginTop: '12px', fontSize: '13px', fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {categories.map((cat, i) => {
                const accent = CATEGORY_ACCENTS[cat.name] || DEFAULT_ACCENT;
                const topTools = topToolsByCategory[cat.name] || [];
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                  >
                    <div
                      onClick={() => navigate(`/?category=${encodeURIComponent(cat.name)}`)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8ECF0',
                        borderRadius: '16px',
                        padding: '0',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget;
                        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                        el.style.borderColor = accent.border;
                        el.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget;
                        el.style.boxShadow = 'none';
                        el.style.borderColor = '#E8ECF0';
                        el.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Accent top bar */}
                      <div style={{ height: '3px', background: accent.border }} />

                      <div style={{ padding: '24px 24px 20px' }}>
                        {/* Icon + Name row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: accent.iconBg, border: `1px solid ${accent.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '22px', flexShrink: 0,
                          }}>
                            {cat.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{
                              fontFamily: "'Inter', sans-serif", fontSize: '16px', fontWeight: 800,
                              color: '#171717', margin: 0, letterSpacing: '-0.01em',
                            }}>
                              {cat.name}
                            </h3>
                            <span style={{
                              fontSize: '12px', fontWeight: 700, color: accent.text,
                              background: accent.bg, border: `1px solid ${accent.border}`,
                              padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '3px',
                            }}>
                              {cat.count} tools
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{
                          fontSize: '13px', color: '#64748B', lineHeight: 1.55,
                          margin: '0 0 16px', fontWeight: 400,
                        }}>
                          {cat.description}
                        </p>

                        {/* Top tools row + explore arrow */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {topTools.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginRight: '2px' }}>Top:</span>
                              <div style={{ display: 'flex' }}>
                                {topTools.map((tool, j) => (
                                  <img
                                    key={tool.name}
                                    src={tool.logo}
                                    alt={tool.name}
                                    title={tool.name}
                                    style={{
                                      width: '26px', height: '26px', borderRadius: '7px',
                                      border: '2px solid #fff', marginLeft: j === 0 ? 0 : '-6px',
                                      objectFit: 'cover', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                      background: '#F8FAFC',
                                    }}
                                  />
                                ))}
                              </div>
                              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, marginLeft: '4px' }}>
                                +{Math.max(0, cat.count - 3)} more
                              </span>
                            </div>
                          )}
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: accent.bg, border: `1px solid ${accent.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'background 0.15s',
                          }}>
                            <ArrowRight style={{ width: '14px', height: '14px', color: accent.text }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '56px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '100px', background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: '16px' }}>
            <Sparkles style={{ width: '12px', height: '12px', color: '#D97706' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>For Founders</span>
          </div>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 800, color: '#171717', letterSpacing: '-0.025em', margin: '0 0 10px' }}>
            Don't see your category?
          </h2>
          <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Submit your tool via LaunchPad and we'll add it to the right category. Free to list.
          </p>
          <button
            onClick={() => navigate('/launchpad')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', borderRadius: '12px',
              background: '#F59E0B', color: '#fff', fontSize: '14px', fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Go to LaunchPad <ArrowRight style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}

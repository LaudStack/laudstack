/**
 * Saved.tsx — LaudStack Saved Tools Page
 * Design: Clean white, consistent with the rest of the platform.
 * Shows all bookmarked tools in a responsive grid.
 * Empty state guides users back to browsing.
 */

import { Link, useLocation } from 'wouter';
import { Bookmark, ArrowLeft, Search, Trash2, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { useSavedTools } from '@/hooks/useSavedTools';
import { MOCK_TOOLS } from '@/lib/mockData';

export default function Saved() {
  const [, navigate] = useLocation();
  const { savedIds, isSaved, toggle, clear } = useSavedTools();

  // Resolve saved IDs to full tool objects (maintain save order — most recent first)
  const savedTools = savedIds
    .map(id => MOCK_TOOLS.find(t => t.id === id))
    .filter(Boolean) as typeof MOCK_TOOLS;

  const handleClearAll = () => {
    clear();
    toast.success('All saved tools cleared');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ height: '72px', flexShrink: 0 }} />

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Saved Tools</span>
          </div>
        </div>
      </div>

      {/* ── Page header ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '32px 0 28px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bookmark style={{ width: '20px', height: '20px', color: '#fff', fill: '#fff' }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>Your collection</p>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
                  Saved Tools
                  {savedTools.length > 0 && (
                    <span style={{ marginLeft: '10px', fontSize: '16px', fontWeight: 700, color: '#94A3B8' }}>({savedTools.length})</span>
                  )}
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {savedTools.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; }}
                >
                  <Trash2 style={{ width: '13px', height: '13px' }} /> Clear All
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
              >
                <ArrowLeft style={{ width: '13px', height: '13px' }} /> Browse Tools
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 80px', width: '100%', boxSizing: 'border-box', flex: 1 }}>

        {savedTools.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '80px 24px', textAlign: 'center' }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bookmark style={{ width: '36px', height: '36px', color: '#F59E0B' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px', letterSpacing: '-0.03em' }}>No saved tools yet</h2>
              <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '420px', lineHeight: 1.65 }}>
                Click the <strong style={{ color: '#D97706' }}>bookmark icon</strong> on any tool card to save it here for quick access later.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}
              >
                <Search style={{ width: '14px', height: '14px' }} /> Browse All Tools
              </Link>
              <Link
                href="/categories"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', borderRadius: '12px', background: '#FFFFFF', color: '#374151', fontWeight: 700, fontSize: '14px', textDecoration: 'none', border: '1.5px solid #E2E8F0' }}
              >
                Explore Categories <ChevronRight style={{ width: '14px', height: '14px' }} />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── Tool grid ── */
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Summary bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                  <strong style={{ color: '#0F172A' }}>{savedTools.length}</strong> tool{savedTools.length !== 1 ? 's' : ''} saved
                </p>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Sorted by most recently saved</p>
              </div>

              {savedTools.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <Footer />
    </div>
  );
}

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
import PageHero from '@/components/PageHero';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { useSavedTools } from '@/hooks/useSavedTools';
import { trpc } from '@/lib/trpc';
import { stacksToTools } from '@/lib/stackAdapter';

export default function Saved() {
  const [, navigate] = useLocation();
  const { savedIds, isSaved, toggle, clear } = useSavedTools();

  // Fetch saved stacks from the DB via tRPC
  const { data: savedStacksData } = trpc.saves.mySavedStacks.useQuery(undefined, { enabled: savedIds.length > 0 });
  const savedTools = stacksToTools((savedStacksData ?? []) as any[]);

  const handleClearAll = () => {
    clear();
    toast.success('All saved tools cleared');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <PageHero
        eyebrow="Your Collection"
        title={savedTools.length > 0 ? `Saved Tools (${savedTools.length})` : 'Saved Tools'}
        subtitle="Products you've bookmarked for quick access. Save any product to build your personal stack."
        accent="amber"
        layout="default"
        size="sm"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {savedTools.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              <Trash2 style={{ width: '13px', height: '13px' }} /> Clear All
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            <ArrowLeft style={{ width: '13px', height: '13px' }} /> Browse Tools
          </button>
        </div>
      </PageHero>

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
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '26px', fontWeight: 900, color: '#171717', margin: '0 0 10px', letterSpacing: '-0.03em' }}>No saved tools yet</h2>
              <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '420px', lineHeight: 1.65 }}>
                Click the <strong style={{ color: '#D97706' }}>bookmark icon</strong> on any tool card to save it here for quick access later.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', borderRadius: '12px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}
              >
                <Search style={{ width: '14px', height: '14px' }} /> Browse All Products
              </Link>
              <Link
                href="/tools"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', borderRadius: '12px', background: '#FFFFFF', color: '#374151', fontWeight: 700, fontSize: '14px', textDecoration: 'none', border: '1.5px solid #E2E8F0' }}
              >
                Explore All Tools <ChevronRight style={{ width: '14px', height: '14px' }} />
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
                  <strong style={{ color: '#171717' }}>{savedTools.length}</strong> tool{savedTools.length !== 1 ? 's' : ''} saved
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

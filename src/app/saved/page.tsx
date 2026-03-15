"use client";

/**
 * Saved.tsx — LaudStack Saved Stacks Page
 * Design: Clean white, consistent with the rest of the platform.
 * Shows all bookmarked tools in a responsive grid.
 * Empty state guides users back to browsing.
 * Loading skeleton prevents flash of empty state.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bookmark, ArrowLeft, Search, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import PageHero from '@/components/PageHero';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { useSavedTools } from '@/hooks/useSavedTools';
import { useToolsData } from '@/hooks/useToolsData';

export default function Saved() {
  const { tools: allTools, loading: toolsLoading } = useToolsData();
  const router = useRouter();
  const { savedIds, clear, loading: savedLoading } = useSavedTools();
  const [clearing, setClearing] = useState(false);

  // Resolve saved IDs to full tool objects (maintain save order — most recent first)
  const savedTools = savedIds
    .map(id => allTools.find(t => t.id === id))
    .filter(Boolean) as typeof allTools;

  const isLoading = toolsLoading || savedLoading;

  const handleClearAll = async () => {
    if (!confirm('Remove all saved stacks? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clear();
      toast.success('All saved stacks cleared');
    } catch {
      toast.error('Failed to clear saved stacks');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <PageHero
        eyebrow="Your Collection"
        title={!isLoading && savedTools.length > 0 ? `Saved Stacks (${savedTools.length})` : 'Saved Stacks'}
        subtitle="Tools you've bookmarked for quick access. Save any tool from the directory to build your personal stack."
        accent="amber"
        layout="default"
        size="sm"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {!isLoading && savedTools.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                borderRadius: '9px', border: '1.5px solid #FECACA', background: '#FEF2F2',
                color: '#DC2626', fontWeight: 600, fontSize: '13px',
                cursor: clearing ? 'wait' : 'pointer', opacity: clearing ? 0.6 : 1,
              }}
            >
              {clearing ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : <Trash2 style={{ width: '13px', height: '13px' }} />}
              {clearing ? 'Clearing…' : 'Clear All'}
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            <ArrowLeft style={{ width: '13px', height: '13px' }} /> Browse Stacks
          </button>
        </div>
      </PageHero>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 80px', width: '100%', boxSizing: 'border-box', flex: 1 }}>

        {isLoading ? (
          /* ── Loading skeleton ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ width: 120, height: 16, borderRadius: 6, background: '#E2E8F0' }} />
              <div style={{ width: 160, height: 12, borderRadius: 6, background: '#F1F5F9' }} />
            </div>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '20px',
                  borderRadius: 16, border: '1px solid #E5E7EB', background: '#FFFFFF',
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: 14, background: '#F1F5F9', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ width: '40%', height: 18, borderRadius: 6, background: '#E2E8F0' }} />
                  <div style={{ width: '25%', height: 12, borderRadius: 6, background: '#F1F5F9' }} />
                  <div style={{ width: '80%', height: 12, borderRadius: 6, background: '#F1F5F9' }} />
                </div>
                <div style={{ width: 48, height: 56, borderRadius: 10, background: '#F1F5F9', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        ) : savedTools.length === 0 ? (
          /* ── Empty state ── */
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '80px 24px', textAlign: 'center' }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bookmark style={{ width: '36px', height: '36px', color: '#F59E0B' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '26px', fontWeight: 900, color: '#171717', margin: '0 0 10px', letterSpacing: '-0.03em' }}>No saved stacks yet</h2>
              <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '420px', lineHeight: 1.65 }}>
                Click the <strong style={{ color: '#D97706' }}>bookmark icon</strong> on any tool card to save it here for quick access later.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', borderRadius: '12px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}
              >
                <Search style={{ width: '14px', height: '14px' }} /> Browse All Stacks
              </Link>
              <Link
                href="/tools"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', borderRadius: '12px', background: '#FFFFFF', color: '#374151', fontWeight: 700, fontSize: '14px', textDecoration: 'none', border: '1.5px solid #E2E8F0' }}
              >
                Explore All Stacks <ChevronRight style={{ width: '14px', height: '14px' }} />
              </Link>
            </div>
          </div>
        ) : (
          /* ── Tool grid ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Summary bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                <strong style={{ color: '#171717' }}>{savedTools.length}</strong> tool{savedTools.length !== 1 ? 's' : ''} saved
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Sorted by most recently saved</p>
            </div>

            {savedTools.map((tool) => (
              <div key={tool.id}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

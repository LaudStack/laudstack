"use client";

/**
 * CompareBar — LaudStack
 * Floating bottom tray that appears when 1+ tools are selected for comparison.
 * Shows tool thumbnails, a count, and a "Compare Now" CTA.
 * Design: dark navy bar with amber accent, slides up from bottom.
 */

import { X, GitCompareArrows, ArrowRight } from 'lucide-react';
import LogoWithFallback from '@/components/LogoWithFallback';
import { useRouter, usePathname } from 'next/navigation';
import { useCompare } from '@/contexts/CompareContext';

/** Pages where the compare bar should be visible */
const COMPARE_PAGES = [
  '/',
  '/tools',
  '/compare',
  '/comparisons',
  '/alternatives',
  '/search',
  '/trending',
  '/top-rated',
  '/community-picks',
  '/community-voting',
  '/launches',
  '/categories',
  '/editors-picks',
  '/most-lauded',
  '/recently-added',
  '/stack-finder',
  '/launch-archive',
];

export default function CompareBar() {
  const { selected, remove, clear } = useCompare();
  const router = useRouter();
  const pathname = usePathname();

  // Only show on relevant pages (exact match or starts with tool/category/alt paths)
  const isRelevantPage = pathname ? (
    COMPARE_PAGES.includes(pathname) ||
    pathname.startsWith('/tools/') ||
    pathname.startsWith('/alt/') ||
    pathname.startsWith('/c/') ||
    pathname.startsWith('/best/')
  ) : false;
  if (!isRelevantPage) return null;

  const handleCompare = () => {
    if (selected.length < 2) return;
    // For exactly 2 tools, use SEO-friendly /vs/ route
    if (selected.length === 2) {
      router.push(`/vs/${selected[0].slug}/${selected[1].slug}`);
    } else {
      const slugs = selected.map(t => t.slug).join(',');
      router.push(`/compare?tools=${slugs}`);
    }
  };

  return (
    <>
      {selected.length > 0 && (
        <div
          key="compare-bar"
          
          style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 300, width: 'calc(100% - 48px)', maxWidth: '760px',
          }}
        >
          <div style={{
            background: '#171717', borderRadius: '16px',
            border: '1px solid rgba(245,158,11,0.25)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: '14px',
            flexWrap: 'wrap',
          }}>
            {/* Icon */}
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <GitCompareArrows style={{ width: '17px', height: '17px', color: '#fff' }} />
            </div>

            {/* Label */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>Comparing</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9', marginTop: '2px' }}>
                {selected.length} of 3 tools selected
              </div>
            </div>

            {/* Tool chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', minWidth: 0, overflowX: 'auto', padding: '2px 0' }}>
              {selected.map(tool => (
                <div
                  key={tool.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '9px', padding: '5px 10px 5px 7px', flexShrink: 0,
                  }}
                >
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', overflow: 'hidden', background: '#171717', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogoWithFallback src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain" fallbackSize="text-[11px]" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#E2E8F0', whiteSpace: 'nowrap' }}>{tool.name}</span>
                  <button
                    onClick={() => remove(tool.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', display: 'flex', alignItems: 'center', color: '#475569', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                  >
                    <X style={{ width: '11px', height: '11px' }} />
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 3 - selected.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    width: '90px', height: '34px', borderRadius: '9px',
                    border: '1.5px dashed rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#334155', fontWeight: 500 }}>+ Add tool</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={clear}
                style={{ fontSize: '12px', fontWeight: 600, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
              >
                Clear
              </button>
              <button
                onClick={handleCompare}
                disabled={selected.length < 2}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px', borderRadius: '10px',
                  background: selected.length >= 2 ? '#F59E0B' : '#171717',
                  color: selected.length >= 2 ? '#fff' : '#475569',
                  fontWeight: 700, fontSize: '13px', border: 'none',
                  cursor: selected.length >= 2 ? 'pointer' : 'not-allowed',
                  boxShadow: selected.length >= 2 ? '0 4px 14px rgba(245,158,11,0.35)' : 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (selected.length >= 2) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(245,158,11,0.45)'; }}
                onMouseLeave={e => { if (selected.length >= 2) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(245,158,11,0.35)'; }}
              >
                Compare Now <ArrowRight style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

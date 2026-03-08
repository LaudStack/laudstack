/**
 * CompareBar — LaudStack
 * Floating bottom tray that appears when 1+ tools are selected for comparison.
 * Shows tool thumbnails, a count, and a "Compare Now" CTA.
 * Design: dark navy bar with amber accent, slides up from bottom.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { X, GitCompareArrows, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useCompare } from '@/contexts/CompareContext';

export default function CompareBar() {
  const { selected, remove, clear } = useCompare();
  const [, navigate] = useLocation();

  const handleCompare = () => {
    if (selected.length < 2) return;
    navigate('/compare');
  };

  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          key="compare-bar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 300, width: 'calc(100% - 48px)', maxWidth: '760px',
          }}
        >
          <div style={{
            background: '#0F172A', borderRadius: '16px',
            border: '1px solid rgba(245,158,11,0.25)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            {/* Icon */}
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflowX: 'auto', padding: '2px 0' }}>
              {selected.map(tool => (
                <div
                  key={tool.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '9px', padding: '5px 10px 5px 7px', flexShrink: 0,
                  }}
                >
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', overflow: 'hidden', background: '#1E293B', flexShrink: 0 }}>
                    <img
                      src={tool.logo_url}
                      alt={tool.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={e => {
                        const t = e.currentTarget;
                        t.style.display = 'none';
                        const p = t.parentElement;
                        if (p) {
                          p.style.display = 'flex';
                          p.style.alignItems = 'center';
                          p.style.justifyContent = 'center';
                          p.innerHTML = `<span style="font-size:11px;font-weight:800;color:#94A3B8">${tool.name.charAt(0)}</span>`;
                        }
                      }}
                    />
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
                  background: selected.length >= 2 ? 'linear-gradient(135deg, #F59E0B, #EA580C)' : '#1E293B',
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

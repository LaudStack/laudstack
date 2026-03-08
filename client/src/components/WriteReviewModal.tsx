/*
 * WriteReviewModal — LaudStack
 * Design: Clean white modal, enterprise-grade
 * Features: Interactive 5-star hover rating, title, body, pros/cons, submit
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  toolName: string;
  toolLogo?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export default function WriteReviewModal({ open, onClose, toolName, toolLogo }: Props) {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [title, setTitle]         = useState('');
  const [body, setBody]           = useState('');
  const [pros, setPros]           = useState<string[]>(['']);
  const [cons, setCons]           = useState<string[]>(['']);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayRating = hovered || rating;

  const addPro  = () => pros.length  < 5 && setPros([...pros, '']);
  const addCon  = () => cons.length  < 5 && setCons([...cons, '']);
  const removePro = (i: number) => setPros(pros.filter((_, idx) => idx !== i));
  const removeCon = (i: number) => setCons(cons.filter((_, idx) => idx !== i));
  const updatePro = (i: number, v: string) => setPros(pros.map((p, idx) => idx === i ? v : p));
  const updateCon = (i: number, v: string) => setCons(cons.map((c, idx) => idx === i ? v : c));

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setRating(0); setHovered(0); setTitle(''); setBody('');
      setPros(['']); setCons(['']); setSubmitted(false);
    }, 300);
  };

  const handleSubmit = () => {
    if (!rating) { toast.error('Please select a star rating'); return; }
    if (!title.trim()) { toast.error('Please add a review title'); return; }
    if (body.trim().length < 30) { toast.error('Review body must be at least 30 characters'); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '100%', maxWidth: '600px', maxHeight: '90vh',
              background: '#fff', borderRadius: '20px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {toolLogo && (
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <img src={toolLogo} alt={toolName} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Write a Review</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{toolName}</div>
              </div>
              <button
                onClick={handleClose}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', transition: 'all 0.15s', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
              >
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {submitted ? (
                /* ── Success State ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '32px 0' }}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 style={{ width: '32px', height: '32px', color: '#fff' }} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Review Submitted!</div>
                  <div style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 28px' }}>
                    Thank you for sharing your experience with <strong>{toolName}</strong>. Your review will be visible after a brief moderation check.
                  </div>
                  <button
                    onClick={handleClose}
                    style={{ padding: '10px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #EA580C)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* ── Star Rating ── */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '10px' }}>
                      Overall Rating <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <button
                            key={i}
                            onClick={() => setRating(i)}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(0)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', transition: 'transform 0.1s' }}
                            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
                            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            <Star
                              style={{
                                width: '32px', height: '32px',
                                fill: i <= displayRating ? '#F59E0B' : 'transparent',
                                color: i <= displayRating ? '#F59E0B' : '#CBD5E1',
                                transition: 'all 0.1s',
                                filter: i <= displayRating ? 'drop-shadow(0 1px 3px rgba(245,158,11,0.4))' : 'none',
                              }}
                            />
                          </button>
                        ))}
                      </div>
                      {displayRating > 0 && (
                        <motion.span
                          key={displayRating}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}
                        >
                          {RATING_LABELS[displayRating]}
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* ── Review Title ── */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
                      Review Title <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Summarise your experience in one line"
                      maxLength={100}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        border: '1.5px solid #E2E8F0', fontSize: '14px', color: '#0F172A',
                        outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#F59E0B')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                    />
                    <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'right', marginTop: '4px' }}>{title.length}/100</div>
                  </div>

                  {/* ── Review Body ── */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
                      Your Review <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder="Share your honest experience — what problem did it solve? How does it compare to alternatives? Who would you recommend it to?"
                      rows={4}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        border: '1.5px solid #E2E8F0', fontSize: '14px', color: '#0F172A',
                        outline: 'none', resize: 'vertical', transition: 'border-color 0.15s',
                        boxSizing: 'border-box', lineHeight: 1.6, fontFamily: 'inherit',
                        minHeight: '100px',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#F59E0B')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                    />
                    <div style={{ fontSize: '11px', color: body.length < 30 ? '#EF4444' : '#94A3B8', textAlign: 'right', marginTop: '4px' }}>
                      {body.length} chars {body.length < 30 ? `(${30 - body.length} more needed)` : '✓'}
                    </div>
                  </div>

                  {/* ── Pros ── */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
                      Pros <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>optional</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pros.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                          <input
                            value={p}
                            onChange={e => updatePro(i, e.target.value)}
                            placeholder={`Pro ${i + 1}`}
                            style={{
                              flex: 1, padding: '8px 12px', borderRadius: '8px',
                              border: '1.5px solid #E2E8F0', fontSize: '13px', color: '#0F172A',
                              outline: 'none', fontFamily: 'inherit',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = '#10B981')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                          />
                          {pros.length > 1 && (
                            <button onClick={() => removePro(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '4px', display: 'flex' }}>
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          )}
                        </div>
                      ))}
                      {pros.length < 5 && (
                        <button onClick={addPro} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#10B981', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', width: 'fit-content' }}>
                          <Plus style={{ width: '14px', height: '14px' }} /> Add another pro
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Cons ── */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
                      Cons <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8' }}>optional</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {cons.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                          <input
                            value={c}
                            onChange={e => updateCon(i, e.target.value)}
                            placeholder={`Con ${i + 1}`}
                            style={{
                              flex: 1, padding: '8px 12px', borderRadius: '8px',
                              border: '1.5px solid #E2E8F0', fontSize: '13px', color: '#0F172A',
                              outline: 'none', fontFamily: 'inherit',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = '#EF4444')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                          />
                          {cons.length > 1 && (
                            <button onClick={() => removeCon(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '4px', display: 'flex' }}>
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          )}
                        </div>
                      ))}
                      {cons.length < 5 && (
                        <button onClick={addCon} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', width: 'fit-content' }}>
                          <Plus style={{ width: '14px', height: '14px' }} /> Add another con
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {!submitted && (
              <div style={{ padding: '16px 28px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#FAFAFA' }}>
                <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.5, maxWidth: '260px' }}>
                  Reviews are moderated and must comply with our community guidelines.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <button
                    onClick={handleClose}
                    style={{ padding: '9px 20px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      padding: '9px 24px', borderRadius: '10px', border: 'none',
                      background: submitting ? '#FDE68A' : 'linear-gradient(135deg, #F59E0B, #EA580C)',
                      color: '#fff', fontWeight: 700, fontSize: '13px', cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s', fontFamily: 'inherit', minWidth: '120px',
                      boxShadow: submitting ? 'none' : '0 4px 12px rgba(245,158,11,0.3)',
                    }}
                  >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

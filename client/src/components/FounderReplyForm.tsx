/**
 * FounderReplyForm — Inline reply form for founders to respond to reviews
 *
 * Shows below a review when the authenticated user is the tool's founder.
 * Collapsible: starts as a "Reply" button, expands to a text area.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  reviewId: string;
  toolName: string;
  onReplySubmitted?: (reviewId: string, body: string) => void;
}

export default function FounderReplyForm({ reviewId, toolName, onReplySubmitted }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error('Please write a reply before submitting');
      return;
    }
    if (trimmed.length < 10) {
      toast.error('Reply must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setExpanded(false);
      setBody('');
      toast.success('Reply posted successfully!');
      onReplySubmitted?.(reviewId, trimmed);
    }, 800);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', fontWeight: 600, color: '#B45309',
          background: 'none', border: '1px solid #FDE68A',
          padding: '5px 12px', borderRadius: '8px',
          cursor: 'pointer', transition: 'all 0.15s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <MessageSquare style={{ width: '12px', height: '12px' }} />
        Reply as Founder
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          marginTop: '12px',
          padding: '16px 18px',
          borderRadius: '12px',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderLeft: '3px solid #F59E0B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare style={{ width: '13px', height: '13px', color: '#B45309' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309' }}>Reply as {toolName} Founder</span>
          </div>
          <button
            onClick={() => { setExpanded(false); setBody(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px', display: 'flex' }}
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Thank the reviewer, address their feedback, or share an update..."
          rows={3}
          maxLength={1000}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: '10px',
            border: '1.5px solid #FDE68A', fontSize: '13px', color: '#171717',
            outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
            resize: 'vertical', boxSizing: 'border-box',
            background: '#FFFFFF',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#F59E0B')}
          onBlur={e => (e.currentTarget.style.borderColor = '#FDE68A')}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontSize: '11px', color: '#92400E' }}>{body.length}/1000</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setExpanded(false); setBody(''); }}
              style={{
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid #FDE68A', background: '#FFFFFF',
                color: '#92400E', fontWeight: 600, fontSize: '12px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '8px',
                border: 'none', background: '#F59E0B',
                color: '#0A0A0A', fontWeight: 700, fontSize: '12px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: submitting ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <Send style={{ width: '12px', height: '12px' }} />
              {submitting ? 'Posting…' : 'Post Reply'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

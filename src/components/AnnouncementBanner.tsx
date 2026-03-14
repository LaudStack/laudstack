"use client";

/**
 * AnnouncementBanner — LaudStack
 * Global announcement bar that sits above the Navbar on every page.
 * Dark background with amber accent. Dismissible per session.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  if (!visible) return null;

  return (
    <div style={{ background: '#171717', borderBottom: '1px solid rgba(245,158,11,0.25)' }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-3 min-h-[38px] py-1.5">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 justify-center min-w-0">
          <span className="text-xs sm:text-sm shrink-0">🎉</span>
          <p className="text-[11px] sm:text-[13px] text-slate-300 font-medium m-0 truncate sm:whitespace-normal">
            <strong className="text-amber-400 font-bold">New stacks</strong> added this month
            <button
              onClick={() => router.push('/tools')}
              className="ml-1.5 sm:ml-2.5 text-[11px] sm:text-xs font-bold text-amber-400 bg-transparent border-none cursor-pointer underline underline-offset-2 p-0 hover:text-amber-300 transition-colors"
            >
              Browse →
            </button>
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
          className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

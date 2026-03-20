'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  /* ── Scroll-to-top on route change ────────────────────────────── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  /* ── Show/hide button based on scroll position ────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 group flex items-center justify-center w-12 h-12 rounded-full bg-[#1E3A5F] text-white shadow-lg cursor-pointer transition-all duration-300 ease-out hover:bg-amber-600 hover:shadow-xl active:scale-95"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
    </button>
  );
}

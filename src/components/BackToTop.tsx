'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 800px (roughly past Browse by Category header)
      setVisible(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg cursor-pointer transition-all duration-300 ease-out hover:bg-gray-50 hover:text-amber-600 hover:border-amber-300 hover:shadow-xl active:scale-95"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
    </button>
  );
}

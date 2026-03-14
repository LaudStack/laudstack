"use client";

import Link from 'next/link';
import { Home, Search, ArrowRight, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const QUICK_LINKS = [
  { label: 'Browse All Products', href: '/tools', icon: Compass },
  { label: 'Launch Leaderboard', href: '/launches', icon: ArrowRight },
  { label: 'Launch Your Tool', href: '/launchpad', icon: ArrowRight },
  { label: 'Contact Us', href: '/contact', icon: ArrowRight },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="mt-[72px] flex-1 flex flex-col items-center justify-center px-4 py-20">

        {/* 404 graphic */}
        <div className="relative mb-8 select-none">
          <div className="text-[120px] font-black text-slate-800 leading-none tracking-tighter">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl px-6 py-3">
              <span className="text-amber-400 font-bold text-lg tracking-wide">Page Not Found</span>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-center text-base max-w-md leading-relaxed mb-10 font-medium">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Primary CTA */}
        <Link href="/">
          <div className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer mb-10 text-sm">
            <Home className="w-4 h-4" />
            Back to LaudStack
          </div>
        </Link>

        {/* Quick links */}
        <div className="w-full max-w-sm">
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest text-center mb-4">Or explore</p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href}>
                <div className="flex items-center gap-2 bg-gray-100/60 hover:bg-gray-200/60 border border-gray-300/60 hover:border-amber-500/30 rounded-xl px-4 py-3 cursor-pointer transition-all group">
                  <Icon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-600 group-hover:text-slate-900 text-xs font-semibold leading-tight">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search hint */}
        <div className="mt-10 flex items-center gap-2 text-slate-600 text-sm">
          <Search className="w-4 h-4" />
          <span>Try searching with <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-xs font-mono text-slate-500">⌘K</kbd></span>
        </div>
      </div>
      <Footer />
    </div>
  );
}

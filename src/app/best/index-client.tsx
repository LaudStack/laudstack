"use client";
import Link from "next/link";
import { ArrowRight, Sparkles, Award } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Collection {
  slug: string;
  title: string;
  description: string;
  count: number;
}

export default function BestToolsIndexClient({
  collections,
}: {
  collections: Collection[];
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ══════════ UNIFIED HERO — premium background ══════════ */}
      <section className="relative border-b border-slate-200 pt-[60px] lg:pt-[64px] overflow-hidden" style={{ background: '#F8FAFC' }}>
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', opacity: 0.35, pointerEvents: 'none' }} />
        <div aria-hidden className="absolute" style={{ top: '-20%', right: '-5%', width: '500px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div aria-hidden className="absolute left-0 top-0 bottom-0" style={{ width: '3px', background: '#D97706' }} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-[30px] pb-[26px] relative z-[1]">
          {/* Breadcrumb */}
          <Breadcrumbs items={[{ label: 'Best Stacks' }]} className="mb-3 sm:mb-4" />

          {/* Title row */}
          <div className="flex flex-col items-center text-center mb-2">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Award className="w-3 h-3" />
                Curated Collections
              </span>
            </div>
            <h1 className="font-['Inter',system-ui,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-slate-900 tracking-tight leading-tight m-0">
              Best AI &amp; SaaS Tools
            </h1>
            <p className="text-[15px] text-slate-600 font-normal mt-2 leading-relaxed max-w-[540px]">
              Curated collections of the best tools, ranked by reviews and Lauds.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ COLLECTION GRID ══════════ */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/best/${c.slug}`}
              className="flex flex-col p-6 bg-slate-50 rounded-2xl border border-slate-200 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-300 group"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  {c.count} tools
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5 leading-snug">
                {c.title}
              </h3>
              <p className="text-[13px] text-slate-600 leading-snug flex-1 line-clamp-2">
                {c.description}
              </p>
              <div className="flex items-center gap-1 mt-3.5 text-[13px] font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                Browse collection
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

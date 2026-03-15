"use client";
import Link from "next/link";
import { ArrowRight, Sparkles, Award } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* ══════════ UNIFIED HERO — matches /categories pattern ══════════ */}
      <section className="bg-white border-b border-gray-200 pt-[84px] pb-6">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-5">
            <Link
              href="/"
              className="text-xs text-slate-400 no-underline font-medium hover:text-slate-600 transition-colors"
            >
              Home
            </Link>
            <span className="text-[11px] text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-semibold">
              Best Stacks
            </span>
          </nav>

          {/* Title row */}
          <div className="flex items-start justify-between gap-6 flex-wrap mb-2">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Award className="w-3 h-3" />
                  Curated Collections
                </span>
              </div>
              <h1 className="font-['Inter',system-ui,sans-serif] text-[clamp(24px,3vw,30px)] font-black text-gray-900 tracking-tight leading-tight m-0">
                Best AI &amp; SaaS Tools
              </h1>
              <p className="text-[15px] text-slate-500 font-normal mt-2 leading-relaxed max-w-xl">
                Browse curated collections of the best tools for every use case,
                ranked by community reviews and Laud votes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ COLLECTION GRID ══════════ */}
      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/best/${c.slug}`}
              className="flex flex-col p-6 bg-white rounded-2xl border border-slate-200 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-300 group"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  {c.count} tools
                </span>
              </div>
              <h3 className="text-base font-extrabold text-gray-900 mb-1.5 leading-snug">
                {c.title}
              </h3>
              <p className="text-[13px] text-gray-500 leading-snug flex-1 line-clamp-2">
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

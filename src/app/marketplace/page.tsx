"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, Star, Eye, Package, Code, Layers, Globe, BarChart3,
  Zap, Rocket, Sparkles, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Loader2, Crown, TrendingUp, ShoppingCart, ArrowRight, Store, Tag,
  Cpu, Wrench, FileText, X, SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { browseProducts, getFeaturedProducts } from "@/app/actions/marketplace";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All Products", icon: Layers },
  { id: "templates", label: "Templates", icon: Code },
  { id: "saas_boilerplates", label: "SaaS Boilerplates", icon: Rocket },
  { id: "micro_saas", label: "Micro-SaaS", icon: Zap },
  { id: "full_apps", label: "Full Apps", icon: Globe },
  { id: "automation_tools", label: "Automation Tools", icon: Wrench },
  { id: "startup_assets", label: "Startup Assets", icon: FileText },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "top_rated", label: "Highest Rated" },
  { value: "most_sales", label: "Most Sales" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
];

const PRICE_FILTERS = [
  { value: "all", label: "All Prices" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const p = product.product || product;
  const creator = product.creator;

  return (
    <Link href={`/marketplace/${p.slug}`} className="group block">
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[16/10] bg-slate-50 overflow-hidden">
          {p.previewImageUrl ? (
            <img src={p.previewImageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {p.isFeatured && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wide flex items-center gap-1">
                <Crown className="w-3 h-3" /> Spotlight
              </span>
            )}
            {p.isBoosted && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wide flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Boosted
              </span>
            )}
            {p.offersEnabled && (
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wide">
                Offers OK
              </span>
            )}
          </div>

          {/* Price tag */}
          <div className="absolute bottom-3 right-3">
            {p.price === 0 ? (
              <span className="px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-lg">Free</span>
            ) : (
              <span className="px-2.5 py-1 bg-slate-50/95 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-lg shadow-sm border border-slate-200">
                ${(p.price / 100).toFixed(0)}
                {p.compareAtPrice && p.compareAtPrice > p.price && (
                  <span className="ml-1 text-slate-500 line-through text-[10px]">${(p.compareAtPrice / 100).toFixed(0)}</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-amber-600 transition-colors line-clamp-1">{p.name}</h3>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{p.tagline}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {p.averageRating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-slate-600 font-medium">{p.averageRating.toFixed(1)}</span>
                  <span>({p.reviewCount})</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" /> {p.salesCount}
              </span>
            </div>

            {creator && (
              <div className="flex items-center gap-1.5">
                {creator.avatarUrl ? (
                  <img src={creator.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                    {(creator.name || "?")[0]}
                  </div>
                )}
                <span className="text-[11px] text-slate-500 truncate max-w-[80px]">{creator.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Featured Section ─────────────────────────────────────────────────────────
function FeaturedSection({ products }: { products: any[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <Crown className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Spotlight Products</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map((p: any) => (
          <ProductCard key={p.product?.id || p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MarketplaceBrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL
  const [category, setCategory] = useState(searchParams?.get("category") || "all");
  const [search, setSearch] = useState(searchParams?.get("q") || "");
  const [searchInput, setSearchInput] = useState(searchParams?.get("q") || "");
  const [sort, setSort] = useState(searchParams?.get("sort") || "popular");
  const [priceFilter, setPriceFilter] = useState(searchParams?.get("price") || "all");
  const [page, setPage] = useState(parseInt(searchParams?.get("page") || "1", 10));

  // Data
  const [products, setProducts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const LIMIT = 24;
  const totalPages = Math.ceil(total / LIMIT);

  // Fetch featured products once
  useEffect(() => {
    getFeaturedProducts(4).then(res => {
      if (res.success) setFeatured(res.products || []);
      setFeaturedLoading(false);
    });
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await browseProducts({
      category: category === "all" ? undefined : category,
      search: search || undefined,
      sort: sort as any,
      priceFilter: priceFilter as any,
      page,
      limit: LIMIT,
    });
    if (res.success) {
      setProducts(res.products || []);
      setTotal(res.total || 0);
    }
    setLoading(false);
  }, [category, search, sort, priceFilter, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("q", search);
    if (sort !== "popular") params.set("sort", sort);
    if (priceFilter !== "all") params.set("price", priceFilter);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(`/marketplace${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [category, search, sort, priceFilter, page, router]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <PageHero
        eyebrow="Marketplace"
        title="Digital products for builders"
        subtitle="Templates, boilerplates, micro-SaaS, full apps, and startup assets — built by creators, vetted by the community."
        accent="amber"
        size="md"
        layout="centered"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Marketplace" },
        ]}
        actions={
          <Link
            href="/marketplace/creator/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-sm"
          >
            <Store className="w-4 h-4" /> Become a Creator
          </Link>
        }
      />

      {/* ── Sticky Filter Bar (matching /trending design) ──────────────── */}
      <div
        className="sticky top-[56px] sm:top-[64px] z-20"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6">
          <div className="flex items-center gap-2.5 py-3 sm:py-3.5 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white rounded-xl flex-1 min-w-0 sm:min-w-[140px] max-w-[320px]" style={{ border: "1.5px solid #E2E8F0" }}>
              <span className="pl-3 flex items-center shrink-0"><Search className="w-3.5 h-3.5 text-slate-500" /></span>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search products…"
                className="flex-1 border-none outline-none text-[13px] text-slate-900 bg-transparent font-medium placeholder:text-slate-500 py-[8px] pr-3 min-w-0"
                style={{ paddingLeft: "4px" }}
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                  className="pr-3 bg-transparent border-none cursor-pointer p-0 text-slate-500 flex hover:text-slate-600 transition-colors"
                >
                  <X className="w-[13px] h-[13px]" />
                </button>
              )}
            </div>

            {/* Product category dropdown */}
            <div className="flex items-center bg-white rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              <select
                value={category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="px-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Sort select */}
            <div className="flex items-center gap-1.5 bg-white rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              <span className="pl-3 flex items-center"><SlidersHorizontal className="w-[13px] h-[13px] text-slate-500" /></span>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="pr-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                style={{ paddingLeft: "4px" }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Price filter */}
            <div className="flex items-center bg-white rounded-xl overflow-hidden" style={{ border: "1.5px solid #E2E8F0" }}>
              <select
                value={priceFilter}
                onChange={e => { setPriceFilter(e.target.value); setPage(1); }}
                className="px-3 py-[8px] text-[13px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              >
                {PRICE_FILTERS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Result count */}
            <span className="text-[12px] text-slate-500 font-medium ml-auto whitespace-nowrap">
              {loading
                ? "Loading…"
                : <><span className="text-slate-900 font-extrabold">{total}</span> product{total !== 1 ? "s" : ""}</>}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Featured */}
          {!featuredLoading && <FeaturedSection products={featured} />}

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-slate-600 text-sm">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No products found</h3>
              <p className="text-sm text-slate-600 max-w-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} products
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {products.map((p: any) => (
                  <ProductCard key={p.product?.id || p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium ${
                          page === pageNum
                            ? "bg-amber-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

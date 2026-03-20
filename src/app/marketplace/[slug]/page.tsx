"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Star, ShoppingCart, Eye, Package, Code, ExternalLink, Download,
  Loader2, Crown, TrendingUp, ArrowLeft, ChevronLeft, ChevronRight,
  CheckCircle, Shield, Users, Clock, Tag, Layers, MessageSquare,
  DollarSign, Send, Zap, Globe, Wrench, FileText, Rocket, X,
  Heart, Share2, Copy, Check
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  getProductBySlug,
  hasUserPurchased,
  getProductReviews,
  submitOffer,
  submitReview,
} from "@/app/actions/marketplace";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  templates: "Templates",
  saas_boilerplates: "SaaS Boilerplates",
  micro_saas: "Micro-SaaS",
  full_apps: "Full Apps",
  automation_tools: "Automation Tools",
  startup_assets: "Startup Assets",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  templates: Code,
  saas_boilerplates: Rocket,
  micro_saas: Zap,
  full_apps: Globe,
  automation_tools: Wrench,
  startup_assets: FileText,
};

// ─── Make Offer Modal ─────────────────────────────────────────────────────────
function MakeOfferModal({
  product,
  onClose,
  onSubmit,
}: {
  product: any;
  onClose: () => void;
  onSubmit: (amount: number, message?: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const minPercent = product.minimumOfferPercent || 60;
  const minAmount = Math.ceil(product.price * (minPercent / 100));
  const amountCents = Math.round(parseFloat(amount || "0") * 100);
  const isValid = amountCents >= minAmount && amountCents > 0;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error(`Minimum offer is $${(minAmount / 100).toFixed(2)} (${minPercent}% of listing price)`);
      return;
    }
    setSubmitting(true);
    await onSubmit(amountCents, message.trim() || undefined);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Make an Offer</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            {product.previewImageUrl ? (
              <img src={product.previewImageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-500" />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
              <p className="text-xs text-slate-500">Listed at <strong>${(product.price / 100).toFixed(2)}</strong></p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Offer (USD) <span className="text-slate-600 font-normal">— min ${(minAmount / 100).toFixed(2)}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={(minAmount / 100).toFixed(2)}
                min="0"
                step="0.01"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
              />
            </div>
            {amountCents > 0 && amountCents < minAmount && (
              <p className="text-xs text-red-500 mt-1">Minimum offer is ${(minAmount / 100).toFixed(2)} ({minPercent}% of listing price)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell the creator why you're interested..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
            />
          </div>

          <p className="text-xs text-slate-500">
            Offers expire in 72 hours. The creator can accept, reject, or counter your offer. If accepted, you&apos;ll be notified to complete payment.
          </p>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex-1 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Offer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ item }: { item: any }) {
  const r = item.review || item;
  const u = item.user || {};
  const name = u.name || r.reviewerName || "User";
  const avatar = u.avatarUrl || r.reviewerAvatar;
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        {avatar ? (
          <img src={avatar} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
            {name[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900 text-sm">{name}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
              ))}
            </div>
            <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          {r.title && <p className="font-medium text-slate-800 text-sm mb-1">{r.title}</p>}
          <p className="text-sm text-slate-600">{r.body}</p>
          {r.creatorReply && (
            <div className="mt-3 pl-3 border-l-2 border-amber-300">
              <p className="text-xs text-amber-700 font-medium mb-0.5">Creator Reply</p>
              <p className="text-sm text-slate-600">{r.creatorReply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Write Review Form ───────────────────────────────────────────────────────
function WriteReviewForm({ productId, onReviewSubmitted }: { productId: number; onReviewSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (!title.trim()) { toast.error("Please add a review title"); return; }
    if (!body.trim()) { toast.error("Please write your review"); return; }
    setSubmitting(true);
    try {
      const res = await submitReview({ productId, rating, title: title.trim(), body: body.trim() });
      if (res.success) {
        toast.success("Review submitted! Thank you for your feedback.");
        setSubmitted(true);
        onReviewSubmitted();
      } else if (res.error === "EMAIL_NOT_VERIFIED") {
        toast.error("Please verify your email before leaving a review. Go to your profile settings to verify.");
      } else {
        toast.error(res.error || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-green-700">Your review has been published. Thank you!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Write a Review</h3>
      {/* Star rating */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs text-slate-500 mr-2">Rating:</span>
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star className={`w-5 h-5 transition-colors ${
              i <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }`} />
          </button>
        ))}
        {rating > 0 && <span className="text-xs text-slate-500 ml-1">{rating}/5</span>}
      </div>
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Review title (e.g., Great boilerplate for SaaS)"
        maxLength={256}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 mb-3"
      />
      {/* Body */}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Share your experience with this product. What did you like? Any downsides?"
        rows={4}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 mb-3 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="px-5 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit Review
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [buying, setBuying] = useState(false);
  const [screenshotIdx, setScreenshotIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fetch product
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug).then(res => {
      if (res.success && 'product' in res) {
        setProduct(res.product);
        setCreator(res.creator);
      }
      setLoading(false);
    });
  }, [slug]);

  // Check if purchased
  useEffect(() => {
    if (!product || !user) return;
    hasUserPurchased(product.id).then(res => {
      if (res.success) setPurchased(res.purchased || false);
    });
  }, [product, user]);

  // Fetch reviews
  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    getProductReviews(product.id, reviewsPage).then(res => {
      if (res.success) {
        setReviews(res.reviews || []);
        setReviewsTotal(res.total || 0);
      }
      setReviewsLoading(false);
    });
  }, [product, reviewsPage]);

  const handleBuyNow = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setBuying(true);
    try {
      const res = await fetch("/api/stripe/marketplace-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } catch {
      toast.error("Failed to start checkout");
    }
    setBuying(false);
  };

  const handleSubmitOffer = async (amountCents: number, message?: string) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const res = await submitOffer({
      productId: product.id,
      offerAmountCents: amountCents,
      message,
    });
    if (res.success) {
      toast.success("Offer submitted! The creator will be notified.");
      setShowOfferModal(false);
    } else {
      toast.error(res.error || "Failed to submit offer");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div style={{ height: "72px" }} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Product not found</h2>
            <p className="text-slate-500 mb-6">This product may have been removed or doesn&apos;t exist.</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Marketplace
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const screenshots = product.screenshots || [];
  const techStack = product.techStack || [];
  const includes = product.includes || [];
  const features = product.features || [];
  const tags = product.tags || [];
  const CatIcon = CATEGORY_ICONS[product.category] || Package;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div style={{ height: "72px", flexShrink: 0 }} />

      <main className="flex-1 py-8 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/marketplace" className="hover:text-slate-600">Marketplace</Link>
            <span>/</span>
            <Link href={`/marketplace?category=${product.category}`} className="hover:text-slate-600">
              {CATEGORY_LABELS[product.category] || product.category}
            </Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-[200px]">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ─── Left Column: Product Info ─── */}
            <div className="lg:col-span-2">
              {/* Hero Image / Screenshots */}
              {(product.previewImageUrl || screenshots.length > 0) && (
                <div className="mb-6">
                  <div className="relative aspect-[16/9] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={screenshots.length > 0 ? screenshots[screenshotIdx] : product.previewImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {screenshots.length > 1 && (
                      <>
                        <button
                          onClick={() => setScreenshotIdx(i => (i - 1 + screenshots.length) % screenshots.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => setScreenshotIdx(i => (i + 1) % screenshots.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {screenshots.map((_: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => setScreenshotIdx(i)}
                              className={`w-2 h-2 rounded-full transition-colors ${i === screenshotIdx ? "bg-white" : "bg-white/50"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {screenshots.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {screenshots.map((url: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setScreenshotIdx(i)}
                          className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                            i === screenshotIdx ? "border-amber-500" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Meta */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                    <CatIcon className="w-3 h-3" />
                    {CATEGORY_LABELS[product.category]}
                  </span>
                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-amber-200">
                      <Crown className="w-3 h-3" /> Spotlight
                    </span>
                  )}
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
                <p className="text-slate-600 text-base">{product.tagline}</p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200">
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{product.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-slate-600">({product.reviewCount} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{product.salesCount} sales</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Eye className="w-4 h-4" />
                  <span>{product.viewCount} views</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
                <div className="prose prose-slate prose-sm max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{product.longDescription || product.description}</p>
                </div>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((f: any, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{f.title}</p>
                          {f.description && <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Included */}
              {includes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">What&apos;s Included</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {includes.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {techStack.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Reviews ({reviewsTotal})</h2>
                </div>
                {/* Write Review Form — only for purchasers */}
                {purchased && user && (
                  <WriteReviewForm
                    productId={product.id}
                    onReviewSubmitted={() => {
                      setReviewsPage(1);
                      // Re-fetch reviews
                      getProductReviews(product.id, 1).then(res => {
                        if (res.success) {
                          setReviews(res.reviews || []);
                          setReviewsTotal(res.total || 0);
                        }
                      });
                    }}
                  />
                )}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No reviews yet. Be the first to review this product.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r: any) => (
                      <ReviewCard key={r.review?.id || r.id} item={r} />
                    ))}
                    {reviewsTotal > 10 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <button onClick={() => setReviewsPage(p => Math.max(1, p - 1))} disabled={reviewsPage === 1} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm disabled:opacity-50">Previous</button>
                        <span className="px-3 py-1.5 text-sm text-slate-600">Page {reviewsPage}</span>
                        <button onClick={() => setReviewsPage(p => p + 1)} disabled={reviews.length < 10} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm disabled:opacity-50">Next</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Right Column: Purchase Sidebar ─── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Purchase Card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-4">
                  {/* Price */}
                  <div className="mb-4">
                    {product.price === 0 ? (
                      <p className="text-3xl font-bold text-green-600">Free</p>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-slate-900">${(product.price / 100).toFixed(2)}</p>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <p className="text-lg text-slate-500 line-through">${(product.compareAtPrice / 100).toFixed(2)}</p>
                        )}
                      </div>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                      </p>
                    )}
                  </div>

                  {/* Buy / Purchased */}
                  {purchased ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-green-700">You own this product</p>
                      {product.downloadFileKey && (
                        <button className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                          <Download className="w-4 h-4" /> Download
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleBuyNow}
                        disabled={buying}
                        className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
                      >
                        {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                        {product.price === 0 ? "Get for Free" : "Buy Now"}
                      </button>

                      {product.offersEnabled && (
                        <button
                          onClick={() => user ? setShowOfferModal(true) : router.push("/auth/login")}
                          className="w-full py-3 bg-slate-50 border-2 border-amber-500 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors text-sm flex items-center justify-center gap-2 mb-3"
                        >
                          <MessageSquare className="w-4 h-4" /> Make an Offer
                        </button>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {product.demoUrl && (
                      <a
                        href={product.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Demo
                      </a>
                    )}
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 flex items-center justify-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Share"}
                    </button>
                  </div>

                  {/* Trust signals */}
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Shield className="w-3.5 h-3.5 text-green-500" />
                      Secure checkout via Stripe
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Download className="w-3.5 h-3.5 text-blue-500" />
                      Instant digital delivery
                    </div>
                    {product.offersEnabled && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                        Negotiable — make an offer
                      </div>
                    )}
                  </div>
                </div>

                {/* Creator Card */}
                {creator && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">Created by</p>
                    <Link href={`/profile/${creator.id}`} className="flex items-center gap-3 group">
                      {creator.avatarUrl ? (
                        <img src={creator.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                          {(creator.name || "?")[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">{creator.name}</p>
                        {creator.headline && <p className="text-xs text-slate-500 truncate max-w-[180px]">{creator.headline}</p>}
                      </div>
                    </Link>
                  </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag: string, i: number) => (
                        <Link
                          key={i}
                          href={`/marketplace?q=${encodeURIComponent(tag)}`}
                          className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg hover:bg-slate-200 hover:text-slate-600 transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Make Offer Modal */}
      {showOfferModal && (
        <MakeOfferModal
          product={product}
          onClose={() => setShowOfferModal(false)}
          onSubmit={handleSubmitOffer}
        />
      )}
    </div>
  );
}

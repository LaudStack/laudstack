"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Download, ArrowRight, Package } from "lucide-react";

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const productSlug = searchParams?.get("product") ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div style={{ height: "72px", flexShrink: 0 }} />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-8">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Purchase Complete!
          </h1>
          <p className="text-base text-slate-500 mb-8 leading-relaxed">
            Thank you for your purchase. Your order has been confirmed and you can now access your product.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard?tab=purchases"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              View My Purchases
            </Link>

            {productSlug && (
              <Link
                href={`/marketplace/${productSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                <Package className="w-4 h-4" />
                View Product
              </Link>
            )}

            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 text-slate-500 font-semibold text-sm hover:text-slate-700 transition-colors"
            >
              Browse More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Info box */}
          <div className="mt-10 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
            <p className="text-sm text-slate-600">
              <strong className="text-slate-800">What&apos;s next?</strong> Visit your{" "}
              <Link href="/dashboard?tab=purchases" className="text-amber-600 font-semibold hover:underline">
                Purchases tab
              </Link>{" "}
              in your dashboard to download files, leave a review, or contact the creator.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

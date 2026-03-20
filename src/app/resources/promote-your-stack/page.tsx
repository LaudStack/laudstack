import type { Metadata } from "next";
import Link from "next/link";
import {
  Megaphone, CheckCircle2, ArrowRight, Zap, Star,
  BarChart3, Eye, TrendingUp, Shield, Clock,
  DollarSign, Target, Award, Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Promote Your Product on LaudStack | Promotion Guide",
  description:
    "Explore promotion options on LaudStack to boost your product's visibility. Featured placements, deal listings, and strategic promotion strategies for AI and SaaS founders.",
  openGraph: {
    title: "Promote Your Product on LaudStack",
    description: "Boost your product's visibility with LaudStack's promotion options.",
  },
};

const PROMOTION_OPTIONS = [
  {
    name: "Featured Placement",
    icon: Sparkles,
    description: "Get your product highlighted in the Featured section on the homepage and category pages. Featured products receive significantly more views and clicks.",
    benefits: [
      "Prominent placement on homepage and category pages",
      "Featured badge on your product card",
      "Priority positioning in search results",
      "Increased credibility and trust signals",
    ],
    plans: [
      { name: "Boost", duration: "30 days", price: "$149" },
      { name: "Spotlight", duration: "90 days", price: "$349" },
      { name: "Dominate", duration: "180 days", price: "$699" },
    ],
    cta: "Get Featured",
    ctaHref: "/dashboard/founder?tab=promote",
  },
  {
    name: "Deal Listing",
    icon: DollarSign,
    description: "List a special deal or discount on the Deals page to attract price-conscious users. Deal listings drive high-intent traffic from users actively looking for software deals.",
    benefits: [
      "Dedicated placement on the Deals page",
      "Deal badge visible across the platform",
      "Attracts high-intent, ready-to-buy users",
      "Great for launches, seasonal offers, and lifetime deals",
    ],
    plans: [
      { name: "Standard", duration: "30 days", price: "$99" },
      { name: "Premium", duration: "90 days", price: "$249" },
      { name: "Featured Deal", duration: "90 days", price: "$449" },
    ],
    cta: "List a Deal",
    ctaHref: "/dashboard/founder?tab=deals",
  },
];

const BEST_PRACTICES = [
  {
    icon: Target,
    title: "Time Your Promotions Strategically",
    description: "Run promotions during high-traffic periods — product launches, feature releases, or seasonal buying cycles. Avoid running promotions when your listing isn't fully optimized.",
  },
  {
    icon: BarChart3,
    title: "Track and Measure ROI",
    description: "Use your Founder Dashboard analytics to track views, clicks, and engagement during your promotion period. Compare metrics before and after to measure impact.",
  },
  {
    icon: Star,
    title: "Combine With Reviews",
    description: "Promotions work best when paired with strong social proof. Aim for 5+ reviews before running a featured placement to maximize conversion.",
  },
  {
    icon: Eye,
    title: "Optimize Before Promoting",
    description: "Ensure your listing is fully optimized before spending on promotion. A polished description, professional screenshots, and accurate pricing will maximize your promotion's effectiveness.",
  },
  {
    icon: Clock,
    title: "Plan for Duration",
    description: "Longer promotion periods provide more consistent visibility and better ROI. The 90-day Spotlight plan typically delivers the best balance of cost and impact.",
  },
  {
    icon: Shield,
    title: "Maintain Quality",
    description: "Promoted products are held to the same quality standards. Ensure your product delivers on its promises — promoted listings with poor reviews can hurt more than help.",
  },
];

const FAQ = [
  {
    q: "How quickly does a featured placement go live?",
    a: "Featured placements are activated immediately after payment confirmation. Your product will appear in the Featured section within minutes.",
  },
  {
    q: "Can I cancel or change my promotion?",
    a: "Promotions are one-time payments for a fixed duration. They cannot be cancelled or refunded, but you can upgrade to a longer plan at any time.",
  },
  {
    q: "Do promotions affect my organic ranking?",
    a: "Promotions boost your visibility through dedicated placements but do not directly affect your organic search ranking. However, the increased traffic and engagement from promotions can indirectly improve your organic position.",
  },
  {
    q: "Can I run multiple promotions at the same time?",
    a: "Yes, you can have both a featured placement and a deal listing active simultaneously. This combination provides maximum visibility across different sections of the platform.",
  },
  {
    q: "What metrics can I track during my promotion?",
    a: "Your Founder Dashboard provides real-time analytics including views, outbound clicks, review activity, and laud counts. You can compare these metrics across different time periods.",
  },
];

export default function PromoteYourStackPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 pt-[60px] lg:pt-[64px]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full mb-6">
            <Megaphone className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Founder Resource</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Promote Your Product<br className="hidden sm:block" /> on LaudStack
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-[640px] mx-auto leading-relaxed">
            Boost your product&apos;s visibility with targeted promotions. Featured placements, deal listings, and strategies to maximize your reach.
          </p>
        </div>
      </section>

      {/* Promotion Options */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-10 text-center">
          Promotion Options
        </h2>

        <div className="flex flex-col gap-8">
          {PROMOTION_OPTIONS.map(({ name, icon: Icon, description, benefits, plans, cta, ctaHref }) => (
            <div key={name} className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{name}</h3>
              </div>
              <div className="px-5 sm:px-6 py-5">
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">{description}</p>

                {/* Benefits */}
                <div className="mb-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Benefits</div>
                  <ul className="space-y-2">
                    {benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {plans.map(({ name: planName, duration, price }) => (
                    <div key={planName} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                      <div className="text-sm font-bold text-slate-900 mb-1">{planName}</div>
                      <div className="text-2xl font-black text-slate-900">{price}</div>
                      <div className="text-xs text-slate-500 mt-1">{duration}</div>
                    </div>
                  ))}
                </div>

                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors no-underline"
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 text-center">
            Promotion Best Practices
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BEST_PRACTICES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <Icon className="w-5 h-5 text-amber-500 mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4 max-w-[700px] mx-auto">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="border border-slate-200 rounded-xl p-5">
              <h3 className="text-base font-bold text-slate-900 mb-2">{q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-amber-600">Boost your visibility</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Ready to Promote Your Product?
          </h2>
          <p className="text-base text-slate-600 max-w-[500px] mx-auto mb-6">
            Choose a promotion plan from your Founder Dashboard and start reaching more users today.
          </p>
          <Link
            href="/dashboard/founder?tab=promote"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Eye, CheckCircle2, ArrowRight, TrendingUp, Star,
  BarChart3, Users, MessageSquare, Zap, Share2,
  Globe, Megaphone, RefreshCw, Award
} from "lucide-react";

export const metadata: Metadata = {
  title: "Grow Your Product Visibility | LaudStack Resources",
  description:
    "Proven strategies to increase your product's visibility on LaudStack. Learn how to climb rankings, earn more reviews, and drive consistent traffic to your listing.",
  openGraph: {
    title: "Grow Your Product Visibility on LaudStack",
    description: "Strategies to increase your product's discoverability and engagement.",
  },
};

const STRATEGIES = [
  {
    icon: Star,
    title: "Build a Strong Review Profile",
    description: "Reviews are the single most powerful driver of organic visibility on LaudStack. Products with 10+ verified reviews appear higher in search results and category pages.",
    actions: [
      "Add a 'Review us on LaudStack' link to your product's onboarding flow",
      "Send a review request email to users after 30 days of active use",
      "Respond to every review within 24 hours to show you're engaged",
      "Feature your LaudStack rating badge on your website",
    ],
    impact: "High",
  },
  {
    icon: RefreshCw,
    title: "Keep Your Listing Fresh",
    description: "Products that update their listings regularly signal active development and earn more trust. Update your listing whenever you ship a major feature, change pricing, or reach a milestone.",
    actions: [
      "Update your description when you launch new features",
      "Refresh screenshots to show your latest UI",
      "Add new tags as your product expands into new use cases",
      "Update your pricing information promptly when it changes",
    ],
    impact: "Medium",
  },
  {
    icon: Share2,
    title: "Leverage External Traffic",
    description: "Drive traffic from your own channels to your LaudStack listing. External traffic signals relevance and can boost your ranking in search and category pages.",
    actions: [
      "Link to your LaudStack listing from your website footer",
      "Share your listing in relevant online communities and forums",
      "Include your LaudStack URL in your email signature",
      "Mention your LaudStack presence in press releases and blog posts",
    ],
    impact: "Medium",
  },
  {
    icon: MessageSquare,
    title: "Engage With the Community",
    description: "Active founders who participate in the LaudStack community build stronger brand presence. Engage with discussions, help other founders, and contribute to community voting.",
    actions: [
      "Participate in community discussions related to your category",
      "Vote on and review complementary products in your space",
      "Share insights and tips that help other founders",
      "Respond to comparison requests involving your product",
    ],
    impact: "Medium",
  },
  {
    icon: Megaphone,
    title: "Run Strategic Promotions",
    description: "LaudStack offers several promotion options to accelerate visibility. From featured placements to deal listings, strategic promotions can significantly boost your product's reach.",
    actions: [
      "Consider a featured placement during your growth phase",
      "List a limited-time deal to attract new users",
      "Time promotions around product launches or major updates",
      "Track promotion ROI through your Founder Dashboard analytics",
    ],
    impact: "High",
  },
  {
    icon: Globe,
    title: "Optimize for Comparisons & Alternatives",
    description: "Many users discover products through comparison and alternatives pages. Make sure your product appears in relevant comparisons by maintaining an accurate and complete listing.",
    actions: [
      "Ensure your category and tags match your competitors' listings",
      "Highlight unique differentiators in your description",
      "Keep your feature list and pricing current for accurate comparisons",
      "Claim your product if it was added by the community",
    ],
    impact: "High",
  },
];

const TIMELINE = [
  { week: "Week 1–2", focus: "Launch & Initial Reviews", tasks: "Complete your listing, launch on LaunchPad, gather first 5 reviews" },
  { week: "Week 3–4", focus: "Build Social Proof", tasks: "Reach 10+ reviews, respond to all feedback, share listing externally" },
  { week: "Month 2", focus: "Optimize & Promote", tasks: "Update listing based on feedback, consider featured placement, run a deal" },
  { week: "Month 3+", focus: "Sustain & Scale", tasks: "Regular listing updates, ongoing review collection, community engagement" },
];

export default function GrowVisibilityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 pt-[60px] lg:pt-[64px]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full mb-6">
            <Eye className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Founder Resource</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Grow Your Product Visibility
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-[640px] mx-auto leading-relaxed">
            Proven strategies to climb rankings, earn more reviews, and drive consistent traffic to your listing on LaudStack.
          </p>
        </div>
      </section>

      {/* Strategies */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-10 text-center">
          6 Proven Growth Strategies
        </h2>

        <div className="flex flex-col gap-8">
          {STRATEGIES.map(({ icon: Icon, title, description, actions, impact }) => (
            <div key={title} className="border border-slate-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0 ${
                  impact === "High" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-600 border border-slate-200"
                }`}>
                  {impact} Impact
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">{description}</p>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Action Items</div>
                <ul className="space-y-2">
                  {actions.map((action) => (
                    <li key={action} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Growth Timeline */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 text-center">
            Recommended Growth Timeline
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            A realistic roadmap for building sustainable visibility.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIMELINE.map(({ week, focus, tasks }) => (
              <div key={week} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">{week}</div>
                <div className="text-base font-bold text-slate-900 mb-2">{focus}</div>
                <p className="text-sm text-slate-600 leading-snug">{tasks}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
          Start Growing Today
        </h2>
        <p className="text-base text-slate-600 max-w-[500px] mx-auto mb-6">
          Track your progress and manage your visibility from the Founder Dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/founder"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Open Founder Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/resources/promote-your-stack"
            className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Explore Promotions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

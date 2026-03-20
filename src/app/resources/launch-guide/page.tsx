import type { Metadata } from "next";
import Link from "next/link";
import {
  Rocket, CheckCircle2, ArrowRight, Target, Users,
  BarChart3, Star, Zap, Clock, FileText, Image as ImageIcon,
  MessageSquare, TrendingUp, Shield
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Launch Your Product on LaudStack | Launch Guide",
  description:
    "Step-by-step guide to launching your AI or SaaS product on LaudStack. Learn how to prepare your listing, maximize launch day impact, and build lasting visibility.",
  openGraph: {
    title: "How to Launch Your Product on LaudStack",
    description: "The complete guide to a successful product launch on LaudStack.",
  },
};

const LAUNCH_STEPS = [
  {
    step: 1,
    icon: FileText,
    title: "Prepare Your Listing",
    description:
      "Craft a compelling product description that clearly communicates your value proposition. Include your tagline, key features, pricing model, and the problem your product solves. First impressions matter — make every word count.",
    tips: [
      "Write a tagline under 60 characters that captures your core value",
      "List 3–5 key features with clear, benefit-driven language",
      "Be transparent about pricing — users trust honest listings",
      "Choose the most accurate category for better discoverability",
    ],
  },
  {
    step: 2,
    icon: ImageIcon,
    title: "Add High-Quality Media",
    description:
      "Upload a professional logo, product screenshots, and optionally a demo video. Visual assets are the first thing users see and significantly impact engagement rates.",
    tips: [
      "Use a square logo (512×512px minimum) with a transparent background",
      "Include 3–5 screenshots showing your product's key workflows",
      "Add a short demo video (60–90 seconds) for higher conversion",
      "Ensure all media is crisp and up-to-date",
    ],
  },
  {
    step: 3,
    icon: Target,
    title: "Choose Your Launch Day",
    description:
      "Timing matters. Schedule your launch for maximum visibility. Tuesday through Thursday typically see the highest engagement. Avoid holidays and major industry events that could overshadow your launch.",
    tips: [
      "Tuesday–Thursday launches tend to get the most traction",
      "Launch early in the day (9–10 AM EST) for full-day exposure",
      "Avoid launching on the same day as major industry events",
      "Consider scheduling an upcoming launch to build anticipation",
    ],
  },
  {
    step: 4,
    icon: Users,
    title: "Rally Your Community",
    description:
      "Share your launch with your existing audience — email subscribers, social followers, beta users, and supporters. The first few hours of engagement set the tone for your launch's success.",
    tips: [
      "Send a launch-day email to your subscriber list",
      "Share on Twitter/X, LinkedIn, and relevant communities",
      "Ask beta users to leave honest reviews on launch day",
      "Engage with every comment and review personally",
    ],
  },
  {
    step: 5,
    icon: MessageSquare,
    title: "Engage With Feedback",
    description:
      "Respond to every review and question. Founders who actively engage with the community build trust and credibility. Use feedback to improve your product and listing over time.",
    tips: [
      "Reply to reviews within 24 hours — speed shows you care",
      "Thank positive reviewers and address concerns constructively",
      "Use the Founder Dashboard to track and manage all feedback",
      "Update your listing based on common user questions",
    ],
  },
  {
    step: 6,
    icon: TrendingUp,
    title: "Sustain Momentum",
    description:
      "A successful launch is just the beginning. Continue building visibility through promotions, deals, and regular updates. Products that stay active on the platform consistently outperform one-time launches.",
    tips: [
      "Run a limited-time deal to attract new users post-launch",
      "Update your listing regularly with new features and milestones",
      "Consider a featured placement to boost ongoing visibility",
      "Track your analytics to understand what drives engagement",
    ],
  },
];

const QUICK_STATS = [
  { value: "42+", label: "Verified stacks listed" },
  { value: "15", label: "Stack categories" },
  { value: "Free", label: "To list your stack" },
  { value: "100%", label: "Verified reviews" },
];

export default function LaunchGuidePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 pt-[60px] lg:pt-[64px]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full mb-6">
            <Rocket className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Founder Resource</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            How to Launch Your Product<br className="hidden sm:block" /> on LaudStack
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-[640px] mx-auto leading-relaxed mb-8">
            Everything you need to know to prepare, launch, and grow your AI or SaaS product on LaudStack.
          </p>
          <Link
            href="/launchpad"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Go to LaunchPad <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b border-slate-200">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {QUICK_STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{value}</div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Launch Steps */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-10 text-center">
          6 Steps to a Successful Launch
        </h2>

        <div className="flex flex-col gap-10">
          {LAUNCH_STEPS.map(({ step, icon: Icon, title, description, tips }) => (
            <div key={step} className="flex gap-5 sm:gap-8">
              {/* Step number */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-black text-amber-600">{step}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">{description}</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pro Tips</div>
                  <ul className="space-y-2">
                    {tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why LaudStack */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 text-center">
            Why Founders Choose LaudStack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Verified Reviews", desc: "Build credibility with authentic, verified community reviews that users trust." },
              { icon: BarChart3, title: "Real Analytics", desc: "Track views, clicks, and engagement with your Founder Dashboard analytics." },
              { icon: Star, title: "Organic Discovery", desc: "Get discovered by professionals actively searching for AI and SaaS solutions." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <Icon className="w-5 h-5 text-amber-500 mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-amber-600">Ready to launch?</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
          Start Your Launch Today
        </h2>
        <p className="text-base text-slate-600 max-w-[500px] mx-auto mb-6">
          Join hundreds of founders who have successfully launched their products on LaudStack.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/launchpad"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Launch Your Product <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/resources/listing-optimization"
            className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Optimize Your Listing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

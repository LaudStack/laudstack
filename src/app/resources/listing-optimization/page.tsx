import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText, CheckCircle2, ArrowRight, Star, Eye,
  Search, Tag, Image as ImageIcon, MessageSquare,
  Zap, BarChart3, Lightbulb, AlertCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Optimize Your Product Listing | LaudStack Resources",
  description:
    "Learn how to create a high-converting product listing on LaudStack. Tips on writing descriptions, choosing categories, adding media, and improving discoverability.",
  openGraph: {
    title: "Optimize Your Product Listing on LaudStack",
    description: "Best practices for creating listings that convert browsers into users.",
  },
};

const SECTIONS = [
  {
    icon: FileText,
    title: "Craft a Compelling Description",
    content:
      "Your product description is the single most important element of your listing. It needs to communicate what your product does, who it's for, and why it matters — all within the first two sentences.",
    dos: [
      "Lead with the problem you solve, not the features you offer",
      "Use clear, jargon-free language that anyone can understand",
      "Include specific numbers: '10x faster', 'saves 5 hours/week'",
      "End with a clear call-to-action or value statement",
    ],
    donts: [
      "Don't start with 'We are a...' — lead with user value",
      "Don't list every feature — focus on the top 3–5",
      "Don't use buzzwords without substance ('revolutionary AI')",
      "Don't forget to mention your pricing model",
    ],
  },
  {
    icon: Tag,
    title: "Choose the Right Category & Tags",
    content:
      "Category selection directly impacts where your product appears in browse and search results. Choose the most specific category that accurately describes your product. Broad categories have more competition; niche categories can help you stand out.",
    dos: [
      "Select the single most accurate primary category",
      "Add relevant tags that describe your use cases",
      "Include tags for your target audience (e.g., 'for startups', 'for developers')",
      "Review similar products to see which categories they use",
    ],
    donts: [
      "Don't pick a broad category just because it has more traffic",
      "Don't add irrelevant tags to game discoverability",
      "Don't skip the tagging step — it significantly impacts search ranking",
      "Don't use more than 8–10 tags; quality over quantity",
    ],
  },
  {
    icon: ImageIcon,
    title: "Invest in Visual Assets",
    content:
      "Products with professional logos and clear screenshots receive significantly more engagement. Your visual assets are the first impression — they need to look polished and current.",
    dos: [
      "Use a high-resolution logo (512×512px, transparent background)",
      "Include 3–5 screenshots showing real product workflows",
      "Add captions to screenshots explaining what users are seeing",
      "Consider adding a 60–90 second product demo video",
    ],
    donts: [
      "Don't use blurry, outdated, or cropped screenshots",
      "Don't show empty states or placeholder data in screenshots",
      "Don't use marketing mockups instead of real product screenshots",
      "Don't skip the logo — listings without logos get 40% less engagement",
    ],
  },
  {
    icon: Search,
    title: "Optimize for Search & Discovery",
    content:
      "Your listing's discoverability depends on how well it matches what users are searching for. Think about the words your target users would type when looking for a product like yours.",
    dos: [
      "Include key use cases in your description naturally",
      "Mention your target industry or audience explicitly",
      "Use common terms users search for (e.g., 'project management' not 'task orchestration')",
      "Keep your tagline under 60 characters with your primary keyword",
    ],
    donts: [
      "Don't keyword-stuff your description — it hurts readability",
      "Don't use internal jargon that users won't search for",
      "Don't neglect your tagline — it appears in search results",
      "Don't forget to update your listing when you add major features",
    ],
  },
  {
    icon: Star,
    title: "Build Social Proof",
    content:
      "Reviews and ratings are the strongest trust signals on the platform. Products with 5+ reviews consistently outperform those without. Actively encourage your users to share their experience.",
    dos: [
      "Ask satisfied customers to leave a review after onboarding",
      "Respond to every review — positive and negative",
      "Share your LaudStack listing link in your product's help docs",
      "Include a 'Review us on LaudStack' link in your email signature",
    ],
    donts: [
      "Don't incentivize reviews with discounts or rewards",
      "Don't ignore negative reviews — address them constructively",
      "Don't ask for reviews from people who haven't used your product",
      "Don't wait for reviews to come organically — actively request them",
    ],
  },
];

const CHECKLIST = [
  "Professional logo uploaded (512×512px minimum)",
  "Compelling tagline under 60 characters",
  "Clear description with value proposition in first two sentences",
  "3–5 key features listed with benefit-driven language",
  "Accurate category selected",
  "5–8 relevant tags added",
  "3–5 product screenshots uploaded",
  "Pricing model clearly stated",
  "Website URL and affiliate link configured",
  "At least 3 reviews from real users",
];

export default function ListingOptimizationPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 pt-[60px] lg:pt-[64px]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Founder Resource</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Optimize Your Product Listing
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-[640px] mx-auto leading-relaxed mb-8">
            Best practices for creating a listing that converts browsers into users. Every detail matters — here&apos;s how to get them right.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col gap-12">
          {SECTIONS.map(({ icon: Icon, title, content, dos, donts }) => (
            <div key={title} className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-700" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h2>
              </div>
              <div className="px-5 sm:px-6 py-5">
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">{content}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Do
                    </div>
                    <ul className="space-y-2">
                      {dos.map((item) => (
                        <li key={item} className="text-sm text-green-800 leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Don&apos;t
                    </div>
                    <ul className="space-y-2">
                      {donts.map((item) => (
                        <li key={item} className="text-sm text-red-800 leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 text-center">
            Listing Quality Checklist
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Complete these items to maximize your listing&apos;s performance.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-[600px] mx-auto">
            <ul className="space-y-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
          Ready to Optimize?
        </h2>
        <p className="text-base text-slate-600 max-w-[500px] mx-auto mb-6">
          Apply these best practices to your listing and watch your engagement grow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/founder"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Go to Founder Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/resources/grow-visibility"
            className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Grow Your Visibility <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

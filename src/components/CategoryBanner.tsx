'use client';

import { useEffect, useState } from 'react';

/**
 * Category-specific banner data — each category gets a unique headline,
 * description, gradient accent, and decorative icon.
 */
const CATEGORY_BANNERS: Record<string, {
  headline: string;
  description: string;
  accentFrom: string;
  accentTo: string;
  bgFrom: string;
  bgTo: string;
  textColor: string;
  subtextColor: string;
  decorativeEmoji: string;
}> = {
  'All': {
    headline: 'Explore All Products',
    description: 'Browse every SaaS & AI stack on LaudStack — filtered, sorted, and reviewed by real users.',
    accentFrom: '#F59E0B', accentTo: '#D97706',
    bgFrom: '#FFFBEB', bgTo: '#FEF3C7',
    textColor: '#78350F', subtextColor: '#92400E',
    decorativeEmoji: '🌐',
  },
  'AI Productivity': {
    headline: 'AI Productivity Tools',
    description: 'Automate workflows, manage tasks smarter, and boost output with AI-powered productivity platforms.',
    accentFrom: '#8B5CF6', accentTo: '#7C3AED',
    bgFrom: '#F5F3FF', bgTo: '#EDE9FE',
    textColor: '#4C1D95', subtextColor: '#5B21B6',
    decorativeEmoji: '⚡',
  },
  'AI Writing': {
    headline: 'AI Writing Assistants',
    description: 'Generate content, refine copy, and overcome writer\'s block with the best AI writing tools.',
    accentFrom: '#3B82F6', accentTo: '#2563EB',
    bgFrom: '#EFF6FF', bgTo: '#DBEAFE',
    textColor: '#1E3A8A', subtextColor: '#1D4ED8',
    decorativeEmoji: '✍️',
  },
  'AI Image': {
    headline: 'AI Image Generation',
    description: 'Create stunning visuals, edit photos, and generate art with cutting-edge AI image tools.',
    accentFrom: '#EC4899', accentTo: '#DB2777',
    bgFrom: '#FDF2F8', bgTo: '#FCE7F3',
    textColor: '#831843', subtextColor: '#9D174D',
    decorativeEmoji: '🎨',
  },
  'AI Video': {
    headline: 'AI Video Creation',
    description: 'Produce, edit, and enhance videos at scale with AI-powered video platforms.',
    accentFrom: '#EF4444', accentTo: '#DC2626',
    bgFrom: '#FEF2F2', bgTo: '#FEE2E2',
    textColor: '#7F1D1D', subtextColor: '#991B1B',
    decorativeEmoji: '🎬',
  },
  'AI Audio': {
    headline: 'AI Audio & Voice',
    description: 'Generate voiceovers, transcribe audio, and create music with AI audio tools.',
    accentFrom: '#14B8A6', accentTo: '#0D9488',
    bgFrom: '#F0FDFA', bgTo: '#CCFBF1',
    textColor: '#134E4A', subtextColor: '#115E59',
    decorativeEmoji: '🎙️',
  },
  'AI Code': {
    headline: 'AI Coding Assistants',
    description: 'Write, debug, and ship code faster with AI-powered developer tools and copilots.',
    accentFrom: '#10B981', accentTo: '#059669',
    bgFrom: '#ECFDF5', bgTo: '#D1FAE5',
    textColor: '#064E3B', subtextColor: '#065F46',
    decorativeEmoji: '💻',
  },
  'AI Analytics': {
    headline: 'AI Analytics & Research',
    description: 'Uncover insights, analyze data, and make smarter decisions with AI analytics platforms.',
    accentFrom: '#6366F1', accentTo: '#4F46E5',
    bgFrom: '#EEF2FF', bgTo: '#E0E7FF',
    textColor: '#312E81', subtextColor: '#3730A3',
    decorativeEmoji: '📊',
  },
  'Design': {
    headline: 'Design Tools',
    description: 'Create beautiful interfaces, graphics, and prototypes with professional design platforms.',
    accentFrom: '#F472B6', accentTo: '#EC4899',
    bgFrom: '#FDF2F8', bgTo: '#FCE7F3',
    textColor: '#831843', subtextColor: '#9D174D',
    decorativeEmoji: '🖌️',
  },
  'Marketing': {
    headline: 'Marketing & SEO',
    description: 'Grow your audience, optimize campaigns, and dominate search with marketing tools.',
    accentFrom: '#F97316', accentTo: '#EA580C',
    bgFrom: '#FFF7ED', bgTo: '#FFEDD5',
    textColor: '#7C2D12', subtextColor: '#9A3412',
    decorativeEmoji: '📣',
  },
  'Developer Tools': {
    headline: 'Developer Tools',
    description: 'Ship faster with tools built for engineers — APIs, SDKs, CI/CD, and infrastructure.',
    accentFrom: '#64748B', accentTo: '#475569',
    bgFrom: '#F8FAFC', bgTo: '#F1F5F9',
    textColor: '#1E293B', subtextColor: '#334155',
    decorativeEmoji: '🔧',
  },
  'Project Management': {
    headline: 'Project Management',
    description: 'Plan, track, and deliver projects on time with the best PM and collaboration tools.',
    accentFrom: '#0EA5E9', accentTo: '#0284C7',
    bgFrom: '#F0F9FF', bgTo: '#E0F2FE',
    textColor: '#0C4A6E', subtextColor: '#075985',
    decorativeEmoji: '📋',
  },
  'Customer Support': {
    headline: 'Customer Support',
    description: 'Delight customers with fast, smart support using helpdesk and live chat platforms.',
    accentFrom: '#22C55E', accentTo: '#16A34A',
    bgFrom: '#F0FDF4', bgTo: '#DCFCE7',
    textColor: '#14532D', subtextColor: '#166534',
    decorativeEmoji: '💬',
  },
  'CRM': {
    headline: 'CRM Platforms',
    description: 'Manage relationships, track deals, and close more sales with CRM software.',
    accentFrom: '#F59E0B', accentTo: '#D97706',
    bgFrom: '#FFFBEB', bgTo: '#FEF3C7',
    textColor: '#78350F', subtextColor: '#92400E',
    decorativeEmoji: '🤝',
  },
  'Sales': {
    headline: 'Sales Intelligence',
    description: 'Find leads, automate outreach, and accelerate revenue with sales tools.',
    accentFrom: '#A855F7', accentTo: '#9333EA',
    bgFrom: '#FAF5FF', bgTo: '#F3E8FF',
    textColor: '#581C87', subtextColor: '#6B21A8',
    decorativeEmoji: '💰',
  },
  'HR & Recruiting': {
    headline: 'HR & Recruiting',
    description: 'Hire smarter, onboard faster, and manage your team with HR platforms.',
    accentFrom: '#06B6D4', accentTo: '#0891B2',
    bgFrom: '#ECFEFF', bgTo: '#CFFAFE',
    textColor: '#164E63', subtextColor: '#155E75',
    decorativeEmoji: '👥',
  },
  'Finance': {
    headline: 'Finance & Accounting',
    description: 'Track expenses, manage invoices, and automate bookkeeping with finance tools.',
    accentFrom: '#059669', accentTo: '#047857',
    bgFrom: '#ECFDF5', bgTo: '#D1FAE5',
    textColor: '#064E3B', subtextColor: '#065F46',
    decorativeEmoji: '🏦',
  },
  'Security': {
    headline: 'Cybersecurity Tools',
    description: 'Protect your data, monitor threats, and secure your infrastructure.',
    accentFrom: '#EF4444', accentTo: '#DC2626',
    bgFrom: '#FEF2F2', bgTo: '#FEE2E2',
    textColor: '#7F1D1D', subtextColor: '#991B1B',
    decorativeEmoji: '🔒',
  },
  'E-commerce': {
    headline: 'E-commerce Platforms',
    description: 'Build stores, manage inventory, and grow online sales with e-commerce tools.',
    accentFrom: '#8B5CF6', accentTo: '#7C3AED',
    bgFrom: '#F5F3FF', bgTo: '#EDE9FE',
    textColor: '#4C1D95', subtextColor: '#5B21B6',
    decorativeEmoji: '🛒',
  },
  'Education': {
    headline: 'EdTech & Learning',
    description: 'Create courses, manage classrooms, and enhance learning with education tools.',
    accentFrom: '#3B82F6', accentTo: '#2563EB',
    bgFrom: '#EFF6FF', bgTo: '#DBEAFE',
    textColor: '#1E3A8A', subtextColor: '#1D4ED8',
    decorativeEmoji: '📚',
  },
  'Other': {
    headline: 'More Products',
    description: 'Discover unique tools and platforms that don\'t fit neatly into a single category.',
    accentFrom: '#6B7280', accentTo: '#4B5563',
    bgFrom: '#F9FAFB', bgTo: '#F3F4F6',
    textColor: '#1F2937', subtextColor: '#374151',
    decorativeEmoji: '📦',
  },
};

interface CategoryBannerProps {
  selectedCategory: string;
  toolCount: number;
}

export default function CategoryBanner({ selectedCategory, toolCount }: CategoryBannerProps) {
  const [displayCategory, setDisplayCategory] = useState(selectedCategory);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (selectedCategory !== displayCategory) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayCategory(selectedCategory);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, displayCategory]);

  const banner = CATEGORY_BANNERS[displayCategory] || CATEGORY_BANNERS['All'];

  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-6 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${banner.bgFrom} 0%, ${banner.bgTo} 100%)`,
        border: `1px solid ${banner.accentFrom}15`,
      }}
    >
      {/* Decorative background elements */}
      <div
        className="absolute top-0 right-0 w-48 h-48 opacity-[0.06] pointer-events-none"
        style={{
          fontSize: '160px',
          lineHeight: 1,
          transform: 'translate(20%, -20%)',
        }}
      >
        {banner.decorativeEmoji}
      </div>
      <div
        className="absolute bottom-0 left-1/2 w-64 h-32 opacity-[0.04] pointer-events-none rounded-full blur-3xl"
        style={{ background: banner.accentFrom, transform: 'translate(-50%, 50%)' }}
      />

      {/* Content */}
      <div
        className="relative z-10 px-6 sm:px-8 py-5 sm:py-6 transition-opacity duration-150"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Category label pill */}
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="text-xl leading-none">{banner.decorativeEmoji}</span>
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: banner.accentFrom }}
              >
                {displayCategory === 'All' ? 'All Categories' : displayCategory}
              </span>
            </div>

            {/* Headline */}
            <h3
              className="text-lg sm:text-xl font-extrabold tracking-tight mb-1.5"
              style={{ color: banner.textColor, letterSpacing: '-0.02em' }}
            >
              {banner.headline}
            </h3>

            {/* Description */}
            <p
              className="text-sm font-medium leading-relaxed max-w-xl"
              style={{ color: banner.subtextColor, opacity: 0.85 }}
            >
              {banner.description}
            </p>
          </div>

          {/* Tool count badge */}
          <div
            className="hidden sm:flex flex-col items-center justify-center shrink-0 rounded-xl px-4 py-3"
            style={{
              background: `${banner.accentFrom}10`,
              border: `1px solid ${banner.accentFrom}20`,
            }}
          >
            <span
              className="text-2xl font-black leading-none"
              style={{ color: banner.accentFrom }}
            >
              {toolCount}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider mt-1"
              style={{ color: banner.subtextColor, opacity: 0.7 }}
            >
              Tools
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, ${banner.accentFrom} 0%, ${banner.accentTo} 50%, transparent 100%)`,
          opacity: 0.3,
        }}
      />
    </div>
  );
}

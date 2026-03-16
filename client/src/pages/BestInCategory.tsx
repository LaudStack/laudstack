/**
 * BestInCategory.tsx — SEO Comparison Pages
 *
 * Dynamic route: /best/:categorySlug
 * Generates pages like:
 *   /best/ai-writing       → "Best AI Writing Stacks 2026"
 *   /best/project-management → "Best Project Management Stacks 2026"
 *
 * SEO-optimized with structured content, comparison tables,
 * and rich tool cards for high-intent search traffic.
 */

import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Star, ArrowRight, ExternalLink, CheckCircle2, Award,
  TrendingUp, Users, DollarSign, Crown
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { MOCK_TOOLS } from '@/lib/mockData';
import type { Tool } from '@/lib/types';

// ─── Category slug → display config ────────────────────────────────────────

interface CategoryConfig {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  introText: string;
  buyerGuide: string[];
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    slug: 'ai-writing',
    category: 'AI Writing',
    title: 'Best AI Writing Stacks 2026',
    subtitle: 'Compare the top AI writing assistants for content creation, copywriting, and editing.',
    metaDescription: 'Discover the best AI writing tools in 2026. Compare features, pricing, and real user reviews on LaudStack.',
    introText: 'AI writing tools have transformed how teams create content. From blog posts to marketing copy, these stacks help you write faster, edit smarter, and maintain consistent quality. We\'ve analyzed community reviews, feature sets, and pricing to rank the best options.',
    buyerGuide: [
      'Content quality and accuracy of generated text',
      'Integration with your existing workflow (Google Docs, CMS, etc.)',
      'Pricing model — per-word, per-seat, or flat rate',
      'Support for multiple content types (blogs, ads, emails, social)',
      'Team collaboration features and brand voice customization',
    ],
  },
  {
    slug: 'ai-productivity',
    category: 'AI Productivity',
    title: 'Best AI Productivity Stacks 2026',
    subtitle: 'The most powerful AI assistants for work, research, and daily tasks.',
    metaDescription: 'Find the best AI productivity tools in 2026. Real reviews and comparisons on LaudStack.',
    introText: 'AI productivity assistants are becoming essential workplace tools. From answering complex questions to drafting documents and analyzing data, these stacks amplify what you can accomplish in a day. Here are the top-rated options based on community reviews.',
    buyerGuide: [
      'Breadth of capabilities (writing, coding, analysis, research)',
      'Speed and accuracy of responses',
      'Privacy and data handling policies',
      'API access and integration options',
      'Pricing tiers and usage limits',
    ],
  },
  {
    slug: 'ai-code',
    category: 'AI Code',
    title: 'Best AI Coding Stacks 2026',
    subtitle: 'Top AI-powered development tools for faster, smarter coding.',
    metaDescription: 'Compare the best AI coding tools in 2026. Developer reviews and feature comparisons on LaudStack.',
    introText: 'AI coding assistants are reshaping software development. From autocomplete to full code generation, debugging, and code review, these tools help developers ship faster with fewer bugs. We\'ve ranked them based on developer community feedback.',
    buyerGuide: [
      'Language and framework support',
      'IDE integration (VS Code, JetBrains, Neovim)',
      'Code quality and security of suggestions',
      'Context window and codebase understanding',
      'Team features and enterprise compliance',
    ],
  },
  {
    slug: 'ai-image',
    category: 'AI Image',
    title: 'Best AI Image Generation Stacks 2026',
    subtitle: 'Create stunning visuals with the top AI image generators.',
    metaDescription: 'Discover the best AI image generation tools in 2026. Compare quality, pricing, and user reviews on LaudStack.',
    introText: 'AI image generation has evolved from novelty to professional-grade tool. Whether you need marketing visuals, product mockups, or creative illustrations, these stacks deliver impressive results. Rankings are based on output quality, ease of use, and community reviews.',
    buyerGuide: [
      'Image quality and style consistency',
      'Speed of generation and iteration',
      'Commercial usage rights and licensing',
      'Editing and refinement capabilities',
      'Pricing per image or subscription model',
    ],
  },
  {
    slug: 'ai-video',
    category: 'AI Video',
    title: 'Best AI Video Stacks 2026',
    subtitle: 'Top AI tools for video creation, editing, and production.',
    metaDescription: 'Find the best AI video tools in 2026. Real user reviews and comparisons on LaudStack.',
    introText: 'AI video tools are democratizing video production. From text-to-video generation to automated editing and avatar creation, these stacks make professional video accessible to everyone. Here are the top-rated options.',
    buyerGuide: [
      'Video quality and resolution options',
      'Ease of use for non-video professionals',
      'Template library and customization options',
      'Export formats and platform integrations',
      'Pricing and rendering time',
    ],
  },
  {
    slug: 'ai-audio',
    category: 'AI Audio',
    title: 'Best AI Audio Stacks 2026',
    subtitle: 'Leading AI tools for audio generation, editing, and transcription.',
    metaDescription: 'Compare the best AI audio tools in 2026. User reviews and feature comparisons on LaudStack.',
    introText: 'AI audio tools cover everything from text-to-speech and music generation to transcription and audio editing. These stacks are transforming podcasting, music production, and content accessibility.',
    buyerGuide: [
      'Audio quality and naturalness',
      'Language and voice variety',
      'Real-time processing capabilities',
      'Integration with audio/video workflows',
      'Pricing model and usage limits',
    ],
  },
  {
    slug: 'ai-analytics',
    category: 'AI Analytics',
    title: 'Best AI Analytics Stacks 2026',
    subtitle: 'Smart analytics tools powered by AI for data-driven decisions.',
    metaDescription: 'Discover the best AI analytics tools in 2026. Compare features and read real reviews on LaudStack.',
    introText: 'AI analytics tools help teams make sense of complex data without requiring deep technical expertise. From natural language queries to automated insights, these stacks turn raw data into actionable intelligence.',
    buyerGuide: [
      'Data source integrations',
      'Natural language query capabilities',
      'Visualization and reporting features',
      'Predictive analytics accuracy',
      'Security and data governance',
    ],
  },
  {
    slug: 'project-management',
    category: 'Project Management',
    title: 'Best Project Management Stacks 2026',
    subtitle: 'Top project management tools for teams of all sizes.',
    metaDescription: 'Find the best project management tools in 2026. Real reviews and comparisons on LaudStack.',
    introText: 'Project management tools are the backbone of productive teams. From agile boards to Gantt charts, resource planning to time tracking, these stacks help teams stay organized and deliver on time.',
    buyerGuide: [
      'Task management and workflow flexibility',
      'Team collaboration and communication features',
      'Reporting and analytics capabilities',
      'Integration ecosystem (Slack, GitHub, etc.)',
      'Pricing per user and feature tiers',
    ],
  },
  {
    slug: 'crm',
    category: 'CRM',
    title: 'Best CRM Stacks 2026',
    subtitle: 'Top customer relationship management platforms for growing businesses.',
    metaDescription: 'Compare the best CRM tools in 2026. User reviews and feature comparisons on LaudStack.',
    introText: 'A great CRM is the foundation of customer-centric business. These stacks help you manage contacts, track deals, automate outreach, and build lasting customer relationships.',
    buyerGuide: [
      'Contact and deal management capabilities',
      'Sales pipeline visualization and forecasting',
      'Email and communication integrations',
      'Automation and workflow features',
      'Scalability and pricing for growing teams',
    ],
  },
  {
    slug: 'design',
    category: 'Design',
    title: 'Best Design Stacks 2026',
    subtitle: 'Top design tools for UI/UX, graphics, and creative work.',
    metaDescription: 'Discover the best design tools in 2026. Compare features and read real reviews on LaudStack.',
    introText: 'Design tools have evolved from desktop software to collaborative cloud platforms. Whether you need UI/UX design, graphic design, or prototyping, these stacks offer the features modern design teams need.',
    buyerGuide: [
      'Design capabilities (UI, graphic, prototyping)',
      'Collaboration and handoff features',
      'Component and asset library management',
      'Plugin ecosystem and integrations',
      'Pricing for individuals vs. teams',
    ],
  },
  {
    slug: 'marketing',
    category: 'Marketing',
    title: 'Best Marketing Stacks 2026',
    subtitle: 'Top marketing tools for campaigns, automation, and growth.',
    metaDescription: 'Find the best marketing tools in 2026. Real user reviews and comparisons on LaudStack.',
    introText: 'Marketing tools help teams plan, execute, and measure campaigns across channels. From email marketing to social media management, SEO, and analytics, these stacks cover the full marketing workflow.',
    buyerGuide: [
      'Channel coverage (email, social, SEO, ads)',
      'Automation and workflow capabilities',
      'Analytics and attribution reporting',
      'Integration with CRM and sales tools',
      'Ease of use for non-technical marketers',
    ],
  },
  {
    slug: 'developer-tools',
    category: 'Developer Tools',
    title: 'Best Developer Tools 2026',
    subtitle: 'Essential tools for modern software development workflows.',
    metaDescription: 'Compare the best developer tools in 2026. Developer reviews and feature comparisons on LaudStack.',
    introText: 'Developer tools encompass everything from version control and CI/CD to monitoring, testing, and deployment. These stacks help development teams build, ship, and maintain software more efficiently.',
    buyerGuide: [
      'Integration with existing development workflow',
      'Language and platform support',
      'Performance and reliability',
      'Documentation and community support',
      'Open source vs. commercial licensing',
    ],
  },
  {
    slug: 'customer-support',
    category: 'Customer Support',
    title: 'Best Customer Support Stacks 2026',
    subtitle: 'Top helpdesk and customer service platforms.',
    metaDescription: 'Discover the best customer support tools in 2026. Compare features and read real reviews on LaudStack.',
    introText: 'Customer support tools help teams deliver fast, personalized service across channels. From ticketing systems to live chat and AI-powered automation, these stacks keep customers happy and teams efficient.',
    buyerGuide: [
      'Multi-channel support (email, chat, phone, social)',
      'AI and automation capabilities',
      'Knowledge base and self-service features',
      'Reporting and customer satisfaction metrics',
      'Pricing per agent and feature tiers',
    ],
  },
  {
    slug: 'sales',
    category: 'Sales',
    title: 'Best Sales Stacks 2026',
    subtitle: 'Top sales tools for prospecting, outreach, and closing deals.',
    metaDescription: 'Find the best sales tools in 2026. Real user reviews and comparisons on LaudStack.',
    introText: 'Sales tools help teams find prospects, manage outreach, and close deals faster. From lead generation to sales engagement and revenue intelligence, these stacks give sales teams a competitive edge.',
    buyerGuide: [
      'Lead generation and prospecting features',
      'Email and call automation',
      'Pipeline management and forecasting',
      'CRM integration depth',
      'Data accuracy and enrichment quality',
    ],
  },
];

const currentYear = new Date().getFullYear();

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} style={{ width: size, height: size, fill: i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0', color: i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0' }} />
      ))}
    </div>
  );
}

export default function BestInCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const config = CATEGORY_CONFIGS.find(c => c.slug === categorySlug);

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC', paddingTop: '72px' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '60px 24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#171717' }}>Category Not Found</h1>
          <p style={{ fontSize: '14px', color: '#64748B' }}>The category you're looking for doesn't exist.</p>
          <Link href="/categories" style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B', textDecoration: 'none' }}>
            Browse All Categories →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Get tools in this category, sorted by rating
  const tools = MOCK_TOOLS
    .filter(t => t.category === config.category)
    .sort((a, b) => b.average_rating - a.average_rating || b.review_count - a.review_count);

  const topTool = tools[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC', paddingTop: '72px' }}>
      <Navbar />

      {/* Hero */}
      <PageHero
        eyebrow="Best Stacks"
        title={config.title}
        subtitle={config.subtitle}
        accent="amber"
        size="lg"
        layout="default"
        backLink={{ href: '/categories', label: 'All Categories' }}
        stats={[
          { value: String(tools.length), label: 'Stacks Compared' },
          { value: tools.reduce((sum, t) => sum + t.review_count, 0).toLocaleString(), label: 'Community Reviews' },
          { value: topTool ? topTool.average_rating.toFixed(1) : '—', label: 'Highest Rating' },
        ]}
      />

      <div className="max-w-[1300px] mx-auto px-6 lg:px-10" style={{ paddingTop: '40px', paddingBottom: '60px' }}>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', marginBottom: '28px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
        >
          <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.75, margin: 0 }}>
            {config.introText}
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: '28px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
        >
          <div style={{ padding: '24px 32px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>
              Quick Comparison
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>Rank</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>Stack</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>Rating</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>Reviews</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>Pricing</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0' }}>Lauds</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, i) => (
                  <tr key={tool.id} style={{ borderBottom: i < tools.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: i === 0 ? '#F59E0B' : '#374151', fontSize: '14px' }}>
                      {i === 0 && <Crown style={{ width: '14px', height: '14px', color: '#F59E0B', display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />}
                      #{i + 1}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Link href={`/tools/${tool.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden', flexShrink: 0, background: '#F8FAFC' }}>
                          <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={e => { const t = e.currentTarget; t.style.display = 'none'; }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#171717' }}>{tool.name}</span>
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>{tool.tagline.length > 50 ? tool.tagline.slice(0, 50) + '…' : tool.tagline}</div>
                        </div>
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <StarRating rating={tool.average_rating} size={11} />
                        <span style={{ fontWeight: 700, color: '#171717' }}>{tool.average_rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>
                      {tool.review_count.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>
                        {tool.pricing_model}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>
                      {tool.upvote_count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Detailed Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 + i * 0.04 }}
              style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px 32px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)', position: 'relative' }}
            >
              {/* Rank badge */}
              {i < 3 && (
                <div style={{
                  position: 'absolute', top: '-8px', left: '24px',
                  padding: '3px 12px', borderRadius: '100px',
                  background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#CD7F32',
                  color: '#FFFFFF', fontSize: '11px', fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}>
                  #{i + 1} {i === 0 ? 'Top Pick' : i === 1 ? 'Runner Up' : 'Notable'}
                </div>
              )}

              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Logo */}
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', flexShrink: 0, background: '#F8FAFC' }}>
                  <img src={tool.logo_url} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={e => { const t = e.currentTarget; t.style.display = 'none'; }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Link href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#171717', margin: 0, letterSpacing: '-0.02em' }}>{tool.name}</h3>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <StarRating rating={tool.average_rating} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#171717' }}>{tool.average_rating.toFixed(1)}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>({tool.review_count.toLocaleString()} reviews)</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>{tool.tagline}</p>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7, margin: '0 0 16px' }}>{tool.description.length > 200 ? tool.description.slice(0, 200) + '…' : tool.description}</p>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>
                      {tool.pricing_model}
                    </span>
                    {tool.badges.includes('top_rated') && (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                        Top Rated
                      </span>
                    )}
                    {tool.is_verified && (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', background: '#F59E0B', color: '#0A0A0A', fontWeight: 700, fontSize: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.25)', transition: 'all 0.15s' }}>
                        Read Reviews <ArrowRight style={{ width: '12px', height: '12px' }} />
                      </button>
                    </Link>
                    <a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', background: '#FFFFFF', color: '#374151', fontWeight: 700, fontSize: '12px', border: '1.5px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s' }}>
                        Visit Website <ExternalLink style={{ width: '12px', height: '12px' }} />
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Buyer's Guide */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', marginBottom: '28px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
        >
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 800, color: '#171717', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Buyer's Guide: What to Look For
          </h2>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: '0 0 20px' }}>
            When evaluating {config.category.toLowerCase()} stacks, consider these key factors:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {config.buyerGuide.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22C55E', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Browse All Categories CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#171717', margin: '0 0 4px' }}>Explore More Categories</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Browse all {CATEGORY_CONFIGS.length} categories to find the best stacks for your needs.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORY_CONFIGS.filter(c => c.slug !== categorySlug).slice(0, 4).map(c => (
              <Link key={c.slug} href={`/best/${c.slug}`} style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s', display: 'inline-block' }}>
                  {c.category}
                </span>
              </Link>
            ))}
            <Link href="/categories" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', cursor: 'pointer', display: 'inline-block' }}>
                All Categories →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export { CATEGORY_CONFIGS };

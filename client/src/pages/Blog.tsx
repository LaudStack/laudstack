// Design: LaudStack dark-slate + amber accent. Blog index with featured hero and article grid.
import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { Calendar, Clock, Tag, ArrowRight, User, BookOpen, TrendingUp, Lightbulb, Zap, Star } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    slug: 'top-ai-writing-tools-2026',
    title: 'The 10 Best AI Writing Tools of 2026: Tested & Ranked',
    excerpt: 'We spent 3 months testing every major AI writing assistant. Here\'s what actually works for different use cases — from blog posts to technical documentation.',
    category: 'AI Tools',
    author: 'Sarah Chen',
    authorRole: 'Senior Editor',
    date: '2026-03-05',
    readTime: '12 min read',
    featured: true,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    tags: ['AI Writing', 'Productivity', 'Review'],
  },
  {
    id: 2,
    slug: 'how-to-choose-saas-tools',
    title: 'How to Choose SaaS Tools Without Wasting Money',
    excerpt: 'A practical framework for evaluating software before committing. The 5 questions every founder and team lead should ask before signing up.',
    category: 'Guides',
    author: 'Marcus Webb',
    authorRole: 'Product Strategist',
    date: '2026-03-01',
    readTime: '8 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    tags: ['SaaS', 'Decision Making', 'Guide'],
  },
  {
    id: 3,
    slug: 'ai-code-assistants-comparison',
    title: 'GitHub Copilot vs Cursor vs Codeium: Which AI Coder Wins?',
    excerpt: 'Side-by-side comparison of the three leading AI coding assistants. We tested them on real-world tasks across Python, TypeScript, and Rust.',
    category: 'Comparisons',
    author: 'Dev Patel',
    authorRole: 'Engineering Lead',
    date: '2026-02-24',
    readTime: '15 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    tags: ['AI Code', 'Developer Tools', 'Comparison'],
  },
  {
    id: 4,
    slug: 'saas-pricing-trends-2026',
    title: 'SaaS Pricing in 2026: Why Usage-Based Models Are Winning',
    excerpt: 'Seat-based pricing is dying. Here\'s why the most successful SaaS companies are switching to consumption models — and what it means for buyers.',
    category: 'Industry',
    author: 'Priya Nair',
    authorRole: 'Market Analyst',
    date: '2026-02-18',
    readTime: '10 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    tags: ['Pricing', 'SaaS Trends', 'Business'],
  },
  {
    id: 5,
    slug: 'building-ai-stack-startup',
    title: 'The Lean AI Stack: What 50 Startups Are Actually Using',
    excerpt: 'We surveyed 50 early-stage startups about their AI tooling. The results were surprising — and the patterns reveal what actually matters at different stages.',
    category: 'Guides',
    author: 'James Okafor',
    authorRole: 'Startup Advisor',
    date: '2026-02-10',
    readTime: '9 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    tags: ['Startups', 'AI Stack', 'Guide'],
  },
  {
    id: 6,
    slug: 'review-manipulation-problem',
    title: 'The Review Manipulation Problem in SaaS — And How We\'re Fixing It',
    excerpt: 'Fake reviews cost buyers billions annually. Here\'s how LaudStack\'s Trust Framework uses behavioral signals and verification to surface authentic feedback.',
    category: 'LaudStack',
    author: 'LaudStack Team',
    authorRole: 'Editorial',
    date: '2026-02-03',
    readTime: '7 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
    tags: ['Trust', 'Reviews', 'LaudStack'],
  },
];

const CATEGORIES = ['All', 'AI Tools', 'Comparisons', 'Guides', 'Industry', 'LaudStack'];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'All': BookOpen,
  'AI Tools': Zap,
  'Comparisons': TrendingUp,
  'Guides': Lightbulb,
  'Industry': Star,
  'LaudStack': Tag,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Blog() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  const featured = ARTICLES.find(a => a.featured);
  const rest = filtered.filter(a => !a.featured || activeCategory !== 'All');

  const handleArticleClick = () => {
    // Articles are static for now — show a toast
    toast.info('Full article coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHero
        eyebrow="LaudStack Blog"
        title="Insights for the Modern Software Buyer"
        subtitle="In-depth reviews, comparisons, and guides to help you make smarter decisions about AI and SaaS tools."
        accent="amber"
        layout="split"
        size="md"
      >
        {/* Article category quick-links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, minWidth: '180px' }}>
          {CATEGORIES.filter(c => c !== 'All').map(cat => {
            const Icon = CATEGORY_ICONS[cat] || BookOpen;
            const count = ARTICLES.filter(a => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  background: activeCategory === cat ? '#FFFBEB' : 'transparent',
                  color: activeCategory === cat ? '#B45309' : '#374151',
                  border: activeCategory === cat ? '1px solid #FDE68A' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (activeCategory !== cat) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; } }}
                onMouseLeave={e => { if (activeCategory !== cat) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Icon style={{ width: '13px', height: '13px', opacity: 0.7 }} />
                  {cat}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', background: '#F3F4F6', padding: '1px 6px', borderRadius: '10px' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </PageHero>

      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Featured Article */}
        {featured && activeCategory === 'All' && (
          <div
            onClick={handleArticleClick}
            className="group relative rounded-2xl overflow-hidden border border-gray-200 cursor-pointer mb-12 hover:border-amber-500/40 transition-all duration-300"
          >
            <div className="absolute inset-0">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/85" />
            </div>
            <div className="relative p-8 md:p-12 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wide">Featured</span>
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-slate-600 text-xs font-medium">{featured.category}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 group-hover:text-amber-400 transition-colors">
                {featured.title}
              </h2>
              <p className="text-slate-500 text-base mb-6 leading-relaxed">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="text-slate-600 font-medium">{featured.author}</span>
                  <span>· {featured.authorRole}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(featured.date)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {featured.readTime}
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-amber-400 font-bold text-sm group-hover:gap-3 transition-all">
                Read Article <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || BookOpen;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-white border border-gray-200 text-slate-500 hover:text-slate-900 hover:border-gray-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat}
              </button>
            );
          })}
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <article
              key={article.id}
              onClick={handleArticleClick}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/40 hover:bg-gray-100/80 transition-all duration-200"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-xs font-medium text-slate-500">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {article.readTime}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-400 transition-colors mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-400">{article.author[0]}</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{article.author}</div>
                      <div className="text-xs text-slate-500">{formatDate(article.date)}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {rest.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No articles in this category yet</h3>
            <p className="text-slate-500 text-sm">Check back soon — we publish new content weekly.</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Get the Weekly Digest</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            New tool reviews, comparison guides, and industry insights — delivered every Tuesday.
          </p>
          <div className="flex items-center gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-slate-900 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => toast.success('Subscribed! Check your inbox.')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

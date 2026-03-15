"use client";

export const dynamic = 'force-dynamic';


/*
 * LaudStack BlogPost — Article detail page
 * Design: white article canvas, amber accents, dark slate sidebar, no gradients
 * Layout: two-column (article body left, sticky sidebar right) on desktop; single column mobile
 * Typography: prose-style with generous line-height, clear heading hierarchy
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Calendar, Clock, Tag, ArrowRight, ArrowLeft,
  Twitter, Linkedin, Link2, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import {
  ARTICLES, AUTHORS, getArticleBySlug, getRelatedArticles, formatDate
} from '@/data/blogData';

// ── Share button ────────────────────────────────────────────────────────────
function ShareButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-slate-500 hover:text-slate-900 hover:border-gray-400 text-sm font-medium transition-all"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ── Author card (sidebar + inline) ──────────────────────────────────────────
function AuthorCard({ authorName, compact = false }: { authorName: string; compact?: boolean }) {
  const author = AUTHORS[authorName];
  if (!author) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-amber-600">{author.avatar}</span>
          </div>
        )}
        <div>
          <div className="text-sm font-semibold text-slate-900">{author.name}</div>
          <div className="text-xs text-slate-500">{author.role}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-amber-600">{author.avatar}</span>
          </div>
        )}
        <div className="min-w-0">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Written by</div>
          <div className="text-lg font-black text-slate-900">{author.name}</div>
          <div className="text-sm text-slate-500 font-medium mb-3">{author.role}</div>
          <p className="text-sm text-slate-600 leading-relaxed">{author.bio}</p>
          <div className="flex gap-2 mt-4">
            {author.twitter && (
              <a href={author.twitter} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <Twitter className="h-3.5 w-3.5 text-slate-600" />
              </a>
            )}
            {author.linkedin && (
              <a href={author.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <Linkedin className="h-3.5 w-3.5 text-slate-600" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Related article card ─────────────────────────────────────────────────────
function RelatedCard({ article }: { article: (typeof ARTICLES)[0] }) {
  return (
    <Link href={`/blog/${article.slug}`}>
      <div className="group flex gap-4 p-4 rounded-xl border border-gray-200 hover:border-amber-500/40 hover:bg-amber-50/30 cursor-pointer transition-all">
        <img
          src={article.image}
          alt={article.title}
          className="w-20 h-16 rounded-lg object-cover shrink-0"
        />
        <div className="min-w-0">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">{article.category}</span>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 mt-0.5 leading-snug">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            {article.readTime}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ?? '';
  const [nlEmail, setNlEmail] = useState('');
  const [nlSubscribed, setNlSubscribed] = useState(false);

  const nlSubscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        toast.info("You're already subscribed — thanks!");
      } else {
        toast.success("You're subscribed! Check your inbox.");
        setNlSubscribed(true);
      }
      setNlEmail('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong. Please try again.');
    },
  });

  const handleNlSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nlEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    nlSubscribe.mutate({ email: trimmed, source: 'blog_article' });
  };

  const article = getArticleBySlug(slug);
  const related = article ? getRelatedArticles(article) : [];

  // Redirect to 404 if slug not found
  useEffect(() => {
    if (slug && !article) {
      router.push('/blog');
      toast.error('Article not found.');
    }
  }, [slug, article, router]);

  if (!article) return null;

  const author = AUTHORS[article.author];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* ── Hero banner ── */}
      <div className="bg-white border-b border-gray-200" style={{ paddingTop: '64px' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/blog">
              <span className="hover:text-amber-600 cursor-pointer font-medium transition-colors">Blog</span>
            </Link>
            <span>/</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              {article.category}
            </span>
          </nav>

          <div className="max-w-3xl">
            {/* Category + read time */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wide">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-slate-500 text-sm">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black text-slate-900 leading-tight mb-4">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              {article.excerpt}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {author && (
                <div className="flex items-center gap-2">
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-600">{author.avatar}</span>
                    </div>
                  )}
                  <span className="font-semibold text-slate-700">{article.author}</span>
                  <span className="text-slate-400">·</span>
                  <span>{article.authorRole}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.date)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cover image ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-0 pt-8">
        <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-[21/9] max-h-[420px]">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-10 items-start">

          {/* ── Article body ── */}
          <article className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-medium text-slate-600">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Prose body */}
            <div
              className="prose-article"
              dangerouslySetInnerHTML={{ __html: article.body || '<p>Full article coming soon.</p>' }}
            />

            {/* Share row */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Share this article</p>
              <div className="flex flex-wrap gap-2">
                <ShareButton icon={Twitter} label="Twitter" onClick={handleShareTwitter} />
                <ShareButton icon={Linkedin} label="LinkedIn" onClick={handleShareLinkedIn} />
                <ShareButton icon={Link2} label="Copy link" onClick={handleCopyLink} />
              </div>
            </div>

            {/* Author bio — inline (mobile + desktop below sidebar) */}
            <div className="mt-10">
              <AuthorCard authorName={article.author} />
            </div>

            {/* Back to blog */}
            <div className="mt-8">
              <Link href="/blog">
                <button className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-amber-600 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Blog
                </button>
              </Link>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-[300px] shrink-0 sticky top-24 space-y-6">

            {/* Author compact */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">About the author</p>
              <AuthorCard authorName={article.author} compact />
              {author && (
                <p className="text-xs text-slate-500 leading-relaxed mt-3 line-clamp-4">{author.bio}</p>
              )}
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Related Articles</p>
                <div className="space-y-3">
                  {related.map(rel => (
                    <RelatedCard key={rel.slug} article={rel} />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter CTA */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <BookOpen className="h-6 w-6 text-amber-600 mb-3" />
              <h4 className="text-sm font-black text-slate-900 mb-1">Weekly Tool Digest</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                New reviews, comparisons, and guides — delivered every Monday.
              </p>
              {nlSubscribed ? (
                <div className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  You&apos;re subscribed!
                </div>
              ) : (
                <form onSubmit={handleNlSubscribe}>
                  <input
                    type="email"
                    value={nlEmail}
                    onChange={e => setNlEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-amber-200 text-slate-900 text-xs placeholder-gray-400 focus:outline-none focus:border-amber-500 mb-2"
                  />
                  <button
                    type="submit"
                    disabled={nlSubscribe.isPending}
                    className="w-full py-2 rounded-lg bg-amber-500 text-white font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-60"
                  >
                    {nlSubscribe.isPending ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Related posts (full-width, below article) ── */}
      {related.length > 0 && (
        <div className="bg-white border-t border-gray-200 mt-4">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">More to Read</h2>
              <Link href="/blog">
                <button className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-500 transition-colors">
                  All articles <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(rel => (
                <Link key={rel.slug} href={`/blog/${rel.slug}`}>
                  <article className="group bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/40 hover:bg-white transition-all duration-200">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                          {rel.category}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {rel.readTime}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2 leading-snug">
                        {rel.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{rel.excerpt}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                            <span className="text-xs font-bold text-amber-600">{rel.author[0]}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{rel.author}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

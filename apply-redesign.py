#!/usr/bin/env python3
"""
Atomically replace the stack detail page sections:
1. Add selectedTab state + mediaIndex state
2. Replace tab bar with true tab switching
3. Replace main content with tabbed sections (Overview, Features, Pricing, Reviews, Team, Discussion, Alternatives)
4. Remove Quick Comparison table and You Might Also Like section
"""

with open('src/app/tools/[slug]/page.tsx', 'r') as f:
    content = f.read()

# ─── 1. Add selectedTab and mediaIndex state after activeSection state ─────
OLD_STATE = "  const [activeSection, setActiveSection] = useState('about');"
NEW_STATE = """  const [activeSection, setActiveSection] = useState('about');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'features' | 'pricing' | 'reviews' | 'team' | 'discussion' | 'alternatives'>('overview');
  const [mediaIndex, setMediaIndex] = useState(0);"""
content = content.replace(OLD_STATE, NEW_STATE, 1)

# ─── 2. Replace the tab bar ────────────────────────────────────────────────
OLD_TAB_BAR = """      {/* ══ STICKY TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="sticky top-[72px] z-[39] bg-white border-b border-slate-200" style={{ boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <nav className="flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {([
              { id: 'about', label: 'About' },
              { id: 'media', label: 'Media' },
              { id: 'features', label: 'Features' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'comments', label: 'Discussion' },
              { id: 'alternatives', label: 'Alternatives' },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => scrollToSection(tab.id)}
                className="shrink-0 px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-[13px] font-medium bg-transparent border-none cursor-pointer transition-colors whitespace-nowrap -mb-px"
                style={{
                  fontWeight: activeSection === tab.id ? 700 : 500,
                  color: activeSection === tab.id ? '#B45309' : '#64748B',
                  borderBottom: activeSection === tab.id ? '2px solid #F59E0B' : '2px solid transparent',
                }}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>"""

NEW_TAB_BAR = """      {/* ══ STICKY TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="sticky top-[72px] z-[39] bg-white border-b border-slate-200" style={{ boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <nav className="flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {([
              { id: 'overview' as const, label: 'Overview' },
              { id: 'features' as const, label: 'Features' },
              { id: 'pricing' as const, label: 'Pricing' },
              { id: 'reviews' as const, label: 'Reviews' },
              { id: 'team' as const, label: 'Team' },
              { id: 'discussion' as const, label: 'Discussion' },
              { id: 'alternatives' as const, label: 'Alternatives' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
                className="shrink-0 px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-[13px] bg-transparent border-none cursor-pointer transition-colors whitespace-nowrap -mb-px"
                style={{
                  fontWeight: selectedTab === tab.id ? 700 : 500,
                  color: selectedTab === tab.id ? '#B45309' : '#64748B',
                  borderBottom: selectedTab === tab.id ? '2px solid #F59E0B' : '2px solid transparent',
                }}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>"""

content = content.replace(OLD_TAB_BAR, NEW_TAB_BAR, 1)

# ─── 3. Replace the main content area (two-column layout + alternatives + similar products) ─
OLD_MAIN = """      {/* ══ MAIN CONTENT — Responsive Two Column Layout ═════════════════════ */}
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-6 order-2 lg:order-1">

            {/* About */}
            <section id="section-about" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 sm:mb-4" style={{ letterSpacing: '-0.02em' }}>About {tool.name}</h2>
              <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed sm:leading-[1.75] mb-4 sm:mb-5">{tool.description}</p>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map(tag => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-xs font-semibold py-1 px-3 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 no-underline hover:border-amber-300 hover:text-amber-700 transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>

            {/* Media */}
            <section id="section-media" className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Media</h2>
              </div>
              {toolScreenshots.length > 0 ? (
                <div className="relative bg-slate-100 aspect-video overflow-hidden">
                  {mediaErr ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-slate-400 text-sm font-medium">Media unavailable</p>
                    </div>
                  ) : (
                    <img src={toolScreenshots[0]?.url} alt={toolScreenshots[0]?.caption}
                      className="w-full h-full object-cover object-top"
                      onError={() => setMediaErr(true)} />
                  )}
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-slate-50">
                  <p className="text-slate-400 text-sm font-medium">No media available</p>
                </div>
              )}
            </section>

            {/* Key Features */}
            <section id="section-features" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-4 sm:mb-6" style={{ letterSpacing: '-0.02em' }}>Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {toolFeatures.map((feat, i) => (
                  <div key={i} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:border-amber-200 hover:shadow-sm">
                    <div className="text-2xl mb-2.5">{feat.icon}</div>
                    <h3 className="text-sm font-extrabold text-gray-900 mb-1">{feat.title}</h3>
                    <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed m-0">{feat.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing */}
            <section id="section-pricing" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Pricing</h2>
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-700 no-underline inline-flex items-center gap-1">
                  View full pricing <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {toolPricingTiers.map((tier, i) => (
                  <div key={i} className="rounded-2xl p-5 sm:p-6 relative flex flex-col gap-3.5"
                    style={{
                      border: tier.highlighted ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                      background: tier.highlighted ? '#FFFBEB' : '#FAFBFC',
                      boxShadow: tier.highlighted ? '0 4px 20px rgba(245,158,11,0.12)' : 'none',
                    }}>
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-[11px] font-extrabold px-3.5 py-0.5 rounded-full whitespace-nowrap">
                        {tier.badge}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{tier.name}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.03em' }}>{tier.price}</span>
                        {tier.period && <span className="text-xs text-slate-400 font-medium">{tier.period}</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-snug">{tier.description}</p>
                    </div>
                    <div className="flex-1 flex flex-col gap-2.5">
                      {tier.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: tier.highlighted ? '#B45309' : '#15803D' }} />
                          <span className="text-[13px] text-gray-700 leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                    <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center py-3 rounded-lg text-[13px] font-bold no-underline transition-all"
                      style={{
                        background: tier.highlighted ? '#F59E0B' : '#FFFFFF',
                        color: tier.highlighted ? '#0A0A0A' : '#374151',
                        border: tier.highlighted ? 'none' : '1.5px solid #E2E8F0',
                        boxShadow: tier.highlighted ? '0 3px 10px rgba(245,158,11,0.3)' : 'none',
                      }}>
                      {tier.cta}
                    </a>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-4 text-center">
                Pricing shown is indicative. Visit {tool.name}&apos;s website for the latest pricing.
              </p>
            </section>

            {/* Ratings & Reviews Summary */}
            <section id="section-reviews" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <div className="flex items-center justify-between gap-3 mb-6 sm:mb-7 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Ratings &amp; Reviews</h2>
                <button onClick={handleWriteReview}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-bold text-[13px] border-none cursor-pointer transition-all hover:shadow-md whitespace-nowrap"
                  style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.25)' }}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                </button>
              </div>

              {/* Rating summary — stacks on mobile */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-center mb-7 sm:mb-8 p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-center shrink-0">
                  <div className="text-4xl sm:text-5xl font-black text-gray-900 leading-none" style={{ letterSpacing: '-0.04em' }}>
                    {totalReviews > 0 ? realAvgRating.toFixed(1) : '0.0'}
                  </div>
                  <div className="mt-1.5"><StarRating rating={realAvgRating} size={16} /></div>
                  <div className="text-[13px] text-slate-500 mt-1.5 font-medium">{totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}</div>
                </div>
                <div className="flex-1 w-full flex flex-col gap-2">
                  {ratingBreakdown.map(({ star, count }) => (
                    <RatingBar key={star} label={`${star} ★`} count={count} total={totalReviews} />
                  ))}
                </div>
              </div>
            </section>

            {/* Individual Reviews */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Community Reviews</h2>
              </div>

              <div className="flex flex-col">
                {reviews.length === 0 && (
                  <div className="px-5 sm:px-7 py-12 text-center">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-900 mb-1">No reviews yet</h3>
                    <p className="text-xs text-slate-500 mb-4">Be the first to share your experience with this tool.</p>
                    <button onClick={handleWriteReview}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-bold text-xs border-none cursor-pointer transition-all hover:shadow-md"
                      style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.2)' }}>
                      <MessageSquare className="w-3 h-3" />
                      {isAuthenticated ? 'Write the First Review' : 'Sign In to Review'}
                    </button>
                  </div>
                )}
                {reviews.map((review, i) => (
                  <div key={review.id} className="px-5 sm:px-7 py-5 sm:py-6" style={{ borderBottom: i < reviews.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    {/* Reviewer header — stacks on very small screens */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] rounded-full shrink-0 flex items-center justify-center"
                          style={{ background: `hsl(${(review.user?.name.charCodeAt(0) ?? 65) * 7}, 50%, 52%)` }}>
                          <span className="text-sm sm:text-base font-extrabold text-white">{review.user?.name.charAt(0) ?? '?'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{review.user?.name}</span>
                            {review.is_verified_purchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2 rounded-full bg-green-50 text-green-700 border border-green-200">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">
                            {review.user?.role}{review.user?.company ? ` · ${review.user.company}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1">
                        <StarRating rating={review.rating} size={13} />
                        <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                      </div>
                    </div>

                    {/* Review content */}
                    <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 mb-2 leading-snug">{review.title}</h3>
                    <p className="text-[13px] sm:text-sm text-gray-700 leading-relaxed sm:leading-[1.7] mb-4">{review.body}</p>

                    {/* Pros / Cons — stacks on mobile */}
                    {(review.pros || review.cons) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {review.pros && (
                          <div className="p-3 sm:p-3.5 rounded-xl bg-green-50 border border-green-200">
                            <div className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-1.5">Pros</div>
                            <p className="text-xs sm:text-[13px] text-green-800 m-0 leading-snug">{review.pros}</p>
                          </div>
                        )}
                        {review.cons && (
                          <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                            <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1.5">Cons</div>
                            <p className="text-xs sm:text-[13px] text-rose-800 m-0 leading-snug">{review.cons}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edit form for own review */}
                    {editingReview === review.id ? (
                      <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-600 mb-1 block">Rating</label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <button key={s} onClick={() => setEditRating(s)} className="p-0 border-none bg-transparent cursor-pointer">
                                <Star className="w-5 h-5" style={{ fill: s <= editRating ? '#FBBF24' : '#E2E8F0', color: s <= editRating ? '#FBBF24' : '#E2E8F0' }} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Review title" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                        <textarea value={editBody} onChange={e => setEditBody(e.target.value)} placeholder="Your review" rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none" />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={editPros} onChange={e => setEditPros(e.target.value)} placeholder="Pros" className="px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                          <input value={editCons} onChange={e => setEditCons(e.target.value)} placeholder="Cons" className="px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(review.id)} disabled={savingEdit}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50">
                            {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                          </button>
                          <button onClick={() => setEditingReview(null)} className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Helpful + Edit/Delete */}
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => handleHelpful(review.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all"
                        style={{
                          color: helpfulMap[review.id] ? '#15803D' : '#64748B',
                          background: helpfulMap[review.id] ? '#F0FDF4' : 'transparent',
                          border: helpfulMap[review.id] ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                          cursor: helpfulMap[review.id] ? 'default' : 'pointer',
                        }}>
                        <ThumbsUp className="w-3 h-3" />
                        Helpful ({review.helpful_count + (helpfulMap[review.id] ? 1 : 0)})
                      </button>
                      {isOwnReview(review) && editingReview !== review.id && (
                        <>
                          <button onClick={() => startEditReview(review)}
                            className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReview === review.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
                            {deletingReview === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
                          </button>
                        </>
                      )}
                    </div>

                    {/* Founder reply */}
                    {review.founder_reply && (
                      <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-400">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-3.5 h-3.5 text-amber-700" />
                          <span className="text-xs font-bold text-amber-700">Founder Reply</span>
                          <span className="text-[11px] text-amber-800">· {formatDate(review.founder_reply.created_at)}</span>
                        </div>
                        <p className="text-[13px] text-amber-900 leading-relaxed m-0">{review.founder_reply.body}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Write a review CTA */}
              <div className="px-5 sm:px-7 py-4 sm:py-5 bg-amber-50 border-t border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-0.5">Have experience with {tool.name}?</p>
                  <p className="text-[13px] text-slate-500 m-0">Share your honest review and help others make informed decisions.</p>
                </div>
                <button onClick={handleWriteReview}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-bold text-[13px] border-none cursor-pointer transition-all hover:shadow-md whitespace-nowrap shrink-0"
                  style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                </button>
              </div>
            </section>

            {/* Comments / Discussion */}
            <CommentsSection
              toolId={parseInt(tool.id, 10)}
              isAuthenticated={isAuthenticated}
              currentUserId={dbUser?.id ?? null}
              onAuthRequired={() => {
                setAuthAction('comment');
                setShowAuthModal(true);
              }}
            />
          </div>

          {/* ── RIGHT SIDEBAR — hidden on mobile, shown below content on tablet, sticky on desktop ── */}
          <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-5 order-1 lg:order-2 lg:sticky lg:top-[140px]">

            {/* Stack Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-4 sm:mb-5 uppercase tracking-wider">Stack Details</h3>
              <div className="flex flex-col gap-3.5 sm:gap-4">
                {[
                  { icon: Tag, label: 'Category', value: tool.category },
                  { icon: Globe, label: 'Pricing', value: tool.pricing_model },
                  { icon: Calendar, label: 'Launched', value: new Date(tool.launched_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                  { icon: Award, label: 'Rank Score', value: tool.rank_score.toLocaleString() },
                  { icon: TrendingUp, label: 'Weekly Change', value: tool.weekly_rank_change ? `+${tool.weekly_rank_change}` : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <span className="text-[13px] text-slate-500 font-medium">{label}</span>
                    </div>
                    <span className="text-[13px] font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100">
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackOutboundClick('website')}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-amber-400 text-gray-900 font-extrabold text-[13px] no-underline transition-all hover:shadow-md"
                  style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.3)' }}>
                  Visit Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Founder Info */}
            {tool.founder && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h3 className="text-[13px] font-extrabold text-gray-900 mb-3.5 sm:mb-4 uppercase tracking-wider">Built By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 border-2 border-slate-200 flex items-center justify-center overflow-hidden"
                    style={{ background: `hsl(${(tool.founder.name.charCodeAt(0)) * 7}, 50%, 52%)` }}>
                    {tool.founder.avatar_url ? (
                      <img src={tool.founder.avatar_url} alt={tool.founder.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-base font-extrabold text-white">{tool.founder.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900 truncate">{tool.founder.name}</span>
                      {tool.founder.is_pro && (
                        <span className="text-[10px] font-bold py-0.5 px-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">PRO</span>
                      )}
                    </div>
                    {tool.founder.bio && <p className="text-xs text-slate-500 mt-0.5 leading-snug truncate">{tool.founder.bio}</p>}
                  </div>
                </div>
                {(tool.founder.twitter_handle || tool.founder.linkedin_url) && (
                  <div className="flex gap-2 mt-3.5">
                    {tool.founder.twitter_handle && (
                      <a href={`https://twitter.com/${tool.founder.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-500 no-underline py-1 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                        @{tool.founder.twitter_handle}
                      </a>
                    )}
                    {tool.founder.linkedin_url && (
                      <a href={tool.founder.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-500 no-underline py-1 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Claim / Verified */}
            {!tool.is_verified ? (
              <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden" style={{ background: '#0F1629', boxShadow: '0 4px 24px rgba(15,23,42,0.18)' }}>
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }} />
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mb-3.5" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <Building2 className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">For Founders</span>
                </div>
                <h3 className="text-base font-black text-white mb-1.5 leading-tight" style={{ letterSpacing: '-0.02em' }}>Is this your product?</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed mb-4">Claim this listing to unlock founder features and grow faster.</p>
                <ul className="m-0 mb-5 p-0 list-none flex flex-col gap-2.5">
                  {['Respond to reviews publicly', 'Add a promotional banner', 'Access traffic & analytics', 'Get a Verified badge'].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-4.5 h-4.5 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', width: 18, height: 18 }}>
                        <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" />
                      </div>
                      <span className="text-xs text-slate-300 font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => router.push('/launchpad')}
                  className="w-full py-3 rounded-lg bg-amber-400 text-gray-900 font-extrabold text-[13px] border-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  style={{ boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                  <Building2 className="w-3.5 h-3.5" /> Claim This Listing
                </button>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl border-[1.5px] border-green-200 p-4 sm:p-5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-green-800 mb-0.5">Verified Listing</p>
                  <p className="text-xs text-green-700 m-0 leading-snug">This product has been claimed and verified by its founder.</p>
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h3 className="text-[13px] font-extrabold text-gray-900 mb-3.5 uppercase tracking-wider">Share</h3>
              <div className="flex gap-2">
                <ShareButton label="Twitter / X" icon="𝕏" hoverColor="#000" hoverBg="#F9FAFB"
                  onClick={() => {
                    const text = encodeURIComponent(`Check out ${tool.name} on @LaudStack — ${tool.tagline}`);
                    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400');
                  }} />
                <ShareButton label="LinkedIn" icon="in" hoverColor="#0A66C2" hoverBg="#EFF6FF"
                  onClick={() => {
                    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=500');
                  }} />
                <CopyLinkButton url={typeof window !== 'undefined' ? window.location.href : ''} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ══ ALTERNATIVES (Full Width — Responsive Grid) ═════════════════════ */}
      {alternatives.length > 0 && (
        <section id="section-alternatives" className="bg-white border-t border-slate-200 py-12 sm:py-14">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-9 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-3">
                  <Layers className="w-3 h-3 text-blue-600" />
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Alternatives</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1.5" style={{ letterSpacing: '-0.02em' }}>
                  Top Alternatives to {tool.name}
                </h2>
                <p className="text-sm text-slate-500 m-0">
                  {alternatives.length} product{alternatives.length !== 1 ? 's' : ''} in {tool.category} you might also consider
                </p>
              </div>
              <Link href={`/alternatives?product=${tool.slug}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 no-underline px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0 self-start sm:self-auto">
                View all alternatives <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Alternatives Grid — responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {alternatives.map((alt, i) => (
                <AlternativeProductCard key={alt.id} product={alt} currentTool={tool} rank={i + 1} />
              ))}
            </div>

            {/* Quick Comparison Table */}
            <div className="mt-8 sm:mt-10 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base font-extrabold text-gray-900 m-0">Quick Comparison</h3>
                <Link href={`/compare?tools=${tool.slug},${alternatives[0]?.slug || ''}`}
                  className="text-xs font-bold text-amber-700 no-underline inline-flex items-center gap-1">
                  Full comparison <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]" style={{ minWidth: 560 }}>
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 sm:px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="py-3 px-3 sm:px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                      <th className="py-3 px-3 sm:px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Reviews</th>
                      <th className="py-3 px-3 sm:px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing</th>
                      <th className="py-3 px-3 sm:px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Lauds</th>
                      <th className="py-3 px-3 sm:px-5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Current tool row (highlighted) */}
                    <tr className="bg-amber-50 border-b border-amber-200">
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <img src={tool.logo_url} alt={tool.name} className="w-6 h-6 sm:w-7 sm:h-7 rounded-md object-contain border border-slate-200"
                            onError={e => { e.currentTarget.style.opacity = '0'; }} />
                          <span className="font-extrabold text-gray-900 text-sm">{tool.name}</span>
                          <span className="text-[10px] font-bold py-0.5 px-1.5 rounded bg-amber-400 text-gray-900">Current</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3" style={{ fill: '#FBBF24', color: '#FBBF24' }} />
                          <span className="font-bold text-gray-900">{tool.average_rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center font-semibold text-gray-700">{tool.review_count.toLocaleString()}</td>
                      <td className="py-3 px-3 sm:px-4 text-center font-semibold text-gray-700">{tool.pricing_model}</td>
                      <td className="py-3 px-3 sm:px-4 text-center font-semibold text-gray-700">{tool.upvote_count.toLocaleString()}</td>
                      <td className="py-3 px-3 sm:px-5 text-center">—</td>
                    </tr>
                    {/* Alternative rows */}
                    {alternatives.slice(0, 5).map((alt, i) => (
                      <tr key={alt.id} style={{ borderBottom: i < Math.min(alternatives.length, 5) - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <td className="py-3 px-4 sm:px-5">
                          <Link href={`/tools/${alt.slug}`} className="flex items-center gap-2.5 no-underline">
                            <img src={alt.logo_url} alt={alt.name} className="w-6 h-6 sm:w-7 sm:h-7 rounded-md object-contain border border-slate-200"
                              onError={e => { e.currentTarget.style.opacity = '0'; }} />
                            <span className="font-bold text-gray-900 text-sm">{alt.name}</span>
                            {alt.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                          </Link>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3 h-3" style={{ fill: '#FBBF24', color: '#FBBF24' }} />
                            <span className="font-bold text-gray-900">{alt.average_rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center font-semibold text-gray-700">{alt.review_count.toLocaleString()}</td>
                        <td className="py-3 px-3 sm:px-4 text-center font-semibold text-gray-700">{alt.pricing_model}</td>
                        <td className="py-3 px-3 sm:px-4 text-center font-semibold text-gray-700">{alt.upvote_count.toLocaleString()}</td>
                        <td className="py-3 px-3 sm:px-5 text-center">
                          <Link href={`/compare?tools=${tool.slug},${alt.slug}`}
                            className="text-xs font-bold text-blue-600 no-underline py-1 px-2.5 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                            Compare
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ SIMILAR PRODUCTS (cross-category, tag-based) ═════════════════════ */}
      {similarProducts.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200 py-10 sm:py-12">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-7 sm:mb-8 gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-2.5">
                  <Sparkles className="w-3 h-3 text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">You Might Also Like</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  Similar Products Across Categories
                </h2>
              </div>
              <Link href="/tools" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-700 no-underline shrink-0">
                Browse all products <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarProducts.map((product, i) => (
                <AlternativeProductCard key={product.id} product={product} currentTool={tool} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}"""

NEW_MAIN = """      {/* ══ MAIN CONTENT — Tab-based Two Column Layout ═══════════════════════ */}
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-start">

          {/* ── LEFT COLUMN (tab content) ────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-6 order-2 lg:order-1">

            {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
            {selectedTab === 'overview' && (
              <>
                {/* Description + tags */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 sm:mb-4" style={{ letterSpacing: '-0.02em' }}>Overview</h2>
                  <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed sm:leading-[1.75] mb-4 sm:mb-5">{tool.description}</p>
                  {tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map(tag => (
                        <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                          className="text-xs font-semibold py-1 px-3 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 no-underline hover:border-amber-300 hover:text-amber-700 transition-colors">
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                {/* ProductHunt-style media gallery */}
                {toolScreenshots.length > 0 && (
                  <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                    {/* Main image */}
                    <div className="relative bg-slate-100 overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: 380 }}>
                      {mediaErr ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-slate-400 text-sm font-medium">Media unavailable</p>
                        </div>
                      ) : (
                        <img
                          src={toolScreenshots[mediaIndex]?.url ?? toolScreenshots[0]?.url}
                          alt={toolScreenshots[mediaIndex]?.caption ?? tool.name}
                          className="w-full h-full object-cover object-top transition-opacity duration-200"
                          onError={() => setMediaErr(true)}
                        />
                      )}
                      {/* Caption overlay */}
                      {toolScreenshots[mediaIndex]?.caption && (
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/50 to-transparent">
                          <p className="text-xs text-white/90 font-medium m-0">{toolScreenshots[mediaIndex].caption}</p>
                        </div>
                      )}
                    </div>
                    {/* Thumbnail strip — only if multiple screenshots */}
                    {toolScreenshots.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-t border-slate-100" style={{ scrollbarWidth: 'none' }}>
                        {toolScreenshots.map((shot, i) => (
                          <button key={i} onClick={() => setMediaIndex(i)}
                            className="shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-transparent p-0"
                            style={{
                              width: 72, height: 48,
                              borderColor: mediaIndex === i ? '#F59E0B' : '#E2E8F0',
                              opacity: mediaIndex === i ? 1 : 0.65,
                            }}>
                            <img src={shot.url} alt={shot.caption} className="w-full h-full object-cover object-top" />
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Discussion / Comments */}
                <CommentsSection
                  toolId={parseInt(tool.id, 10)}
                  isAuthenticated={isAuthenticated}
                  currentUserId={dbUser?.id ?? null}
                  onAuthRequired={() => {
                    setAuthAction('comment');
                    setShowAuthModal(true);
                  }}
                />
              </>
            )}

            {/* ── FEATURES TAB ──────────────────────────────────────────── */}
            {selectedTab === 'features' && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-4 sm:mb-6" style={{ letterSpacing: '-0.02em' }}>Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {toolFeatures.map((feat, i) => (
                    <div key={i} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:border-amber-200 hover:shadow-sm">
                      <div className="text-2xl mb-2.5">{feat.icon}</div>
                      <h3 className="text-sm font-extrabold text-gray-900 mb-1">{feat.title}</h3>
                      <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed m-0">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── PRICING TAB ───────────────────────────────────────────── */}
            {selectedTab === 'pricing' && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Pricing</h2>
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-700 no-underline inline-flex items-center gap-1">
                    View full pricing <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {toolPricingTiers.map((tier, i) => (
                    <div key={i} className="rounded-2xl p-5 sm:p-6 relative flex flex-col gap-3.5"
                      style={{
                        border: tier.highlighted ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                        background: tier.highlighted ? '#FFFBEB' : '#FAFBFC',
                        boxShadow: tier.highlighted ? '0 4px 20px rgba(245,158,11,0.12)' : 'none',
                      }}>
                      {tier.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-[11px] font-extrabold px-3.5 py-0.5 rounded-full whitespace-nowrap">
                          {tier.badge}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{tier.name}</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.03em' }}>{tier.price}</span>
                          {tier.period && <span className="text-xs text-slate-400 font-medium">{tier.period}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-snug">{tier.description}</p>
                      </div>
                      <div className="flex-1 flex flex-col gap-2.5">
                        {tier.features.map((f, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: tier.highlighted ? '#B45309' : '#15803D' }} />
                            <span className="text-[13px] text-gray-700 leading-snug">{f}</span>
                          </div>
                        ))}
                      </div>
                      <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center py-3 rounded-lg text-[13px] font-bold no-underline transition-all"
                        style={{
                          background: tier.highlighted ? '#F59E0B' : '#FFFFFF',
                          color: tier.highlighted ? '#0A0A0A' : '#374151',
                          border: tier.highlighted ? 'none' : '1.5px solid #E2E8F0',
                          boxShadow: tier.highlighted ? '0 3px 10px rgba(245,158,11,0.3)' : 'none',
                        }}>
                        {tier.cta}
                      </a>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-4 text-center">
                  Pricing shown is indicative. Visit {tool.name}&apos;s website for the latest pricing.
                </p>
              </section>
            )}

            {/* ── REVIEWS TAB ───────────────────────────────────────────── */}
            {selectedTab === 'reviews' && (
              <>
                {/* Ratings & Reviews Summary */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <div className="flex items-center justify-between gap-3 mb-6 sm:mb-7 flex-wrap">
                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Ratings &amp; Reviews</h2>
                    <button onClick={handleWriteReview}
                      className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-bold text-[13px] border-none cursor-pointer transition-all hover:shadow-md whitespace-nowrap"
                      style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.25)' }}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center mb-7 sm:mb-8 p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-center shrink-0">
                      <div className="text-4xl sm:text-5xl font-black text-gray-900 leading-none" style={{ letterSpacing: '-0.04em' }}>
                        {totalReviews > 0 ? realAvgRating.toFixed(1) : '0.0'}
                      </div>
                      <div className="mt-1.5"><StarRating rating={realAvgRating} size={16} /></div>
                      <div className="text-[13px] text-slate-500 mt-1.5 font-medium">{totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}</div>
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-2">
                      {ratingBreakdown.map(({ star, count }) => (
                        <RatingBar key={star} label={`${star} ★`} count={count} total={totalReviews} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Individual Reviews */}
                <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100">
                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Community Reviews</h2>
                  </div>
                  <div className="flex flex-col">
                    {reviews.length === 0 && (
                      <div className="px-5 sm:px-7 py-12 text-center">
                        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No reviews yet</h3>
                        <p className="text-xs text-slate-500 mb-4">Be the first to share your experience with this tool.</p>
                        <button onClick={handleWriteReview}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-bold text-xs border-none cursor-pointer transition-all hover:shadow-md"
                          style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.2)' }}>
                          <MessageSquare className="w-3 h-3" />
                          {isAuthenticated ? 'Write the First Review' : 'Sign In to Review'}
                        </button>
                      </div>
                    )}
                    {reviews.map((review, i) => (
                      <div key={review.id} className="px-5 sm:px-7 py-5 sm:py-6" style={{ borderBottom: i < reviews.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] rounded-full shrink-0 flex items-center justify-center"
                              style={{ background: `hsl(${(review.user?.name.charCodeAt(0) ?? 65) * 7}, 50%, 52%)` }}>
                              <span className="text-sm sm:text-base font-extrabold text-white">{review.user?.name.charAt(0) ?? '?'}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">{review.user?.name}</span>
                                {review.is_verified_purchase && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2 rounded-full bg-green-50 text-green-700 border border-green-200">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 font-medium mt-0.5">
                                {review.user?.role}{review.user?.company ? ` · ${review.user.company}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1">
                            <StarRating rating={review.rating} size={13} />
                            <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                        <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 mb-2 leading-snug">{review.title}</h3>
                        <p className="text-[13px] sm:text-sm text-gray-700 leading-relaxed sm:leading-[1.7] mb-4">{review.body}</p>
                        {(review.pros || review.cons) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {review.pros && (
                              <div className="p-3 sm:p-3.5 rounded-xl bg-green-50 border border-green-200">
                                <div className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-1.5">Pros</div>
                                <p className="text-xs sm:text-[13px] text-green-800 m-0 leading-snug">{review.pros}</p>
                              </div>
                            )}
                            {review.cons && (
                              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                                <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1.5">Cons</div>
                                <p className="text-xs sm:text-[13px] text-rose-800 m-0 leading-snug">{review.cons}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {editingReview === review.id ? (
                          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                            <div>
                              <label className="text-xs font-bold text-slate-600 mb-1 block">Rating</label>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <button key={s} onClick={() => setEditRating(s)} className="p-0 border-none bg-transparent cursor-pointer">
                                    <Star className="w-5 h-5" style={{ fill: s <= editRating ? '#FBBF24' : '#E2E8F0', color: s <= editRating ? '#FBBF24' : '#E2E8F0' }} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Review title" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                            <textarea value={editBody} onChange={e => setEditBody(e.target.value)} placeholder="Your review" rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none" />
                            <div className="grid grid-cols-2 gap-2">
                              <input value={editPros} onChange={e => setEditPros(e.target.value)} placeholder="Pros" className="px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                              <input value={editCons} onChange={e => setEditCons(e.target.value)} placeholder="Cons" className="px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveEdit(review.id)} disabled={savingEdit}
                                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50">
                                {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                              </button>
                              <button onClick={() => setEditingReview(null)} className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => handleHelpful(review.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all"
                            style={{
                              color: helpfulMap[review.id] ? '#15803D' : '#64748B',
                              background: helpfulMap[review.id] ? '#F0FDF4' : 'transparent',
                              border: helpfulMap[review.id] ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                              cursor: helpfulMap[review.id] ? 'default' : 'pointer',
                            }}>
                            <ThumbsUp className="w-3 h-3" />
                            Helpful ({review.helpful_count + (helpfulMap[review.id] ? 1 : 0)})
                          </button>
                          {isOwnReview(review) && editingReview !== review.id && (
                            <>
                              <button onClick={() => startEditReview(review)}
                                className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={() => handleDeleteReview(review.id)}
                                disabled={deletingReview === review.id}
                                className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
                                {deletingReview === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
                              </button>
                            </>
                          )}
                        </div>
                        {review.founder_reply && (
                          <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-400">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-3.5 h-3.5 text-amber-700" />
                              <span className="text-xs font-bold text-amber-700">Founder Reply</span>
                              <span className="text-[11px] text-amber-800">· {formatDate(review.founder_reply.created_at)}</span>
                            </div>
                            <p className="text-[13px] text-amber-900 leading-relaxed m-0">{review.founder_reply.body}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-5 sm:px-7 py-4 sm:py-5 bg-amber-50 border-t border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-0.5">Have experience with {tool.name}?</p>
                      <p className="text-[13px] text-slate-500 m-0">Share your honest review and help others make informed decisions.</p>
                    </div>
                    <button onClick={handleWriteReview}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-bold text-[13px] border-none cursor-pointer transition-all hover:shadow-md whitespace-nowrap shrink-0"
                      style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* ── TEAM TAB ──────────────────────────────────────────────── */}
            {selectedTab === 'team' && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-5" style={{ letterSpacing: '-0.02em' }}>Team &amp; Founder</h2>
                {tool.founder ? (
                  <div className="flex flex-col gap-4">
                    {/* Founder card */}
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      {/* Avatar */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0 border-2 border-white flex items-center justify-center overflow-hidden"
                        style={{
                          background: `hsl(${(tool.founder.name.charCodeAt(0)) * 7}, 50%, 52%)`,
                          boxShadow: '0 2px 12px rgba(15,23,42,0.1)',
                        }}>
                        {tool.founder.avatar_url ? (
                          <img src={tool.founder.avatar_url} alt={tool.founder.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <span className="text-xl font-black text-white">{tool.founder.name.charAt(0)}</span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-base font-extrabold text-gray-900">{tool.founder.name}</span>
                          {tool.founder.is_pro && (
                            <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-purple-50 text-purple-600 border border-purple-200">PRO</span>
                          )}
                          <span className="text-[11px] font-semibold py-0.5 px-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Founder</span>
                        </div>
                        {tool.founder.bio && (
                          <p className="text-sm text-slate-600 leading-relaxed mb-3">{tool.founder.bio}</p>
                        )}
                        {/* Social links */}
                        {(tool.founder.twitter_handle || tool.founder.linkedin_url) && (
                          <div className="flex gap-2 flex-wrap">
                            {tool.founder.twitter_handle && (
                              <a href={`https://twitter.com/${tool.founder.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 no-underline py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors">
                                <span className="font-black">𝕏</span> @{tool.founder.twitter_handle}
                              </a>
                            )}
                            {tool.founder.linkedin_url && (
                              <a href={tool.founder.linkedin_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 no-underline py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                                <span className="font-black text-[11px]">in</span> LinkedIn
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Built with */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-900 mb-0.5">Built by the {tool.founder.name} team</p>
                        <p className="text-xs text-amber-700 m-0">
                          {tool.is_verified
                            ? 'This listing has been claimed and verified by the founder.'
                            : 'Want to claim this listing? Visit the LaunchPad to get started.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500 mb-1">No team information yet</p>
                    <p className="text-xs text-slate-400 mb-4">The founder hasn&apos;t added team details yet.</p>
                    <button onClick={() => router.push('/launchpad')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors border-none cursor-pointer">
                      Claim this listing <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── DISCUSSION TAB ────────────────────────────────────────── */}
            {selectedTab === 'discussion' && (
              <CommentsSection
                toolId={parseInt(tool.id, 10)}
                isAuthenticated={isAuthenticated}
                currentUserId={dbUser?.id ?? null}
                onAuthRequired={() => {
                  setAuthAction('comment');
                  setShowAuthModal(true);
                }}
              />
            )}

            {/* ── ALTERNATIVES TAB ──────────────────────────────────────── */}
            {selectedTab === 'alternatives' && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-2.5">
                      <Layers className="w-3 h-3 text-blue-600" />
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Alternatives</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
                      Top Alternatives to {tool.name}
                    </h2>
                    <p className="text-sm text-slate-500 m-0">
                      {alternatives.length > 0
                        ? `${alternatives.length} product${alternatives.length !== 1 ? 's' : ''} in ${tool.category} to consider`
                        : `No alternatives found in ${tool.category} yet`}
                    </p>
                  </div>
                  {alternatives.length > 0 && (
                    <Link href={`/alternatives?product=${tool.slug}`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 no-underline px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0 self-start sm:self-auto">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                {alternatives.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {alternatives.map((alt, i) => (
                      <AlternativeProductCard key={alt.id} product={alt} currentTool={tool} rank={i + 1} />
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500 mb-1">No alternatives listed yet</p>
                    <p className="text-xs text-slate-400">Check back later or browse all tools in this category.</p>
                    <Link href={`/tools?category=${encodeURIComponent(tool.category)}`}
                      className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-amber-700 no-underline px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                      Browse {tool.category} tools <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </section>
            )}

          </div>

          {/* ── RIGHT SIDEBAR ────────────────────────────────────────────── */}
          <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 order-1 lg:order-2 lg:sticky lg:top-[140px]">

            {/* Stack Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h3 className="text-[11px] font-extrabold text-slate-400 mb-4 uppercase tracking-widest">Stack Details</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Tag, label: 'Category', value: tool.category },
                  { icon: Globe, label: 'Pricing', value: tool.pricing_model },
                  { icon: Calendar, label: 'Launched', value: new Date(tool.launched_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                  { icon: Award, label: 'Rank Score', value: tool.rank_score.toLocaleString() },
                  { icon: TrendingUp, label: 'Weekly Change', value: tool.weekly_rank_change ? `+${tool.weekly_rank_change}` : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[13px] text-slate-500">{label}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              {/* Social links — founder's social profiles */}
              {tool.founder && (tool.founder.twitter_handle || tool.founder.linkedin_url) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Connect</p>
                  <div className="flex gap-2 flex-wrap">
                    {tool.founder.twitter_handle && (
                      <a href={`https://twitter.com/${tool.founder.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 no-underline py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                        <span className="font-black text-[11px]">𝕏</span> Twitter
                      </a>
                    )}
                    {tool.founder.linkedin_url && (
                      <a href={tool.founder.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 no-underline py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                        <span className="font-black text-[11px]">in</span> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackOutboundClick('website')}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-400 text-gray-900 font-extrabold text-[13px] no-underline transition-all hover:shadow-md"
                  style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.3)' }}>
                  Visit Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Founder quick card — compact sidebar version */}
            {tool.founder && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h3 className="text-[11px] font-extrabold text-slate-400 mb-3.5 uppercase tracking-widest">Built By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shrink-0 border border-slate-200 flex items-center justify-center overflow-hidden"
                    style={{ background: `hsl(${(tool.founder.name.charCodeAt(0)) * 7}, 50%, 52%)` }}>
                    {tool.founder.avatar_url ? (
                      <img src={tool.founder.avatar_url} alt={tool.founder.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-extrabold text-white">{tool.founder.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900 truncate">{tool.founder.name}</span>
                      {tool.founder.is_pro && (
                        <span className="text-[10px] font-bold py-0.5 px-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">PRO</span>
                      )}
                    </div>
                    {tool.founder.bio && <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{tool.founder.bio}</p>}
                  </div>
                </div>
                <button onClick={() => setSelectedTab('team')}
                  className="mt-3 w-full py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
                  View full profile →
                </button>
              </div>
            )}

            {/* Claim / Verified */}
            {!tool.is_verified ? (
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#0F1629', boxShadow: '0 4px 24px rgba(15,23,42,0.18)' }}>
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }} />
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mb-3" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <Building2 className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">For Founders</span>
                </div>
                <h3 className="text-sm font-black text-white mb-1.5 leading-tight" style={{ letterSpacing: '-0.02em' }}>Is this your product?</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">Claim this listing to unlock founder features and grow faster.</p>
                <button onClick={() => router.push('/launchpad')}
                  className="w-full py-2.5 rounded-lg bg-amber-400 text-gray-900 font-extrabold text-[13px] border-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  style={{ boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                  <Building2 className="w-3.5 h-3.5" /> Claim This Listing
                </button>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl border-[1.5px] border-green-200 p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-green-800 mb-0.5">Verified Listing</p>
                  <p className="text-xs text-green-700 m-0 leading-snug">Claimed and verified by its founder.</p>
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h3 className="text-[11px] font-extrabold text-slate-400 mb-3.5 uppercase tracking-widest">Share</h3>
              <div className="flex gap-2">
                <ShareButton label="Twitter / X" icon="𝕏" hoverColor="#000" hoverBg="#F9FAFB"
                  onClick={() => {
                    const text = encodeURIComponent(`Check out ${tool.name} on @LaudStack — ${tool.tagline}`);
                    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400');
                  }} />
                <ShareButton label="LinkedIn" icon="in" hoverColor="#0A66C2" hoverBg="#EFF6FF"
                  onClick={() => {
                    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=500');
                  }} />
                <CopyLinkButton url={typeof window !== 'undefined' ? window.location.href : ''} />
              </div>
            </div>
          </aside>
        </div>
      </div>"""

content = content.replace(OLD_MAIN, NEW_MAIN, 1)

with open('src/app/tools/[slug]/page.tsx', 'w') as f:
    f.write(content)

print("Done — full redesign applied")
print(f"File length: {len(content.splitlines())} lines")

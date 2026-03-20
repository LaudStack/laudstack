"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  User, Star, Bookmark, Globe, Twitter, Linkedin,
  ChevronLeft, Rocket, CheckCircle, Award, Calendar,
  ExternalLink, MessageSquare, ArrowRight, Zap, BookmarkCheck,
  Briefcase, Building2, Shield, Users, UserPlus, UserMinus, ChevronDown, ChevronUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FollowUserButton from '@/components/FollowUserButton';
import { getUserFollowCounts, getFollowers, getFollowing, isFollowingUser } from '@/app/actions/follows';
import { useAuth } from '@/hooks/useAuth';
import { useDbUser } from '@/hooks/useDbUser';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

const BADGE_CONFIG: Record<string, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  amber: { icon: Star, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  blue: { icon: Star, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  purple: { icon: Award, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  green: { icon: Bookmark, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  emerald: { icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  orange: { icon: Zap, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

const BADGE_ICONS: Record<string, React.ElementType> = {
  star: Star,
  award: Award,
  bookmark: BookmarkCheck,
  rocket: Rocket,
  check: CheckCircle,
  zap: Zap,
};

export default function PublicProfile() {
  const params = useParams();
  const userId = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const { dbUser } = useDbUser();
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [isCurrentUserFollowing, setIsCurrentUserFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/profile/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      })
      .then(data => { setProfile(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [userId]);

  // Fetch follow counts and follow state
  useEffect(() => {
    if (!userId) return;
    const numId = parseInt(userId, 10);
    if (isNaN(numId)) return;
    getUserFollowCounts(numId).then(setFollowCounts).catch(() => {});
    if (isAuthenticated) {
      isFollowingUser(numId).then(setIsCurrentUserFollowing).catch(() => {});
    }
  }, [userId, isAuthenticated]);

  const loadFollowers = useCallback(async () => {
    if (!userId) return;
    setFollowersLoading(true);
    try {
      const result = await getFollowers(parseInt(userId, 10));
      setFollowersList(result.users);
    } catch { /* ignore */ }
    setFollowersLoading(false);
  }, [userId]);

  const loadFollowing = useCallback(async () => {
    if (!userId) return;
    setFollowingLoading(true);
    try {
      const result = await getFollowing(parseInt(userId, 10));
      setFollowingList(result.users);
    } catch { /* ignore */ }
    setFollowingLoading(false);
  }, [userId]);

  const handleToggleFollowers = () => {
    if (!showFollowers && followersList.length === 0) loadFollowers();
    setShowFollowers(!showFollowers);
    setShowFollowing(false);
  };

  const handleToggleFollowing = () => {
    if (!showFollowing && followingList.length === 0) loadFollowing();
    setShowFollowing(!showFollowing);
    setShowFollowers(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="h-[60px] lg:h-[64px]" />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-100 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-32 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="h-[60px] lg:h-[64px]" />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-slate-900 font-black text-xl mb-2">Profile not found</h2>
          <p className="text-slate-600 text-sm mb-6">This user profile doesn&apos;t exist or has been made private.</p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { user: u, stats, recentReviews, badges = [], founderTools = [] } = profile;
  const initials = u.name ? u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const memberSince = u.memberSince ? new Date(u.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
  const isFounder = u.founderStatus === 'verified';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="h-[60px] lg:h-[64px]" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-amber-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        {/* Profile card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Cover — executive gradient for founders */}
          <div className={`h-36 relative ${
            isFounder
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900'
              : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500'
          }`}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            {isFounder && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-400/20 backdrop-blur-sm text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1.5 rounded-full">
                <Rocket className="w-3 h-3" /> Verified Founder
              </div>
            )}
          </div>

          {/* Avatar + info */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-end justify-between -mt-14 mb-4">
              <div className="relative">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.name} className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-white object-cover shadow-lg" />
                ) : (
                  <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-white flex items-center justify-center text-white font-black text-xl sm:text-3xl shadow-lg ${
                    isFounder
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900'
                      : 'bg-gradient-to-br from-amber-400 to-amber-500'
                  }`}>
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap justify-end">
                {isFounder && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                    <Rocket className="w-3 h-3" /> Founder
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>

            <h1 className="text-slate-900 font-black text-xl sm:text-2xl">{u.name}</h1>
            {u.headline && <p className="text-amber-600 font-semibold text-sm mt-1">{u.headline}</p>}

            {/* Job title & company */}
            {(u.jobTitle || u.company) && (
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                {u.jobTitle && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> {u.jobTitle}
                  </span>
                )}
                {u.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {u.company}
                  </span>
                )}
              </div>
            )}

            {u.bio && <p className="text-slate-600 text-sm mt-3 leading-relaxed max-w-xl">{u.bio}</p>}

            {/* Follow button + counts */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {(!dbUser || dbUser.id !== parseInt(userId, 10)) && (
                <FollowUserButton
                  targetUserId={parseInt(userId, 10)}
                  targetUserName={u.name || 'User'}
                  initialFollowing={isCurrentUserFollowing}
                  onAuthRequired={() => {
                    window.location.href = '/login';
                  }}
                  onToggle={(following) => {
                    setIsCurrentUserFollowing(following);
                    setFollowCounts(prev => ({
                      ...prev,
                      followers: following ? prev.followers + 1 : Math.max(0, prev.followers - 1),
                    }));
                  }}
                />
              )}
              <button
                onClick={handleToggleFollowers}
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-amber-600 transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                <Users className="w-4 h-4" />
                <span className="font-bold text-slate-900">{followCounts.followers}</span> Followers
                {showFollowers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button
                onClick={handleToggleFollowing}
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-amber-600 transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                <span className="font-bold text-slate-900">{followCounts.following}</span> Following
                {showFollowing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Expandable followers list */}
            {showFollowers && (
              <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Followers</h4>
                {followersLoading ? (
                  <div className="py-4 text-center text-sm text-slate-600">Loading...</div>
                ) : followersList.length === 0 ? (
                  <div className="py-4 text-center text-sm text-slate-600">No followers yet</div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {followersList.map((f: any) => (
                      <Link key={f.id} href={`/profile/${f.id}`} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white transition-colors no-underline">
                        {f.avatarUrl ? (
                          <img src={f.avatarUrl} alt={f.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                            {(f.name || 'U')[0]}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-700">{f.name || 'Anonymous'}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Expandable following list */}
            {showFollowing && (
              <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Following</h4>
                {followingLoading ? (
                  <div className="py-4 text-center text-sm text-slate-600">Loading...</div>
                ) : followingList.length === 0 ? (
                  <div className="py-4 text-center text-sm text-slate-600">Not following anyone yet</div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {followingList.map((f: any) => (
                      <Link key={f.id} href={`/profile/${f.id}`} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white transition-colors no-underline">
                        {f.avatarUrl ? (
                          <img src={f.avatarUrl} alt={f.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                            {(f.name || 'U')[0]}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-700">{f.name || 'Anonymous'}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {u.website && (
                <a href={u.website.startsWith('http') ? u.website : `https://${u.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-amber-600 transition-colors">
                  <Globe className="w-4 h-4" /> {u.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {u.twitterHandle && (
                <a href={`https://twitter.com/${u.twitterHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-amber-600 transition-colors">
                  <Twitter className="w-4 h-4" /> {u.twitterHandle}
                </a>
              )}
              {memberSince && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" /> Joined {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-5 text-center">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-black text-slate-900">{stats.reviewCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Reviews Written</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-5 text-center">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-black text-slate-900">{stats.avgRating ? stats.avgRating.toFixed(1) : '0.0'}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Avg Rating Given</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-5 text-center">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-lg sm:text-2xl font-black text-slate-900">{stats.savedToolsCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Tools Saved</div>
          </div>
        </div>

        {/* Badges & Achievements */}
        {badges.length > 0 && (
          <div className="mt-6">
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Badges & Achievements
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge: any) => {
                const config = BADGE_CONFIG[badge.color] || BADGE_CONFIG.amber;
                const IconComp = BADGE_ICONS[badge.icon] || Star;
                return (
                  <div
                    key={badge.id}
                    className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} border ${config.border} text-xs font-bold px-3 py-1.5 rounded-full`}
                  >
                    <IconComp className="w-3 h-3" />
                    {badge.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Founder's Tools */}
        {isFounder && founderTools.length > 0 && (
          <div className="mt-6">
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-amber-500" />
              Tools by {u.name?.split(' ')[0] || 'Founder'}
            </h3>
            <div className="space-y-3">
              {founderTools.map((tool: any) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="block bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-amber-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                      {tool.logoUrl ? (
                        <img
                          src={tool.logoUrl}
                          alt={tool.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`w-full h-full flex items-center justify-center text-lg font-black text-slate-600 ${tool.logoUrl ? 'hidden' : ''}`}>
                        {(tool.name || 'T')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-slate-900 font-bold text-sm group-hover:text-amber-600 transition-colors truncate">
                          {tool.name}
                        </h4>
                        {tool.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      {tool.tagline && (
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{tool.tagline}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-slate-700">
                            {tool.averageRating ? Number(tool.averageRating).toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-xs text-slate-500">({tool.reviewCount || 0})</span>
                        </div>
                        <div
                          className="flex items-center gap-1"
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1.5px solid #E2E8F0',
                            background: '#F8FAFC',
                            color: '#64748B',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                            <path fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z" />
                          </svg>
                          {tool.upvoteCount || 0}
                        </div>
                        {tool.category && (
                          <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                            {tool.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                  {/* Screenshot preview */}
                  {tool.screenshotUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={tool.screenshotUrl}
                        alt={`${tool.name} screenshot`}
                        className="w-full h-32 object-cover object-top"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {recentReviews && recentReviews.length > 0 && (
          <div className="mt-6">
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Recent Reviews
            </h3>
            <div className="space-y-3">
              {recentReviews.map((review: any) => (
                <div key={review.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                        {review.toolLogo ? (
                          <img src={review.toolLogo} alt={review.toolName} className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-sm font-black text-slate-600">
                            {(review.toolName || 'T')[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <Link href={`/tools/${review.toolSlug}`} className="text-slate-900 font-bold text-sm hover:text-amber-600 transition-colors">
                          {review.toolName}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRow rating={review.rating} />
                          <span className="text-xs text-slate-500">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.title && <h4 className="text-slate-900 font-semibold text-sm mb-1">{review.title}</h4>}
                  {review.body && <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{review.body}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for no reviews */}
        {(!recentReviews || recentReviews.length === 0) && (
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
            <Star className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold text-sm">No reviews yet</p>
            <p className="text-slate-500 text-xs mt-1">This user hasn&apos;t written any reviews.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

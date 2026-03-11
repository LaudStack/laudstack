/*
 * LaudStack — User Dashboard (/dashboard)
 * Design: Clean white sidebar layout, amber accents, professional UX
 * Tabs: Profile · My Reviews · Saved Tools · Notifications · Settings
 * Auth: Uses real Manus OAuth via AuthContext
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  User, Star, Bookmark, Settings, Bell, Shield, ChevronRight,
  Edit3, Camera, CheckCircle, TrendingUp, MessageSquare, Heart,
  ExternalLink, Trash2, LogOut, Eye, EyeOff, Save, AlertCircle,
  Award, Calendar, Globe, Twitter, Linkedin, Mail,
  Package, ArrowRight, X, Info, Zap, Crown,
  ThumbsUp, Reply, Clock, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, getInitials } from '@/contexts/AuthContext';
import { useSavedTools } from '@/hooks/useSavedTools';
import { MOCK_TOOLS, MOCK_REVIEWS } from '@/lib/mockData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'reviews' | 'saved' | 'notifications' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'profile',       label: 'My Profile',     icon: <User className="w-4 h-4" /> },
  { id: 'reviews',       label: 'My Reviews',     icon: <Star className="w-4 h-4" /> },
  { id: 'saved',         label: 'Saved Tools',    icon: <Bookmark className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications',  icon: <Bell className="w-4 h-4" />, badge: 3 },
  { id: 'settings',      label: 'Settings',       icon: <Settings className="w-4 h-4" /> },
];

// ─── Mock notifications ───────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'reply', title: 'Founder replied to your review', body: 'The founder of Notion AI replied to your review: "Thank you for the detailed feedback..."', time: '2 hours ago', read: false, iconColor: '#3B82F6', iconBg: '#EFF6FF' },
  { id: 'n2', type: 'helpful', title: '12 people found your review helpful', body: 'Your review of Linear was marked helpful by 12 users this week.', time: '1 day ago', read: false, iconColor: '#22C55E', iconBg: '#F0FDF4' },
  { id: 'n3', type: 'deal', title: 'New deal on a saved tool', body: 'Notion AI is offering 40% off annual plans for LaudStack members.', time: '2 days ago', read: false, iconColor: '#F59E0B', iconBg: '#FFFBEB' },
  { id: 'n4', type: 'badge', title: 'You earned the "Trusted Reviewer" badge', body: 'Your reviews have been consistently helpful. You\'ve earned the Trusted Reviewer badge!', time: '3 days ago', read: true, iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
  { id: 'n5', type: 'launch', title: 'New tool in your watchlist category', body: 'A new AI Productivity tool "FlowAI" just launched. Check it out!', time: '5 days ago', read: true, iconColor: '#EC4899', iconBg: '#FDF2F8' },
];

// ─── Helper components ────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${value ? 'bg-amber-400' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user }: { user: { name: string; email: string; role: string } }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState('Product builder and SaaS enthusiast. I review tools I actually use in my daily workflow.');
  const [company, setCompany] = useState('Independent');
  const [jobRole, setJobRole] = useState('Founder');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [showEmail, setShowEmail] = useState(false);

  const userReviews = MOCK_REVIEWS.filter(r => r.user_id === 'u1');
  const totalHelpful = userReviews.reduce((s, r) => s + r.helpful_count, 0);
  const avgRating = userReviews.length > 0 ? userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length : 0;

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #171717 0%, #1e293b 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* Avatar + actions */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-slate-900 border-4 border-white shadow-lg"
                style={{ background: '#F59E0B' }}
              >
                {getInitials(name)}
              </div>
              {editing && (
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Camera className="w-3 h-3 text-slate-600" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 pb-1">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-2 rounded-xl transition-colors" style={{ background: '#F59E0B' }}>
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: name, onChange: setName, placeholder: 'Jane Smith' },
                  { label: 'Role / Title', value: jobRole, onChange: setJobRole, placeholder: 'Founder' },
                  { label: 'Company', value: company, onChange: setCompany, placeholder: 'Acme Inc.' },
                  { label: 'Website', value: website, onChange: setWebsite, placeholder: 'https://yoursite.com' },
                  { label: 'Twitter / X', value: twitter, onChange: setTwitter, placeholder: '@handle' },
                  { label: 'LinkedIn', value: linkedin, onChange: setLinkedin, placeholder: 'linkedin.com/in/...' },
                ].map(({ label, value, onChange, placeholder }) => (
                  <div key={label}>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wide mb-1.5">{label}</label>
                    <input
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      placeholder={placeholder}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wide mb-1.5">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 resize-none" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-slate-900 font-bold text-xl">{name}</h2>
                <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">{jobRole} · {company}</p>
              <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                <button onClick={() => setShowEmail(!showEmail)} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                  {showEmail ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showEmail ? user.email : '••••••@••••••.com'}
                </button>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{bio}</p>
              <div className="flex items-center gap-4 flex-wrap">
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 font-medium transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                {twitter && <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Twitter className="w-3.5 h-3.5" /> {twitter}</span>}
                {linkedin && <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Linkedin className="w-3.5 h-3.5" /> LinkedIn</span>}
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
          <div className="text-2xl font-black text-amber-500">{userReviews.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Reviews Written</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
          <div className="text-2xl font-black text-green-500">{totalHelpful}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Helpful Votes</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
          <div className="text-2xl font-black text-blue-500">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Avg Rating Given</div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Badges & Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: CheckCircle, label: 'Verified Member', desc: 'Account verified', color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0' },
            { icon: MessageSquare, label: 'First Review', desc: 'Wrote first review', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
            { icon: ThumbsUp, label: 'Helpful Reviewer', desc: '10+ helpful votes', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
          ].map(({ icon: Icon, label, desc, color, bg, border }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: bg, borderColor: border }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            </div>
          ))}
          {/* Locked badges */}
          {[
            { label: 'Power Reviewer', desc: 'Write 10+ reviews' },
            { label: 'Founder', desc: 'Submit a tool' },
            { label: 'Community Leader', desc: '50+ helpful votes' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 opacity-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-200">
                <Shield className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">{label}</div>
                <div className="text-xs text-slate-400">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder CTA */}
      <div className="rounded-2xl p-5 border border-amber-200" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F59E0B' }}>
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-900 font-bold mb-1">Are you a founder?</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">List your tool on LaudStack, reply to reviews, manage deals, and access detailed analytics.</p>
            <Link href="/dashboard/founder">
              <button
                className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl transition-all"
                style={{ background: '#F59E0B' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#D97706')}
                onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
              >
                <Crown className="w-3.5 h-3.5" /> Go to Founder Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab() {
  const userReviews = MOCK_REVIEWS.filter(r => r.user_id === 'u1');
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [sort, setSort] = useState<'newest' | 'helpful'>('newest');

  const filtered = userReviews
    .filter(r => filter === 'all' || r.rating === Number(filter))
    .sort((a, b) => sort === 'helpful' ? b.helpful_count - a.helpful_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">My Reviews</h3>
            <p className="text-slate-500 text-sm">{userReviews.length} reviews · {userReviews.reduce((s, r) => s + r.helpful_count, 0)} helpful votes</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-amber-400 cursor-pointer">
              <option value="all">All Ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-amber-400 cursor-pointer">
              <option value="newest">Newest</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reviews yet</p>
          <Link href="/tools"><button className="mt-4 text-sm font-bold text-amber-600 hover:text-amber-700">Browse Tools →</button></Link>
        </div>
      ) : (
        filtered.map(review => {
          const tool = MOCK_TOOLS.find(t => t.id === review.tool_id);
          return (
            <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-3 mb-4">
                <img src={tool?.logo_url || ''} alt={tool?.name || ''} className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool?.name || 'T')}&background=f1f5f9&color=64748b&size=40`; }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/tools/${tool?.slug}`}>
                      <span className="text-slate-900 font-bold text-sm hover:text-amber-600 transition-colors cursor-pointer">{tool?.name}</span>
                    </Link>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{tool?.category}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <StarRow rating={review.rating} />
                    <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                  <ThumbsUp className="w-3.5 h-3.5" /><span>{review.helpful_count}</span>
                </div>
              </div>
              <h4 className="text-slate-900 font-semibold text-sm mb-2">{review.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">{review.body}</p>
              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {review.pros && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-green-700 mb-1">Pros</p>
                      <p className="text-xs text-green-700 leading-relaxed">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-red-700 mb-1">Cons</p>
                      <p className="text-xs text-red-700 leading-relaxed">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}
              {review.founder_reply && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Reply className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700">Founder Reply</span>
                    <span className="text-xs text-blue-400">{new Date(review.founder_reply.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">{review.founder_reply.body}</p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Saved Tools Tab ──────────────────────────────────────────────────────────
function SavedTab() {
  const { savedIds, toggle } = useSavedTools();
  const savedTools = MOCK_TOOLS.filter(t => savedIds.includes(t.id));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(savedTools.map(t => t.category)))];
  const filtered = savedTools.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.tagline.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || t.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">Saved Tools</h3>
            <p className="text-slate-500 text-sm">{savedTools.length} tools in your library</p>
          </div>
          <Link href="/tools">
            <button className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700">
              <Package className="w-3.5 h-3.5" /> Browse More
            </button>
          </Link>
        </div>
        {savedTools.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search saved tools..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-amber-400 bg-slate-50" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-amber-400 cursor-pointer">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
      </div>

      {savedTools.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No saved tools yet</p>
          <p className="text-slate-400 text-sm mt-1">Click the bookmark icon on any tool to save it here.</p>
          <Link href="/tools"><button className="mt-4 text-sm font-bold text-amber-600 hover:text-amber-700">Discover Tools →</button></Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No tools match your search</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(tool => (
            <div key={tool.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-slate-300 transition-colors">
              <img src={tool.logo_url} alt={tool.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=48`; }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-900 font-bold text-sm">{tool.name}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{tool.category}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{tool.pricing_model}</span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5 truncate">{tool.tagline}</p>
                <div className="flex items-center gap-3 mt-1">
                  <StarRow rating={Math.round(tool.average_rating)} />
                  <span className="text-xs text-slate-500 font-medium">{tool.average_rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">{tool.review_count} reviews</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/tools/${tool.slug}`}>
                  <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </Link>
                <button onClick={() => { toggle(tool.id); toast.success('Removed from saved tools'); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const NOTIF_ICONS: Record<string, React.ReactNode> = {
    reply: <Reply className="w-4 h-4" />,
    helpful: <ThumbsUp className="w-4 h-4" />,
    deal: <Zap className="w-4 h-4" />,
    badge: <Award className="w-4 h-4" />,
    launch: <Package className="w-4 h-4" />,
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">Notifications</h3>
            <p className="text-slate-500 text-sm">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No notifications</p>
        </div>
      ) : (
        notifications.map(notif => (
          <div
            key={notif.id}
            className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer hover:border-slate-300 ${!notif.read ? 'border-l-4 border-l-amber-400 border-slate-200' : 'border-slate-200'}`}
            onClick={() => markRead(notif.id)}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: notif.iconBg, color: notif.iconColor }}>
                {NOTIF_ICONS[notif.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                    <button onClick={e => { e.stopPropagation(); dismiss(notif.id); }} className="p-1 text-slate-300 hover:text-slate-500 rounded transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{notif.body}</p>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {notif.time}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ signOut }: { signOut: () => void }) {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [reviewReplies, setReviewReplies] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [newDeals, setNewDeals] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [showReviews, setShowReviews] = useState(true);

  return (
    <div className="space-y-5">
      {/* Email notifications */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Email Notifications
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Email notifications', desc: 'Receive notifications via email', value: emailNotifs, onChange: setEmailNotifs },
            { label: 'Review replies', desc: 'When a founder replies to your review', value: reviewReplies, onChange: setReviewReplies },
            { label: 'Weekly digest', desc: 'Weekly summary of trending tools', value: weeklyDigest, onChange: setWeeklyDigest },
            { label: 'New deals', desc: 'Exclusive deals on tools you\'ve saved', value: newDeals, onChange: setNewDeals },
          ].map(({ label, desc, value, onChange }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" /> Privacy Settings
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Public profile', desc: 'Allow others to view your profile', value: profilePublic, onChange: setProfilePublic },
            { label: 'Show my reviews', desc: 'Display your reviews publicly', value: showReviews, onChange: setShowReviews },
          ].map(({ label, desc, value, onChange }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Account actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-400" /> Account
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => { signOut(); toast.success('Signed out successfully'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left group border border-transparent hover:border-red-100"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 group-hover:text-red-600 transition-colors">Sign Out</p>
              <p className="text-xs text-slate-400">Sign out of your account</p>
            </div>
          </button>
          <button
            onClick={() => toast.info('Account deletion requires contacting support.')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left group border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Delete Account</p>
              <p className="text-xs text-slate-400">Permanently remove your account and data</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { isAuthenticated, user, loading, signIn, signOut } = useAuth();
  const { savedIds } = useSavedTools();
  const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-amber-400 border-t-transparent animate-spin mx-auto mb-3" style={{ borderWidth: '3px', borderStyle: 'solid', borderTopColor: 'transparent' }} />
            <p className="text-slate-500 text-sm font-medium">Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FFF7ED', border: '1px solid #FDE68A' }}>
              <User className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-slate-900 font-black text-2xl mb-2">Sign in to view your dashboard</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Access your profile, reviews, saved tools, and more by signing in with your Manus account.</p>
            <button
              onClick={signIn}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all"
              style={{ background: '#F59E0B', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#D97706')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
            >
              Sign In with Manus <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ height: '72px' }} />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* ── Sidebar ── */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            {/* User card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black text-slate-900 flex-shrink-0" style={{ background: '#F59E0B' }}>
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 font-bold text-sm truncate">{user.name}</p>
                  <p className="text-slate-500 text-xs truncate">{user.email}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Verified</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-sm font-black text-slate-900">{MOCK_REVIEWS.filter(r => r.user_id === 'u1').length}</div>
                  <div className="text-xs text-slate-400">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black text-slate-900">{savedIds.length}</div>
                  <div className="text-xs text-slate-400">Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black text-slate-900">{unreadNotifs}</div>
                  <div className="text-xs text-slate-400">Alerts</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white border border-slate-200 rounded-2xl p-2 mb-4">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group mb-0.5 last:mb-0 ${
                    activeTab === tab.id ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`${activeTab === tab.id ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
                    {tab.icon}
                  </span>
                  <span className="text-sm font-semibold flex-1">{tab.label}</span>
                  {tab.id === 'notifications' && unreadNotifs > 0 && (
                    <span className="text-xs font-bold text-white bg-amber-400 rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifs}
                    </span>
                  )}
                  {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </nav>

            {/* Founder CTA */}
            <div className="rounded-2xl p-4 border border-amber-200" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)' }}>
              <Crown className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-xs font-bold text-slate-800 mb-1">Founder Dashboard</p>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">List tools, reply to reviews, manage deals.</p>
              <Link href="/dashboard/founder">
                <button className="w-full text-xs font-bold text-white py-2 rounded-xl transition-colors" style={{ background: '#F59E0B' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#D97706')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
                >
                  Go to Founder Dashboard
                </button>
              </Link>
            </div>
          </aside>

          {/* ── Mobile tab bar ── */}
          <div className="md:hidden w-full mb-4 self-start">
            <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    activeTab === tab.id ? 'bg-amber-400 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === 'notifications' && unreadNotifs > 0 && (
                    <span className="text-xs font-bold bg-white text-amber-600 rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadNotifs}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            <div className="mb-5">
              <h1 className="text-slate-900 font-black text-xl">{TABS.find(t => t.id === activeTab)?.label}</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {activeTab === 'profile' && 'Manage your public profile and account details'}
                {activeTab === 'reviews' && "All reviews you've written on LaudStack"}
                {activeTab === 'saved' && "Tools you've bookmarked for later"}
                {activeTab === 'notifications' && 'Stay up to date with your activity'}
                {activeTab === 'settings' && 'Manage your account preferences'}
              </p>
            </div>

            {activeTab === 'profile'       && <ProfileTab user={user} />}
            {activeTab === 'reviews'       && <ReviewsTab />}
            {activeTab === 'saved'         && <SavedTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'settings'      && <SettingsTab signOut={signOut} />}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

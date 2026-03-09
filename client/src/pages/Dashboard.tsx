// LaudStack — User Dashboard
// Design: Clean white sidebar layout, amber accents, data-rich profile view

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  User, Star, Bookmark, Settings, Bell, Shield, ChevronRight,
  Edit3, Camera, CheckCircle, TrendingUp, MessageSquare, Heart,
  ExternalLink, Trash2, LogOut, Eye, EyeOff, Save, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedTools } from '@/hooks/useSavedTools';
import { MOCK_TOOLS, MOCK_REVIEWS } from '@/lib/mockData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Tab = 'profile' | 'reviews' | 'saved' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',  label: 'My Profile',   icon: <User className="w-4 h-4" /> },
  { id: 'reviews',  label: 'My Reviews',   icon: <Star className="w-4 h-4" /> },
  { id: 'saved',    label: 'Saved Tools',  icon: <Bookmark className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings',     icon: <Settings className="w-4 h-4" /> },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
      ))}
    </div>
  );
}

function ProfileTab({ user }: { user: { name: string; email: string } }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState('Product builder and SaaS enthusiast. I review tools I actually use in my daily workflow.');
  const [company, setCompany] = useState('Independent');
  const [role, setRole] = useState('Founder');
  const [website, setWebsite] = useState('');

  const userReviews = MOCK_REVIEWS.filter(r => r.user_id === 'u1').length;

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-slate-900"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' }}
              >
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Camera className="w-3 h-3 text-slate-900" />
              </button>
            </div>
            <div>
              <h2 className="text-slate-900 font-bold text-lg">{name}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 text-xs font-medium">Verified account</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Role / Title</label>
                <input value={role} onChange={e => setRole(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Company</label>
                <input value={company} onChange={e => setCompany(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Website</label>
                <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors resize-none" />
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-600 text-sm leading-relaxed">{bio}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{role} at {company}</span>
              {website && <a href={website} className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700"><ExternalLink className="w-3.5 h-3.5" />{website}</a>}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reviews Written', value: userReviews, icon: <MessageSquare className="w-5 h-5 text-amber-400" /> },
          { label: 'Helpful Votes', value: 47, icon: <Heart className="w-5 h-5 text-rose-400" /> },
          { label: 'Tools Saved', value: 0, icon: <Bookmark className="w-5 h-5 text-sky-400" /> },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Wrote a review for', tool: 'ChatGPT', time: '2 days ago', icon: <Star className="w-3.5 h-3.5 text-amber-400" /> },
            { action: 'Saved', tool: 'Notion', time: '3 days ago', icon: <Bookmark className="w-3.5 h-3.5 text-sky-400" /> },
            { action: 'Upvoted', tool: 'Linear', time: '5 days ago', icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-slate-100 last:border-0">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">{item.icon}</div>
              <span className="text-slate-600">{item.action} <span className="font-semibold text-slate-900">{item.tool}</span></span>
              <span className="ml-auto text-slate-500 text-xs">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const myReviews = MOCK_REVIEWS.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 font-bold">{myReviews.length} Reviews</h3>
        <Link href="/">
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">Browse tools to review →</button>
        </Link>
      </div>
      {myReviews.map(review => {
        const tool = MOCK_TOOLS.find(t => t.id === review.tool_id);
        return (
          <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {tool && (
                  <img src={tool.logo_url} alt={tool.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=40`; }} />
                )}
                <div>
                  <Link href={`/tools/${tool?.slug}`}>
                    <span className="text-slate-900 font-bold text-sm hover:text-amber-600 cursor-pointer transition-colors">{tool?.name}</span>
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRow rating={review.rating} />
                    <span className="text-slate-500 text-xs">{review.created_at}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {review.is_verified_purchase && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Verified</span>
                )}
                <button className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className="text-slate-900 font-semibold text-sm mb-1">{review.title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">{review.body}</p>
            {(review.pros || review.cons) && (
              <div className="grid grid-cols-2 gap-3">
                {review.pros && (
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-emerald-700 text-xs font-semibold mb-1">Pros</p>
                    <p className="text-emerald-800 text-xs">{review.pros}</p>
                  </div>
                )}
                {review.cons && (
                  <div className="bg-rose-50 rounded-xl p-3">
                    <p className="text-rose-700 text-xs font-semibold mb-1">Cons</p>
                    <p className="text-rose-800 text-xs">{review.cons}</p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1 text-slate-500 text-xs">
              <Heart className="w-3 h-3" />
              <span>{review.helpful_count} people found this helpful</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SavedTab() {
  const { savedIds, toggle } = useSavedTools();
  const savedTools = MOCK_TOOLS.filter(t => savedIds.includes(t.id));

  if (savedTools.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-slate-900 font-bold text-lg mb-2">No saved tools yet</h3>
        <p className="text-slate-500 text-sm mb-5">Bookmark tools you want to revisit or share with your team.</p>
        <Link href="/">
          <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
            Browse Tools <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 font-bold">{savedTools.length} Saved Tools</h3>
      </div>
      {savedTools.map(tool => (
        <div key={tool.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-amber-300 transition-colors group">
          <img src={tool.logo_url} alt={tool.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=40`; }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-semibold text-sm truncate">{tool.name}</span>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0">{tool.pricing_model}</span>
            </div>
            <p className="text-slate-500 text-xs truncate">{tool.tagline}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-slate-700 text-sm font-medium">{tool.average_rating.toFixed(1)}</span>
            </div>
            <Link href={`/tools/${tool.slug}`}>
              <button className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Link>
            <button onClick={() => { toggle(tool.id); toast.success(`Removed ${tool.name} from saved`); }}
              className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({ user }: { user: { name: string; email: string } }) {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [reviewReplies, setReviewReplies] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { signOut } = useAuth();
  const [, navigate] = useLocation();

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative w-10 h-5.5 rounded-full transition-colors ${value ? 'bg-amber-400' : 'bg-slate-200'}`} style={{ height: '22px', width: '40px' }}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          Notifications
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Email notifications', sub: 'Receive updates via email', value: emailNotifs, onChange: () => setEmailNotifs(v => !v) },
            { label: 'Weekly digest', sub: 'Top tools and reviews every Monday', value: weeklyDigest, onChange: () => setWeeklyDigest(v => !v) },
            { label: 'Review replies', sub: 'When a founder responds to your review', value: reviewReplies, onChange: () => setReviewReplies(v => !v) },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-slate-900 text-sm font-medium">{item.label}</p>
                <p className="text-slate-500 text-xs">{item.sub}</p>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Privacy
        </h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-slate-900 text-sm font-medium">Public profile</p>
            <p className="text-slate-500 text-xs">Let others see your reviews and activity</p>
          </div>
          <Toggle value={profilePublic} onChange={() => setProfilePublic(v => !v)} />
        </div>
      </div>

      {/* Password */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold mb-4">Change Password</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">Current password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors pr-10" />
              <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">New password</label>
            <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
          <button onClick={() => { toast.success('Password updated successfully'); setCurrentPw(''); setNewPw(''); }}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
            <Save className="w-4 h-4" />
            Update Password
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6">
        <h3 className="text-rose-600 font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-900 text-sm font-medium">Sign out of LaudStack</p>
            <p className="text-slate-500 text-xs">You can sign back in at any time</p>
          </div>
          <button onClick={() => { signOut(); navigate('/'); toast.success('Signed out successfully'); }}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-4 py-2 rounded-xl transition-colors text-sm border border-rose-200">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <User className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-slate-900 font-black text-2xl mb-2">Sign in to view your dashboard</h2>
          <p className="text-slate-500 mb-6">Track your reviews, saved tools, and account settings.</p>
          <button onClick={() => navigate('/signin?return=/dashboard')}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
            Sign In <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div style={{ height: '72px' }} />

      <div className="max-w-[1300px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-slate-900 font-black text-2xl">My Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your profile, reviews, and saved tools</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 sticky top-24">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile'  && <ProfileTab user={user} />}
            {activeTab === 'reviews'  && <ReviewsTab />}
            {activeTab === 'saved'    && <SavedTab />}
            {activeTab === 'settings' && <SettingsTab user={user} />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/*
 * LaudStack Sign In / Sign Up Page — /signin
 * Design: Split layout — dark left panel (brand) + white right panel (form)
 * Enterprise-grade, clean, no clutter
 */

import { useState } from 'react';
import { useLocation, Link, useSearch } from 'wouter';
import {
  Mail, Lock, Eye, EyeOff, Rocket, ArrowRight,
  Github, CheckCircle2, Star, Shield, Users
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const TRUST_POINTS = [
  { icon: Star,         text: 'Access verified reviews from 12,000+ professionals' },
  { icon: Shield,       text: 'Contribute reviews and build your reputation' },
  { icon: Users,        text: 'Join a community of founders and tool enthusiasts' },
  { icon: Rocket,       text: 'List your tool on LaunchPad and reach buyers' },
];



export default function SignIn() {
  const [, navigate]              = useLocation();
  const search                    = useSearch();
  const returnUrl                 = new URLSearchParams(search).get('return') || '/';
  const [mode, setMode]           = useState<'signin' | 'signup'>('signin');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [name, setName]           = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const { signIn }                = useAuth();

  const isSignUp = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    // Set the display name: for sign-in use email prefix, for sign-up use provided name
    const displayName = isSignUp ? name : (name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    signIn(displayName, email);
    setLoading(false);
    setDone(true);
    // Sign-up → verify email; sign-in → return URL
    if (isSignUp) {
      setTimeout(() => navigate('/verify-email'), 1500);
    } else {
      setTimeout(() => navigate(returnUrl), 1500);
    }
  };

  const handleSocial = (provider: string) => {
    toast.info(`${provider} authentication coming soon!`);
  };

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F0FDF4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 style={{ width: '32px', height: '32px', color: '#22C55E' }} />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
            {isSignUp ? 'Account created!' : 'Welcome back!'}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: 500 }}>Redirecting you to the homepage…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
      <Navbar />
      <div style={{ height: '72px', flexShrink: 0 }} />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* ── Left panel — brand ── */}
        <div
          className="hidden lg:flex"
          style={{ width: '480px', flexShrink: 0, flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)' }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '33%', left: '50%', transform: 'translate(-50%,-50%)', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link href="/">
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 900, color: '#F59E0B', letterSpacing: '-0.03em' }}>LaudStack</span>
            </Link>
          </div>

          <div style={{ position: 'relative', zIndex: 1, marginTop: '48px' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
              The trusted source for<br />
              <span style={{ color: '#F59E0B' }}>AI & SaaS tools.</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.7, margin: '0 0 32px', fontWeight: 500 }}>
              Join thousands of professionals who discover, evaluate, and review tools on LaudStack.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Icon style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                  </div>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', marginTop: '32px' }}>
            <p style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.65, margin: '0 0 12px' }}>
              "LaudStack is where we discovered three of the tools we now use daily. The reviews are genuinely helpful."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#F59E0B' }}>PK</div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Priya K.</p>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Engineering Manager, Fintech Co.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#FFFFFF' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>

            {/* Mobile logo */}
            <div className="lg:hidden" style={{ marginBottom: '32px' }}>
              <Link href="/">
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 900, color: '#F59E0B', letterSpacing: '-0.03em' }}>LaudStack</span>
              </Link>
            </div>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
                {isSignUp ? 'Create your account' : 'Sign in to LaudStack'}
              </h1>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontWeight: 500 }}>
                {isSignUp ? 'Join 12,000+ professionals discovering better tools.' : 'Welcome back. Enter your credentials to continue.'}
              </p>
            </div>

            {/* Social auth */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <button
                onClick={() => handleSocial('Google')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; }}
              >
                <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button
                onClick={() => handleSocial('GitHub')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; }}
              >
                <Github style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}><div style={{ width: '100%', borderTop: '1px solid #E2E8F0' }} /></div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <span style={{ background: '#FFFFFF', padding: '0 12px', fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isSignUp && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box', fontWeight: 500 }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box', fontWeight: 500 }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                  {!isSignUp && (
                    <a href="/reset-password" style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', textDecoration: 'none' }}>Forgot password?</a>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                    style={{ width: '100%', padding: '10px 40px 10px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box', fontWeight: 500 }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex', alignItems: 'center' }}>
                    {showPass ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  By creating an account, you agree to our{' '}
                  <button type="button" onClick={() => toast.info('Terms coming soon!')} style={{ fontWeight: 700, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" onClick={() => toast.info('Privacy policy coming soon!')} style={{ fontWeight: 700, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Privacy Policy</button>.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#94A3B8' : 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, boxShadow: loading ? 'none' : '0 4px 16px rgba(245,158,11,0.3)', transition: 'all 0.15s' }}
              >
                {loading ? (
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>{isSignUp ? 'Create Account' : 'Sign In'}<ArrowRight style={{ width: '15px', height: '15px' }} /></>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '24px', fontWeight: 500 }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setMode(isSignUp ? 'signin' : 'signup')} style={{ fontWeight: 700, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {isSignUp ? 'Sign In' : 'Sign Up for free'}
              </button>
            </p>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link href="/" style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textDecoration: 'none' }}>← Back to LaudStack</Link>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

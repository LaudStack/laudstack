/*
 * LaudStack — Sign In / Sign Up Page (/signin)
 *
 * Design Philosophy: "Premium Professional"
 *  - Clean split layout: left brand panel (dark) + right auth panel (white)
 *  - Amber accent (#F59E0B) consistent with platform identity
 *  - Three auth methods: Google, LinkedIn, Email/Password
 *  - Smooth tab switch between Sign In and Sign Up
 *  - Inline form validation with clear error messages
 *  - LinkedIn extracts: first/last name, email, location, profile photo
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  Star, Shield, Rocket, CheckCircle2, AlertCircle,
  Loader2, ChevronRight, Sparkles, Users, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginUrl, getLinkedInLoginUrl } from '@/const';

// ─── SVG Brand Icons ────────────────────────────────────────────────────────

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// ─── Left Panel Brand Stats ─────────────────────────────────────────────────

const BRAND_STATS = [
  { icon: Users,     value: '12,000+', label: 'Professionals' },
  { icon: Star,      value: '4.9',     label: 'Avg Rating' },
  { icon: BarChart3, value: '95+',     label: 'AI & SaaS Tools' },
  { icon: Rocket,    value: '500+',    label: 'Tool Launches' },
];

const FEATURES = [
  { icon: CheckCircle2, text: 'Save tools to your personal library' },
  { icon: CheckCircle2, text: 'Write verified reviews and build reputation' },
  { icon: CheckCircle2, text: 'Access exclusive founder deals' },
  { icon: CheckCircle2, text: 'Track your tool submissions & analytics' },
];

// ─── Component ──────────────────────────────────────────────────────────────

type AuthTab = 'signin' | 'signup';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export default function SignIn() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<AuthTab>('signin');
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Check URL params for errors from OAuth callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      const messages: Record<string, string> = {
        linkedin_denied: 'LinkedIn sign-in was cancelled. Please try again.',
        linkedin_token_failed: 'LinkedIn authentication failed. Please try again.',
        linkedin_profile_failed: 'Could not retrieve your LinkedIn profile. Please try again.',
        linkedin_failed: 'LinkedIn sign-in failed. Please try again.',
        linkedin_no_code: 'LinkedIn sign-in was interrupted. Please try again.',
      };
      setSubmitError(messages[err] ?? 'Authentication failed. Please try again.');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors(prev => { const next = { ...prev }; delete next[field as string]; return next; });
    }
    setSubmitError(null);
  };

  const validateSignIn = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const validateSignUp = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Include uppercase, lowercase, and a number';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = tab === 'signin' ? validateSignIn() : validateSignUp();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (tab === 'signin') {
        window.location.href = getLoginUrl('email');
      } else {
        const url = new URL(getLoginUrl('email'));
        url.searchParams.set('email', form.email);
        url.searchParams.set('firstName', form.firstName);
        url.searchParams.set('lastName', form.lastName);
        window.location.href = url.toString();
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = getLoginUrl('google');
  };

  const handleLinkedInSignIn = () => {
    window.location.href = getLinkedInLoginUrl();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: '#F59E0B', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    height: '46px',
    padding: '0 14px',
    fontSize: '14px',
    color: '#171717',
    background: '#FAFAFA',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  };

  const inputErrorStyle: React.CSSProperties = {
    ...inputBase,
    borderColor: '#EF4444',
    background: '#FFF5F5',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  };

  const fieldErrorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '5px',
    fontSize: '12px',
    color: '#EF4444',
    fontWeight: 500,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FFFFFF' }}>

      {/* ── Left: Brand Panel ─────────────────────────────────────────────── */}
      <div style={{
        width: '44%',
        minHeight: '100vh',
        background: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
        className="hidden lg:flex"
      >
        {/* Subtle amber glow */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{ width: '36px', height: '36px', background: '#F59E0B', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>LaudStack</span>
        </Link>

        {/* Headline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '100px', padding: '5px 14px', marginBottom: '28px', width: 'fit-content' }}>
            <Star style={{ width: '12px', height: '12px', color: '#F59E0B', fill: '#F59E0B' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trusted Platform</span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '0 0 18px' }}>
            The Trusted Source<br />
            for <span style={{ color: '#F59E0B' }}>AI & SaaS Tools</span>
          </h1>

          <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.7, margin: '0 0 40px', maxWidth: '360px' }}>
            Discover, compare, and review the best tools. Join 12,000+ professionals and founders making smarter software decisions.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '48px' }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '12px', height: '12px', color: '#22C55E' }} />
                </div>
                <span style={{ fontSize: '13.5px', color: '#CBD5E1', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {BRAND_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom security note */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield style={{ width: '14px', height: '14px', color: '#22C55E' }} />
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
              Your data is protected with enterprise-grade security
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: Auth Panel ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', background: '#F59E0B', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles style={{ width: '15px', height: '15px', color: '#fff' }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#171717', letterSpacing: '-0.02em' }}>LaudStack</span>
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#171717', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              {tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
              {tab === 'signin'
                ? 'Sign in to access your dashboard and saved tools'
                : 'Join 12,000+ professionals discovering the best tools'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
            {(['signin', 'signup'] as AuthTab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}); setSubmitError(null); setSubmitSuccess(null); }}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  background: tab === t ? '#FFFFFF' : 'transparent',
                  color: tab === t ? '#171717' : '#64748B',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Global error */}
          {submitError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#EF4444', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>{submitError}</span>
            </div>
          )}

          {/* Success message */}
          {submitSuccess && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22C55E', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: 500 }}>{submitSuccess}</span>
            </div>
          )}

          {/* ── Social Buttons ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', height: '46px', borderRadius: '10px',
                border: '1.5px solid #E2E8F0', background: '#FFFFFF',
                fontSize: '14px', fontWeight: 600, color: '#374151',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
              <GoogleIcon size={18} />
              Continue with Google
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleLinkedInSignIn}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', height: '46px', borderRadius: '10px',
                border: '1.5px solid #E2E8F0', background: '#FFFFFF',
                fontSize: '14px', fontWeight: 600, color: '#374151',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0A66C2'; e.currentTarget.style.background = '#F0F7FF'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(10,102,194,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
              <LinkedInIcon size={18} />
              Continue with LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>or continue with email</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          {/* ── Email/Password Form ─────────────────────────────────────────── */}
          <form onSubmit={handleEmailSubmit} noValidate>

            {/* Sign Up: First + Last name */}
            {tab === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="John"
                      value={form.firstName}
                      onChange={e => update('firstName', e.target.value)}
                      style={{ ...(errors.firstName ? inputErrorStyle : inputBase), paddingLeft: '36px' }}
                      onFocus={e => { if (!errors.firstName) { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}}
                      onBlur={e => { e.target.style.borderColor = errors.firstName ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.firstName && <div style={fieldErrorStyle}><AlertCircle style={{ width: '12px', height: '12px' }} />{errors.firstName}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={e => update('lastName', e.target.value)}
                      style={{ ...(errors.lastName ? inputErrorStyle : inputBase), paddingLeft: '36px' }}
                      onFocus={e => { if (!errors.lastName) { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}}
                      onBlur={e => { e.target.style.borderColor = errors.lastName ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {errors.lastName && <div style={fieldErrorStyle}><AlertCircle style={{ width: '12px', height: '12px' }} />{errors.lastName}</div>}
                </div>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  style={{ ...(errors.email ? inputErrorStyle : inputBase), paddingLeft: '36px' }}
                  onFocus={e => { if (!errors.email) { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}}
                  onBlur={e => { e.target.style.borderColor = errors.email ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.email && <div style={fieldErrorStyle}><AlertCircle style={{ width: '12px', height: '12px' }} />{errors.email}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: tab === 'signup' ? '16px' : '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, margin: 0 }}>Password</label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => window.location.href = getLoginUrl('email')}
                    style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  type={form.showPassword ? 'text' : 'password'}
                  placeholder={tab === 'signup' ? 'Min. 8 characters' : 'Your password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  style={{ ...(errors.password ? inputErrorStyle : inputBase), paddingLeft: '36px', paddingRight: '42px' }}
                  onFocus={e => { if (!errors.password) { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}}
                  onBlur={e => { e.target.style.borderColor = errors.password ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => update('showPassword', !form.showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px', display: 'flex', alignItems: 'center' }}
                >
                  {form.showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                </button>
              </div>
              {errors.password && <div style={fieldErrorStyle}><AlertCircle style={{ width: '12px', height: '12px' }} />{errors.password}</div>}
              {tab === 'signup' && !errors.password && form.password && (
                <PasswordStrength password={form.password} />
              )}
            </div>

            {/* Confirm Password (sign up only) */}
            {tab === 'signup' && (
              <div style={{ marginBottom: '8px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    type={form.showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    style={{ ...(errors.confirmPassword ? inputErrorStyle : inputBase), paddingLeft: '36px', paddingRight: '42px' }}
                    onFocus={e => { if (!errors.confirmPassword) { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}}
                    onBlur={e => { e.target.style.borderColor = errors.confirmPassword ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => update('showConfirmPassword', !form.showConfirmPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px', display: 'flex', alignItems: 'center' }}
                  >
                    {form.showConfirmPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
                {errors.confirmPassword && <div style={fieldErrorStyle}><AlertCircle style={{ width: '12px', height: '12px' }} />{errors.confirmPassword}</div>}
              </div>
            )}

            {/* Terms (sign up only) */}
            {tab === 'signup' && (
              <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.6, margin: '12px 0 20px' }}>
                By creating an account, you agree to our{' '}
                <Link href="/terms" style={{ color: '#F59E0B', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" style={{ color: '#F59E0B', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', height: '48px', marginTop: tab === 'signin' ? '20px' : '0',
                borderRadius: '10px', border: 'none',
                background: submitting ? '#FDE68A' : '#F59E0B',
                color: '#FFFFFF', fontSize: '14.5px', fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
              }}
              onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = '#D97706'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.4)'; }}}
              onMouseLeave={e => { if (!submitting) { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,158,11,0.3)'; }}}
            >
              {submitting ? (
                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>
                  {tab === 'signin' ? 'Sign In with Email' : 'Create Account'}
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13.5px', color: '#64748B' }}>
            {tab === 'signin' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setTab('signup')} style={{ color: '#F59E0B', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13.5px' }}>
                  Create one free <ChevronRight style={{ width: '13px', height: '13px', display: 'inline', verticalAlign: 'middle' }} />
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setTab('signin')} style={{ color: '#F59E0B', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13.5px' }}>
                  Sign in <ChevronRight style={{ width: '13px', height: '13px', display: 'inline', verticalAlign: 'middle' }} />
                </button>
              </>
            )}
          </p>

          {/* Back to home */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/" style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>
              ← Back to LaudStack
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Password Strength Indicator ────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: '8+ chars', pass: password.length >= 8 },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < score ? colors[score - 1] : '#E2E8F0', transition: 'background 0.2s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: score > 0 ? colors[score - 1] : '#94A3B8', fontWeight: 600 }}>
          {score > 0 ? labels[score - 1] : 'Enter password'}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {checks.map(({ label, pass }) => (
            <span key={label} style={{ fontSize: '10px', color: pass ? '#22C55E' : '#CBD5E1', fontWeight: 600 }}>
              {pass ? '✓' : '○'} {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

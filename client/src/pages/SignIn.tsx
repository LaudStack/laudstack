/*
 * LaudStack Sign In Page — /signin
 * Design: Split layout — dark left panel (brand) + white right panel
 * Uses Manus OAuth for real authentication
 */

import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Rocket, Star, Shield, Users, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginUrl } from '@/const';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TRUST_POINTS = [
  { icon: Star,         text: 'Access verified reviews from 12,000+ professionals' },
  { icon: Shield,       text: 'Contribute reviews and build your reputation' },
  { icon: Users,        text: 'Join a community of founders and tool enthusiasts' },
  { icon: Rocket,       text: 'List your tool on LaunchPad and reach buyers' },
];

const FEATURES = [
  { icon: CheckCircle2, label: 'Save tools to your library' },
  { icon: CheckCircle2, label: 'Write & manage reviews' },
  { icon: CheckCircle2, label: 'Access exclusive deals' },
  { icon: CheckCircle2, label: 'Track your tool submissions' },
];

export default function SignIn() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSignIn = () => {
    window.location.href = getLoginUrl();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #F59E0B', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
          style={{ width: '480px', flexShrink: 0, flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #171717 0%, #1a1a2e 100%)' }}
        >
          {/* Background patterns */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '33%', left: '50%', transform: 'translate(-50%,-50%)', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link href="/">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', fontWeight: 900, color: '#F59E0B', letterSpacing: '-0.03em', cursor: 'pointer' }}>LaudStack</span>
            </Link>
          </div>

          {/* Main copy */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '100px', padding: '5px 14px', marginBottom: '20px' }}>
              <Zap style={{ width: '12px', height: '12px', color: '#F59E0B' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trusted Platform</span>
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '30px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
              The trusted source for<br />
              <span style={{ color: '#F59E0B' }}>AI & SaaS tools.</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.7, margin: '0 0 32px', fontWeight: 500 }}>
              Join thousands of professionals who discover, evaluate, and review tools on LaudStack.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <Icon style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                  </div>
                  <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
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

        {/* ── Right panel — sign in ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#FFFFFF' }}>
          <div style={{ width: '100%', maxWidth: '440px' }}>

            {/* Mobile logo */}
            <div className="lg:hidden" style={{ marginBottom: '32px' }}>
              <Link href="/">
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', fontWeight: 900, color: '#F59E0B', letterSpacing: '-0.03em', cursor: 'pointer' }}>LaudStack</span>
              </Link>
            </div>

            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FFF7ED', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Rocket style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
              </div>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '26px', fontWeight: 900, color: '#171717', letterSpacing: '-0.025em', margin: '0 0 8px' }}>
                Sign in to LaudStack
              </h1>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
                Access your profile, reviews, saved tools, and founder dashboard.
              </p>
            </div>

            {/* Feature list */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 18px', marginBottom: '28px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>What you get</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon style={{ width: '13px', height: '13px', color: '#22C55E', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleSignIn}
              style={{
                width: '100%', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF', fontSize: '15px', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(245,158,11,0.5)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(245,158,11,0.35)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              <Rocket style={{ width: '17px', height: '17px' }} />
              Continue with Manus
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '16px', fontWeight: 500, lineHeight: 1.6 }}>
              By continuing, you agree to our{' '}
              <Link href="/legal">
                <span style={{ color: '#D97706', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
              </Link>
              {' '}and{' '}
              <Link href="/legal">
                <span style={{ color: '#D97706', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
              </Link>
              .
            </p>

            {/* Divider */}
            <div style={{ position: 'relative', margin: '24px 0' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}><div style={{ width: '100%', borderTop: '1px solid #E2E8F0' }} /></div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <span style={{ background: '#FFFFFF', padding: '0 12px', fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>New to LaudStack?</span>
              </div>
            </div>

            {/* Sign up CTA */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', padding: '16px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#78350F', margin: '0 0 10px', fontWeight: 500, lineHeight: 1.5 }}>
                Create a free account and start discovering the best AI & SaaS tools.
              </p>
              <button
                onClick={handleSignIn}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '10px', border: '1px solid #F59E0B', background: '#FFFFFF', fontSize: '13px', fontWeight: 700, color: '#D97706', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF7ED'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; }}
              >
                <Rocket style={{ width: '13px', height: '13px' }} />
                Create Free Account
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link href="/">
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }}>← Back to LaudStack</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

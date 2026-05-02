'use client';

// ═══════════════════════════════════════════════════════════════
// candidate-login-page.tsx
// Theme: matches home page — white bg, indigo/purple gradients
// Uses Better Auth to sign in with email + password
// On success → redirects to /candidate
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';

export function CandidateLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email is required.');
    if (!password)     return setError('Password is required.');
    setLoading(true);
    setError('');
    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });
      if (result.error) {
        setError(result.error.message ?? 'Invalid email or password.');
        return;
      }
      router.push('/candidate');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── NAVBAR ── matches home page style */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Logo/>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.3px' }}>TalentMatch</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/home" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>← Back to home</a>
            <a href="/candidate/register" style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>Register</a>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', background: 'linear-gradient(160deg, #f8f7ff 0%, #f0f4ff 50%, #faf5ff 100%)' }}>

        {/* Left panel — branding */}
        <div style={{ flex: 1, display: 'none', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} className="left-panel">
          <div style={{ maxWidth: 360, color: '#fff' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.5px' }}>Find your perfect match</h2>
            <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.7 }}>Intelligent matching connects you with the right jobs based on your skills and experience.</p>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, marginBottom: 20, letterSpacing: '0.04em' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}/>
              CANDIDATE PORTAL
            </div>

            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Welcome back</h1>
            <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 32px' }}>Sign in to access your job matches</p>

            {/* Card */}
            <div style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #e0e7ff', padding: '36px 32px' }}>

              <form onSubmit={handleSubmit}>

                {/* Email */}
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Email address</label>
                  <input type="email" placeholder="e.g. john@email.com"
                    value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Password</label>
                  <input type="password" placeholder="Enter your password"
                    value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                  background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Signing in...' : 'Sign in →'}
                </button>

              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }}/>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }}/>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', margin: 0 }}>
                Don't have an account?{' '}
                <a href="/candidate/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
                  Register free →
                </a>
              </p>

            </div>

            {/* Trust note */}
            <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 20 }}>
              ✓ Free to join · ✓ Intelligent matching · ✓ Top-10 job recommendations
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
      <circle cx="18" cy="22" r="10" fill="url(#lgG)"/>
      <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95"/>
      <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="34" cy="10" r="4" fill="#8b5cf6"/>
      <circle cx="37" cy="22" r="4" fill="#6366f1"/>
      <circle cx="34" cy="34" r="4" fill="#8b5cf6"/>
      <defs>
        <linearGradient id="lgG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };

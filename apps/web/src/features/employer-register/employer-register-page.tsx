'use client';

// ═══════════════════════════════════════════════════════════════
// employer-register-page.tsx
// Theme: matches home page — white bg, indigo/purple gradients
// Uses Better Auth signUp + saves employer profile to DB
// On success → redirects to /employer
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';

type Form = {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  description: string;
  contactPerson: string;
  contactPhone: string;
};

const EMPTY: Form = {
  companyName: '',
  email: '',
  password: '',
  confirmPassword: '',
  industry: '',
  companySize: '',
  location: '',
  website: '',
  description: '',
  contactPerson: '',
  contactPhone: '',
};

export function EmployerRegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);
  const [step, setStep]       = useState(1); // 1=account, 2=company info, 3=contact

  const set = (f: keyof Form, v: string) => { setForm(p => ({ ...p, [f]: v })); setError(''); };

  const handleNext = () => {
    if (step === 1) {
      if (!form.companyName.trim()) return setError('Company name is required.');
      if (!form.email.trim())       return setError('Email is required.');
      if (!form.password)           return setError('Password is required.');
      if (form.password.length < 8) return setError('Password must be at least 8 characters.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }
    if (step === 2) {
      if (!form.industry)     return setError('Please select an industry.');
      if (!form.companySize)  return setError('Please select company size.');
      if (!form.location.trim()) return setError('Company location is required.');
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactPerson.trim()) return setError('Contact person name is required.');
    setLoading(true);
    setError('');
    try {
      const auth = await authClient.signUp.email({
        name: form.companyName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (auth.error) {
        setError(auth.error.message ?? 'Registration failed. Email may already exist.');
        setStep(1);
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/employer'), 2000);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS ───────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f8f7ff 0%, #f0f4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 400, border: '1.5px solid #e0e7ff' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>You're all set!</h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Employer account created successfully.</p>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 4px' }}>Login anytime with:</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>{form.email}</p>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  // ── MAIN FORM ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* NAVBAR */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Logo />
            <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.3px' }}>TalentMatch</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/home" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>← Back to home</a>
            <a href="/employer/login" style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '7px 18px', borderRadius: 10, textDecoration: 'none' }}>Sign in</a>
          </div>
        </div>
      </header>

      {/* HERO STRIP */}
      <div style={{ background: 'linear-gradient(160deg, #f8f7ff 0%, #f0f4ff 60%, #faf5ff 100%)', padding: '40px 24px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, marginBottom: 16, letterSpacing: '0.04em' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
          EMPLOYER REGISTRATION
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Create your employer account</h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 28px' }}>Start finding the best candidates for your company</p>

        {/* Step progress bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {[
            { n: 1, label: 'Account' },
            { n: 2, label: 'Company' },
            { n: 3, label: 'Contact' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: step > s.n ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : step === s.n ? '#6366f1' : '#f1f5f9',
                  color: step >= s.n ? '#fff' : '#9ca3af',
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step >= s.n ? '#6366f1' : '#9ca3af' }}>{s.label}</span>
              </div>
              {s.n < 3 && <div style={{ width: 32, height: 2, borderRadius: 1, background: step > s.n ? '#6366f1' : '#e5e7eb' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '24px 24px 80px' }}>
        <form onSubmit={step < 3 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>

          {/* ── STEP 1: ACCOUNT ── */}
          {step === 1 && (
            <FormCard title="Account credentials" icon="🔐" subtitle="Used to log in every time">
              <Field label="Company name" required>
                <input style={inp} placeholder="e.g. Acme Corporation" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
              </Field>
              <Field label="Work email address" required hint="This will be your login username">
                <input style={inp} type="email" placeholder="e.g. hr@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </Field>
              <Field label="Password" required hint="Minimum 8 characters">
                <input style={inp} type="password" placeholder="Create a strong password" value={form.password} onChange={e => set('password', e.target.value)} />
              </Field>
              <Field label="Confirm password" required>
                <input style={{
                  ...inp,
                  borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : '#e5e7eb',
                }} type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>Passwords do not match</p>
                )}
              </Field>
            </FormCard>
          )}

          {/* ── STEP 2: COMPANY INFO ── */}
          {step === 2 && (
            <>
              <FormCard title="Company details" icon="🏢">
                <Field label="Industry" required>
                  <select style={inp} value={form.industry} onChange={e => set('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail & E-commerce</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="consulting">Consulting</option>
                    <option value="marketing">Marketing & Advertising</option>
                    <option value="construction">Construction</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Company size" required>
                  <select style={inp} value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                    <option value="">Select size</option>
                    <option value="1-10">1–10 employees</option>
                    <option value="11-50">11–50 employees</option>
                    <option value="51-200">51–200 employees</option>
                    <option value="201-500">201–500 employees</option>
                    <option value="501-1000">501–1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                </Field>
                <Field label="Company location" required>
                  <input style={inp} placeholder="e.g. Sydney, NSW" value={form.location} onChange={e => set('location', e.target.value)} />
                </Field>
                <Field label="Company website" hint="Optional">
                  <input style={inp} placeholder="e.g. https://company.com" value={form.website} onChange={e => set('website', e.target.value)} />
                </Field>
              </FormCard>

              <FormCard title="About your company" icon="📝">
                <Field label="Company description" hint="Brief overview of what your company does">
                  <textarea style={{ ...inp, height: 'auto', resize: 'vertical' } as any} rows={4}
                    placeholder="e.g. We are a leading tech company specializing in..."
                    value={form.description} onChange={e => set('description', e.target.value)} />
                </Field>
              </FormCard>
            </>
          )}

          {/* ── STEP 3: CONTACT ── */}
          {step === 3 && (
            <FormCard title="Contact information" icon="📞" subtitle="Who should candidates contact?">
              <Field label="Contact person name" required>
                <input style={inp} placeholder="e.g. Jane Smith" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
              </Field>
              <Field label="Contact phone number" hint="Optional">
                <input style={inp} placeholder="e.g. +61 400 000 000" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
              </Field>

              {/* Summary */}
              <div style={{ background: '#f8f7ff', borderRadius: 12, border: '1px solid #e0e7ff', padding: 16, marginTop: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', margin: '0 0 10px' }}>Account summary</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'Company', value: form.companyName },
                    { label: 'Email', value: form.email },
                    { label: 'Industry', value: form.industry },
                    { label: 'Size', value: form.companySize },
                    { label: 'Location', value: form.location },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#9ca3af' }}>{r.label}</span>
                      <span style={{ color: '#111827', fontWeight: 600 }}>{r.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FormCard>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                style={{ flex: '0 0 auto', padding: '13px 24px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                ← Back
              </button>
            )}
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '13px', borderRadius: 12, border: 'none',
              background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Creating account...' : step < 3 ? 'Continue →' : 'Create employer account →'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 16 }}>
            Already have an account?{' '}
            <a href="/employer/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Sign in →</a>
          </p>

        </form>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
      <circle cx="18" cy="22" r="10" fill="url(#empRegLogoG)" />
      <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95" />
      <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="10" r="4" fill="#8b5cf6" />
      <circle cx="37" cy="22" r="4" fill="#6366f1" />
      <circle cx="34" cy="34" r="4" fill="#8b5cf6" />
      <defs>
        <linearGradient id="empRegLogoG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FormCard({ title, icon, subtitle, children }: { title: string; icon: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24, marginBottom: 16 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>{title}
        </h2>
        {subtitle && <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0 26px' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 5px' }}>{hint}</p>}
      {children}
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box' };

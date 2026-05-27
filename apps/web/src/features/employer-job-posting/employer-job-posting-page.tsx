'use client';

// ═══════════════════════════════════════════════════════════════
// create-job-page.tsx  —  EMPLOYER CREATE JOB POSTING
// Follows instruction: title, company info, description,
// education, skills, experience, work mode, location
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { talentApi } from '../talent/api';

const SKILLS_LIST = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'SQL', 'PostgreSQL', 'MongoDB', 'Java', 'C++',
  'Machine Learning', 'Data Analysis', 'Excel', 'Tableau',
  'Project Management', 'Communication', 'Leadership',
  'Marketing', 'Sales', 'Customer Service',
  'Figma', 'UI/UX Design', 'Docker', 'AWS', 'Git',
];

type Form = {
  title: string;
  description: string;
  educationLevel: string;
  yearsOfExperience: string;
  workMode: string;
  location: string;
  employerId: string;
};

const EMPTY: Form = {
  title: '', description: '', educationLevel: '',
  yearsOfExperience: '', workMode: '', location: '', employerId: '',
};

export function CreateJobPage() {
  const router = useRouter();
  const [form, setForm]         = useState<Form>(EMPTY);
  const [skills, setSkills]     = useState<string[]>([]);
  const [customSkill, setCustom] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);
  const [step, setStep]         = useState(1);

  const { data: employers = [] } = useSWR('employer-list', talentApi.employers.list);

  const set = (f: keyof Form, v: string) => { setForm(p => ({ ...p, [f]: v })); setError(''); };
  const toggleSkill = (s: string) => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const addCustom = () => { const t = customSkill.trim(); if (t && !skills.includes(t)) setSkills(p => [...p, t]); setCustom(''); };

  const handleNext = () => {
    if (step === 1) {
      if (!form.employerId)       return setError('Please select your company profile.');
      if (!form.title.trim())     return setError('Job title is required.');
      if (!form.description.trim()) return setError('Job description is required.');
    }
    if (step === 2) {
      if (!form.workMode)         return setError('Please select a work mode.');
      if (!form.location.trim())  return setError('Job location is required.');
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await talentApi.jobs.create({
        employerId:        form.employerId,
        title:             form.title.trim(),
        description:       form.description.trim(),
        requiredEducation:    (form.educationLevel as any) || undefined,
        requiredSkills:    skills.length > 0 ? skills.join(', ') : undefined,
        requiredYearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
        workMode:          form.workMode as any,
        location:          form.location.trim(),
      });
      setDone(true);
      setTimeout(() => router.push('/employer'), 2000);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS ───────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0fdf9 0%, #f8f7ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 400, border: '1.5px solid #d1fae5' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Job posted!</h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Your job posting is now live on TalentMatch.</p>
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
          <a href="/employer" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Logo />
            <span style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>TalentMatch</span>
          </a>
          <a href="/employer" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>← Back to dashboard</a>
        </div>
      </header>

      {/* HERO STRIP */}
      <div style={{ background: 'linear-gradient(160deg, #f0fdf9 0%, #f8f7ff 100%)', padding: '40px 24px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, marginBottom: 16, letterSpacing: '0.04em' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          POST A JOB
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Create a job posting</h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 28px' }}>Fill in the details to find the best matched candidates</p>

        {/* Step progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {[
            { n: 1, label: 'Job details' },
            { n: 2, label: 'Requirements' },
            { n: 3, label: 'Skills' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: step > s.n ? 'linear-gradient(135deg, #10b981, #059669)' : step === s.n ? '#10b981' : '#f1f5f9',
                  color: step >= s.n ? '#fff' : '#9ca3af',
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step >= s.n ? '#10b981' : '#9ca3af' }}>{s.label}</span>
              </div>
              {s.n < 3 && <div style={{ width: 32, height: 2, borderRadius: 1, background: step > s.n ? '#10b981' : '#e5e7eb' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '24px 24px 80px' }}>
        <form onSubmit={step < 3 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>

          {/* ── STEP 1: JOB DETAILS ── */}
          {step === 1 && (
            <>
              <FormCard title="Company" icon="🏢">
                <Field label="Select your company profile" required>
                  <select style={inp} value={form.employerId} onChange={e => set('employerId', e.target.value)}>
                    <option value="">Select company</option>
                    {employers.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.companyName}</option>
                    ))}
                  </select>
                </Field>
              </FormCard>

              <FormCard title="Job information" icon="💼">
                <Field label="Job title" required>
                  <input style={inp} placeholder="e.g. Senior Software Engineer" value={form.title} onChange={e => set('title', e.target.value)} />
                </Field>
                <Field label="Job description" required hint="Describe the role, responsibilities, and what you're looking for">
                  <textarea style={{ ...inp, height: 'auto', resize: 'vertical' } as any} rows={6}
                    placeholder="e.g. We are looking for a passionate software engineer to join our team..."
                    value={form.description} onChange={e => set('description', e.target.value)} />
                </Field>
              </FormCard>
            </>
          )}

          {/* ── STEP 2: REQUIREMENTS ── */}
          {step === 2 && (
            <>
              <FormCard title="Education & experience" icon="🎓">
                <Field label="Required education level">
                  <select style={inp} value={form.educationLevel} onChange={e => set('educationLevel', e.target.value)}>
                    <option value="">Any education level</option>
                    <option value="high_school">High school</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor's degree</option>
                    <option value="master">Master's degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </Field>
                <Field label="Years of experience required">
                  <select style={inp} value={form.yearsOfExperience} onChange={e => set('yearsOfExperience', e.target.value)}>
                    <option value="">Any experience level</option>
                    <option value="0">0 — Entry level</option>
                    <option value="1">1+ year</option>
                    <option value="2">2+ years</option>
                    <option value="3">3+ years</option>
                    <option value="5">5+ years</option>
                    <option value="7">7+ years</option>
                    <option value="10">10+ years</option>
                  </select>
                </Field>
              </FormCard>

              <FormCard title="Work arrangement" icon="📍">
                <Field label="Work mode" required>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { v: 'remote',  l: 'Remote',  c: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                      { v: 'on_site', l: 'On-site', c: '#6366f1', bg: '#f8f7ff', border: '#e0e7ff' },
                      { v: 'hybrid',  l: 'Hybrid',  c: '#8b5cf6', bg: '#faf5ff', border: '#e9d5ff' },
                    ].map(o => (
                      <button key={o.v} type="button"
                        onClick={() => set('workMode', form.workMode === o.v ? '' : o.v)}
                        style={{
                          flex: 1, padding: '12px 8px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: '2px solid',
                          background: form.workMode === o.v ? o.bg : '#fff',
                          color: form.workMode === o.v ? o.c : '#6b7280',
                          borderColor: form.workMode === o.v ? o.border : '#e5e7eb',
                        }}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Job location" required hint="City or region">
                  <input style={inp} placeholder="e.g. Sydney, NSW" value={form.location} onChange={e => set('location', e.target.value)} />
                </Field>
              </FormCard>
            </>
          )}

          {/* ── STEP 3: SKILLS ── */}
          {step === 3 && (
            <FormCard title="Required skills" icon="⚡">
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>Click to select skills needed for this role</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {SKILLS_LIST.map(s => (
                  <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                    padding: '5px 13px', borderRadius: 9999, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1.5px solid',
                    background: skills.includes(s) ? 'linear-gradient(135deg, #10b981, #059669)' : '#fff',
                    color: skills.includes(s) ? '#fff' : '#374151',
                    borderColor: skills.includes(s) ? '#10b981' : '#e5e7eb',
                  }}>
                    {skills.includes(s) ? '✓ ' : '+ '}{s}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} placeholder="Add custom skill..."
                  value={customSkill} onChange={e => setCustom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())} />
                <button type="button" onClick={addCustom} style={{ padding: '0 16px', borderRadius: 10, background: '#f1f5f9', border: '1px solid #e5e7eb', fontWeight: 600, cursor: 'pointer', fontSize: 13, color: '#374151' }}>Add</button>
              </div>
              {skills.length > 0 && (
                <div style={{ marginTop: 10, padding: 12, background: '#f0fdf9', borderRadius: 12, border: '1px solid #d1fae5' }}>
                  <p style={{ fontSize: 12, color: '#059669', fontWeight: 700, margin: '0 0 8px' }}>Selected ({skills.length}):</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {skills.map(s => (
                      <span key={s} style={{ padding: '3px 10px', borderRadius: 9999, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {s}
                        <button type="button" onClick={() => toggleSkill(s)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </FormCard>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12 }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                style={{ flex: '0 0 auto', padding: '13px 24px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                ← Back
              </button>
            )}
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '13px', borderRadius: 12, border: 'none',
              background: loading ? '#6ee7b7' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Posting job...' : step < 3 ? 'Continue →' : 'Post job →'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
      <circle cx="18" cy="22" r="10" fill="url(#createJobLogoG)" />
      <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95" />
      <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="10" r="4" fill="#8b5cf6" />
      <circle cx="37" cy="22" r="4" fill="#6366f1" />
      <circle cx="34" cy="34" r="4" fill="#8b5cf6" />
      <defs>
        <linearGradient id="createJobLogoG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FormCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24, marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>{title}
      </h2>
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@lib/auth-client';
import { establishEmailSession } from '@lib/establish-email-session';
import { authenticationApi } from '@features/authentication/api';
import { RegisterSuccessView } from '../components/register-success-view';
import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';

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
  const { refetch: refetchSession } = authClient.useSession();
  const [form, setForm]       = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone] = useState(false);
  const [manualSignInRequired, setManualSignInRequired] = useState(false);
  const [step, setStep] = useState(1);

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
      const emailNorm = form.email.trim().toLowerCase();
      const auth = await authClient.signUp.email({
        name: form.companyName.trim(),
        email: emailNorm,
        password: form.password,
      });
      if (auth.error) {
        setError(auth.error.message ?? 'Registration failed. Email may already exist.');
        setStep(1);
        return;
      }
      const userId = auth.data?.user?.id ?? (auth.data as { id?: string })?.id;
      if (!userId) {
        setError('Could not get user ID. Please try again.');
        return;
      }

      const sessionRes = await establishEmailSession(emailNorm, form.password);
      if (sessionRes.error) {
        setManualSignInRequired(true);
      }

      const companyInfo = [
        form.industry && `Industry: ${form.industry}`,
        form.companySize && `Company size: ${form.companySize}`,
        form.location && `Head office: ${form.location}`,
        form.website && `Website: ${form.website}`,
        form.description.trim() && form.description.trim(),
      ]
        .filter(Boolean)
        .join('\n');

      await authenticationApi.employers.create({
        userId,
        companyName: form.companyName.trim(),
        companyInfo: companyInfo || undefined,
        contactInfo: [form.contactPerson.trim(), emailNorm, form.contactPhone.trim()]
          .filter(Boolean)
          .join(' · '),
        isMember: false,
      });

      if (sessionRes.error) {
        setDone(true);
        return;
      }

      await refetchSession();
      await router.refresh();
      window.location.assign('/employer');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <RegisterSuccessView email={form.email} variant="employer" manualSignIn={manualSignInRequired} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-white to-[#f6f8fc] font-sans">

      <div className="border-b border-[#e4e2e0] bg-gradient-to-r from-white via-[#f9fbff] to-[#eef4ff] px-4 pb-10 pt-10 text-center">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#2d2d2d]">Create your employer account</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#595959]">
          Register once — we sign you in at the end so you can jump straight into posting and candidate search.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {[
            { n: 1, label: 'Account' },
            { n: 2, label: 'Company' },
            { n: 3, label: 'Contact' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    step >= s.n ? 'bg-[#2557a7] text-white' : 'bg-[#f3f2f1] text-[#767676]'
                  }`}
                >
                  {step > s.n ? '✓' : s.n}
                </div>
                <span
                  className={`text-xs font-semibold ${step >= s.n ? 'text-[#2557a7]' : 'text-[#767676]'}`}
                >
                  {s.label}
                </span>
              </div>
              {s.n < 3 && (
                <div
                  className={`hidden h-0.5 w-8 sm:block ${step > s.n ? 'bg-[#2557a7]' : 'bg-[#e4e2e0]'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 pb-20 pt-6">
        <form onSubmit={step < 3 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
          {step === 1 && (
            <FormCard title="Account credentials" icon="🔐" subtitle="Used to log in every time">
              <Field label="Company name" required>
                <input className={inp} placeholder="e.g. Acme Corporation" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
              </Field>
              <Field label="Work email address" required hint="This will be your login username">
                <input className={inp} type="email" placeholder="e.g. hr@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </Field>
              <Field label="Password" required hint="Minimum 8 characters">
                <input className={inp} type="password" placeholder="Create a strong password" value={form.password} onChange={e => set('password', e.target.value)} />
              </Field>
              <Field label="Confirm password" required>
                <input
                  className={`${inp} ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-[#c9262d]' : ''}`}
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="mt-1 text-xs text-[#c9262d]">Passwords do not match</p>
                )}
              </Field>
            </FormCard>
          )}
          {step === 2 && (
            <>
              <FormCard title="Company details" icon="🏢">
                <Field label="Industry" required>
                  <select className={inp} value={form.industry} onChange={e => set('industry', e.target.value)}>
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
                  <select className={inp} value={form.companySize} onChange={e => set('companySize', e.target.value)}>
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
                  <input className={inp} placeholder="e.g. Sydney, NSW" value={form.location} onChange={e => set('location', e.target.value)} />
                </Field>
                <Field label="Company website" hint="Optional">
                  <input className={inp} placeholder="e.g. https://company.com" value={form.website} onChange={e => set('website', e.target.value)} />
                </Field>
              </FormCard>

              <FormCard title="About your company" icon="📝">
                <Field label="Company description" hint="Brief overview of what your company does">
                  <textarea
                    className={`${inp} min-h-[120px] resize-y`}
                    rows={4}
                    placeholder="e.g. We are a leading tech company specializing in..."
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field>
              </FormCard>
            </>
          )}
          {step === 3 && (
            <FormCard title="Contact information" icon="📞" subtitle="Who should candidates contact?">
              <Field label="Contact person name" required>
                <input className={inp} placeholder="e.g. Jane Smith" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
              </Field>
              <Field label="Contact phone number" hint="Optional">
                <input className={inp} placeholder="e.g. +61 400 000 000" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
              </Field>
              <div className="rounded-xl border border-[#d4d2d0] bg-[#eef4ff]/60 p-4 mt-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#2557a7]">Account summary</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Company', value: form.companyName },
                    { label: 'Email', value: form.email },
                    { label: 'Industry', value: form.industry },
                    { label: 'Size', value: form.companySize },
                    { label: 'Location', value: form.location },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between gap-3 text-sm">
                      <span className="text-[#767676]">{r.label}</span>
                      <span className="max-w-[55%] text-right font-semibold text-[#2d2d2d]">{r.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FormCard>
          )}
          {error && (
            <div className="mb-4 rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#c9262d]">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <LinkedoutButton type="button" variant="secondary" className="min-h-12 shrink-0 px-6" onClick={() => setStep((s) => s - 1)}>
                ← Back
              </LinkedoutButton>
            )}
            <LinkedoutButton type="submit" disabled={loading} className="min-h-12 flex-1">
              {loading ? 'Creating account…' : step < 3 ? 'Continue' : 'Create employer account'}
            </LinkedoutButton>
          </div>

          <p className="mt-6 text-center text-sm text-[#767676]">
            Already have an account?{' '}
            <a href="/employer/login" className="font-bold text-[#2557a7] hover:underline">
              Sign in
            </a>
          </p>

        </form>
      </div>
    </div>
  );
}

function FormCard({ title, icon, subtitle, children }: { title: string; icon: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="squircle-card mb-4 bg-white p-6">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#2d2d2d]">
          <span className="text-lg">{icon}</span>
          {title}
        </h2>
        {subtitle && <p className="ml-7 mt-1 text-xs text-[#767676]">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-[#2d2d2d]">
        {label}
        {required && <span className="ml-1 text-[#c9262d]">*</span>}
      </label>
      {hint && <p className="mb-1.5 text-xs text-[#767676]">{hint}</p>}
      {children}
    </div>
  );
}

const inp =
  'box-border h-12 w-full rounded-lg border border-[#767676] bg-white px-3.5 text-sm text-[#2d2d2d] outline-none focus:border-[#2557a7] focus:ring-2 focus:ring-[#eef4ff]';

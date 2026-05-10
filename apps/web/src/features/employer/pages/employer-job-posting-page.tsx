'use client';

import {
  LinkedoutButton,
  LinkedoutCard,
  LinkedoutInput,
  LinkedoutSelect,
  LinkedoutTextarea,
} from '@features/candidate/components/linkedout-ui';
import { JOB_POSTING_SKILL_PRESETS } from '../constants/job-skills-presets';
import { JobPostingField, JobPostingFormCard } from '../components/job-posting-form-primitives';
import { useEmployerJobPosting } from '../hooks/use-employer-job-posting';

export function CreateJobPage() {
  const j = useEmployerJobPosting();

  if (!j.session?.user) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-lg px-4 py-16">
          <LinkedoutCard className="p-10 text-center">
            <h1 className="text-xl font-bold text-[#2d2d2d]">Sign in to post a job</h1>
            <p className="mt-2 text-sm text-[#595959]">Employers must be signed in with an active company profile.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkedoutButton href="/employer/login">Sign in</LinkedoutButton>
              <LinkedoutButton href="/employer/register" variant="secondary">
                Register company
              </LinkedoutButton>
            </div>
          </LinkedoutCard>
        </main>
      </div>
    );
  }

  if (j.employerLoading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[#595959]">
          Loading…
        </main>
      </div>
    );
  }

  if (!j.myEmployer) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-lg px-4 py-16">
          <LinkedoutCard className="p-10 text-center">
            <h1 className="text-xl font-bold text-[#2d2d2d]">Company profile required</h1>
            <p className="mt-2 text-sm text-[#595959]">Register your organisation before posting roles.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkedoutButton href="/employer/register">Register company</LinkedoutButton>
              <LinkedoutButton href="/employer" variant="secondary">
                Back to dashboard
              </LinkedoutButton>
            </div>
          </LinkedoutCard>
        </main>
      </div>
    );
  }

  if (j.done) {
    return (
      <div className="min-h-screen bg-white">
        <main className="flex min-h-[calc(100vh-62px)] items-center justify-center px-4 py-12">
          <LinkedoutCard className="max-w-md p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#2557a7]">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#2d2d2d]">Job posted</h2>
            <p className="mt-2 text-sm text-[#595959]">Your posting is live on Linkedout.</p>
            <p className="mt-4 text-xs text-[#767676]">Redirecting to your dashboard…</p>
          </LinkedoutCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="border-b border-[#e4e2e0] bg-white px-4 pb-10 pt-10 text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4d2d0] bg-[#f3f2f1] px-3 py-1 text-[11px] font-bold tracking-wide text-[#595959]">
          Post a job
        </p>
        <h1 className="text-3xl font-normal tracking-[-0.02em] text-[#2d2d2d]">Create a job posting</h1>
        <p className="mt-2 text-[15px] text-[#595959]">Fill in the details to reach matched candidates.</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {[
            { n: 1, label: 'Job details' },
            { n: 2, label: 'Requirements' },
            { n: 3, label: 'Skills' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    j.step >= s.n ? 'bg-[#2557a7] text-white' : 'bg-[#f3f2f1] text-[#767676]'
                  }`}
                >
                  {j.step > s.n ? '✓' : s.n}
                </div>
                <span className={`text-xs font-semibold ${j.step >= s.n ? 'text-[#2557a7]' : 'text-[#767676]'}`}>
                  {s.label}
                </span>
              </div>
              {s.n < 3 && (
                <div className={`hidden h-0.5 w-8 sm:block ${j.step > s.n ? 'bg-[#2557a7]' : 'bg-[#e4e2e0]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 pb-20 pt-6">
        <form onSubmit={j.step < 3 ? (e) => { e.preventDefault(); j.handleNext(); } : j.handleSubmit}>
          {j.step === 1 && (
            <>
              <LinkedoutCard className="mb-4 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#595959]">Posting as</p>
                <p className="mt-1 text-lg font-bold text-[#2d2d2d]">{j.myEmployer.companyName}</p>
              </LinkedoutCard>

              <JobPostingFormCard title="Job information" icon="💼">
                <JobPostingField label="Job title" required>
                  <LinkedoutInput
                    placeholder="e.g. Senior Software Engineer"
                    value={j.form.title}
                    onChange={(e) => j.setField('title', e.target.value)}
                  />
                </JobPostingField>
                <JobPostingField label="Job description" required hint="Describe the role and responsibilities">
                  <LinkedoutTextarea
                    rows={6}
                    className="min-h-[140px] resize-y"
                    placeholder="e.g. We are looking for a passionate software engineer…"
                    value={j.form.description}
                    onChange={(e) => j.setField('description', e.target.value)}
                  />
                </JobPostingField>
              </JobPostingFormCard>
            </>
          )}

          {j.step === 2 && (
            <>
              <JobPostingFormCard title="Education & experience" icon="🎓">
                <JobPostingField label="Required education level">
                  <LinkedoutSelect value={j.form.educationLevel} onChange={(e) => j.setField('educationLevel', e.target.value)}>
                    <option value="">Any education level</option>
                    <option value="high_school">High school</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor&apos;s degree</option>
                    <option value="master">Master&apos;s degree</option>
                    <option value="phd">PhD</option>
                  </LinkedoutSelect>
                </JobPostingField>
                <JobPostingField label="Years of experience required">
                  <LinkedoutSelect value={j.form.yearsOfExperience} onChange={(e) => j.setField('yearsOfExperience', e.target.value)}>
                    <option value="">Any experience level</option>
                    <option value="0">0 — Entry level</option>
                    <option value="1">1+ year</option>
                    <option value="2">2+ years</option>
                    <option value="3">3+ years</option>
                    <option value="5">5+ years</option>
                    <option value="7">7+ years</option>
                    <option value="10">10+ years</option>
                  </LinkedoutSelect>
                </JobPostingField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <JobPostingField label="Minimum salary">
                    <LinkedoutInput
                      type="number"
                      min="0"
                      placeholder="e.g. 70000"
                      value={j.form.salaryMin}
                      onChange={(e) => j.setField('salaryMin', e.target.value)}
                    />
                  </JobPostingField>
                  <JobPostingField label="Maximum salary">
                    <LinkedoutInput
                      type="number"
                      min="0"
                      placeholder="e.g. 95000"
                      value={j.form.salaryMax}
                      onChange={(e) => j.setField('salaryMax', e.target.value)}
                    />
                  </JobPostingField>
                </div>
              </JobPostingFormCard>

              <JobPostingFormCard title="Work arrangement" icon="📍">
                <JobPostingField label="Work mode" required>
                  <div className="flex gap-2">
                    {(['remote', 'on_site', 'hybrid'] as const).map((v) => {
                      const labels = { remote: 'Remote', on_site: 'On-site', hybrid: 'Hybrid' };
                      const on = j.form.workMode === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
                            on
                              ? 'border-[#2557a7] bg-[#eef4ff] text-[#2557a7]'
                              : 'border-[#e4e2e0] bg-white text-[#595959] hover:border-[#9bb8e5]'
                          }`}
                          onClick={() => j.setField('workMode', j.form.workMode === v ? '' : v)}
                        >
                          {labels[v]}
                        </button>
                      );
                    })}
                  </div>
                </JobPostingField>
                <JobPostingField label="Job location" required hint="City or region">
                  <LinkedoutInput
                    placeholder="e.g. Sydney, NSW"
                    value={j.form.location}
                    onChange={(e) => j.setField('location', e.target.value)}
                  />
                </JobPostingField>
              </JobPostingFormCard>
            </>
          )}

          {j.step === 3 && (
            <JobPostingFormCard title="Required skills" icon="⚡">
              <p className="mb-3 text-sm text-[#595959]">Select skills needed for this role.</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {JOB_POSTING_SKILL_PRESETS.map((s) => {
                  const on = j.skills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => j.toggleSkill(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        on
                          ? 'border-[#2557a7] bg-[#2557a7] text-white'
                          : 'border-[#d4d2d0] bg-white text-[#2d2d2d] hover:border-[#9bb8e5]'
                      }`}
                    >
                      {on ? '✓ ' : '+ '}
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <LinkedoutInput
                  className="flex-1"
                  placeholder="Add custom skill…"
                  value={j.customSkill}
                  onChange={(e) => j.setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), j.addCustomSkill())}
                />
                <LinkedoutButton type="button" variant="secondary" className="min-h-12 shrink-0 px-4" onClick={j.addCustomSkill}>
                  Add
                </LinkedoutButton>
              </div>
              {j.skills.length > 0 && (
                <div className="mt-4 rounded-xl border border-[#d4d2d0] bg-[#f3f2f1] p-4">
                  <p className="mb-2 text-xs font-bold text-[#2557a7]">Selected ({j.skills.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {j.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full bg-[#2557a7] px-2.5 py-1 text-xs text-white"
                      >
                        {s}
                        <button
                          type="button"
                          className="text-white/90 hover:text-white"
                          onClick={() => j.toggleSkill(s)}
                          aria-label={`Remove ${s}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </JobPostingFormCard>
          )}

          {j.error && (
            <div className="mb-4 rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#c9262d]">
              {j.error}
            </div>
          )}

          <div className="flex gap-3">
            {j.step > 1 && (
              <LinkedoutButton type="button" variant="secondary" className="min-h-12 shrink-0 px-6" onClick={() => j.setStep((s) => s - 1)}>
                ← Back
              </LinkedoutButton>
            )}
            <LinkedoutButton type="submit" disabled={j.loading} className="min-h-12 flex-1">
              {j.loading ? 'Posting…' : j.step < 3 ? 'Continue' : 'Post job'}
            </LinkedoutButton>
          </div>
        </form>
      </div>
    </div>
  );
}

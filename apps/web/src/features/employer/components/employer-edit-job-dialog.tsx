'use client';

import { useState, useEffect } from 'react';
import { LinkedoutButton, LinkedoutCard, LinkedoutInput, LinkedoutSelect, LinkedoutTextarea } from '@features/candidate/components/linkedout-ui';
import { JobPostingField } from './job-posting-form-primitives';
import { JOB_POSTING_SKILL_PRESETS } from '../constants/job-skills-presets';
import { employerApi } from '../api';
import type { JobDto } from '@talent-matching/dtos';

export function EmployerEditJobDialog({
  open,
  job,
  onClose,
  onSaved,
}: {
  open: boolean;
  job: JobDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill form when dialog opens with the job's current data
  useEffect(() => {
    if (open && job) {
      setTitle(job.title ?? '');
      setDescription((job as any).description ?? '');
      setEducationLevel((job as any).requiredEducation ?? '');
      setYearsOfExperience(String((job as any).requiredYearsOfExperience ?? ''));
      setSalaryMin(String((job as any).salaryMin ?? ''));
      setSalaryMax(String((job as any).salaryMax ?? ''));
      setWorkMode((job as any).workMode ?? '');
      setLocation((job as any).location ?? '');
      const existingSkills = (job as any).requiredSkills
        ? (job as any).requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      setSkills(existingSkills);
      setError('');
      setSuccess(false);
    }
  }, [open, job]);

  if (!open || !job) return null;

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onClose();
  };

  const toggleSkill = (skill: string) =>
    setSkills((prev) => prev.includes(skill) ? prev.filter((x) => x !== skill) : [...prev, skill]);

  const addCustomSkill = () => {
    const t = customSkill.trim();
    if (t && !skills.includes(t)) setSkills((prev) => [...prev, t]);
    setCustomSkill('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Job title is required.');
    if (!description.trim()) return setError('Job description is required.');
    if (!workMode) return setError('Please select a work mode.');
    if (!location.trim()) return setError('Job location is required.');

    setLoading(true);
    try {
      await employerApi.jobs.update(job.id, {
        title: title.trim(),
        description: description.trim(),
        requiredEducation: (educationLevel as never) || undefined,
        requiredSkills: skills.length > 0 ? skills.join(', ') : undefined,
        requiredYearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
        workMode: workMode as never,
        location: location.trim(),
      });
      setSuccess(true);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={handleClose}
      />
      <LinkedoutCard className="relative z-[401] flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4e2e0] px-6 py-4">
          <h3 className="text-lg font-bold text-[#2d2d2d]">Edit job posting</h3>
          <button
            type="button"
            className="squircle-button px-2 py-1 text-sm font-semibold text-[#595959] hover:bg-[#f3f2f1]"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#2d2d2d]">Job updated</h3>
            <p className="mt-2 text-sm text-[#595959]">Your job posting has been saved.</p>
            <LinkedoutButton type="button" className="mt-6" onClick={handleClose}>
              Done
            </LinkedoutButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-4">
                <JobPostingField label="Job title" required>
                  <LinkedoutInput
                    placeholder="e.g. Senior Software Engineer"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(''); }}
                  />
                </JobPostingField>

                <JobPostingField label="Job description" required>
                  <LinkedoutTextarea
                    rows={5}
                    className="min-h-[120px] resize-y"
                    placeholder="Describe the role and responsibilities…"
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setError(''); }}
                  />
                </JobPostingField>

                <div className="grid gap-3 sm:grid-cols-2">
                  <JobPostingField label="Required education">
                    <LinkedoutSelect value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                      <option value="">Any education level</option>
                      <option value="high_school">High school</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor&apos;s degree</option>
                      <option value="master">Master&apos;s degree</option>
                      <option value="phd">PhD</option>
                    </LinkedoutSelect>
                  </JobPostingField>
                  <JobPostingField label="Years of experience">
                    <LinkedoutSelect value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)}>
                      <option value="">Any experience</option>
                      <option value="0">0 — Entry level</option>
                      <option value="1">1+ year</option>
                      <option value="2">2+ years</option>
                      <option value="3">3+ years</option>
                      <option value="5">5+ years</option>
                      <option value="7">7+ years</option>
                      <option value="10">10+ years</option>
                    </LinkedoutSelect>
                  </JobPostingField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <JobPostingField label="Min salary">
                    <LinkedoutInput
                      type="number"
                      min="0"
                      placeholder="e.g. 70000"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                    />
                  </JobPostingField>
                  <JobPostingField label="Max salary">
                    <LinkedoutInput
                      type="number"
                      min="0"
                      placeholder="e.g. 95000"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                    />
                  </JobPostingField>
                </div>

                <JobPostingField label="Work mode" required>
                  <div className="flex gap-2">
                    {(['remote', 'on_site', 'hybrid'] as const).map((v) => {
                      const labels = { remote: 'Remote', on_site: 'On-site', hybrid: 'Hybrid' };
                      const on = workMode === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
                            on
                              ? 'border-[#2557a7] bg-[#eef4ff] text-[#2557a7]'
                              : 'border-[#e4e2e0] bg-white text-[#595959] hover:border-[#9bb8e5]'
                          }`}
                          onClick={() => setWorkMode(workMode === v ? '' : v)}
                        >
                          {labels[v]}
                        </button>
                      );
                    })}
                  </div>
                </JobPostingField>

                <JobPostingField label="Location" required>
                  <LinkedoutInput
                    placeholder="e.g. Sydney, NSW"
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); setError(''); }}
                  />
                </JobPostingField>

                {/* Skills section */}
                <div>
                  <p className="mb-2 text-[13px] font-semibold text-[#2d2d2d]">Required skills</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {JOB_POSTING_SKILL_PRESETS.map((s) => {
                      const on = skills.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            on
                              ? 'border-[#2557a7] bg-[#2557a7] text-white'
                              : 'border-[#d4d2d0] bg-white text-[#2d2d2d] hover:border-[#9bb8e5]'
                          }`}
                        >
                          {on ? '✓ ' : '+ '}{s}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <LinkedoutInput
                      className="flex-1"
                      placeholder="Add custom skill…"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    />
                    <LinkedoutButton type="button" variant="secondary" className="shrink-0 px-4" onClick={addCustomSkill}>
                      Add
                    </LinkedoutButton>
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-[#d4d2d0] bg-[#f3f2f1] p-3">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-full bg-[#2557a7] px-2.5 py-1 text-xs text-white"
                        >
                          {s}
                          <button
                            type="button"
                            className="text-white/80 hover:text-white"
                            onClick={() => toggleSkill(s)}
                            aria-label={`Remove ${s}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#e4e2e0] px-6 py-4">
              {error && (
                <div className="mb-3 rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#c9262d]">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <LinkedoutButton type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                  Cancel
                </LinkedoutButton>
                <LinkedoutButton type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving…' : 'Save changes'}
                </LinkedoutButton>
              </div>
            </div>
          </form>
        )}
      </LinkedoutCard>
    </div>
  );
}
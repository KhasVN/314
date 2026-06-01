'use client';

import { useState, useEffect } from 'react';
import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';
import { LinkedoutInput, LinkedoutTextarea } from '@features/candidate/components/linkedout-ui';
import { JobPostingField } from './job-posting-form-primitives';
import { employerApi } from '../api';
import type { EmployerDto } from '@talent-matching/dtos';

export function EmployerEditProfileDialog({
  open,
  employer,
  onClose,
  onSaved,
}: {
  open: boolean;
  employer: EmployerDto;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill form with current employer data whenever dialog opens
  useEffect(() => {
    if (open && employer) {
      setCompanyName(employer.companyName ?? '');
      setIndustry((employer as any).industry ?? '');
      setWebsite((employer as any).website ?? '');
      setLocation((employer as any).location ?? '');
      setDescription((employer as any).description ?? '');
      setError('');
      setSuccess(false);
    }
  }, [open, employer]);

  if (!open) return null;

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) return setError('Company name is required.');

    setLoading(true);
    try {
      await employerApi.employers.update(employer.id, {
        companyName: companyName.trim(),
        ...(industry && { industry: industry.trim() }),
        ...(website && { website: website.trim() }),
        ...(location && { location: location.trim() }),
        ...(description && { description: description.trim() }),
      } as any);
      setSuccess(true);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
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
      <LinkedoutCard className="relative z-[401] w-full max-w-lg p-6">
        {success ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#2d2d2d]">Profile updated</h3>
            <p className="mt-2 text-sm text-[#595959]">Your company profile has been saved.</p>
            <LinkedoutButton type="button" className="mt-6 w-full" onClick={handleClose}>
              Done
            </LinkedoutButton>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#2d2d2d]">Edit company profile</h3>
              <button
                type="button"
                className="squircle-button px-2 py-1 text-sm font-semibold text-[#595959] hover:bg-[#f3f2f1]"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            {/* Avatar initial display */}
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2557a7] text-xl font-bold text-white">
                {companyName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-bold text-[#2d2d2d]">{companyName || 'Your company'}</p>
                <p className="text-xs text-[#595959]">Company profile</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <JobPostingField label="Company name" required>
                <LinkedoutInput
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setError(''); }}
                />
              </JobPostingField>

              <JobPostingField label="Industry">
                <LinkedoutInput
                  placeholder="e.g. Technology, Finance, Healthcare"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </JobPostingField>

              <div className="grid gap-3 sm:grid-cols-2">
                <JobPostingField label="Website">
                  <LinkedoutInput
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </JobPostingField>
                <JobPostingField label="Location">
                  <LinkedoutInput
                    placeholder="e.g. Sydney, NSW"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </JobPostingField>
              </div>

              <JobPostingField label="Company description" hint="Tell candidates what your company is about">
                <LinkedoutTextarea
                  rows={4}
                  placeholder="We are a fast-growing company that…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </JobPostingField>

              {error && (
                <div className="rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#c9262d]">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <LinkedoutButton type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                  Cancel
                </LinkedoutButton>
                <LinkedoutButton type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving…' : 'Save profile'}
                </LinkedoutButton>
              </div>
            </form>
          </>
        )}
      </LinkedoutCard>
    </div>
  );
}
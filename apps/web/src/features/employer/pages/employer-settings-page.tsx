'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { authClient } from '@lib/auth-client';
import { employerApi } from '../api';
import {
  LinkedoutButton,
  LinkedoutCard,
  LinkedoutInput,
  LinkedoutSelect,
  LinkedoutTextarea,
} from '@features/candidate/components/linkedout-ui';
import { JobPostingField } from '../components/job-posting-form-primitives';

export function EmployerSettingsPage() {
  const { data: session } = authClient.useSession();
  const { data: employer, mutate: mutateEmployer } = useSWR(
    session?.user ? 'employer-profile' : null,
    () => employerApi.employers.meOptional(),
  );

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-[#595959]">
          Please sign in to access settings.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-[#e4e2e0] bg-white px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d]">Account settings</h1>
          <p className="mt-1 text-sm text-[#595959]">Manage your company profile and account security.</p>
        </div>
      </div>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 lg:px-8">
        <ProfileSection employer={employer ?? null} onSaved={() => mutateEmployer()} />
        <PasswordSection />
      </main>
    </div>
  );
}

function ProfileSection({
  employer,
  onSaved,
}: {
  employer: Awaited<ReturnType<typeof employerApi.employers.meOptional>>;
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

  useEffect(() => {
    if (employer) {
      setCompanyName(employer.companyName ?? '');
      setIndustry((employer as any).industry ?? '');
      setWebsite((employer as any).website ?? '');
      setLocation((employer as any).location ?? '');
      setDescription((employer as any).description ?? '');
    }
  }, [employer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!companyName.trim()) return setError('Company name is required.');
    if (!employer) return setError('No employer profile found.');
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
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinkedoutCard className="p-6">
      <div className="mb-6 flex items-center gap-4 border-b border-[#e4e2e0] pb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2557a7] text-xl font-bold text-white">
          {companyName?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="text-base font-bold text-[#2d2d2d]">Company profile</h2>
          <p className="text-sm text-[#595959]">Update your company information visible to candidates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <JobPostingField label="Company name" required>
          <LinkedoutInput
            placeholder="e.g. Acme Corp"
            value={companyName}
            onChange={(e) => { setCompanyName(e.target.value); setError(''); setSuccess(false); }}
          />
        </JobPostingField>

        <JobPostingField label="Industry">
          <LinkedoutSelect
            value={industry}
            onChange={(e) => { setIndustry(e.target.value); setSuccess(false); }}
          >
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
          </LinkedoutSelect>
        </JobPostingField>

        <div className="grid gap-4 sm:grid-cols-2">
          <JobPostingField label="Website">
            <LinkedoutInput
              type="url"
              placeholder="https://yourcompany.com"
              value={website}
              onChange={(e) => { setWebsite(e.target.value); setSuccess(false); }}
            />
          </JobPostingField>
          <JobPostingField label="Location">
            <LinkedoutInput
              placeholder="e.g. Sydney, NSW"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setSuccess(false); }}
            />
          </JobPostingField>
        </div>

        <JobPostingField label="Company description" hint="Tell candidates what your company does">
          <LinkedoutTextarea
            rows={4}
            placeholder="We are a fast-growing company that…"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setSuccess(false); }}
          />
        </JobPostingField>

        {error && (
          <div className="rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#c9262d]">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#16a34a]">
            Profile saved successfully.
          </div>
        )}

        <div className="flex justify-end">
          <LinkedoutButton type="submit" disabled={loading} className="min-w-32">
            {loading ? 'Saving…' : 'Save profile'}
          </LinkedoutButton>
        </div>
      </form>
    </LinkedoutCard>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!currentPassword) return setError('Current password is required.');
    if (!newPassword) return setError('New password is required.');
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinkedoutCard className="p-6">
      <div className="mb-6 border-b border-[#e4e2e0] pb-5">
        <h2 className="text-base font-bold text-[#2d2d2d]">Security</h2>
        <p className="mt-1 text-sm text-[#595959]">Change your account password.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <JobPostingField label="Current password" required>
          <LinkedoutInput
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            autoComplete="current-password"
            onChange={(e) => { setCurrentPassword(e.target.value); setError(''); setSuccess(false); }}
          />
        </JobPostingField>

        <div className="grid items-end gap-4 sm:grid-cols-2">
          <JobPostingField label="New password" required hint="At least 8 characters">
            <LinkedoutInput
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              autoComplete="new-password"
              onChange={(e) => { setNewPassword(e.target.value); setError(''); setSuccess(false); }}
            />
          </JobPostingField>
          <JobPostingField label="Confirm new password" required>
            <LinkedoutInput
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); setSuccess(false); }}
            />
          </JobPostingField>
        </div>

        {error && (
          <div className="rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#c9262d]">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#16a34a]">
            Password changed successfully.
          </div>
        )}

        <div className="flex justify-end">
          <LinkedoutButton type="submit" disabled={loading} className="min-w-40">
            {loading ? 'Saving…' : 'Change password'}
          </LinkedoutButton>
        </div>
      </form>
    </LinkedoutCard>
  );
}

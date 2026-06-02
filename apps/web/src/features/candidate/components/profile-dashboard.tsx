'use client';

import { useState } from 'react';
import type { CandidateDto } from '@talent-matching/dtos';
import {
  LinkedoutButton,
  LinkedoutCard,
  LinkedoutField,
  LinkedoutInput,
  LinkedoutSelect,
  LinkedoutTextarea,
} from '@features/candidate/components/linkedout-ui';
import { formatEducationLevel } from '@features/candidate/utils/format-education';
import { candidateApi } from '@features/candidate/api';
import { authClient } from '@lib/auth-client';

type Props = {
  candidate: CandidateDto;
  resumeText: string;
  onResumeChange: (value: string) => void;
  savingResume: boolean;
  message: string;
  onSaveResume: () => void;
  onBeginEditResume: (existing?: string | null) => void;
  onResumeFile: (file?: File) => void;
  onProfileUpdated?: () => void;
};

export function ProfileDashboard({
  candidate,
  resumeText,
  onResumeChange,
  savingResume,
  message,
  onSaveResume,
  onBeginEditResume,
  onResumeFile,
  onProfileUpdated,
}: Props) {
  const detailRows = [
    { label: 'Education', value: formatEducationLevel(candidate.education), icon: '🎓' },
    { label: 'Field of study', value: candidate.major, icon: '📚' },
    {
      label: 'Years of experience',
      value: candidate.yearsOfExperience != null ? `${candidate.yearsOfExperience} years` : null,
      icon: '📅',
    },
    {
      label: 'Preferred work mode',
      value: candidate.preferredWorkMode?.replace(/_/g, ' ') ?? null,
      icon: '💼',
    },
  ].filter((r) => r.value);

  // ── Edit personal details ─────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editFields, setEditFields] = useState({
    fullName: candidate.fullName ?? '',
    contactInfo: candidate.contactInfo ?? '',
    skills: candidate.skills ?? '',
    major: candidate.major ?? '',
    yearsOfExperience: candidate.yearsOfExperience?.toString() ?? '',
    workExperience: candidate.workExperience ?? '',
    preferredLocations: candidate.preferredLocations ?? '',
    preferredWorkMode: candidate.preferredWorkMode ?? '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  const handleEditSave = async () => {
    if (!candidate.id) return;
    setSavingEdit(true);
    setEditMsg('');
    try {
      await candidateApi.candidates.update(candidate.id, {
        fullName: editFields.fullName || undefined,
        contactInfo: editFields.contactInfo || undefined,
        skills: editFields.skills || undefined,
        major: editFields.major || undefined,
        yearsOfExperience: editFields.yearsOfExperience
          ? parseInt(editFields.yearsOfExperience, 10)
          : undefined,
        workExperience: editFields.workExperience || undefined,
        preferredLocations: editFields.preferredLocations || undefined,
        preferredWorkMode: (editFields.preferredWorkMode as never) || undefined,
      });
      setEditMsg('Profile updated successfully.');
      setEditOpen(false);
      onProfileUpdated?.();
    } catch {
      setEditMsg('Failed to update. Please try again.');
    } finally {
      setSavingEdit(false);
      window.setTimeout(() => setEditMsg(''), 4000);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const [pwOpen, setPwOpen] = useState(false);
  const [pwFields, setPwFields] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  const handleChangePw = async () => {
    setPwErr('');
    setPwMsg('');
    if (pwFields.next.length < 6) {
      setPwErr('New password must be at least 6 characters.');
      return;
    }
    if (pwFields.next !== pwFields.confirm) {
      setPwErr('New passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await authClient.changePassword({
        currentPassword: pwFields.current,
        newPassword: pwFields.next,
        revokeOtherSessions: false,
      });
      setPwMsg('Password changed successfully.');
      setPwFields({ current: '', next: '', confirm: '' });
      setPwOpen(false);
    } catch (err: unknown) {
      setPwErr(
        err instanceof Error ? err.message : 'Failed. Check your current password and try again.',
      );
    } finally {
      setSavingPw(false);
      window.setTimeout(() => setPwMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Profile header ───────────────────────────────────────────────────── */}
      <LinkedoutCard className="p-6 md:p-7">
        <div className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#2557a7] text-[28px] font-black text-white">
            {candidate.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black tracking-tight text-[#2d2d2d]">{candidate.fullName}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6b7280]">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {candidate.contactInfo}
            </p>
            {candidate.preferredLocations && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6b7280]">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {candidate.preferredLocations}
              </p>
            )}
            {candidate.isMember && (
              <span className="mt-2 inline-block rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#2557a7]">
                Member
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-800">
          <span aria-hidden>✓</span>
          Employers can find you
        </div>
      </LinkedoutCard>

      {/* ── Edit personal details ─────────────────────────────────────────────── */}
      <LinkedoutCard className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2d2d2d]">Personal details</h2>
          <LinkedoutButton
            type="button"
            variant="secondary"
            className="text-[13px]"
            onClick={() => {
              setEditOpen((v) => !v);
              setEditMsg('');
            }}
          >
            {editOpen ? 'Cancel' : 'Edit'}
          </LinkedoutButton>
        </div>

        {/* Read-only view */}
        {!editOpen && (
          <div className="mt-4 divide-y divide-slate-100">
            {[
              { label: 'Full name', value: candidate.fullName },
              { label: 'Contact / address / phone', value: candidate.contactInfo },
              { label: 'Skills', value: candidate.skills },
              { label: 'Field of study / qualification', value: candidate.major },
              { label: 'Years of experience', value: candidate.yearsOfExperience != null ? `${candidate.yearsOfExperience} years` : null },
              { label: 'Work experience', value: candidate.workExperience },
              { label: 'Preferred locations', value: candidate.preferredLocations },
              { label: 'Preferred work mode', value: candidate.preferredWorkMode?.replace(/_/g, ' ') },
            ]
              .filter((r) => r.value)
              .map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                  <span className="text-sm text-[#6b7280]">{row.label}</span>
                  <span className="text-right text-sm font-medium text-[#0f172a]">{row.value}</span>
                </div>
              ))}
          </div>
        )}

        {/* Edit form */}
        {editOpen && (
          <div className="mt-4 space-y-4">
            <LinkedoutField label="Full name">
              <LinkedoutInput
                value={editFields.fullName}
                onChange={(e) => setEditFields((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Your full name"
              />
            </LinkedoutField>
            <LinkedoutField label="Contact info / address / phone">
              <LinkedoutInput
                value={editFields.contactInfo}
                onChange={(e) => setEditFields((f) => ({ ...f, contactInfo: e.target.value }))}
                placeholder="e.g. john@email.com | +61 400 000 000 | Sydney NSW"
              />
            </LinkedoutField>
            <LinkedoutField label="Skills (comma separated)">
              <LinkedoutInput
                value={editFields.skills}
                onChange={(e) => setEditFields((f) => ({ ...f, skills: e.target.value }))}
                placeholder="e.g. Python, React, SQL"
              />
            </LinkedoutField>
            <LinkedoutField label="Field of study / qualification">
              <LinkedoutInput
                value={editFields.major}
                onChange={(e) => setEditFields((f) => ({ ...f, major: e.target.value }))}
                placeholder="e.g. Computer Science, Business"
              />
            </LinkedoutField>
            <LinkedoutField label="Years of experience">
              <LinkedoutInput
                type="number"
                min="0"
                value={editFields.yearsOfExperience}
                onChange={(e) => setEditFields((f) => ({ ...f, yearsOfExperience: e.target.value }))}
                placeholder="e.g. 3"
              />
            </LinkedoutField>
            <LinkedoutField label="Work experience summary">
              <LinkedoutTextarea
                value={editFields.workExperience}
                onChange={(e) => setEditFields((f) => ({ ...f, workExperience: e.target.value }))}
                placeholder="Brief description of your work history..."
                rows={3}
              />
            </LinkedoutField>
            <LinkedoutField label="Preferred locations">
              <LinkedoutInput
                value={editFields.preferredLocations}
                onChange={(e) => setEditFields((f) => ({ ...f, preferredLocations: e.target.value }))}
                placeholder="e.g. Sydney, Melbourne, Remote"
              />
            </LinkedoutField>
            <LinkedoutField label="Preferred work mode">
              <LinkedoutSelect
                value={editFields.preferredWorkMode}
                onChange={(e) => setEditFields((f) => ({ ...f, preferredWorkMode: e.target.value }))}
              >
                <option value="">Select...</option>
                <option value="remote">Remote</option>
                <option value="on_site">On-site</option>
                <option value="hybrid">Hybrid</option>
              </LinkedoutSelect>
            </LinkedoutField>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <LinkedoutButton type="button" disabled={savingEdit} onClick={handleEditSave}>
                {savingEdit ? 'Saving…' : 'Save changes'}
              </LinkedoutButton>
              {editMsg && (
                <p className={`text-sm ${editMsg.includes('success') ? 'text-emerald-700' : 'text-red-600'}`}>
                  {editMsg}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success toast outside edit form (shown after form closes) */}
        {!editOpen && editMsg && (
          <p className="mt-3 text-sm text-emerald-700">{editMsg}</p>
        )}
      </LinkedoutCard>

      {/* ── Change password ───────────────────────────────────────────────────── */}
      <LinkedoutCard className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2d2d2d]">Change password</h2>
          <LinkedoutButton
            type="button"
            variant="secondary"
            className="text-[13px]"
            onClick={() => {
              setPwOpen((v) => !v);
              setPwErr('');
              setPwMsg('');
            }}
          >
            {pwOpen ? 'Cancel' : 'Change password'}
          </LinkedoutButton>
        </div>

        {pwOpen && (
          <div className="mt-4 space-y-4">
            <LinkedoutField label="Current password">
              <LinkedoutInput
                type="password"
                value={pwFields.current}
                onChange={(e) => setPwFields((f) => ({ ...f, current: e.target.value }))}
                placeholder="Enter your current password"
                autoComplete="current-password"
              />
            </LinkedoutField>
            <LinkedoutField label="New password">
              <LinkedoutInput
                type="password"
                value={pwFields.next}
                onChange={(e) => setPwFields((f) => ({ ...f, next: e.target.value }))}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </LinkedoutField>
            <LinkedoutField label="Confirm new password">
              <LinkedoutInput
                type="password"
                value={pwFields.confirm}
                onChange={(e) => setPwFields((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </LinkedoutField>

            {pwErr && <p className="text-sm text-red-600">{pwErr}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <LinkedoutButton
                type="button"
                disabled={savingPw || !pwFields.current || !pwFields.next}
                onClick={handleChangePw}
              >
                {savingPw ? 'Updating…' : 'Update password'}
              </LinkedoutButton>
              {pwMsg && <p className="text-sm text-emerald-700">{pwMsg}</p>}
            </div>
          </div>
        )}

        {!pwOpen && pwMsg && (
          <p className="mt-3 text-sm text-emerald-700">{pwMsg}</p>
        )}
      </LinkedoutCard>

      {/* ── Resume ───────────────────────────────────────────────────────────── */}
      <LinkedoutCard className="p-6">
        <h2 className="mb-4 text-base font-bold text-[#2d2d2d]">Resume</h2>
        {candidate.resumeText ? (
          <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <p className="text-[13px] font-semibold text-emerald-800">Resume uploaded</p>
                <p className="text-xs text-slate-500">Your resume is visible to employers</p>
              </div>
            </div>
            <LinkedoutButton
              type="button"
              variant="secondary"
              className="shrink-0 !rounded-full text-[13px]"
              onClick={() => onBeginEditResume(candidate.resumeText)}
            >
              Edit summary
            </LinkedoutButton>
          </div>
        ) : (
          <p className="rounded-xl border-2 border-dashed border-[#d4d2d0] bg-[#fafafa] p-5 text-sm text-[#595959]">
            Add a resume summary employers can search.
          </p>
        )}
        <div className="mt-4 space-y-3">
          <input
            type="file"
            accept=".pdf,.txt,.md,.csv,.json,application/pdf,text/*"
            className="file-input file-input-bordered w-full"
            onChange={(e) => onResumeFile(e.target.files?.[0])}
          />
          <LinkedoutTextarea
            value={resumeText}
            onChange={(e) => onResumeChange(e.target.value)}
            placeholder="Paste or type your resume summary..."
            rows={5}
            className="min-h-[120px] text-sm"
          />
          <LinkedoutButton type="button" disabled={!resumeText.trim() || savingResume} onClick={onSaveResume}>
            {savingResume ? 'Saving…' : 'Save resume summary'}
          </LinkedoutButton>
          {message && <p className="text-sm text-emerald-700">{message}</p>}
        </div>
      </LinkedoutCard>

      {/* ── Profile details ──────────────────────────────────────────────────── */}
      <LinkedoutCard className="p-6">
        <h2 className="mb-4 text-base font-bold text-[#2d2d2d]">Profile details</h2>
        <div className="divide-y divide-slate-100">
          {detailRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
              <span className="flex items-center gap-2 text-sm text-[#6b7280]">
                <span>{row.icon}</span>
                {row.label}
              </span>
              <span className="text-right text-sm font-medium text-[#0f172a]">{row.value}</span>
            </div>
          ))}
        </div>
      </LinkedoutCard>

      {/* ── Skills ───────────────────────────────────────────────────────────── */}
      {candidate.skills && (
        <LinkedoutCard className="p-6">
          <h2 className="mb-3 text-base font-bold text-[#2d2d2d]">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.split(',').map((s) => {
              const t = s.trim();
              if (!t) return null;
              return (
                <span
                  key={t}
                  className="rounded-full border border-[#9bb8e5] bg-[#eef4ff] px-3.5 py-1 text-[13px] font-medium text-[#2557a7]"
                >
                  {t}
                </span>
              );
            })}
          </div>
        </LinkedoutCard>
      )}

      {/* ── Work experience ──────────────────────────────────────────────────── */}
      {candidate.workExperience && (
        <LinkedoutCard className="p-6">
          <h2 className="mb-3 text-base font-bold text-[#2d2d2d]">Work experience</h2>
          <p className="text-sm leading-relaxed text-[#374151]">{candidate.workExperience}</p>
        </LinkedoutCard>
      )}
    </div>
  );
}

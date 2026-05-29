'use client';

import type { CandidateDto } from '@talent-matching/dtos';
import { LinkedoutButton, LinkedoutCard, LinkedoutTextarea } from '@features/candidate/components/linkedout-ui';
import { formatEducationLevel } from '@features/candidate/utils/format-education';

type Props = {
  candidate: CandidateDto;
  resumeText: string;
  onResumeChange: (value: string) => void;
  savingResume: boolean;
  message: string;
  onSaveResume: () => void;
  onBeginEditResume: (existing?: string | null) => void;
  onResumeFile: (file?: File) => void;
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

  return (
    <div className="space-y-5">
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
            {savingResume ? 'Saving...' : 'Save resume summary'}
          </LinkedoutButton>
          {message && <p className="text-sm text-emerald-700">{message}</p>}
        </div>
      </LinkedoutCard>

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

      {candidate.workExperience && (
        <LinkedoutCard className="p-6">
          <h2 className="mb-3 text-base font-bold text-[#2d2d2d]">Work experience</h2>
          <p className="text-sm leading-relaxed text-[#374151]">{candidate.workExperience}</p>
        </LinkedoutCard>
      )}
    </div>
  );
}

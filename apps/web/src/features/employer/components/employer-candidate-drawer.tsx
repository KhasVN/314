'use client';

import type { CandidateDto } from '@talent-matching/dtos';
import { LinkedoutCard } from '@features/candidate/components/linkedout-ui';

export function EmployerCandidateDrawer({ candidate, onClose }: { candidate: CandidateDto; onClose: () => void }) {
  const skills = candidate.skills?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];

  return (
    <aside className="hidden w-80 shrink-0 lg:block">
      <LinkedoutCard className="sticky top-24 p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#2d2d2d]">Profile</h2>
          <button
            type="button"
            className="squircle-button px-2 py-1 text-sm font-semibold text-[#2557a7] hover:bg-[#eef4ff]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2557a7] text-xl font-bold text-white">
          {candidate.fullName?.[0]?.toUpperCase()}
        </div>
        <h3 className="text-lg font-bold text-[#2d2d2d]">{candidate.fullName}</h3>
        <p className="text-sm text-[#595959]">{candidate.contactInfo}</p>
        <dl className="mt-4 space-y-2 text-sm">
          {[
            ['Education', candidate.education?.replace('_', ' ')],
            ['Major', candidate.major],
            ['Experience', candidate.yearsOfExperience != null ? `${candidate.yearsOfExperience} years` : undefined],
            ['Work mode', candidate.preferredWorkMode?.replace('_', '-')],
            ['Location', candidate.preferredLocations],
          ]
            .filter(([, v]) => Boolean(v))
            .map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-2">
                <dt className="text-[#767676]">{k}</dt>
                <dd className="text-right font-medium text-[#2d2d2d]">{v}</dd>
              </div>
            ))}
        </dl>
        {candidate.workExperience && (
          <div className="mt-4 border-t border-[#e4e2e0] pt-4">
            <p className="mb-1 text-xs font-bold text-[#2557a7]">Summary</p>
            <p className="text-sm text-[#595959]">{candidate.workExperience}</p>
          </div>
        )}
        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {skills.map((s) => (
              <span key={s} className="rounded-full border border-[#d4d2d0] bg-[#f3f2f1] px-2 py-0.5 text-xs text-[#2d2d2d]">
                {s}
              </span>
            ))}
          </div>
        )}
      </LinkedoutCard>
    </aside>
  );
}

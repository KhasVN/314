'use client';

import type { CandidateDto } from '@talent-matching/dtos';

export function EmployerCandidateCard({
  candidate,
  rank,
  isSelected,
  onClick,
}: {
  candidate: CandidateDto;
  rank?: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const skills = candidate.skills?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`squircle-card w-full text-left p-4 transition-colors ${
        isSelected ? 'border-[#2557a7] bg-[#eef4ff]' : 'border-[#d4d2d0] bg-white hover:bg-[#f3f2f1]'
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {rank !== undefined && (
                <span className="rounded-full bg-[#2557a7] px-2 py-0.5 text-xs font-bold text-white">#{rank}</span>
              )}
              <h3 className="text-base font-bold text-[#2d2d2d]">{candidate.fullName}</h3>
            </div>
            <p className="text-xs text-[#595959]">
              {[candidate.education, candidate.major, candidate.yearsOfExperience != null ? `${candidate.yearsOfExperience} yrs` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          {candidate.preferredLocations && (
            <span className="shrink-0 text-xs text-[#767676]">{candidate.preferredLocations}</span>
          )}
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 8).map((s) => (
              <span key={s} className="rounded-full border border-[#d4d2d0] bg-white px-2 py-0.5 text-xs text-[#2d2d2d]">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

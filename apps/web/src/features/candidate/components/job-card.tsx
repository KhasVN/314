import type { JobDto } from '@talent-matching/dtos';

type Props = {
  job: JobDto;
  rank?: number;
  isSelected: boolean;
  onClick: () => void;
  onApply: () => void;
};

export function JobCard({ job, rank, isSelected, onClick, onApply }: Props) {
  return (
    <div
      className={`squircle cursor-pointer border bg-white transition-colors ${
        isSelected
          ? 'border-[#2557a7] shadow-[0_0_0_1px_#2557a7]'
          : 'border-[#d4d2d0] hover:border-[#767676]'
      }`}
    >
      <article onClick={onClick} className="block">
        <div className="p-5">
          {rank !== undefined && (
            <div className="mb-2 inline-flex h-6 items-center rounded bg-[#eef4ff] px-2 text-xs font-bold text-[#2557a7]">
              #{rank}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-base font-bold leading-snug text-[#2d2d2d] hover:underline">{job.title}</h3>
              <p className="mb-1 truncate text-sm text-[#595959]">{job.companyInfo || 'Company not listed'}</p>
              {job.location && <p className="mb-3 text-sm text-[#595959]">{job.location}</p>}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
              title="Apply"
              type="button"
              className="squircle-button px-3 py-1.5 text-xs font-bold text-[#2557a7] hover:bg-[#eef4ff]"
            >
              Apply
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {job.workMode && <WorkModeBadge mode={job.workMode} />}
            {job.requiredEducation && (
              <span className="rounded bg-[#f3f2f1] px-2 py-1 text-xs font-semibold text-[#595959]">
                {formatEducation(job.requiredEducation)}
              </span>
            )}
            {job.requiredYearsOfExperience != null && (
              <span className="rounded bg-[#f3f2f1] px-2 py-1 text-xs font-semibold text-[#595959]">
                {job.requiredYearsOfExperience}+ yrs exp
              </span>
            )}
            {job.rerankScore !== undefined && (
              <span className="rounded bg-[#e4f7e6] px-2 py-1 text-xs font-semibold text-[#057642]">
                {Math.round(job.rerankScore * 100)}% match
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="squircle-button w-full border-t border-[#e4e2e0] px-5 py-3 text-left text-xs font-semibold text-[#2557a7] hover:bg-[#eef4ff]"
        >
          {isSelected ? 'Hide details' : 'View similar jobs with this employer'}
        </button>
      </article>
    </div>
  );
}

function WorkModeBadge({ mode }: { mode: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    remote: { bg: '#dcfce7', text: '#16a34a', label: 'Remote' },
    on_site: { bg: '#dbeafe', text: '#6366f1', label: 'On-site' },
    hybrid: { bg: '#f3e8ff', text: '#7c3aed', label: 'Hybrid' },
  };
  const s = map[mode] ?? { bg: '#f3f4f6', text: '#6b7280', label: mode };
  return (
    <span className="rounded px-2 py-1 text-xs font-semibold" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

function formatEducation(level: string) {
  const map: Record<string, string> = {
    high_school: 'High school',
    diploma: 'Diploma',
    bachelor: "Bachelor's",
    master: "Master's",
    phd: 'PhD',
    other: 'Other',
  };
  return map[level] ?? level;
}

import type { JobDto } from '@talent-matching/dtos';

type Props = {
  job: JobDto | null;
  onApply: (job: JobDto) => void;
  onClose: () => void;
  // Save job props — optional so pages that don't support saving still work
  onSave?: (job: JobDto) => void;
  isSaved?: boolean;
};

export function JobDetailDrawer({ job, onApply, onClose, onSave, isSaved }: Props) {
  if (!job) {
    return (
      <aside className="hidden min-w-0 flex-1 min-[920px]:block">
        <div className="squircle sticky top-24 border border-[#e4e2e0] bg-white p-8 text-center text-sm text-[#767676]">
          Select a job to view details.
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden min-w-0 flex-1 min-[920px]:block">
      <div
        className="squircle sticky top-24 border border-[#d4d2d0] bg-white"
        style={{ maxHeight: 'calc(100vh - 7rem)' }}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="border-b border-[#d4d2d0] p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-tight text-[#2d2d2d]">{job.title}</h2>
              <p className="mt-3 text-sm text-[#595959] underline underline-offset-2">{job.companyInfo || 'Company'}</p>
              {job.location && <p className="mt-1 text-sm text-[#595959]">{job.location}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="squircle-button p-1.5 text-[#595959] transition-colors hover:bg-[#f3f2f1] hover:text-[#2d2d2d]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Apply + Save buttons side by side */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onApply(job)}
              className="squircle-button bg-[#2557a7] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#164081]"
            >
              Apply
            </button>
            {onSave && (
              <button
                type="button"
                onClick={() => onSave(job)}
                className={`squircle-button border px-5 py-3 text-sm font-bold transition-colors ${
                  isSaved
                    ? 'border-[#2557a7] bg-[#eef4ff] text-[#2557a7]'
                    : 'border-[#d4d2d0] bg-white text-[#2d2d2d] hover:bg-[#f3f2f1]'
                }`}
              >
                {isSaved ? '✓ Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="space-y-6 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 18rem)' }}>
          <div className="flex flex-wrap gap-2">
            {job.workMode && <InfoBadge icon="💼" label={job.workMode.replace('_', '-')} color="blue" />}
            {job.requiredEducation && (
              <InfoBadge icon="🎓" label={job.requiredEducation.replace('_', ' ')} color="purple" />
            )}
            {job.requiredYearsOfExperience != null && (
              <InfoBadge icon="📅" label={`${job.requiredYearsOfExperience}+ years`} color="green" />
            )}
            {(job.salaryMin != null || job.salaryMax != null) && (
              <InfoBadge icon="$" label={formatSalary(job.salaryMin, job.salaryMax)} color="gold" />
            )}
          </div>

          {job.requiredSkills && (
            <div>
              <SectionTitle>Required skills</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.split(',').map((s) => (
                  <span
                    key={s.trim()}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{ background: '#f8f7ff', color: '#6366f1' }}
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.description && (
            <div>
              <SectionTitle>What you&apos;ll do</SectionTitle>
              <p className="whitespace-pre-line text-sm leading-7 text-[#2d2d2d]">{job.description}</p>
            </div>
          )}

          {job.companyInfo && (
            <div>
              <SectionTitle>About the company</SectionTitle>
              <p className="text-sm leading-7 text-[#2d2d2d]">{job.companyInfo}</p>
            </div>
          )}

          <div className="flex gap-2 rounded-lg bg-[#eef4ff] p-3 text-xs text-[#164081]">
            <span>i</span>
            <span>
              After applying, track the application in <strong>My jobs</strong>.
            </span>
          </div>

          {/* Bottom action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onApply(job)}
              className="squircle-button flex-1 bg-[#2557a7] py-3 text-sm font-bold text-white transition-colors hover:bg-[#164081]"
            >
              Apply
            </button>
            {onSave && (
              <button
                type="button"
                onClick={() => onSave(job)}
                className={`squircle-button border px-5 py-3 text-sm font-bold transition-colors ${
                  isSaved
                    ? 'border-[#2557a7] bg-[#eef4ff] text-[#2557a7]'
                    : 'border-[#d4d2d0] bg-white text-[#2d2d2d] hover:bg-[#f3f2f1]'
                }`}
              >
                {isSaved ? '✓ Saved' : 'Save job'}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-base font-bold text-[#2d2d2d]">{children}</h3>;
}

function formatSalary(min?: number | null, max?: number | null) {
  const money = (value: number) => `$${Math.round(value / 1000)}k`;
  if (min != null && max != null) return `${money(min)} - ${money(max)}`;
  if (min != null) return `${money(min)}+`;
  if (max != null) return `Up to ${money(max)}`;
  return 'Salary listed';
}

function InfoBadge({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: 'blue' | 'purple' | 'green' | 'gold';
}) {
  const map = {
    blue:   { bg: '#eef4ff', text: '#2557a7' },
    purple: { bg: '#f3f2f1', text: '#595959' },
    green:  { bg: '#e4f7e6', text: '#057642' },
    gold:   { bg: '#fff8e6', text: '#7c5a00' },
  };
  const { bg, text } = map[color];
  return (
    <span
      className="flex items-center gap-1.5 rounded bg-[#f3f2f1] px-3 py-1 text-xs font-semibold"
      style={{ background: bg, color: text }}
    >
      <span className="text-[11px]">{icon}</span>
      {label}
    </span>
  );
}

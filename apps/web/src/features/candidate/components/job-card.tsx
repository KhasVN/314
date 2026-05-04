// ═══════════════════════════════════════════════════════════════
// job-card.tsx  —  SINGLE JOB LISTING CARD
//
// Renders one job from the database as a clickable card.
// Shows: company, title, location, badges, relevance score.
//
// Props:
//   job        — the JobDto object fetched from PostgreSQL
//   rank       — position number (1-10) when in Recommended tab
//   isSelected — true when this job is open in the detail panel
//   isSaved    — true when user has bookmarked this job
//   onClick    — opens the job detail drawer
//   onSave     — toggles the saved/bookmarked state
// ═══════════════════════════════════════════════════════════════

import type { JobDto } from '@talent-matching/dtos';

type Props = {
  job: JobDto;
  rank?: number;           // 1-based rank in recommended list
  isSelected: boolean;
  isSaved: boolean;
  onClick: () => void;
  onSave: () => void;
};

export function JobCard({ job, rank, isSelected, isSaved, onClick, onSave }: Props) {
  return (
    <article
      onClick={onClick}
      className={`
        bg-white rounded-xl p-5 cursor-pointer border-2 transition-all duration-150
        hover:shadow-md hover:-translate-y-0.5
        ${isSelected
          ? 'border-indigo-500 shadow-md'
          : 'border-gray-100 hover:border-indigo-200'
        }
      `}
    >
      <div className="flex items-start gap-3">

        {/* ── RANK BADGE (only shown in Recommended tab) ── */}
        {rank !== undefined && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
            style={{ background: rank <= 3 ? '#dbeafe' : '#f3f4f6', color: rank <= 3 ? '#6366f1' : '#6b7280' }}>
            #{rank}
          </div>
        )}

        {/* ── COMPANY LOGO PLACEHOLDER ── */}
        {rank === undefined && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
            style={{ background: `hsl(${(job.title.charCodeAt(0) * 37) % 360}, 60%, 55%)` }}>
            {(job.companyInfo || job.title).charAt(0).toUpperCase()}
          </div>
        )}

        {/* ── MAIN JOB INFO ── */}
        <div className="flex-1 min-w-0">

          {/* Company name */}
          <p className="text-xs text-gray-400 mb-0.5 truncate">
            {job.companyInfo || 'Company not listed'}
          </p>

          {/* Job title — main clickable heading */}
          <h3 className="font-semibold text-indigo-600 text-base leading-snug mb-1.5 hover:underline truncate">
            {job.title}
          </h3>

          {/* Location */}
          {job.location && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
              <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              {job.location}
            </p>
          )}

          {/* ── BADGES ROW ── */}
          <div className="flex flex-wrap gap-1.5">

            {/* Work mode — colour coded: green=remote, blue=on-site, purple=hybrid */}
            {job.workMode && <WorkModeBadge mode={job.workMode}/>}

            {/* Education requirement from DB */}
            {job.requiredEducation && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {formatEducation(job.requiredEducation)}
              </span>
            )}

            {/* Experience requirement from DB */}
            {job.requiredYearsOfExperience != null && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {job.requiredYearsOfExperience}+ yrs exp
              </span>
            )}

            {/* Relevance / match score — only shown when search returns it */}
            {job.rerankScore !== undefined && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ background: '#10b981' }}>
                {Math.round(job.rerankScore * 100)}% match
              </span>
            )}

          </div>
        </div>

        {/* ── RIGHT SIDE: SAVE + APPLY BUTTONS ── */}
        <div className="flex flex-col items-end gap-2 shrink-0">

          {/* Save / Bookmark button */}
          <button
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            title={isSaved ? 'Unsave job' : 'Save job'}
            className={`p-1.5 rounded-full transition-colors ${
              isSaved
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
            }`}
          >
            {/* Bookmark icon — filled when saved */}
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>

          {/* View job / Apply button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-colors hover:bg-indigo-50"
            style={{ borderColor: '#6366f1', color: '#6366f1' }}
          >
            {isSelected ? 'Close' : 'View'}
          </button>

        </div>
      </div>
    </article>
  );
}

// ── WORK MODE BADGE — colour coded for quick visual scanning ──
function WorkModeBadge({ mode }: { mode: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    remote:  { bg: '#dcfce7', text: '#16a34a', label: 'Remote'  },
    on_site: { bg: '#dbeafe', text: '#6366f1', label: 'On-site' },
    hybrid:  { bg: '#f3e8ff', text: '#7c3aed', label: 'Hybrid'  },
  };
  const s = map[mode] ?? { bg: '#f3f4f6', text: '#6b7280', label: mode };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

// ── FORMAT EDUCATION LEVEL to human-readable string ──────────
function formatEducation(level: string) {
  const map: Record<string, string> = {
    high_school: 'High school', diploma: 'Diploma',
    bachelor: "Bachelor's", master: "Master's", phd: 'PhD', other: 'Other',
  };
  return map[level] ?? level;
}

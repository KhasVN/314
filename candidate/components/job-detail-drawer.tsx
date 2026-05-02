// ═══════════════════════════════════════════════════════════════
// job-detail-drawer.tsx  —  JOB DETAIL SIDE PANEL
//
// Appears on the right when a candidate clicks a job card.
// Shows the FULL job data from the database:
//   - Full description (job.description field)
//   - Required skills as individual chips (split by comma)
//   - Work mode, education, experience badges
//   - Company info
//   - Save button & Apply now button
//   - Scope note: Application tracking will be in Sprint 5
// ═══════════════════════════════════════════════════════════════

import type { JobDto } from '@talent-matching/dtos';

type Props = {
  job: JobDto;
  isSaved: boolean;
  onSave: () => void;
  onClose: () => void;
};

export function JobDetailDrawer({ job, isSaved, onSave, onClose }: Props) {
  return (
    <aside className="hidden xl:block w-[380px] shrink-0">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-20 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 6rem)' }}>

        {/* ── HEADER ── */}
        <div className="p-5 border-b border-gray-100">

          {/* Top row: title + close button */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              {/* Company */}
              <p className="text-xs text-gray-400 mb-1">{job.companyInfo || 'Company'}</p>
              {/* Job title */}
              <h2 className="font-bold text-gray-900 text-lg leading-snug">{job.title}</h2>
              {/* Location */}
              {job.location && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {job.location}
                </p>
              )}
            </div>
            {/* Close button */}
            <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div className="flex gap-2">

            {/* APPLY NOW — primary action (Sprint 5 will wire to real application) */}
            <button
              className="flex-1 py-2.5 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: '#1a56db' }}
            >
              Apply now
            </button>

            {/* SAVE JOB — bookmarks this job for later review */}
            <button
              onClick={onSave}
              title={isSaved ? 'Remove from saved' : 'Save this job'}
              className={`px-3 py-2.5 rounded-full border-2 transition-colors font-semibold text-sm ${
                isSaved
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>

          </div>
        </div>

        {/* ── BODY ── */}
        <div className="p-5 space-y-5">

          {/* ── QUICK INFO BADGES ── */}
          {/* Shows work mode, education, experience at a glance */}
          <div className="flex flex-wrap gap-2">
            {job.workMode && <InfoBadge icon="💼" label={job.workMode.replace('_', '-')} color="blue"/>}
            {job.requiredEducation && <InfoBadge icon="🎓" label={job.requiredEducation.replace('_', ' ')} color="purple"/>}
            {job.requiredYearsOfExperience != null && <InfoBadge icon="📅" label={`${job.requiredYearsOfExperience}+ years`} color="green"/>}
          </div>

          {/* ── REQUIRED SKILLS ── */}
          {/* Skills stored as comma-separated string in DB */}
          {job.requiredSkills && (
            <div>
              <SectionTitle>Required skills</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.split(',').map((s) => (
                  <span key={s.trim()} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: '#eff6ff', color: '#1a56db' }}>
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── FULL JOB DESCRIPTION ── */}
          {/* Full text from the description field in PostgreSQL */}
          {job.description && (
            <div>
              <SectionTitle>Job description</SectionTitle>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}

          {/* ── COMPANY INFO ── */}
          {job.companyInfo && (
            <div>
              <SectionTitle>About the company</SectionTitle>
              <p className="text-sm text-gray-600 leading-relaxed">{job.companyInfo}</p>
            </div>
          )}

          {/* ── APPLICATION TRACKING NOTE ── */}
          {/* Scope: Application lifecycle is implemented in Sprint 5 */}
          <div className="rounded-xl p-3 text-xs text-blue-700 flex gap-2" style={{ background: '#eff6ff' }}>
            <span>ℹ️</span>
            <span>After applying, you can track your application status (submitted, reviewed, accepted, rejected) in the <strong>My Applications</strong> tab.</span>
          </div>

          {/* Second apply button at bottom */}
          <button
            className="w-full py-2.5 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: '#1a56db' }}
          >
            Apply now
          </button>

        </div>
      </div>
    </aside>
  );
}

// ── SMALL HELPERS ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{children}</h3>;
}

function InfoBadge({ icon, label, color }: { icon: string; label: string; color: 'blue' | 'purple' | 'green' }) {
  const map = {
    blue:   { bg: '#eff6ff', text: '#1a56db' },
    purple: { bg: '#f5f3ff', text: '#7c3aed' },
    green:  { bg: '#f0fdf4', text: '#16a34a' },
  };
  const { bg, text } = map[color];
  return (
    <span className="text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium"
      style={{ background: bg, color: text }}>
      <span style={{ fontSize: '11px' }}>{icon}</span>{label}
    </span>
  );
}

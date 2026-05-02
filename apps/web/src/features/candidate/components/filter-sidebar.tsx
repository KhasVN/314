'use client';

// ═══════════════════════════════════════════════════════════════
// filter-sidebar.tsx  —  LEFT FILTER PANEL
//
// Lets candidates narrow job results by:
//   • Work mode (Remote / On-site / Hybrid)
//   • Required education level
//   • Max years of experience required
//
// Each filter change immediately calls onFilter() which triggers
// a new database search via GET /api/jobs/search with the params.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import type { JobSearchQueryDto } from '@talent-matching/dtos';

type Props = {
  onFilter: (params: JobSearchQueryDto) => void;
};

export function FilterSidebar({ onFilter }: Props) {

  // ── FILTER STATE — each maps to a backend query param ─────
  const [workMode,  setWorkMode]  = useState('');
  const [education, setEducation] = useState('');
  const [minYears,  setMinYears]  = useState('');

  // ── APPLY FILTERS — sends current filter state to parent ──
  const apply = (wm = workMode, edu = education, yrs = minYears) => {
    onFilter({
      workMode:           (wm  as JobSearchQueryDto['workMode'])           || undefined,
      requiredEducation:  (edu as JobSearchQueryDto['requiredEducation'])  || undefined,
      yearsOfExperience:  yrs ? Number(yrs) : undefined,
      limit: 100,
    });
  };

  // ── RESET ALL FILTERS ─────────────────────────────────────
  const reset = () => {
    setWorkMode('');
    setEducation('');
    setMinYears('');
    onFilter({ limit: 100 });
  };

  return (
    <aside className="hidden lg:block w-52 shrink-0">
      <div className="bg-white rounded-xl p-4 sticky top-20 border border-gray-100 shadow-sm">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 text-sm">Filters</h2>
          <button onClick={reset} className="text-xs text-blue-600 hover:underline font-medium">
            Reset all
          </button>
        </div>

        {/* ══ WORK MODE FILTER ════════════════════════════════ */}
        {/* Filters the DB query by the job's work_mode column  */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
            Work mode
          </h3>
          <div className="space-y-2">
            {[
              { value: '',        label: 'Any mode',  dot: 'bg-gray-300' },
              { value: 'remote',  label: 'Remote',    dot: 'bg-green-400' },
              { value: 'on_site', label: 'On-site',   dot: 'bg-blue-400' },
              { value: 'hybrid',  label: 'Hybrid',    dot: 'bg-purple-400' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="workMode"
                  value={opt.value}
                  checked={workMode === opt.value}
                  onChange={() => { setWorkMode(opt.value); apply(opt.value, education, minYears); }}
                  className="sr-only"
                />
                {/* Custom radio circle */}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  workMode === opt.value ? 'border-blue-600' : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {workMode === opt.value && <div className="w-2 h-2 rounded-full bg-blue-600"/>}
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`}/>
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 mb-5"/>

        {/* ══ EDUCATION FILTER ════════════════════════════════ */}
        {/* Filters by the job's required_education column       */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
            Education required
          </h3>
          <select
            value={education}
            onChange={(e) => { setEducation(e.target.value); apply(workMode, e.target.value, minYears); }}
            className="w-full text-sm border border-gray-200 rounded-full px-3 py-2 text-gray-700 outline-none focus:border-blue-400 bg-gray-50"
          >
            <option value="">Any level</option>
            <option value="high_school">High school</option>
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor's</option>
            <option value="master">Master's</option>
            <option value="phd">PhD</option>
          </select>
        </div>

        <div className="border-t border-gray-100 mb-5"/>

        {/* ══ EXPERIENCE FILTER ═══════════════════════════════ */}
        {/* Filters by required_years_of_experience column       */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
            Experience required
          </h3>
          <div className="space-y-2">
            {[
              { value: '',   label: 'Any level' },
              { value: '0',  label: 'Entry level (0 yrs)' },
              { value: '2',  label: 'Junior (up to 2 yrs)' },
              { value: '5',  label: 'Mid-level (up to 5 yrs)' },
              { value: '10', label: 'Senior (10+ yrs)' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="radio" name="minYears" value={opt.value} checked={minYears === opt.value}
                  onChange={() => { setMinYears(opt.value); apply(workMode, education, opt.value); }} className="sr-only"/>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  minYears === opt.value ? 'border-blue-600' : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {minYears === opt.value && <div className="w-2 h-2 rounded-full bg-blue-600"/>}
                </div>
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}

'use client';

import { useState } from 'react';
import type { JobSearchQueryDto } from '@talent-matching/dtos';

type Props = { onFilter: (params: JobSearchQueryDto | null) => void };

const WORK_MODES: Array<{ value: NonNullable<JobSearchQueryDto['workMode']>; label: string }> = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on_site', label: 'On-site' },
];

const EDUCATION_LEVELS: Array<{
  value: NonNullable<JobSearchQueryDto['requiredEducation']>;
  label: string;
}> = [
  { value: 'high_school', label: 'High school' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
];

const EXPERIENCE_LEVELS = [
  { value: '', label: 'Any experience' },
  { value: '0', label: 'Entry level' },
  { value: '2', label: '2+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
];

const SALARY_RANGES = [
  { value: '', label: 'Any salary' },
  { value: '0-70000', label: 'Up to $70k' },
  { value: '70000-100000', label: '$70k - $100k' },
  { value: '100000-140000', label: '$100k - $140k' },
  { value: '140000-', label: '$140k+' },
];

export function FilterSidebar({ onFilter }: Props) {
  const [workMode, setWorkMode] = useState('');
  const [education, setEducation] = useState('');
  const [minYears, setMinYears] = useState('');
  const [salaryRange, setSalaryRange] = useState('');

  const apply = (wm = workMode, edu = education, yrs = minYears, salary = salaryRange) => {
    const [salaryMin, salaryMax] = salary.split('-');
    const params: JobSearchQueryDto = {
      workMode: (wm as JobSearchQueryDto['workMode']) || undefined,
      requiredEducation: (edu as JobSearchQueryDto['requiredEducation']) || undefined,
      yearsOfExperience: yrs ? Number(yrs) : undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      limit: 100,
    };
    const hasActiveFilter = Boolean(
      params.workMode ||
        params.requiredEducation ||
        params.yearsOfExperience !== undefined ||
        params.salaryMin !== undefined ||
        params.salaryMax !== undefined,
    );
    onFilter(hasActiveFilter ? params : null);
  };

  const reset = () => {
    setWorkMode('');
    setEducation('');
    setMinYears('');
    setSalaryRange('');
    onFilter(null);
  };

  const activeCount = [workMode, education, minYears, salaryRange].filter(Boolean).length;
  const workModeLabel = WORK_MODES.find((mode) => mode.value === workMode)?.label;
  const educationLabel = EDUCATION_LEVELS.find((level) => level.value === education)?.label;
  const experienceLabel = EXPERIENCE_LEVELS.find((level) => level.value === minYears)?.label;
  const salaryLabel = SALARY_RANGES.find((range) => range.value === salaryRange)?.label;

  return (
    <div className="relative z-20 w-full overflow-visible pb-2">
      <div className="flex flex-wrap items-center gap-2 overflow-visible">
        <FilterDropdown
          label={workModeLabel ?? 'Work mode'}
          active={Boolean(workMode)}
          badge={workMode ? 1 : 0}
          onClear={() => {
            setWorkMode('');
            apply('', education, minYears);
          }}
          onApply={() => apply()}
        >
          <div className="space-y-2">
            <OptionButton selected={!workMode} onClick={() => setWorkMode('')}>
              Any work mode
            </OptionButton>
            {WORK_MODES.map((mode) => (
              <OptionButton key={mode.value} selected={workMode === mode.value} onClick={() => setWorkMode(mode.value)}>
                {mode.label}
              </OptionButton>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          label={educationLabel ?? 'Education level'}
          active={Boolean(education)}
          badge={education ? 1 : 0}
          onClear={() => {
            setEducation('');
            apply(workMode, '', minYears);
          }}
          onApply={() => apply()}
        >
          <select
            className="select select-bordered w-full rounded-lg"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          >
            <option value="">Any level</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </FilterDropdown>

        <FilterDropdown
          label={minYears ? experienceLabel ?? 'Experience' : 'Experience'}
          active={Boolean(minYears)}
          badge={minYears ? 1 : 0}
          onClear={() => {
            setMinYears('');
            apply(workMode, education, '');
          }}
          onApply={() => apply()}
        >
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <OptionButton key={level.value || 'any'} selected={minYears === level.value} onClick={() => setMinYears(level.value)}>
                {level.label}
              </OptionButton>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          label={salaryRange ? salaryLabel ?? 'Salary' : 'Salary'}
          active={Boolean(salaryRange)}
          badge={salaryRange ? 1 : 0}
          onClear={() => {
            setSalaryRange('');
            apply(workMode, education, minYears, '');
          }}
          onApply={() => apply()}
        >
          <div className="space-y-2">
            {SALARY_RANGES.map((range) => (
              <OptionButton key={range.value || 'any'} selected={salaryRange === range.value} onClick={() => setSalaryRange(range.value)}>
                {range.label}
              </OptionButton>
            ))}
          </div>
        </FilterDropdown>

        {activeCount > 0 && (
          <button type="button" className="btn btn-ghost btn-sm px-4 text-primary hover:text-primary" onClick={reset}>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({
  label,
  active,
  badge,
  children,
  onClear,
  onApply,
}: {
  label: string;
  active?: boolean;
  badge?: number;
  children: React.ReactNode;
  onClear: () => void;
  onApply: () => void;
}) {
  return (
    <div className="dropdown dropdown-bottom">
      <button
        type="button"
        tabIndex={0}
        className={`btn btn-outline btn-sm border-base-300 bg-base-100 px-5 text-base-content hover:border-neutral hover:bg-base-200 hover:text-base-content focus:text-base-content ${
          active ? 'border-neutral bg-base-200 font-bold' : 'font-normal'
        }`}
      >
        {label}
        {badge ? <span className="badge badge-neutral badge-sm ml-1 h-5 w-5 p-0 text-xs">{badge}</span> : null}
      </button>
      <div
        tabIndex={0}
        className="dropdown-content z-[250] mt-2 w-80 rounded-xl border border-base-300 bg-base-100 p-5 shadow-xl"
      >
        {children}
        <div className="mt-5 flex justify-end gap-2 border-t border-base-300 pt-4">
          <button type="button" className="btn btn-ghost btn-sm text-primary hover:text-primary" onClick={onClear}>
            Clear
          </button>
          <button type="button" className="btn btn-primary btn-sm px-5" onClick={onApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`squircle-button flex w-full items-center gap-3 px-2 py-2 text-left text-sm hover:bg-base-200 ${
        selected ? 'font-bold text-primary' : 'text-base-content'
      }`}
      onClick={onClick}
    >
      <span className={`h-4 w-4 rounded-full border ${selected ? 'border-primary bg-primary shadow-[inset_0_0_0_4px_white]' : 'border-base-300'}`} />
      {children}
    </button>
  );
}

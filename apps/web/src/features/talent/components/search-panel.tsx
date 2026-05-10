import type {
  CandidateDto,
  CandidateSearchQueryDto,
  JobDto,
  JobSearchQueryDto,
} from '@talent-matching/dtos';
import { type FormEvent, useMemo, useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../api';
import {
  emptyToUndefined,
  enumOrUndefined,
  numberOrUndefined,
  title,
} from '@features/talent/utils';
import {
  CandidateDetail,
  CandidateResults,
  JobDetail,
  JobResults,
} from '@components/results';
import { ArrowIcon } from '@components/visuals';

const educationOptions = [
  'high_school',
  'diploma',
  'bachelor',
  'master',
  'phd',
  'other',
] as const;
const workModeOptions = ['remote', 'on_site', 'hybrid'] as const;

export function SearchPanel({
  candidates,
  jobs,
}: {
  candidates: CandidateDto[];
  jobs: JobDto[];
}) {
  const [mode, setMode] = useState<'jobs' | 'candidates'>('jobs');
  const [query, setQuery] = useState('');
  const [relatedId, setRelatedId] = useState('');
  const [rerank, setRerank] = useState(false);
  const [submittedJobParams, setSubmittedJobParams] =
    useState<JobSearchQueryDto | null>(null);
  const [submittedCandidateParams, setSubmittedCandidateParams] =
    useState<CandidateSearchQueryDto | null>(null);

  const [jobFilters, setJobFilters] = useState({
    workMode: '',
    location: '',
    education: '',
    years: '',
  });

  const [candidateFilters, setCandidateFilters] = useState({
    education: '',
    location: '',
    workMode: '',
    years: '',
  });

  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateDto | null>(null);

  const jobParams = useMemo<JobSearchQueryDto>(
    () => ({
      query,
      limit: 1000,
      rerank,
      candidateId: mode === 'jobs' ? emptyToUndefined(relatedId) : undefined,
      workMode: enumOrUndefined(jobFilters.workMode, workModeOptions),
      location: emptyToUndefined(jobFilters.location),
      requiredEducation: enumOrUndefined(
        jobFilters.education,
        educationOptions,
      ),
      yearsOfExperience: numberOrUndefined(jobFilters.years),
    }),
    [jobFilters, mode, query, relatedId, rerank],
  );

  const candidateParams = useMemo<CandidateSearchQueryDto>(
    () => ({
      query,
      limit: 1000,
      rerank,
      jobId: mode === 'candidates' ? emptyToUndefined(relatedId) : undefined,
      education: enumOrUndefined(candidateFilters.education, educationOptions),
      location: emptyToUndefined(candidateFilters.location),
      workMode: enumOrUndefined(candidateFilters.workMode, workModeOptions),
      minYearsOfExperience: numberOrUndefined(candidateFilters.years),
    }),
    [candidateFilters, mode, query, relatedId, rerank],
  );

  const jobResults = useSWR(
    mode === 'jobs' && submittedJobParams
      ? ['job-search', submittedJobParams]
      : null,
    () => talentApi.jobs.search(submittedJobParams!),
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    },
  );
  const candidateResults = useSWR(
    mode === 'candidates' && submittedCandidateParams
      ? ['candidate-search', submittedCandidateParams]
      : null,
    () => talentApi.candidates.search(submittedCandidateParams!),
    { keepPreviousData: true, revalidateOnMount: false },
  );

  const isLoading =
    mode === 'jobs' ? jobResults.isLoading : candidateResults.isLoading;
  const error = mode === 'jobs' ? jobResults.error : candidateResults.error;
  const relatedOptions =
    mode === 'jobs'
      ? candidates.map((c) => [c.id, c.fullName] as const)
      : jobs.map((j) => [j.id, j.title] as const);

  const handleSelect = (item: JobDto | CandidateDto) => {
    if ('title' in item) {
      setSelectedJob(item);
      setSelectedCandidate(null);
    } else {
      setSelectedCandidate(item);
      setSelectedJob(null);
    }
  };

  const handleSearch = (event?: FormEvent) => {
    event?.preventDefault();
    setSelectedJob(null);
    setSelectedCandidate(null);

    if (mode === 'jobs') {
      setSubmittedJobParams({ ...jobParams });
    } else {
      setSubmittedCandidateParams({ ...candidateParams });
    }
  };

  const data =
    mode === 'jobs' ? (jobResults.data ?? []) : (candidateResults.data ?? []);
  const selected = mode === 'jobs' ? selectedJob : selectedCandidate;

  return (
    <section className="search-surface">
      <div className="hero-block">
        <form className="hero-search" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${mode}`}
          />
          <div className="hero-search-side">
            <span>for</span>
            <select
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
            >
              <option value="">Any</option>
              {relatedOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="btn btn-square btn-lg bg-primary text-primary-content hover:bg-accent hover:text-primary border-0 rounded-none"
            >
              <ArrowIcon className="size-8" />
            </button>
          </div>
        </form>
      </div>

      <div className="search-workspace">
        <aside className="filter-rail">
          <div>
            <p className="rail-title">Search for</p>
            <div className="rail-list">
              <button
                className={mode === 'jobs' ? 'active' : ''}
                onClick={() => setMode('jobs')}
              >
                Jobs
              </button>
              <button
                className={mode === 'candidates' ? 'active' : ''}
                onClick={() => setMode('candidates')}
              >
                Candidates
              </button>
            </div>
          </div>
          <label className="rerank-toggle cursor-pointer gap-3 flex items-center">
            <input
              type="checkbox"
              checked={rerank}
              onChange={(e) => setRerank(e.target.checked)}
              className="checkbox checkbox-sm rounded-none"
            />
            <span className="text-sm">Cohere rerank</span>
          </label>
          <div className="filter-stack">
            <p className="rail-title">Hard filters</p>
            {mode === 'jobs' ? (
              <>
                <FilterSelect
                  label="Work mode"
                  value={jobFilters.workMode}
                  onChange={(v) =>
                    setJobFilters((f) => ({ ...f, workMode: v }))
                  }
                  options={workModeOptions.map((o) => [o, title(o)])}
                />
                <FilterInput
                  label="Location"
                  value={jobFilters.location}
                  onChange={(v) =>
                    setJobFilters((f) => ({ ...f, location: v }))
                  }
                />
                <FilterSelect
                  label="Education"
                  value={jobFilters.education}
                  onChange={(v) =>
                    setJobFilters((f) => ({ ...f, education: v }))
                  }
                  options={educationOptions.map((o) => [o, title(o)])}
                />
                <FilterInput
                  label="Years exp."
                  value={jobFilters.years}
                  onChange={(v) => setJobFilters((f) => ({ ...f, years: v }))}
                />
              </>
            ) : (
              <>
                <FilterSelect
                  label="Education"
                  value={candidateFilters.education}
                  onChange={(v) =>
                    setCandidateFilters((f) => ({ ...f, education: v }))
                  }
                  options={educationOptions.map((o) => [o, title(o)])}
                />
                <FilterInput
                  label="Location"
                  value={candidateFilters.location}
                  onChange={(v) =>
                    setCandidateFilters((f) => ({ ...f, location: v }))
                  }
                />
                <FilterSelect
                  label="Work mode"
                  value={candidateFilters.workMode}
                  onChange={(v) =>
                    setCandidateFilters((f) => ({ ...f, workMode: v }))
                  }
                  options={workModeOptions.map((o) => [o, title(o)])}
                />
                <FilterInput
                  label="Min years exp."
                  value={candidateFilters.years}
                  onChange={(v) =>
                    setCandidateFilters((f) => ({ ...f, years: v }))
                  }
                />
              </>
            )}
          </div>
        </aside>

        <div className="results-area">
          {error ? (
            <div className="alert alert-error rounded-none">
              {error instanceof Error ? error.message : 'Request failed'}
            </div>
          ) : isLoading ? (
            <span className="loading loading-spinner loading-lg" />
          ) : (
            <div className={selected ? 'results-split' : ''}>
              <div className="results-list">
                {mode === 'jobs' ? (
                  <JobResults
                    items={data as JobDto[]}
                    selectedId={selectedJob?.id}
                    onSelect={handleSelect}
                  />
                ) : (
                  <CandidateResults
                    items={data as CandidateDto[]}
                    selectedId={selectedCandidate?.id}
                    onSelect={handleSelect}
                  />
                )}
              </div>
              {selected && (
                <div className="results-detail border-l border-base-300 pl-6">
                  {mode === 'jobs' ? (
                    <JobDetail job={selectedJob} />
                  ) : (
                    <CandidateDetail candidate={selectedCandidate} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="form-control">
      <span className="label-text text-xs uppercase text-primary/50">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input input-bordered input-sm rounded-none bg-base-100"
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  emptyLabel = 'Any',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[];
  emptyLabel?: string;
}) {
  return (
    <label className="form-control">
      <span className="label-text text-xs uppercase text-primary/50">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-bordered select-sm rounded-none bg-base-100"
      >
        <option value="">{emptyLabel}</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

'use client';

// ═══════════════════════════════════════════════════════════════
// candidate-home.tsx  —  ROOT PAGE COMPONENT
//
// This is the main entry point for the Candidate Homepage.
// It manages ALL shared state (search, saved jobs, selected job)
// and fetches data from the backend database via the API.
//
// DATA FLOW:
//   PostgreSQL DB → NestJS backend (port 4000)
//     → talentApi (axios) → useSWR (cache+fetch)
//       → this component → child components
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../talent/api';
import { Navbar }           from './components/navbar';
import { HeroSearch }       from './components/hero-search';
import { FilterSidebar }    from './components/filter-sidebar';
import { JobCard }          from './components/job-card';
import { JobDetailDrawer }  from './components/job-detail-drawer';
import type { JobDto, JobSearchQueryDto } from '@talent-matching/dtos';

export function CandidateHome() {

  // ── SEARCH STATE ────────────────────────────────────────────
  // null = no search submitted yet → show all jobs from DB
  // object = user has searched → show filtered/ranked results
  const [searchParams, setSearchParams] = useState<JobSearchQueryDto | null>(null);

  // ── SELECTED JOB STATE ──────────────────────────────────────
  // Stores the job the user clicked on to view in detail panel
  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null);

  // ── SAVED JOBS STATE ────────────────────────────────────────
  // Stores IDs of jobs the user bookmarked (saved for later)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // ── ACTIVE TAB ──────────────────────────────────────────────
  // Controls which section is shown: 'all' | 'recommended'
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');

  // ── SELECTED CANDIDATE PROFILE ──────────────────────────────
  // The candidate whose profile drives the Top-10 recommendations
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  // ── FETCH ALL JOBS FROM DATABASE ────────────────────────────
  // Calls GET /api/jobs on the backend
  // Returns every published job posting stored in PostgreSQL
  const { data: allJobs = [], isLoading: loadingAll } = useSWR(
    'candidate-all-jobs',
    talentApi.jobs.list
  );

  // ── FETCH ALL CANDIDATES (to pick "you" for recommendations) ─
  const { data: allCandidates = [] } = useSWR(
    'candidate-list',
    talentApi.candidates.list
  );

  // ── FETCH SEARCH RESULTS FROM DATABASE ──────────────────────
  // Only runs when user submits a search query
  // Calls GET /api/jobs/search with keyword + filter params
  // Backend uses pg_trgm fuzzy search + pgvector semantic search
  const { data: searchResults, isLoading: loadingSearch } = useSWR(
    searchParams ? ['cand-job-search', searchParams] : null,
    () => talentApi.jobs.search(searchParams!)
  );

  // ── FETCH TOP-10 RECOMMENDED JOBS ───────────────────────────
  // Only runs when a candidate profile is selected
  // Calls GET /api/jobs/search?candidateId=X&limit=10
  // Backend ranks jobs using the candidate's embedding vector
  const { data: recommendedJobs = [], isLoading: loadingRecs } = useSWR(
    selectedCandidateId ? ['cand-recommendations', selectedCandidateId] : null,
    () => talentApi.jobs.search({ candidateId: selectedCandidateId, limit: 10, rerank: true })
  );

  // ── DECIDE WHICH JOBS TO DISPLAY ────────────────────────────
  const displayJobs: JobDto[] =
    activeTab === 'recommended' ? recommendedJobs :
    searchParams ? (searchResults ?? []) : allJobs;

  const isLoading =
    activeTab === 'recommended' ? loadingRecs :
    searchParams ? loadingSearch : loadingAll;

  const handleSearch = (params: JobSearchQueryDto) => {
    setSearchParams(params);
    setSelectedJob(null);
    setActiveTab('all');
  };

  const handleClear = () => {
    setSearchParams(null);
    setSelectedJob(null);
  };

  const toggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const sectionLabel =
    activeTab === 'recommended' ? 'Top 10 recommended for you' :
    searchParams ? 'Search results' : 'All jobs';

  return (
    <div className="min-h-screen" style={{ background: '#f3f6fb' }}>

      {/* NAVBAR */}
      <Navbar
        candidates={allCandidates}
        selectedCandidateId={selectedCandidateId}
        onCandidateChange={setSelectedCandidateId}
      />

      {/* HERO SEARCH */}
      <HeroSearch onSearch={handleSearch} onClear={handleClear} />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* TABS */}
        <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
          <TabButton active={activeTab === 'all'} onClick={() => { setActiveTab('all'); setSelectedJob(null); }} label="All jobs" count={allJobs.length} />
          <TabButton active={activeTab === 'recommended'} onClick={() => { setActiveTab('recommended'); setSelectedJob(null); }} label="Recommended for you" count={recommendedJobs.length} disabled={!selectedCandidateId} hint={!selectedCandidateId ? 'Select your profile in the top bar' : undefined} />
        </div>

        <div className="flex gap-5 items-start">

          {/* FILTER SIDEBAR */}
          <FilterSidebar onFilter={handleSearch} />

          {/* JOB LIST */}
          <section className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : <><span className="font-semibold text-gray-800">{displayJobs.length}</span>{' '}{sectionLabel}</>}
              </p>
              {searchParams && <button onClick={handleClear} className="text-xs text-blue-600 hover:underline">✕ Clear search</button>}
            </div>

            {isLoading && (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white rounded-xl p-5 animate-pulse border border-gray-100">
                    <div className="h-3 bg-gray-100 rounded w-1/4 mb-3"/>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"/>
                    <div className="h-3 bg-gray-100 rounded w-1/3 mb-3"/>
                    <div className="flex gap-2"><div className="h-5 bg-gray-100 rounded-full w-16"/><div className="h-5 bg-gray-100 rounded-full w-20"/></div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && displayJobs.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {activeTab === 'recommended' ? 'No recommendations yet' : 'No jobs found'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'recommended' ? 'Select your profile in the top bar to get personalised job matches' : 'Try different keywords or remove some filters'}
                </p>
                {searchParams && <button onClick={handleClear} className="mt-4 text-blue-600 text-sm hover:underline">Show all jobs</button>}
              </div>
            )}

            {!isLoading && displayJobs.length > 0 && (
              <div className="space-y-3">
                {displayJobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    rank={activeTab === 'recommended' ? index + 1 : undefined}
                    isSelected={selectedJob?.id === job.id}
                    isSaved={savedJobIds.has(job.id)}
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                    onSave={() => toggleSave(job.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* JOB DETAIL DRAWER */}
          {selectedJob && (
            <JobDetailDrawer
              job={selectedJob}
              isSaved={savedJobIds.has(selectedJob.id)}
              onSave={() => toggleSave(selectedJob.id)}
              onClose={() => setSelectedJob(null)}
            />
          )}

        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, label, count, disabled, hint }: {
  active: boolean; onClick: () => void; label: string;
  count: number; disabled?: boolean; hint?: string;
}) {
  return (
    <button onClick={disabled ? undefined : onClick} title={hint}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 ${
        active ? 'border-blue-600 text-blue-600' :
        disabled ? 'border-transparent text-gray-300 cursor-not-allowed' :
        'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
      }`}>
      {label}
      {count > 0 && (
        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

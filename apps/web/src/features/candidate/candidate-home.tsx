'use client';

// ═══════════════════════════════════════════════════════════════
// candidate-home.tsx  —  ROOT PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../talent/api';
import { CandidateNavbar } from '../candidate-shared/candidate-navbar';
import { HeroSearch }       from './components/hero-search';
import { FilterSidebar }    from './components/filter-sidebar';
import { JobCard }          from './components/job-card';
import { JobDetailDrawer }  from './components/job-detail-drawer';
import type { JobDto, JobSearchQueryDto } from '@talent-matching/dtos';

export function CandidateHome() {

  const [searchParams, setSearchParams] = useState<JobSearchQueryDto | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  // ── DELETE PROFILE STATE ─────────────────────────────────────
  // Controls the delete confirmation modal visibility
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const { data: allJobs = [], isLoading: loadingAll } = useSWR(
    'candidate-all-jobs',
    talentApi.jobs.list
  );

  const { data: allCandidates = [], mutate: mutateCandidates } = useSWR(
    'candidate-list',
    talentApi.candidates.list
  );

  const { data: searchResults, isLoading: loadingSearch } = useSWR(
    searchParams ? ['cand-job-search', searchParams] : null,
    () => talentApi.jobs.search(searchParams!)
  );

  const { data: recommendedJobs = [], isLoading: loadingRecs } = useSWR(
    selectedCandidateId ? ['cand-recommendations', selectedCandidateId] : null,
    () => talentApi.jobs.search({ candidateId: selectedCandidateId, limit: 10, rerank: true })
  );

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

  // ── DELETE CANDIDATE PROFILE ─────────────────────────────────
  // Calls DELETE /api/candidates/:id on the backend
  // Removes the candidate profile from the database
  // Note: the auth user (email/password) remains in the user table
  const handleDeleteProfile = async () => {
    if (!selectedCandidateId) return;
    setDeleting(true);
    setDeleteError('');

    try {
      // Call DELETE /api/candidates/:id
      await talentApi.candidates.remove(selectedCandidateId);

      // Clear the selected candidate and refresh the list
      setSelectedCandidateId('');
      setShowDeleteModal(false);
      await mutateCandidates(); // refresh candidate list from DB

    } catch (err: any) {
      setDeleteError(err?.message ?? 'Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const sectionLabel =
    activeTab === 'recommended' ? 'Top 10 recommended for you' :
    searchParams ? 'Search results' : 'All jobs';

  // Find the selected candidate's name for the delete modal
  const selectedCandidate = allCandidates.find((c) => c.id === selectedCandidateId);

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>

      {/* NAVBAR */}
      <CandidateNavbar
        candidates={allCandidates}
        selectedCandidateId={selectedCandidateId}
        onCandidateChange={setSelectedCandidateId}
        activePage="home"
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

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* DELETE CONFIRMATION MODAL                              */}
      {/* Shown when user clicks "Delete profile" in navbar      */}
      {/* Calls DELETE /api/candidates/:id on confirm            */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showDeleteModal && (
        // Dark overlay background
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          {/* Modal card */}
          <div style={{
            background: '#fff', borderRadius: 20,
            padding: '32px', maxWidth: 420, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            {/* Warning icon */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#fef2f2', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 8px' }}>
              Delete candidate profile?
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', margin: '0 0 6px' }}>
              This will permanently delete:
            </p>
            <p style={{
              fontSize: 15, fontWeight: 600, color: '#dc2626',
              textAlign: 'center', margin: '0 0 16px',
            }}>
              {selectedCandidate?.fullName ?? 'this profile'}
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', margin: '0 0 24px' }}>
              This removes the candidate profile from the database. Your login account (email + password) will still exist.
            </p>

            {/* Error message */}
            {deleteError && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: 13, textAlign: 'center',
              }}>
                {deleteError}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Cancel */}
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteError(''); }}
                disabled={deleting}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 10,
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  fontSize: 14, fontWeight: 600, color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              {/* Confirm delete */}
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 10,
                  border: 'none',
                  background: deleting ? '#fca5a5' : '#dc2626',
                  fontSize: 14, fontWeight: 600, color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, delete profile'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        active ? 'border-indigo-500 text-indigo-600' :
        disabled ? 'border-transparent text-gray-300 cursor-not-allowed' :
        'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
      }`}>
      {label}
      {count > 0 && (
        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

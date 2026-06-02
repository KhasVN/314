'use client';

import { HeroSearch } from '../components/hero-search';
import { JobCard } from '../components/job-card';
import { JobDetailDrawer } from '../components/job-detail-drawer';
import { useCandidateHome } from '../hooks/use-candidate-home';
import { useScrollReveal } from '@/lib/use-scroll-reveal';

export function CandidateHome() {
  const h = useCandidateHome();

  const scrollResetKey = `${h.activeTab}-${h.searchParams ? JSON.stringify(h.searchParams) : ''}`;
  const { visibleItems: visibleJobs, sentinelRef, hasMore } = useScrollReveal(h.displayJobs, {
    pageSize: 20,
    resetKey: scrollResetKey,
  });

  return (
    <div className="min-h-screen bg-white">
      <HeroSearch onSearch={h.handleSearch} onClear={h.handleClear} onFilter={h.handleSearch} />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="flex min-[760px]:flex-row flex-col gap-5 min-[760px]:items-start">
          <section className="min-w-0 w-full flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div role="tablist" className="squircle-card grid w-full grid-cols-2 overflow-hidden border-[#d4d2d0] bg-white p-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={h.activeTab === 'all'}
                  className={`squircle-button w-full px-4 py-2 text-center text-sm font-semibold transition-colors ${
                    h.activeTab === 'all'
                      ? 'bg-[#f3f2f1] text-[#2d2d2d]'
                      : 'text-[#595959] hover:bg-[#eef4ff] hover:text-[#2d2d2d]'
                  }`}
                  onClick={() => {
                    h.setActiveTab('all');
                    h.setSelectedJob(null);
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={h.activeTab === 'recommended'}
                  title={!h.profile ? 'Sign in and complete your profile for recommendations' : undefined}
                  className={`squircle-button w-full px-4 py-2 text-center text-sm font-semibold transition-colors ${
                    h.activeTab === 'recommended'
                      ? 'bg-[#f3f2f1] text-[#2d2d2d]'
                      : 'text-[#595959] hover:bg-[#eef4ff] hover:text-[#2d2d2d]'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                  disabled={!h.profile}
                  onClick={() => {
                    if (!h.profile) return;
                    h.setActiveTab('recommended');
                    h.setSelectedJob(null);
                  }}
                >
                  For you
                </button>
              </div>

              {h.searchParams && h.activeTab === 'all' && (
                <button
                  type="button"
                  className="squircle-button px-3 py-1 text-sm font-semibold text-[#2557a7] hover:bg-[#eef4ff] hover:underline"
                  onClick={h.handleClear}
                >
                  Clear search
                </button>
              )}
            </div>

            {h.isLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton h-28 w-full rounded-box" />
                ))}
              </div>
            )}

            {!h.isLoading && h.displayJobs.length === 0 && (
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-base">
                    {h.activeTab === 'recommended'
                      ? 'No recommendations yet'
                      : h.searchParams
                        ? 'No jobs match'
                        : 'No jobs yet'}
                  </h3>
                  <p className="text-sm opacity-70">
                    {h.activeTab === 'recommended'
                      ? 'Complete your candidate profile after signing in.'
                      : h.searchParams
                        ? 'Try different keywords or adjust filters.'
                        : 'Check back later for new openings.'}
                  </p>
                  {h.searchParams && h.activeTab === 'all' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={h.handleClear}>
                      Show all jobs
                    </button>
                  )}
                </div>
              </div>
            )}

            {!h.isLoading && h.displayJobs.length > 0 && (
              <div className="space-y-3">
                {visibleJobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    rank={h.activeTab === 'recommended' ? index + 1 : undefined}
                    isSelected={h.selectedJob?.id === job.id}
                    onClick={() => h.setSelectedJob(h.selectedJob?.id === job.id ? null : job)}
                    onApply={() => h.applyForJob(job)}
                  />
                ))}
                {hasMore && <div ref={sentinelRef} className="h-2 w-full shrink-0" aria-hidden />}
              </div>
            )}
          </section>

          <JobDetailDrawer
            job={h.selectedJob ?? h.displayJobs[0] ?? null}
            onApply={h.applyForJob}
            onSave={h.saveJob}
            isSaved={h.selectedJob ? h.savedJobIds.has(h.selectedJob.id) : false}
            onClose={() => h.setSelectedJob(null)}
          />
        </div>
      </main>
      {h.applicationNotice && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#2d2d2d] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {h.applicationNotice}
        </div>
      )}
    </div>
  );
}

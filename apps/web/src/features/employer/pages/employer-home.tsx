'use client';

import {
  LinkedoutButton,
  LinkedoutCard,
  LinkedoutField,
  LinkedoutInput,
} from '@features/candidate/components/linkedout-ui';
import { EmployerCandidateCard } from '../components/employer-candidate-card';
import { EmployerCandidateDrawer } from '../components/employer-candidate-drawer';
import { EmployerDeleteJobDialog } from '../components/employer-delete-job-dialog';
import { useEmployerHome } from '../hooks/use-employer-home';
import { useScrollReveal } from '@/lib/use-scroll-reveal';

export function EmployerHome() {
  const h = useEmployerHome();

  const candidateScrollKey = `${h.activeTab}-${h.keyword}-${h.education}-${h.workMode}-${h.minExp}-${JSON.stringify(h.searchParams)}`;
  const { visibleItems: visibleCandidates, sentinelRef: candidateSentinelRef, hasMore: moreCandidates } =
    useScrollReveal(h.displayCandidates, {
      pageSize: 20,
      resetKey: candidateScrollKey,
    });

  if (!h.session?.user) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-lg px-4 py-16 lg:px-6">
          <LinkedoutCard className="p-10 text-center">
            <p className="text-4xl" aria-hidden>
              🏢
            </p>
            <h1 className="mt-4 text-xl font-bold text-[#2d2d2d]">Employer dashboard</h1>
            <p className="mt-2 text-sm text-[#595959]">
              Sign in to search candidates, manage postings, and see recommendations.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkedoutButton href="/employer/login">Sign in</LinkedoutButton>
              <LinkedoutButton href="/employer/register" variant="secondary">
                Register company
              </LinkedoutButton>
            </div>
          </LinkedoutCard>
        </main>
      </div>
    );
  }

  if (h.employerLoading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[#595959]">
          Loading your company profile…
        </main>
      </div>
    );
  }

  if (!h.myEmployer) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-lg px-4 py-16 lg:px-6">
          <LinkedoutCard className="p-10 text-center">
            <h1 className="text-xl font-bold text-[#2d2d2d]">Create your company profile</h1>
            <p className="mt-2 text-sm text-[#595959]">
              Register your organisation to post jobs and search candidates on Linkedout.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkedoutButton href="/employer/register">Register company</LinkedoutButton>
              <LinkedoutButton href="/candidate" variant="secondary">
                Browse jobs
              </LinkedoutButton>
            </div>
          </LinkedoutCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      <section className="border-b border-[#e4e2e0] bg-white px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-3xl font-bold tracking-[-0.03em] text-[#2d2d2d]">Find candidates</h1>
          <p className="mb-6 text-sm text-[#595959]">
            Managing <span className="font-semibold text-[#2d2d2d]">{h.myEmployer.companyName}</span>
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-0 flex-1 lg:max-w-xl">
              <LinkedoutField label="Search">
                <LinkedoutInput
                  value={h.keyword}
                  onChange={(e) => h.setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && h.handleSearch()}
                  placeholder="Skills, major, or keywords"
                />
              </LinkedoutField>
            </div>
            <select
              className="select select-bordered w-full lg:w-44"
              value={h.education}
              onChange={(e) => h.setEducation(e.target.value as typeof h.education)}
              aria-label="Education"
            >
              <option value="">Education</option>
              <option value="high_school">High school</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
              <option value="phd">PhD</option>
            </select>
            <select
              className="select select-bordered w-full lg:w-40"
              value={h.workMode}
              onChange={(e) => h.setWorkMode(e.target.value as typeof h.workMode)}
              aria-label="Work mode"
            >
              <option value="">Work mode</option>
              <option value="remote">Remote</option>
              <option value="on_site">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
              className="select select-bordered w-full lg:w-36"
              value={h.minExp}
              onChange={(e) => h.setMinExp(e.target.value)}
              aria-label="Minimum years of experience"
            >
              <option value="">Min experience</option>
              <option value="0">0 years</option>
              <option value="1">1 year</option>
              <option value="2">2 years</option>
              <option value="5">5 years</option>
            </select>
            <div className="flex flex-wrap gap-2">
              <LinkedoutButton type="button" className="min-h-12 px-6" onClick={h.handleSearch}>
                Search
              </LinkedoutButton>
              {h.searchParams && (
                <LinkedoutButton type="button" variant="secondary" className="min-h-12 px-6" onClick={h.handleClear}>
                  Clear
                </LinkedoutButton>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:px-8">
        <aside className="w-full shrink-0 lg:w-64">
          <LinkedoutCard className="p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#2d2d2d]">Your postings</h2>
              <span className="rounded-full bg-[#f3f2f1] px-2 py-0.5 text-xs font-semibold text-[#595959]">
                {h.myJobs.length}
              </span>
            </div>
            {h.myJobs.length === 0 ? (
              <p className="text-sm text-[#595959]">No jobs yet.</p>
            ) : (
              <ul className="mb-4 flex flex-col gap-3 border-t border-[#e4e2e0] pt-3">
                {h.myJobs.slice(0, 8).map((job) => (
                  <li key={job.id} className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-[#2d2d2d]">{job.title}</span>
                    <button
                      type="button"
                      className="self-start text-xs font-semibold text-[#c9262d] hover:underline"
                      onClick={() => {
                        h.setDeletingJobId(job.id);
                        h.setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <LinkedoutButton href="/employer/job-posting" variant="secondary" className="w-full min-h-10 text-sm">
              New posting
            </LinkedoutButton>
          </LinkedoutCard>
        </aside>

        <section className="min-w-0 flex-1">
          <div
            role="tablist"
            className="squircle-card mb-4 grid w-full max-w-md grid-cols-2 overflow-hidden border-[#d4d2d0] bg-white p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={h.activeTab === 'all'}
              className={`squircle-button px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                h.activeTab === 'all' ? 'bg-[#2557a7] text-white' : 'text-[#2d2d2d] hover:bg-[#f3f2f1]'
              }`}
              onClick={() => {
                h.setActiveTab('all');
                h.setSelectedCandidate(null);
              }}
            >
              All
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">{h.allCandidates.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={h.activeTab === 'recommended'}
              className={`squircle-button px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                h.activeTab === 'recommended' ? 'bg-[#2557a7] text-white' : 'text-[#2d2d2d] hover:bg-[#f3f2f1]'
              }`}
              onClick={() => {
                h.setActiveTab('recommended');
                h.setSelectedCandidate(null);
              }}
            >
              For you
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">{h.recommendedCandidates.length}</span>
            </button>
          </div>

          <p className="mb-3 text-sm text-[#595959]">
            {h.isLoading ? (
              'Loading…'
            ) : (
              <>
                <span className="font-semibold text-[#2d2d2d]">{h.displayCandidates.length}</span> {h.sectionLabel}
              </>
            )}
          </p>

          {h.isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-[#f3f2f1]" />
              ))}
            </div>
          )}

          {!h.isLoading && h.displayCandidates.length === 0 && (
            <LinkedoutCard className="border border-[#d4d2d0] bg-[#f3f2f1]/50 p-6 text-sm text-[#595959]">
              {h.activeTab === 'recommended'
                ? 'Post at least one job to unlock recommendations tailored to your company.'
                : 'No candidates match these filters.'}
            </LinkedoutCard>
          )}

          {!h.isLoading && h.displayCandidates.length > 0 && (
            <div className="space-y-3">
              {visibleCandidates.map((candidate, index) => (
                <EmployerCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  rank={h.activeTab === 'recommended' ? index + 1 : undefined}
                  isSelected={h.selectedCandidate?.id === candidate.id}
                  onClick={() =>
                    h.setSelectedCandidate(h.selectedCandidate?.id === candidate.id ? null : candidate)
                  }
                />
              ))}
              {moreCandidates && <div ref={candidateSentinelRef} className="h-2 w-full shrink-0" aria-hidden />}
            </div>
          )}
        </section>

        {h.selectedCandidate && (
          <EmployerCandidateDrawer candidate={h.selectedCandidate} onClose={() => h.setSelectedCandidate(null)} />
        )}
      </main>

      <EmployerDeleteJobDialog
        open={h.showDeleteModal}
        deleteError={h.deleteError}
        onDismissOverlay={h.closeDeleteModal}
        onCancel={h.closeDeleteModal}
        onConfirmDelete={h.handleDeleteJob}
      />
    </div>
  );
}

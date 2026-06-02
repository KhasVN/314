'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { candidateApi } from '@features/candidate/api';
import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';
import { authClient } from '@lib/auth-client';
import type { JobDto, ApplicationDto } from '@talent-matching/dtos';

type Tab = 'applied' | 'interviews' | 'archived' | 'saved';

export function MyJobsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('applied');
  const [toast, setToast] = useState('');

  const { data: session } = authClient.useSession();
  const {
    data: profile,
    isLoading: profileLoading,
  } = useSWR(session?.user ? 'candidate-profile' : null, () =>
    candidateApi.candidates.meOptional(),
  );

  const candidateId = profile?.id;

  const {
    data: bundle,
    mutate: mutateApps,
    isLoading: appsLoading,
  } = useSWR(
    candidateId ? ['candidate-my-apps', candidateId] : null,
    async () => {
      const apps = await candidateApi.applications.list({ candidateId: candidateId! });
      const jobs: Record<string, JobDto> = {};
      await Promise.all(
        apps.map(async (a) => {
          const job = await candidateApi.jobs.get(a.jobId).catch(() => undefined);
          if (job) jobs[a.jobId] = job;
        }),
      );
      return { apps, jobs };
    },
  );

  const allApplications = bundle?.apps ?? [];
  const appJobs = bundle?.jobs ?? {};

  const appliedApps = allApplications.filter(
    (a) => a.status === 'submitted' || a.status === 'reviewed',
  );
  const interviewApps = allApplications.filter((a) => a.status === 'shortlisted');
  const archivedApps = allApplications.filter(
    (a) => a.status === 'accepted' || a.status === 'rejected',
  );

  const withdrawApp = async (app: ApplicationDto) => {
    await candidateApi.applications.remove(app.id);
    await mutateApps();
    showToast('Application withdrawn');
  };

  const moveToInterviews = async (app: ApplicationDto) => {
    await candidateApi.applications.update(app.id, { status: 'shortlisted' });
    await mutateApps();
    showToast('Moved to Interviews');
  };

  const moveToArchived = async (app: ApplicationDto) => {
    await candidateApi.applications.update(app.id, { status: 'accepted' });
    await mutateApps();
    showToast('Moved to Archived');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 4000);
  };

  // ── Saved jobs ───────────────────────────────────────────────────────────
  // Fetches all saved job records for the candidate, then loads full job details
  // for each one so we can show title, location, company etc. in the UI.
  const { data: savedData = [], mutate: mutateSaved } = useSWR(
    candidateId ? ['saved-jobs', candidateId] : null,
    async () => {
      // Catch errors gracefully — if the saved_jobs table doesn't exist yet
      // (migration not run), return empty array instead of crashing.
      const records = await candidateApi.savedJobs.list(candidateId!).catch(() => []);
      if (records.length === 0) return [];
      const jobs: Record<string, JobDto> = {};
      await Promise.all(
        records.map(async (r) => {
          const job = await candidateApi.jobs.get(r.jobId).catch(() => undefined);
          if (job) jobs[r.jobId] = job;
        }),
      );
      return records
        .map((r) => ({ record: r, job: jobs[r.jobId] }))
        .filter((item) => item.record != null);
    },
  );

  const unsaveJob = async (recordId: string, jobTitle: string) => {
    await candidateApi.savedJobs.remove(recordId);
    await mutateSaved();
    showToast(`Removed "${jobTitle}" from saved jobs`);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'applied',    label: 'Applied',    count: appliedApps.length },
    { key: 'interviews', label: 'Interviews', count: interviewApps.length },
    { key: 'archived',   label: 'Archived',   count: archivedApps.length },
    { key: 'saved',      label: 'Saved jobs', count: savedData.length },
  ];

  const signedOut = !session?.user;
  const needsProfile =
    session?.user && !profileLoading && !candidateId;

  return (
    <div className="min-h-screen bg-white font-sans">

      <main className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#2d2d2d]">My jobs</h1>
          <p className="mt-2 text-sm text-[#595959]">
            Track applications, interviews, and outcomes.
          </p>
        </div>

        {signedOut && (
          <LinkedoutCard className="p-10 text-center">
            <p className="text-4xl" aria-hidden>
              🔒
            </p>
            <h2 className="mt-4 text-lg font-semibold text-[#2d2d2d]">Sign in to see your jobs</h2>
            <p className="mt-2 text-sm text-[#595959]">
              Your applications are tied to your candidate profile.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <LinkedoutButton href="/candidate/login">Sign in</LinkedoutButton>
              <LinkedoutButton href="/candidate/register" variant="secondary">
                Register
              </LinkedoutButton>
            </div>
          </LinkedoutCard>
        )}

        {!signedOut && profileLoading && (
          <LinkedoutCard className="p-10 text-center text-sm text-[#595959]">
            Loading your profile…
          </LinkedoutCard>
        )}

        {!signedOut && needsProfile && (
          <LinkedoutCard className="p-10 text-center">
            <h2 className="text-lg font-semibold text-[#2d2d2d]">Complete your candidate profile</h2>
            <p className="mt-2 text-sm text-[#595959]">
              Register your profile so we can match applications to your account.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <LinkedoutButton href="/candidate/register">Finish registration</LinkedoutButton>
              <LinkedoutButton href="/candidate" variant="secondary">
                Browse jobs
              </LinkedoutButton>
            </div>
          </LinkedoutCard>
        )}

        {!signedOut && candidateId && (
          <>
            <div
              role="tablist"
              className="squircle-card mb-6 grid w-full grid-cols-4 overflow-hidden border-[#d4d2d0] bg-white p-1"
            >
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === t.key}
                  className={`squircle-button px-2 py-2.5 text-center text-sm font-semibold transition-colors sm:px-4 ${
                    activeTab === t.key
                      ? 'bg-[#2557a7] text-white'
                      : 'text-[#2d2d2d] hover:bg-[#f3f2f1]'
                  }`}
                  onClick={() => setActiveTab(t.key)}
                >
                  <span className="mr-1 font-bold tabular-nums">{t.count}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.label.slice(0, 4)}</span>
                </button>
              ))}
            </div>

            {appsLoading && (
              <LinkedoutCard className="p-10 text-center text-sm text-[#595959]">
                Loading applications…
              </LinkedoutCard>
            )}

            {!appsLoading && activeTab === 'applied' && (
              <div>
                {appliedApps.length === 0 ? (
                  <EmptyState
                    icon="📝"
                    title="No applications yet"
                    desc="Apply to jobs from the home search."
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {appliedApps.map((app) => {
                      const job = appJobs[app.jobId];
                      return (
                        <JobCard key={app.id} job={job} status={app.status}>
                          <LinkedoutButton type="button" variant="secondary" className="min-h-9 px-4 text-xs" onClick={() => moveToInterviews(app)}>
                            Move to interviews
                          </LinkedoutButton>
                          <LinkedoutButton type="button" variant="danger" className="min-h-9 px-4 text-xs" onClick={() => withdrawApp(app)}>
                            Withdraw
                          </LinkedoutButton>
                        </JobCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!appsLoading && activeTab === 'interviews' && (
              <div>
                {interviewApps.length === 0 ? (
                  <EmptyState
                    icon="🎤"
                    title="No interviews yet"
                    desc="When you hear back, move an application here or ask your recruiter to update status."
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {interviewApps.map((app) => {
                      const job = appJobs[app.jobId];
                      return (
                        <InterviewCard
                          key={app.id}
                          app={app}
                          job={job}
                          onArchive={() => moveToArchived(app)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!appsLoading && activeTab === 'saved' && (
              <div>
                {savedData.length === 0 ? (
                  <EmptyState
                    icon="🔖"
                    title="No saved jobs yet"
                    desc="Click Save on any job listing to bookmark it for later."
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {savedData.map(({ record, job }) => (
                      <LinkedoutCard key={record.id} className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 truncate text-xs text-[#767676]">{job?.companyInfo ?? 'Company'}</p>
                            <h3 className="text-base font-bold text-[#2d2d2d]">{job?.title ?? 'Job unavailable'}</h3>
                            {job?.location && <p className="mt-1 text-sm text-[#595959]">📍 {job.location}</p>}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {job?.workMode && <WorkModeBadge mode={job.workMode} />}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                            <LinkedoutButton
                              type="button"
                              variant="secondary"
                              className="min-h-9 px-4 text-xs"
                              onClick={() => unsaveJob(record.id, job?.title ?? 'job')}
                            >
                              Remove
                            </LinkedoutButton>
                          </div>
                        </div>
                      </LinkedoutCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!appsLoading && activeTab === 'archived' && (
              <div>
                {archivedApps.length === 0 ? (
                  <EmptyState
                    icon="📦"
                    title="Nothing archived yet"
                    desc="Accepted or closed applications appear here."
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {archivedApps.map((app) => {
                      const job = appJobs[app.jobId];
                      return (
                        <LinkedoutCard key={app.id} className="p-5">
                          <p className="mb-1 truncate text-xs text-[#767676]">
                            {job?.companyInfo ?? 'Company'}
                          </p>
                          <h3 className="text-base font-bold text-[#2d2d2d]">{job?.title ?? 'Job unavailable'}</h3>
                          {job?.location && (
                            <p className="mt-1 text-sm text-[#595959]">📍 {job.location}</p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge status={app.status} />
                          </div>
                        </LinkedoutCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[300] flex -translate-x-1/2 items-center gap-3 rounded-xl bg-[#2d2d2d] px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function InterviewCard({
  app,
  job,
  onArchive,
}: {
  app: ApplicationDto;
  job?: JobDto;
  onArchive: () => void;
}) {
  return (
    <LinkedoutCard className="border-[#d4d2d0] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-1 truncate text-xs text-[#767676]">{job?.companyInfo ?? 'Company'}</p>
          <h3 className="text-base font-bold text-[#2d2d2d]">{job?.title ?? 'Job unavailable'}</h3>
          {job?.location && <p className="mt-1 text-sm text-[#595959]">📍 {job.location}</p>}
          <div className="mt-3">
            <StatusBadge status={app.status} />
          </div>
        </div>
        <div className="flex shrink-0">
          <LinkedoutButton type="button" variant="secondary" className="min-h-9 px-4 text-xs" onClick={onArchive}>
            Archive
          </LinkedoutButton>
        </div>
      </div>
    </LinkedoutCard>
  );
}

function JobCard({
  job,
  status,
  children,
}: {
  job?: JobDto;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <LinkedoutCard className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-1 truncate text-xs text-[#767676]">{job?.companyInfo ?? 'Company'}</p>
          <h3 className="text-base font-bold text-[#2d2d2d]">{job?.title ?? 'Job unavailable'}</h3>
          {job?.location && <p className="mt-1 text-sm text-[#595959]">📍 {job.location}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {job?.workMode && <WorkModeBadge mode={job.workMode} />}
            {status && <StatusBadge status={status} />}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">{children}</div>
      </div>
    </LinkedoutCard>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    submitted: { bg: 'bg-[#eef4ff]', color: 'text-[#164081]', label: 'Submitted' },
    reviewed: { bg: 'bg-[#fff8e6]', color: 'text-[#7c5a00]', label: 'Under review' },
    shortlisted: { bg: 'bg-[#e8f5e9]', color: 'text-[#1b5e20]', label: 'Interview' },
    accepted: { bg: 'bg-[#e8f5e9]', color: 'text-[#1b5e20]', label: 'Accepted' },
    rejected: { bg: 'bg-[#fff5f5]', color: 'text-[#c9262d]', label: 'Not selected' },
  };
  const s = map[status] ?? { bg: 'bg-[#f3f2f1]', color: 'text-[#595959]', label: status };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.color}`}>
      {s.label}
    </span>
  );
}

function WorkModeBadge({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    remote: 'bg-[#e8f5e9] text-[#1b5e20]',
    on_site: 'bg-[#eef4ff] text-[#164081]',
    hybrid: 'bg-[#f3e5f5] text-[#6a1b9a]',
  };
  const cls = map[mode] ?? 'bg-[#f3f2f1] text-[#595959]';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {mode.replace('_', '-')}
    </span>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <LinkedoutCard className="p-10 text-center">
      <p className="text-4xl" aria-hidden>
        {icon}
      </p>
      <h2 className="mt-4 text-lg font-semibold text-[#2d2d2d]">{title}</h2>
      <p className="mt-2 text-sm text-[#595959]">{desc}</p>
      <div className="mt-6">
        <LinkedoutButton href="/candidate">Browse jobs</LinkedoutButton>
      </div>
    </LinkedoutCard>
  );
}

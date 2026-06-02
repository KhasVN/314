'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { authClient } from '@lib/auth-client';
import { employerApi } from '../api';
import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';
import { EmployerEditJobDialog } from '../components/employer-edit-job-dialog';
import { EmployerDeleteJobDialog } from '../components/employer-delete-job-dialog';
import type { ApplicationDto, ApplicationStatus, CandidateDto, JobDto } from '@talent-matching/dtos';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  submitted:   'bg-[#f3f2f1] text-[#595959]',
  reviewed:    'bg-[#eef4ff] text-[#2557a7]',
  shortlisted: 'bg-[#e6f9f0] text-[#16a34a]',
  rejected:    'bg-[#fff5f5] text-[#c9262d]',
  accepted:    'bg-[#d1fae5] text-[#065f46]',
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted:   'Submitted',
  reviewed:    'Reviewed',
  shortlisted: 'Shortlisted',
  rejected:    'Rejected',
  accepted:    'Accepted',
};

export function EmployerManagePostingsPage() {
  const { data: session } = authClient.useSession();
  const { data: employer } = useSWR(
    session?.user ? 'employer-profile' : null,
    () => employerApi.employers.meOptional(),
  );
  const { data: jobs = [], mutate: mutateJobs } = useSWR(
    employer?.id ? ['employer-my-jobs', employer.id] : null,
    () => employerApi.employers.jobs(employer!.id),
  );
  const { data: allCandidates = [] } = useSWR(
    employer?.id ? 'employer-all-candidates' : null,
    employerApi.candidates.list,
  );

  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<JobDto | null>(null);
  const [deletingJobId, setDeletingJobId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteJob = async () => {
    if (!deletingJobId) return;
    try {
      await employerApi.jobs.remove(deletingJobId);
      setShowDeleteModal(false);
      setDeletingJobId('');
      await mutateJobs();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete job.');
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteError('');
    setDeletingJobId('');
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[#595959]">
          Please sign in to manage your postings.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-[#e4e2e0] bg-white px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d]">Manage postings</h1>
              <p className="mt-1 text-sm text-[#595959]">
                {jobs.length} {jobs.length === 1 ? 'posting' : 'postings'}
              </p>
            </div>
            <LinkedoutButton href="/employer/job-posting" className="min-h-10 px-5 text-sm">
              + New posting
            </LinkedoutButton>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
        {jobs.length === 0 ? (
          <LinkedoutCard className="p-10 text-center">
            <p className="text-sm text-[#595959]">You have no job postings yet.</p>
            <LinkedoutButton href="/employer/job-posting" className="mt-5">
              Create your first posting
            </LinkedoutButton>
          </LinkedoutCard>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                allCandidates={allCandidates}
                expanded={expandedJobId === job.id}
                onToggleExpand={() =>
                  setExpandedJobId(expandedJobId === job.id ? null : job.id)
                }
                onEdit={() => setEditingJob(job)}
                onDelete={() => { setDeletingJobId(job.id); setShowDeleteModal(true); }}
              />
            ))}
          </div>
        )}
      </main>

      <EmployerEditJobDialog
        open={editingJob !== null}
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onSaved={async () => { await mutateJobs(); }}
      />

      <EmployerDeleteJobDialog
        open={showDeleteModal}
        deleteError={deleteError}
        onDismissOverlay={closeDeleteModal}
        onCancel={closeDeleteModal}
        onConfirmDelete={handleDeleteJob}
      />
    </div>
  );
}

function JobCard({
  job,
  allCandidates,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  job: JobDto;
  allCandidates: CandidateDto[];
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: applications = [], mutate: mutateApplications, isLoading } = useSWR(
    ['job-applications', job.id],
    () => employerApi.applications.listByJob(job.id),
  );

  const candidateMap = Object.fromEntries(allCandidates.map((c) => [c.id, c]));

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    await employerApi.applications.updateStatus(appId, status);
    await mutateApplications();
  };

  return (
    <LinkedoutCard className="overflow-hidden p-0">
      {/* Job header */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-[#2d2d2d]">{job.title}</h2>
            <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-xs font-semibold text-[#2557a7]">
              {applications.length} {applications.length === 1 ? 'applicant' : 'applicants'}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#595959]">
            {(job as any).workMode && (
              <span className="capitalize">{(job as any).workMode.replace('_', '-')}</span>
            )}
            {(job as any).location && <span>{(job as any).location}</span>}
            {(job as any).salaryMin && (job as any).salaryMax && (
              <span>
                ${Number((job as any).salaryMin).toLocaleString()} – ${Number((job as any).salaryMax).toLocaleString()}
              </span>
            )}
          </div>
          {(job as any).requiredSkills && (
            <div className="mt-2 flex flex-wrap gap-1">
              {(job as any).requiredSkills.split(',').slice(0, 5).map((s: string) => (
                <span
                  key={s}
                  className="rounded-full border border-[#d4d2d0] bg-[#f3f2f1] px-2 py-0.5 text-xs text-[#595959]"
                >
                  {s.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {applications.length > 0 && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="min-h-9 rounded-lg border border-[#d4d2d0] px-4 text-sm font-semibold text-[#2d2d2d] hover:bg-[#f3f2f1]"
            >
              {expanded ? 'Hide applicants' : 'View applicants'}
            </button>
          )}
          <LinkedoutButton
            type="button"
            variant="secondary"
            className="min-h-9 px-4 text-sm"
            onClick={onEdit}
          >
            Edit
          </LinkedoutButton>
          <LinkedoutButton
            type="button"
            variant="secondary"
            className="min-h-9 px-4 text-sm text-[#c9262d] hover:border-[#c9262d] hover:bg-[#fff5f5]"
            onClick={onDelete}
          >
            Delete
          </LinkedoutButton>
        </div>
      </div>

      {/* Applicants panel */}
      {expanded && (
        <div className="border-t border-[#e4e2e0] bg-[#f8fafc] px-5 py-4">
          <h3 className="mb-3 text-sm font-bold text-[#2d2d2d]">
            Applicants ({applications.length})
          </h3>
          {isLoading ? (
            <p className="text-sm text-[#595959]">Loading…</p>
          ) : (
            <div className="flex flex-col gap-2">
              {applications.map((app) => {
                const candidate = candidateMap[app.candidateId];
                return (
                  <div
                    key={app.id}
                    className="flex flex-col gap-2 rounded-xl border border-[#e4e2e0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#2d2d2d]">
                        {candidate?.fullName ?? 'Unknown candidate'}
                      </p>
                      {candidate?.contactInfo && (
                        <p className="text-xs text-[#595959]">{candidate.contactInfo}</p>
                      )}
                      {candidate?.skills && (
                        <p className="mt-1 text-xs text-[#767676]">
                          {candidate.skills.split(',').slice(0, 4).join(', ')}
                        </p>
                      )}
                      {app.coverLetter && (
                        <p className="mt-1 line-clamp-2 text-xs text-[#595959]">
                          &ldquo;{app.coverLetter}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[app.status]}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                      <select
                        className="rounded-lg border border-[#d4d2d0] bg-white px-2 py-1 text-xs font-semibold text-[#2d2d2d] focus:outline-none"
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        aria-label="Update status"
                      >
                        {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </LinkedoutCard>
  );
}

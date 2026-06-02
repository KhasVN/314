import type {
  ApplicationDto,
  CandidateDto,
  CreateApplicationDto,
  EmployerDto,
  JobDto,
  JobSearchQueryDto,
  UpdateApplicationDto,
  UpdateCandidateDto,
} from '@talent-matching/dtos';
import { deleteJson, getJson, getJsonAllowMissing, patchJson, postJson } from '@lib/api-client';

export const candidateApi = {
  candidates: {
    meOptional: () => getJsonAllowMissing<CandidateDto>('/candidates/me'),
    update: (id: string, data: UpdateCandidateDto) =>
      patchJson<CandidateDto>(`/candidates/${id}`, data),
  },
  jobs: {
    list: () => getJson<JobDto[]>('/jobs'),
    get: (id: string) => getJson<JobDto>(`/jobs/${id}`),
    search: (params: JobSearchQueryDto) => getJson<JobDto[]>('/jobs/search', params),
  },
  applications: {
    list: (params?: { candidateId?: string; jobId?: string }) =>
      getJson<ApplicationDto[]>('/applications', params),
    create: (data: CreateApplicationDto) => postJson<ApplicationDto>('/applications', data),
    update: (id: string, data: UpdateApplicationDto) =>
      patchJson<ApplicationDto>(`/applications/${id}`, data),
    remove: (id: string) => deleteJson<ApplicationDto>(`/applications/${id}`),
  },
  // ── savedJobs ─────────────────────────────────────────────────────────────
  // Endpoints for the saved_jobs table: bookmark a job for later.
  // Saved jobs appear in My Jobs → Saved jobs tab.
  savedJobs: {
    list: (candidateId: string) =>
      getJson<{ id: string; candidateId: string; jobId: string }[]>('/saved-jobs', {
        candidateId,
      }),
    save: (candidateId: string, jobId: string) =>
      postJson<{ id: string; candidateId: string; jobId: string }>('/saved-jobs', {
        candidateId,
        jobId,
      }),
    remove: (id: string) =>
      deleteJson<{ id: string }>(`/saved-jobs/${id}`),
  },
  employers: {
    list: () => getJson<EmployerDto[]>('/employers'),
    search: (search: string) => getJson<EmployerDto[]>('/employers', { search }),
    jobs: (employerId: string) => getJson<JobDto[]>(`/employers/${employerId}/jobs`),
  },
};

import type {
  ApplicationDto,
  ApplicationStatus,
  CandidateDto,
  CandidateSearchQueryDto,
  CreateJobDto,
  EmployerDto,
  JobDto,
  UpdateEmployerDto,
} from '@talent-matching/dtos';
import { deleteJson, getJson, getJsonAllowMissing, patchJson, postJson } from '@lib/api-client';

export const employerApi = {
  employers: {
    meOptional: () => getJsonAllowMissing<EmployerDto>('/employers/me'),
    update: (id: string, data: UpdateEmployerDto) =>
      patchJson<EmployerDto>(`/employers/${id}`, data),
    jobs: (employerId: string) => getJson<JobDto[]>(`/employers/${employerId}/jobs`),
  },
  candidates: {
    list: () => getJson<CandidateDto[]>('/candidates'),
    search: (params: CandidateSearchQueryDto) =>
      getJson<CandidateDto[]>('/candidates/search', params),
  },
  jobs: {
    create: (data: CreateJobDto) => postJson<JobDto>('/jobs', data),
    update: (id: string, data: Record<string, any>) => patchJson<JobDto>(`/jobs/${id}`, data),
    remove: (id: string) => deleteJson<JobDto>(`/jobs/${id}`),
  },
  applications: {
    listByJob: (jobId: string) => getJson<ApplicationDto[]>('/applications', { jobId }),
    updateStatus: (id: string, status: ApplicationStatus) =>
      patchJson<ApplicationDto>(`/applications/${id}`, { status }),
  },
};
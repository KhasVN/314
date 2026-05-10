import type {
  ApplicationDto,
  CandidateDto,
  CandidateSearchQueryDto,
  CreateApplicationDto,
  CreateCandidateDto,
  CreateEmployerDto,
  CreateJobDto,
  EmployerDto,
  JobDto,
  JobSearchQueryDto,
  UpdateApplicationDto,
  UpdateCandidateDto,
  UpdateEmployerDto,
  UpdateJobDto,
} from '@talent-matching/dtos';
import { deleteJson, getJson, getJsonAllowMissing, patchJson, postJson } from '@lib/api-client';

export const talentApi = {
  employers: {
    list: () => getJson<EmployerDto[]>('/employers'),
    search: (search: string) => getJson<EmployerDto[]>('/employers', { search }),
    me: () => getJson<EmployerDto>('/employers/me'),
    meOptional: () => getJsonAllowMissing<EmployerDto>('/employers/me'),
    create: (data: CreateEmployerDto) => postJson<EmployerDto>('/employers', data),
    update: (id: string, data: UpdateEmployerDto) =>
      patchJson<EmployerDto>(`/employers/${id}`, data),
    remove: (id: string) => deleteJson<EmployerDto>(`/employers/${id}`),
    jobs: (employerId: string) => getJson<JobDto[]>(`/employers/${employerId}/jobs`),
  },
  candidates: {
    list: () => getJson<CandidateDto[]>('/candidates'),
    me: () => getJson<CandidateDto>('/candidates/me'),
    meOptional: () => getJsonAllowMissing<CandidateDto>('/candidates/me'),
    create: (data: CreateCandidateDto) => postJson<CandidateDto>('/candidates', data),
    update: (id: string, data: UpdateCandidateDto) =>
      patchJson<CandidateDto>(`/candidates/${id}`, data),
    remove: (id: string) => deleteJson<CandidateDto>(`/candidates/${id}`),
    search: (params: CandidateSearchQueryDto) =>
      getJson<CandidateDto[]>('/candidates/search', params),
  },
  jobs: {
    list: () => getJson<JobDto[]>('/jobs'),
    get: (id: string) => getJson<JobDto>(`/jobs/${id}`),
    create: (data: CreateJobDto) => postJson<JobDto>('/jobs', data),
    update: (id: string, data: UpdateJobDto) => patchJson<JobDto>(`/jobs/${id}`, data),
    remove: (id: string) => deleteJson<JobDto>(`/jobs/${id}`),
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
};

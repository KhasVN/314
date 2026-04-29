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
import { deleteJson, getJson, patchJson, postJson } from '../../lib/api-client';

export const talentApi = {
  employers: {
    list: () => getJson<EmployerDto[]>('/employers'),
    create: (data: CreateEmployerDto) => postJson<EmployerDto>('/employers', data),
    update: (id: string, data: UpdateEmployerDto) =>
      patchJson<EmployerDto>(`/employers/${id}`, data),
    remove: (id: string) => deleteJson<EmployerDto>(`/employers/${id}`),
  },
  candidates: {
    list: () => getJson<CandidateDto[]>('/candidates'),
    create: (data: CreateCandidateDto) =>
      postJson<CandidateDto>('/candidates', data),
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
    list: () => getJson<ApplicationDto[]>('/applications'),
    create: (data: CreateApplicationDto) =>
      postJson<ApplicationDto>('/applications', data),
    update: (id: string, data: UpdateApplicationDto) =>
      patchJson<ApplicationDto>(`/applications/${id}`, data),
    remove: (id: string) => deleteJson<ApplicationDto>(`/applications/${id}`),
  },
};

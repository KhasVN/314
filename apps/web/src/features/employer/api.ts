import type {
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
    remove: (id: string) => deleteJson<JobDto>(`/jobs/${id}`),
  },
};

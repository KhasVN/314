import type { CandidateDto, CreateCandidateDto, CreateEmployerDto, EmployerDto } from '@talent-matching/dtos';
import { postJson } from '@lib/api-client';

export const authenticationApi = {
  candidates: {
    create: (data: CreateCandidateDto) => postJson<CandidateDto>('/candidates', data),
  },
  employers: {
    create: (data: CreateEmployerDto) => postJson<EmployerDto>('/employers', data),
  },
};

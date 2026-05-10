import type { CandidateDto } from '@talent-matching/dtos';
import { deleteJson, getJsonAllowMissing } from '@lib/api-client';

export const settingsApi = {
  candidates: {
    meOptional: () => getJsonAllowMissing<CandidateDto>('/candidates/me'),
    remove: (id: string) => deleteJson<CandidateDto>(`/candidates/${id}`),
  },
};

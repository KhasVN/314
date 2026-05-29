import type { CandidateDto } from '@talent-matching/dtos';
import { deleteJson, getJsonAllowMissing, patchJson } from '@lib/api-client';

export const settingsApi = {
  candidates: {
    meOptional: () => getJsonAllowMissing<CandidateDto>('/candidates/me'),
    joinMembership: (id: string) =>
      patchJson<CandidateDto>(`/candidates/${id}`, { isMember: true }),
    remove: (id: string) => deleteJson<CandidateDto>(`/candidates/${id}`),
  },
};

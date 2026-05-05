import { createCandidateSchema } from '@talent-matching/dtos';

export const updateCandidateSchema = createCandidateSchema.partial();

export type { UpdateCandidateDto } from '@talent-matching/dtos';

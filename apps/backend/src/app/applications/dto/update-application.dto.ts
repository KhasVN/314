import { createApplicationSchema } from '@talent-matching/dtos';

export const updateApplicationSchema = createApplicationSchema.partial();

export type { UpdateApplicationDto } from '@talent-matching/dtos';

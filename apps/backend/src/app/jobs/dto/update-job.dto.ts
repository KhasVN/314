import { createJobSchema } from '@talent-matching/dtos';

export const updateJobSchema = createJobSchema.partial();

export type { UpdateJobDto } from '@talent-matching/dtos';

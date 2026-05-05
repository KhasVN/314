import { createEmployerSchema } from '@talent-matching/dtos';

export const updateEmployerSchema = createEmployerSchema.partial();

export type { UpdateEmployerDto } from '@talent-matching/dtos';

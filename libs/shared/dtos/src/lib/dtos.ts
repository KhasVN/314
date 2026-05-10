import { z } from 'zod';

export const educationLevels = [
  'high_school',
  'diploma',
  'bachelor',
  'master',
  'phd',
  'other',
] as const;

export const workModes = ['remote', 'on_site', 'hybrid'] as const;
export const jobStatuses = ['draft', 'published', 'closed'] as const;
export const applicationStatuses = [
  'submitted',
  'reviewed',
  'shortlisted',
  'rejected',
  'accepted',
] as const;

const optionalBooleanQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no'].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean().optional());

const optionalNonNegativeIntQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return value;
}, z.coerce.number().int().nonnegative().optional());

const optionalPositiveIntQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return value;
}, z.coerce.number().int().positive().optional());

export const educationLevelSchema = z.enum(educationLevels);
export const workModeSchema = z.enum(workModes);
export const jobStatusSchema = z.enum(jobStatuses);
export const applicationStatusSchema = z.enum(applicationStatuses);

export const createEmployerSchema = z.object({
  userId: z.string().min(1),
  companyName: z.string().min(1),
  companyInfo: z.string().optional(),
  contactInfo: z.string().optional(),
  isMember: z.boolean().optional(),
});

export const employerSchema = createEmployerSchema.extend({
  id: z.string(),
});

export const createJobSchema = z.object({
  employerId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  companyInfo: z.string().optional(),
  requiredEducation: educationLevelSchema.optional().nullable(),
  requiredSkills: z.string().optional().nullable(),
  requiredYearsOfExperience: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .nullable(),
  workMode: workModeSchema.optional().nullable(),
  location: z.string().optional().nullable(),
  status: jobStatusSchema.optional(),
});

export const jobSchema = createJobSchema.extend({
  id: z.string(),
  status: jobStatusSchema,
  rrfScore: z.number().optional(),
  rerankScore: z.number().optional(),
});

export const createCandidateSchema = z.object({
  userId: z.string().min(1),
  fullName: z.string().min(1),
  contactInfo: z.string().optional(),
  education: educationLevelSchema.optional().nullable(),
  major: z.string().optional().nullable(),
  yearsOfExperience: z.number().int().nonnegative().optional().nullable(),
  skills: z.string().optional().nullable(),
  workExperience: z.string().optional().nullable(),
  preferredLocations: z.string().optional().nullable(),
  preferredWorkMode: workModeSchema.optional().nullable(),
  resumeText: z.string().optional().nullable(),
  isMember: z.boolean().optional(),
});

export const candidateSchema = createCandidateSchema.extend({
  id: z.string(),
  rrfScore: z.number().optional(),
  rerankScore: z.number().optional(),
});

export const createApplicationSchema = z.object({
  candidateId: z.string().min(1),
  jobId: z.string().min(1),
  status: applicationStatusSchema.optional(),
  coverLetter: z.string().optional().nullable(),
});

export const applicationSchema = createApplicationSchema.extend({
  id: z.string(),
  status: applicationStatusSchema,
});

export const jobSearchQuerySchema = z.object({
  query: z.string().optional(),
  candidateId: z.string().optional(),
  workMode: workModeSchema.optional(),
  location: z.string().optional(),
  requiredEducation: educationLevelSchema.optional(),
  yearsOfExperience: optionalNonNegativeIntQuerySchema,
  limit: optionalPositiveIntQuerySchema,
  rerank: optionalBooleanQuerySchema,
});

export const candidateSearchQuerySchema = z.object({
  query: z.string().optional(),
  jobId: z.string().uuid().optional(),
  employerId: z.string().uuid().optional(),
  education: educationLevelSchema.optional(),
  location: z.string().optional(),
  workMode: workModeSchema.optional(),
  minYearsOfExperience: optionalNonNegativeIntQuerySchema,
  limit: optionalPositiveIntQuerySchema,
  rerank: optionalBooleanQuerySchema,
});

export type EducationLevel = z.infer<typeof educationLevelSchema>;
export type WorkMode = z.infer<typeof workModeSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type CreateEmployerDto = z.infer<typeof createEmployerSchema>;
export type EmployerDto = z.infer<typeof employerSchema>;
export type UpdateEmployerDto = Partial<CreateEmployerDto>;
export type CreateJobDto = z.infer<typeof createJobSchema>;
export type JobDto = z.infer<typeof jobSchema>;
export type UpdateJobDto = Partial<CreateJobDto>;
export type CreateCandidateDto = z.infer<typeof createCandidateSchema>;
export type CandidateDto = z.infer<typeof candidateSchema>;
export type UpdateCandidateDto = Partial<CreateCandidateDto>;
export type CreateApplicationDto = z.infer<typeof createApplicationSchema>;
export type ApplicationDto = z.infer<typeof applicationSchema>;
export type UpdateApplicationDto = Partial<CreateApplicationDto>;
export type JobSearchQueryDto = z.infer<typeof jobSearchQuerySchema>;
export type CandidateSearchQueryDto = z.infer<
  typeof candidateSearchQuerySchema
>;

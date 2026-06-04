import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  applicationStatusSchema,
  candidateSearchQuerySchema,
  candidateSchema,
  createApplicationSchema,
  createCandidateSchema,
  createEmployerSchema,
  createJobSchema,
  educationLevelSchema,
  employerSchema,
  jobSchema,
  jobSearchQuerySchema,
  jobStatusSchema,
  workModeSchema,
} from '@talent-matching/dtos';

extendZodWithOpenApi(z);

export const openApiRegistry = new OpenAPIRegistry();

export const EducationLevel = openApiRegistry.register(
  'EducationLevel',
  educationLevelSchema.openapi({
    description: 'Highest formal education level attained.',
    example: 'bachelor',
  }),
);

export const WorkMode = openApiRegistry.register(
  'WorkMode',
  workModeSchema.openapi({
    description: 'Work arrangement for a job or candidate preference.',
    example: 'hybrid',
  }),
);

export const JobStatus = openApiRegistry.register(
  'JobStatus',
  jobStatusSchema.openapi({
    description: 'Current lifecycle state of a job posting.',
    example: 'published',
  }),
);

export const ApplicationStatus = openApiRegistry.register(
  'ApplicationStatus',
  applicationStatusSchema.openapi({
    description: 'Current lifecycle state of a job application.',
    example: 'submitted',
  }),
);

export const CreateCandidate = openApiRegistry.register(
  'CreateCandidate',
  createCandidateSchema
    .omit({ userId: true })
    .extend({
      userId: z.string().uuid().openapi({
        description: 'UUID of the authenticated user who owns this profile.',
        example: '550e8400-e29b-41d4-a716-446655440000',
      }),
    })
    .openapi({ description: 'Payload to create a candidate profile.' }),
);

export const UpdateCandidate = openApiRegistry.register(
  'UpdateCandidate',
  createCandidateSchema.partial().openapi({
    description: 'Partial update — every field is optional.',
  }),
);

export const Candidate = openApiRegistry.register(
  'Candidate',
  candidateSchema.omit({ resumeText: true }).extend({
    resumeText: z.string().nullable().optional().openapi({
      description: 'Full text extracted from the resume.',
      example: null,
    }),
  }).openapi({
    description: 'A candidate profile. rrfScore/rerankScore are populated by the AI matcher in search results.',
  }),
);

export const CreateEmployer = openApiRegistry.register(
  'CreateEmployer',
  createEmployerSchema
    .omit({ userId: true })
    .extend({
      userId: z.string().uuid().openapi({
        description: 'UUID of the authenticated user who owns this profile.',
        example: '550e8400-e29b-41d4-a716-446655440000',
      }),
    })
    .openapi({ description: 'Payload to create an employer profile.' }),
);

export const Employer = openApiRegistry.register(
  'Employer',
  employerSchema.openapi({ description: 'An employer profile on the platform.' }),
);

export const UpdateEmployer = openApiRegistry.register(
  'UpdateEmployer',
  createEmployerSchema.partial().omit({ userId: true }).openapi({
    description: 'Partial update — every field is optional.',
  }),
);

export const CreateJob = openApiRegistry.register(
  'CreateJob',
  createJobSchema
    .omit({ employerId: true })
    .extend({
      employerId: z.string().uuid().openapi({
        description: 'UUID of the employer creating this job posting.',
        example: '660e8400-e29b-41d4-a716-446655440001',
      }),
    })
    .openapi({
      description:
        'Payload to create a job posting. Status defaults to published. ' +
        'Salary is auto-calculated if omitted based on education and experience.',
    }),
);

export const Job = openApiRegistry.register(
  'Job',
  jobSchema.omit({ description: true }).extend({
    description: z.string().openapi({
      description: 'Full job description in plain text.',
      example: 'We are looking for a senior full-stack engineer...',
    }),
    rrfScore: z.number().optional().openapi({
      description: 'Reciprocal Rank Fusion score from the AI matcher. Present in search results.',
      example: 0.94,
    }),
    rerankScore: z.number().optional().openapi({
      description: 'Cohere rerank score when rerank: true is passed.',
      example: 0.87,
    }),
  }).openapi({
    description: 'A job posting. Scoring fields are populated by the AI matcher in search results.',
  }),
);

export const CreateApplication = openApiRegistry.register(
  'CreateApplication',
  createApplicationSchema.omit({ status: true }).extend({
    status: applicationStatusSchema.optional().openapi({
      description: 'Initial status. Defaults to submitted.',
      example: 'submitted',
    }),
  }).openapi({
    description: 'Payload to submit a job application.',
  }),
);

export const Application = openApiRegistry.register(
  'Application',
  z.object({
    id: z.string().uuid(),
    candidateId: z.string().uuid(),
    jobId: z.string().uuid(),
    status: applicationStatusSchema,
    coverLetter: z.string().nullable().optional(),
  }).openapi({ description: 'A job application record.' }),
);

export const CreateSavedJob = openApiRegistry.register(
  'CreateSavedJob',
  z.object({
    candidateId: z.string().uuid().openapi({
      description: 'UUID of the candidate saving the job.',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    jobId: z.string().uuid().openapi({
      description: 'UUID of the job to save.',
      example: '660e8400-e29b-41d4-a716-446655440001',
    }),
  }).openapi({ description: 'Payload to bookmark a job for a candidate.' }),
);

export const SavedJob = openApiRegistry.register(
  'SavedJob',
  z.object({
    id: z.string().uuid(),
    candidateId: z.string().uuid(),
    jobId: z.string().uuid(),
    createdAt: z.string().datetime().openapi({
      description: 'ISO 8601 timestamp when the job was bookmarked.',
      example: '2026-06-01T10:30:00.000Z',
    }),
  }).openapi({ description: 'A bookmarked job.' }),
);

export const JobSearchQuery = openApiRegistry.register(
  'JobSearchQuery',
  jobSearchQuerySchema.omit({ rerank: true }).extend({
    rerank: z.boolean().optional().openapi({
      description: 'Pass results through Cohere rerank for improved relevance. Default: false.',
      example: false,
    }),
  }).openapi({
    description: 'Query params for hybrid keyword + filter job search.',
  }),
);

export const CandidateSearchQuery = openApiRegistry.register(
  'CandidateSearchQuery',
  candidateSearchQuerySchema.omit({ rerank: true }).extend({
    rerank: z.boolean().optional().openapi({
      description: 'Pass results through Cohere rerank for improved relevance. Default: true.',
      example: true,
    }),
  }).openapi({
    description: 'Query params for hybrid keyword + filter candidate search.',
  }),
);

export const ErrorResponse = openApiRegistry.register(
  'ErrorResponse',
  z.object({
    statusCode: z.number().int().openapi({ example: 400 }),
    message: z.union([z.string(), z.array(z.string())]).openapi({ example: 'Validation failed' }),
    error: z.string().optional().openapi({ example: 'Bad Request' }),
  }).openapi({ description: 'Standard NestJS error envelope.' }),
);

export function generateOpenApiDocument(
  title: string,
  description: string,
  version: string,
) {
  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: { title, description, version },
    servers: [{ url: '/api', description: 'API root' }],
  });
}

/**
 * OpenAPI schemas — mirrors the shared Zod DTOs with full
 * .openapi() metadata (descriptions, examples, formats).
 *
 * These schemas feed into the OpenAPI document rendered by Scalar.
 * The shared Zod library stays pure — this file is the only place
 * OpenAPI-specific metadata lives.
 */
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

// updateCandidateSchema is defined locally in the backend as createCandidateSchema.partial().
const updateCandidateSchema = createCandidateSchema.partial();

// Adds `.openapi()` method to every Zod type. Safe to call multiple times.
extendZodWithOpenApi(z);

/** Central registry — schemas + paths are registered here and the
 *  generator pulls everything into one OpenAPI document. */
export const openApiRegistry = new OpenAPIRegistry();

// ─── Enums ───────────────────────────────────────────────────────────

export const EducationLevelSchema = openApiRegistry.register(
  'EducationLevel',
  educationLevelSchema.openapi({
    description:
      'Highest formal education level attained by the candidate.',
    example: 'bachelor',
  }),
);

export const WorkModeSchema = openApiRegistry.register(
  'WorkMode',
  workModeSchema.openapi({
    description:
      'Work arrangement for a job or candidate preference.',
    example: 'hybrid',
  }),
);

export const JobStatusSchema = openApiRegistry.register(
  'JobStatus',
  jobStatusSchema.openapi({
    description: 'Current lifecycle state of a job posting.',
    example: 'published',
  }),
);

export const ApplicationStatusSchema = openApiRegistry.register(
  'ApplicationStatus',
  applicationStatusSchema.openapi({
    description: 'Current lifecycle state of a job application.',
    example: 'submitted',
  }),
);

// ─── Candidate ────────────────────────────────────────────────────────

export const CreateCandidateSchema = openApiRegistry.register(
  'CreateCandidate',
  createCandidateSchema
    .omit({ userId: true })
    .extend({
      userId: z.string().uuid().openapi({
        description:
          'UUID of the authenticated user who owns this profile.',
        example: '550e8400-e29b-41d4-a716-446655440000',
      }),
    })
    .openapi({
      description: 'Payload to create a candidate profile.',
    }),
);

export const UpdateCandidateSchema = openApiRegistry.register(
  'UpdateCandidate',
  updateCandidateSchema.openapi({
    description: 'Partial update — every field is optional.',
  }),
);

export const CandidateSchema = openApiRegistry.register(
  'Candidate',
  candidateSchema
    .omit({ resumeText: true })
    .extend({
      resumeText: z.string().nullable().optional().openapi({
        description: 'Full text extracted from the candidate\'s resume.',
        example: null,
      }),
    })
    .openapi({
      description:
        'A candidate profile. `rrfScore` / `rerankScore` are populated ' +
        'by the AI matcher when returned via a search endpoint.',
    }),
);

// ─── Employer ────────────────────────────────────────────────────────

export const CreateEmployerSchema = openApiRegistry.register(
  'CreateEmployer',
  createEmployerSchema
    .omit({ userId: true })
    .extend({
      userId: z.string().uuid().openapi({
        description:
          'UUID of the authenticated user who owns this profile.',
        example: '550e8400-e29b-41d4-a716-446655440000',
      }),
    })
    .openapi({
      description: 'Payload to create an employer profile.',
    }),
);

export const EmployerSchema = openApiRegistry.register(
  'Employer',
  employerSchema.openapi({
    description: 'An employer profile on the platform.',
  }),
);

export const UpdateEmployerSchema = openApiRegistry.register(
  'UpdateEmployer',
  createEmployerSchema.partial().omit({ userId: true }).openapi({
    description: 'Partial update — every field is optional.',
  }),
);

// ─── Job ─────────────────────────────────────────────────────────────

export const CreateJobSchema = openApiRegistry.register(
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
        'Payload to create a job posting. Status defaults to "published" ' +
        'if not provided.',
    }),
);

export const JobSchema = openApiRegistry.register(
  'Job',
  jobSchema
    .omit({ description: true })
    .extend({
      description: z.string().openapi({
        description: 'Full job description in plain text.',
        example:
          'We are looking for a senior full-stack engineer...',
      }),
      rrfScore: z.number().optional().openapi({
        description:
          'Reciprocal Rank Fusion score from the AI matcher. Present ' +
          'when the job is returned via a candidate search.',
        example: 0.94,
      }),
      rerankScore: z.number().optional().openapi({
        description:
          'Cohere rerank score. Present when `rerank: true` is passed ' +
          'to the search endpoint.',
        example: 0.87,
      }),
    })
    .openapi({
      description:
        'A job posting. Scoring fields are populated by the AI matcher ' +
        'when returned via a search endpoint.',
    }),
);

// ─── Application ─────────────────────────────────────────────────────

export const CreateApplicationSchema = openApiRegistry.register(
  'CreateApplication',
  createApplicationSchema
    .omit({ status: true })
    .extend({
      status: applicationStatusSchema.optional().openapi({
        description: 'Initial status. Defaults to "submitted".',
        example: 'submitted',
      }),
    })
    .openapi({
      description:
        'Payload to submit a job application. ' +
        'Status is automatically set to "submitted" if omitted.',
    }),
);

export const ApplicationSchema = openApiRegistry.register(
  'Application',
  z
    .object({
      id: z.string().uuid().openapi({
        description: 'Unique application identifier.',
        example: '770e8400-e29b-41d4-a716-446655440002',
      }),
      candidateId: z.string().uuid().openapi({
        description: 'UUID of the candidate who applied.',
        example: '550e8400-e29b-41d4-a716-446655440000',
      }),
      jobId: z.string().uuid().openapi({
        description: 'UUID of the job applied to.',
        example: '660e8400-e29b-41d4-a716-446655440001',
      }),
      status: applicationStatusSchema,
      coverLetter: z.string().nullable().openapi({
        description: 'Optional cover letter submitted with the application.',
        example: 'I am excited to apply for this role because...',
      }),
    })
    .openapi({ description: 'A job application record.' }),
);

// ─── SavedJob ─────────────────────────────────────────────────────────

export const CreateSavedJobSchema = openApiRegistry.register(
  'CreateSavedJob',
  z
    .object({
      candidateId: z.string().uuid().openapi({
        description: 'UUID of the candidate saving the job.',
        example: '550e8400-e29b-41d4-a716-446655440000',
      }),
      jobId: z.string().uuid().openapi({
        description: 'UUID of the job to save.',
        example: '660e8400-e29b-41d4-a716-446655440001',
      }),
    })
    .openapi({ description: 'Payload to bookmark a job for a candidate.' }),
);

export const SavedJobSchema = openApiRegistry.register(
  'SavedJob',
  z
    .object({
      id: z.string().uuid().openapi({
        description: 'Unique bookmark identifier.',
        example: '880e8400-e29b-41d4-a716-446655440003',
      }),
      candidateId: z.string().uuid(),
      jobId: z.string().uuid(),
      createdAt: z.string().datetime().openapi({
        description: 'ISO 8601 timestamp when the job was bookmarked.',
        example: '2026-06-01T10:30:00.000Z',
      }),
    })
    .openapi({ description: 'A candidate\'s bookmarked job.' }),
);

// ─── Search query DTOs ───────────────────────────────────────────────

export const JobSearchQuerySchema = openApiRegistry.register(
  'JobSearchQuery',
  jobSearchQuerySchema
    .omit({ rerank: true })
    .extend({
      rerank: z.boolean().optional().openapi({
        description:
          'If true, pass results through Cohere rerank for improved relevance. ' +
          'Defaults to false.',
        example: false,
      }),
    })
    .openapi({
      description:
        'Query parameters for hybrid keyword + filter search over jobs. ' +
        'Supports an optional Cohere rerank pass when `rerank: true`.',
    }),
);

export const CandidateSearchQuerySchema = openApiRegistry.register(
  'CandidateSearchQuery',
  candidateSearchQuerySchema
    .omit({ rerank: true })
    .extend({
      rerank: z.boolean().optional().openapi({
        description:
          'If true, pass results through Cohere rerank for improved relevance. ' +
          'Defaults to true when not specified.',
        example: true,
      }),
    })
    .openapi({
      description:
        'Query parameters for hybrid keyword + filter search over candidates. ' +
        'Supports an optional Cohere rerank pass when `rerank: true`.',
    }),
);

// ─── Common ───────────────────────────────────────────────────────────

export const PaginationQuerySchema = openApiRegistry.register(
  'PaginationQuery',
  z
    .object({
      limit: z.coerce.number().int().positive().max(100).optional().openapi({
        description: 'Maximum number of results to return. Defaults to 20, max 100.',
        example: 20,
      }),
    })
    .openapi({ description: 'Standard pagination query parameters.' }),
);

export const ErrorResponseSchema = openApiRegistry.register(
  'ErrorResponse',
  z
    .object({
      statusCode: z.number().int().openapi({ example: 400 }),
      message: z
        .union([z.string(), z.array(z.string())])
        .openapi({ example: 'Validation failed' }),
      error: z.string().optional().openapi({ example: 'Bad Request' }),
    })
    .openapi({ description: 'Standard NestJS error envelope.' }),
);

/** Generates the full OpenAPI 3.0 document from all registered schemas and paths. */
export function generateOpenApiDocument(title: string, description: string, version: string) {
  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title,
      description,
      version,
    },
    servers: [{ url: '/api', description: 'API root' }],
  });
}

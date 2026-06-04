/**
 * OpenAPI path registrations — mirrors every controller route with
 * full request/response schema references and descriptions.
 *
 * All paths are tagged under their respective controller group so
 * Scalar renders them in clearly labelled sections.
 */
import { z } from 'zod';
import {
  openApiRegistry,
  ApplicationSchema,
  CandidateSchema,
  CandidateSearchQuerySchema,
  CreateApplicationSchema,
  CreateCandidateSchema,
  CreateEmployerSchema,
  CreateJobSchema,
  CreateSavedJobSchema,
  EducationLevelSchema,
  EmployerSchema,
  ErrorResponseSchema,
  JobSchema,
  JobSearchQuerySchema,
  JobStatusSchema,
  PaginationQuerySchema,
  SavedJobSchema,
  UpdateCandidateSchema,
  UpdateEmployerSchema,
  WorkModeSchema,
} from './openapi.schemas';

// Helper to register a 200 response with a schema.
function ok(
  description: string,
  schema: z.ZodTypeAny,
): { 200: { description: string; content: Record<string, { schema: z.ZodTypeAny }> } } {
  return {
    200: { description, content: { 'application/json': { schema } } },
  };
}

// ─── Candidates ────────────────────────────────────────────────────────

openApiRegistry.registerPath({
  method: 'post',
  path: '/candidates',
  summary: 'Create a candidate profile',
  description:
    'Creates a new candidate profile for the authenticated user. ' +
    'The profile is indexed for AI-powered job matching upon creation.',
  tags: ['candidates'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateCandidateSchema } },
    },
  },
  responses: {
    ...ok('Candidate profile created successfully.', CandidateSchema),
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/candidates',
  summary: 'List all candidate profiles',
  description: 'Returns all candidate profiles in the system. Intended for admin use.',
  tags: ['candidates'],
  responses: {
    ...ok('Array of all candidates.', z.array(CandidateSchema)),
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/candidates/me',
  summary: 'Get my candidate profile',
  description:
    'Returns the candidate profile belonging to the currently authenticated user. ' +
    'Requires a valid better-auth session cookie.',
  tags: ['candidates'],
  responses: {
    ...ok('The authenticated user\'s candidate profile.', CandidateSchema),
    401: { description: 'Not authenticated', content: { 'application/json': { schema: ErrorResponseSchema } } },
    404: { description: 'Profile not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/candidates/search',
  summary: 'Search candidates',
  description:
    'Hybrid keyword + filter search over all candidates. ' +
    'Supports full-text query, education level, location, work mode, experience filtering, ' +
    'and optional Cohere rerank for improved relevance. ' +
    'Pass `candidateId` to search within jobs the employer has posted.',
  tags: ['candidates'],
  request: {
    query: CandidateSearchQuerySchema,
  },
  responses: {
    ...ok('Matching candidates with optional AI scoring.', z.array(CandidateSchema)),
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/candidates/{id}',
  summary: 'Get a candidate by ID',
  description: 'Returns a single candidate profile by UUID.',
  tags: ['candidates'],
  request: {
    params: z.object({ id: z.string().uuid().openapi({ description: 'Candidate UUID', example: '550e8400-e29b-41d4-a716-446655440000' }) }),
  },
  responses: {
    ...ok('The candidate profile.', CandidateSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'patch',
  path: '/candidates/{id}',
  summary: 'Update a candidate profile',
  description:
    'Partially updates a candidate profile. All fields are optional. ' +
    'If resumeText or skills are changed, the search embedding is regenerated.',
  tags: ['candidates'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { required: true, content: { 'application/json': { schema: UpdateCandidateSchema } } },
  },
  responses: {
    ...ok('Updated candidate profile.', CandidateSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/candidates/{id}',
  summary: 'Delete a candidate profile',
  description: 'Permanently removes a candidate profile and all associated applications.',
  tags: ['candidates'],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    ...ok('Deleted candidate profile.', CandidateSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

// ─── Employers ────────────────────────────────────────────────────────

openApiRegistry.registerPath({
  method: 'post',
  path: '/employers',
  summary: 'Create an employer profile',
  description:
    'Creates a new employer profile for the authenticated user. ' +
    'Employer can then post jobs and review applications.',
  tags: ['employers'],
  request: {
    body: { required: true, content: { 'application/json': { schema: CreateEmployerSchema } } },
  },
  responses: {
    ...ok('Employer profile created successfully.', EmployerSchema),
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/employers',
  summary: 'List all employers',
  description:
    'Returns all employer profiles. Use `?search=` to filter by company name ' +
    'or job title (case-insensitive ILIKE matching).',
  tags: ['employers'],
  request: {
    query: z.object({
      search: z.string().optional().openapi({
        description: 'Filter employers by company name or job title (case-insensitive).',
        example: 'tech startup',
      }),
    }),
  },
  responses: {
    ...ok('Array of employers.', z.array(EmployerSchema)),
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/employers/me',
  summary: 'Get my employer profile',
  description:
    'Returns the employer profile belonging to the currently authenticated user. ' +
    'Requires a valid better-auth session cookie.',
  tags: ['employers'],
  responses: {
    ...ok('The authenticated user\'s employer profile.', EmployerSchema),
    401: { description: 'Not authenticated', content: { 'application/json': { schema: ErrorResponseSchema } } },
    404: { description: 'Profile not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/employers/{id}',
  summary: 'Get an employer by ID',
  description: 'Returns a single employer profile by UUID.',
  tags: ['employers'],
  request: {
    params: z.object({ id: z.string().uuid().openapi({ description: 'Employer UUID' }) }),
  },
  responses: {
    ...ok('The employer profile.', EmployerSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/employers/{id}/jobs',
  summary: 'List jobs by employer',
  description: 'Returns all published and draft job postings for a specific employer.',
  tags: ['employers'],
  request: {
    params: z.object({ id: z.string().uuid().openapi({ description: 'Employer UUID' }) }),
  },
  responses: {
    ...ok('Job postings by this employer.', z.array(JobSchema)),
  },
});

openApiRegistry.registerPath({
  method: 'patch',
  path: '/employers/{id}',
  summary: 'Update an employer profile',
  description: 'Partially updates an employer profile. All fields are optional.',
  tags: ['employers'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { required: true, content: { 'application/json': { schema: UpdateEmployerSchema } } },
  },
  responses: {
    ...ok('Updated employer profile.', EmployerSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/employers/{id}',
  summary: 'Delete an employer profile',
  description: 'Permanently removes an employer profile and all associated job postings.',
  tags: ['employers'],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    ...ok('Deleted employer profile.', EmployerSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

// ─── Jobs ─────────────────────────────────────────────────────────────

openApiRegistry.registerPath({
  method: 'post',
  path: '/jobs',
  summary: 'Create a job posting',
  description:
    'Creates a new job posting. The description is indexed for AI-powered candidate matching. ' +
    'Status defaults to "published" if not provided. ' +
    'If salary fields are omitted, they are auto-calculated based on education and experience level.',
  tags: ['jobs'],
  request: {
    body: { required: true, content: { 'application/json': { schema: CreateJobSchema } } },
  },
  responses: {
    ...ok('Job posting created successfully.', JobSchema),
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/jobs',
  summary: 'List all published job postings',
  description:
    'Returns all job postings with status "published". ' +
    'The description field is omitted in list view to keep responses lightweight; ' +
    'fetch individual jobs by ID for the full description.',
  tags: ['jobs'],
  responses: {
    ...ok('Array of published jobs.', z.array(JobSchema)),
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/jobs/search',
  summary: 'Search jobs',
  description:
    'Hybrid keyword + filter search over all published jobs. ' +
    'Supports full-text query, work mode, location, education, salary range, experience filtering, ' +
    'and optional Cohere rerank for improved relevance. ' +
    'Pass `candidateId` to score jobs against that candidate\'s profile.',
  tags: ['jobs'],
  request: {
    query: JobSearchQuerySchema,
  },
  responses: {
    ...ok('Matching jobs with optional AI scoring.', z.array(JobSchema)),
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/jobs/{id}',
  summary: 'Get a job by ID',
  description: 'Returns a single job posting including the full description.',
  tags: ['jobs'],
  request: {
    params: z.object({ id: z.string().uuid().openapi({ description: 'Job UUID', example: '660e8400-e29b-41d4-a716-446655440001' }) }),
  },
  responses: {
    ...ok('The job posting.', JobSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'patch',
  path: '/jobs/{id}',
  summary: 'Update a job posting',
  description:
    'Partially updates a job posting. All fields are optional. ' +
    'If title or description changes, the search embedding is regenerated.',
  tags: ['jobs'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { required: true, content: { 'application/json': { schema: z.record(z.string(), z.unknown()).openapi({ description: 'Partial job fields to update' }) } } },
  },
  responses: {
    ...ok('Updated job posting.', JobSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/jobs/{id}',
  summary: 'Delete a job posting',
  description: 'Permanently removes a job posting and all associated applications.',
  tags: ['jobs'],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    ...ok('Deleted job posting.', JobSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

// ─── Applications ─────────────────────────────────────────────────────

openApiRegistry.registerPath({
  method: 'post',
  path: '/applications',
  summary: 'Submit a job application',
  description:
    'Creates a new application for a candidate against a job posting. ' +
    'Status is automatically set to "submitted". ' +
    'Duplicate applications (same candidate + job) are rejected.',
  tags: ['applications'],
  request: {
    body: { required: true, content: { 'application/json': { schema: CreateApplicationSchema } } },
  },
  responses: {
    ...ok('Application submitted successfully.', ApplicationSchema),
    400: { description: 'Validation error or duplicate application', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/applications',
  summary: 'List applications',
  description:
    'Returns all applications. Filter by `candidateId` or `jobId` to narrow results. ' +
    'If neither filter is provided, returns all applications in the system.',
  tags: ['applications'],
  request: {
    query: z.object({
      candidateId: z.string().uuid().optional().openapi({ description: 'Filter by candidate UUID' }),
      jobId: z.string().uuid().optional().openapi({ description: 'Filter by job UUID' }),
    }),
  },
  responses: {
    ...ok('Array of applications.', z.array(ApplicationSchema)),
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/applications/{id}',
  summary: 'Get an application by ID',
  description: 'Returns a single application by UUID.',
  tags: ['applications'],
  request: {
    params: z.object({ id: z.string().uuid().openapi({ description: 'Application UUID' }) }),
  },
  responses: {
    ...ok('The application.', ApplicationSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'patch',
  path: '/applications/{id}',
  summary: 'Update an application',
  description:
    'Partially updates an application. Most commonly used by employers to change ' +
    'the application status (e.g. shortlist, reject, accept).',
  tags: ['applications'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { required: true, content: { 'application/json': { schema: z.record(z.string(), z.unknown()).openapi({ description: 'Partial application fields to update' }) } } },
  },
  responses: {
    ...ok('Updated application.', ApplicationSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/applications/{id}',
  summary: 'Withdraw an application',
  description: 'Permanently removes an application. Candidates can withdraw their own applications.',
  tags: ['applications'],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    ...ok('Withdrawn application.', ApplicationSchema),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

// ─── Saved Jobs ───────────────────────────────────────────────────────

// ─── Auth ─────────────────────────────────────────────────────────────
// better-auth endpoints routed at /api/auth/* by toNodeHandler(auth)
// in main.ts. These are cookie-based; no Authorization header needed.

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/sign-in',
  summary: 'Sign in',
  description:
    'Authenticates a user with email and password. Sets a session cookie on success. ' +
    'Returns the user object and session token.',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z
            .object({
              email: z.string().email().openapi({
                description: 'User email address.',
                example: 'alice@example.com',
              }),
              password: z.string().min(1).openapi({
                description: 'User password.',
                example: 's3cr3t!',
              }),
            })
            .openapi('SignInRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Sign-in successful. Session cookie is set.',
      content: {
        'application/json': {
          schema: z
            .object({
              user: z.object({
                id: z.string(),
                email: z.string().email(),
                name: z.string(),
                emailVerified: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
              session: z.object({
                token: z.string(),
                expiresAt: z.string(),
              }),
            })
            .openapi('SignInResponse'),
        },
      },
    },
    401: {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/sign-up',
  summary: 'Register',
  description:
    'Creates a new user account with email and password. ' +
    'Optionally sends a verification email if configured.',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z
            .object({
              name: z.string().min(1).openapi({
                description: 'Display name for the new user.',
                example: 'Alice Smith',
              }),
              email: z.string().email().openapi({
                description: 'Email address for the account.',
                example: 'alice@example.com',
              }),
              password: z.string().min(8).openapi({
                description: 'Account password (min 8 characters).',
                example: 's3cr3t!',
              }),
            })
            .openapi('SignUpRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Account created. Session cookie is set.',
      content: {
        'application/json': {
          schema: z
            .object({
              user: z.object({
                id: z.string(),
                email: z.string().email(),
                name: z.string(),
                emailVerified: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
              session: z.object({
                token: z.string(),
                expiresAt: z.string(),
              }),
            })
            .openapi('SignUpResponse'),
        },
      },
    },
    400: {
      description: 'Validation error or email already in use',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/sign-out',
  summary: 'Sign out',
  description:
    'Invalidates the current session and clears the session cookie.',
  tags: ['auth'],
  responses: {
    200: {
      description: 'Signed out successfully.',
      content: {
        'application/json': {
          schema: z.object({ status: z.boolean() }).openapi('SignOutResponse'),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/auth/get-session',
  summary: 'Get current session',
  description:
    'Returns the currently authenticated user and session based on the session cookie. ' +
    'Returns null if no valid session exists.',
  tags: ['auth'],
  responses: {
    200: {
      description: 'The current session and user, or null if unauthenticated.',
      content: {
        'application/json': {
          schema: z
            .object({
              session: z
                .object({
                  token: z.string(),
                  expiresAt: z.string(),
                  userId: z.string(),
                })
                .nullable(),
              user: z
                .object({
                  id: z.string(),
                  email: z.string().email(),
                  name: z.string(),
                  emailVerified: z.boolean(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                })
                .nullable(),
            })
            .openapi('SessionResponse'),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/request-password-reset',
  summary: 'Request password reset',
  description:
    'Sends a password reset email to the given address if the account exists. ' +
    'The response always returns success to prevent email enumeration. ' +
    'In production, configure `sendResetPassword` in the auth options.',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z
            .object({
              email: z.string().email().openapi({
                description: 'Email address of the account to reset.',
                example: 'alice@example.com',
              }),
              redirectTo: z.string().optional().openapi({
                description:
                  'URL the reset link should redirect to after clicking. ' +
                  'The reset token is appended as a query parameter.',
                example: 'https://yourapp.com/reset-password',
              }),
            })
            .openapi('RequestPasswordResetRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description:
        'Reset email sent if the address exists. Always returns success.',
      content: {
        'application/json': {
          schema: z
            .object({
              status: z.boolean().openapi({ example: true }),
              message: z.string().openapi({
                example:
                  'If this email exists in our system, check your email for the reset link',
              }),
            })
            .openapi('RequestPasswordResetResponse'),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/reset-password',
  summary: 'Reset password',
  description:
    'Resets the account password using a valid reset token. ' +
    'Tokens expire based on `resetPasswordTokenExpiresIn` (default: 1 hour). ' +
    'All active sessions are revoked after a successful reset if `revokeSessionsOnPasswordReset` is enabled.',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z
            .object({
              newPassword: z.string().min(8).openapi({
                description: 'New password (min 8 characters).',
                example: 'n3wS3cr3t!',
              }),
              token: z.string().openapi({
                description:
                  'Reset token received via the email link (query param `token`) ' +
                  'or via the `GET /reset-password/:token` callback redirect.',
                example: 'abc123xyz789',
              }),
            })
            .openapi('ResetPasswordRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset successfully.',
      content: {
        'application/json': {
          schema: z
            .object({ status: z.boolean().openapi({ example: true }) })
            .openapi('ResetPasswordResponse'),
        },
      },
    },
    400: {
      description: 'Invalid or expired token',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// ─── Saved Jobs ───────────────────────────────────────────────────────

openApiRegistry.registerPath({
  method: 'post',
  path: '/saved-jobs',
  summary: 'Bookmark a job',
  description:
    'Bookmarks a job for a candidate. The candidate must own the specified `candidateId`. ' +
    'Duplicate bookmarks are silently ignored.',
  tags: ['saved-jobs'],
  request: {
    body: { required: true, content: { 'application/json': { schema: CreateSavedJobSchema } } },
  },
  responses: {
    ...ok('Job bookmarked successfully.', SavedJobSchema),
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/saved-jobs',
  summary: 'List a candidate\'s bookmarked jobs',
  description: 'Returns all saved-job bookmarks for a given candidate.',
  tags: ['saved-jobs'],
  request: {
    query: z.object({
      candidateId: z.string().uuid().openapi({ description: 'Candidate UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    }),
  },
  responses: {
    ...ok('Bookmarked jobs.', z.array(SavedJobSchema)),
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/saved-jobs/{id}',
  summary: 'Remove a bookmark',
  description: 'Removes a saved-job bookmark by its ID.',
  tags: ['saved-jobs'],
  request: {
    params: z.object({ id: z.string().uuid().openapi({ description: 'SavedJob UUID' }) }),
  },
  responses: {
    ...ok('Bookmark removed.', SavedJobSchema),
    404: { description: 'Bookmark not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
  },
});

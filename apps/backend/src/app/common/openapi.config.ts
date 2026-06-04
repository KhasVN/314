import { z } from 'zod';
import {
  openApiRegistry,
  Application,
  Candidate,
  CandidateSearchQuery,
  CreateApplication,
  CreateCandidate,
  CreateEmployer,
  CreateJob,
  CreateSavedJob,
  Employer,
  ErrorResponse,
  Job,
  JobSearchQuery,
  SavedJob,
  UpdateCandidate,
  UpdateEmployer,
} from './openapi.schemas';

function ok(description: string, schema: z.ZodTypeAny) {
  return {
    200: { description, content: { 'application/json': { schema } } },
  };
}

// Candidates

openApiRegistry.registerPath({
  method: 'post',
  path: '/candidates',
  summary: 'Create a candidate profile',
  description: 'Creates a new candidate profile. Indexed for AI job matching.',
  tags: ['candidates'],
  request: { body: { required: true, content: { 'application/json': { schema: CreateCandidate } } } },
  responses: {
    ...ok('Candidate profile created.', Candidate),
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/candidates',
  summary: 'List all candidate profiles',
  description: 'Returns all candidate profiles. Intended for admin use.',
  tags: ['candidates'],
  responses: { ...ok('Array of all candidates.', z.array(Candidate)) },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/candidates/me',
  summary: 'Get my candidate profile',
  description: 'Returns the candidate profile of the authenticated user. Requires a valid session cookie.',
  tags: ['candidates'],
  responses: {
    ...ok('The authenticated user\'s candidate profile.', Candidate),
    401: { description: 'Not authenticated', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Profile not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/candidates/search',
  summary: 'Search candidates',
  description: 'Hybrid keyword + filter search. Supports education, location, work mode, experience, and optional Cohere rerank.',
  tags: ['candidates'],
  request: { query: CandidateSearchQuery },
  responses: { ...ok('Matching candidates with optional AI scoring.', z.array(Candidate)) },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/candidates/{id}',
  summary: 'Get a candidate by ID',
  tags: ['candidates'],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ description: 'Candidate UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    }),
  },
  responses: {
    ...ok('The candidate profile.', Candidate),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'patch',
  path: '/candidates/{id}',
  summary: 'Update a candidate profile',
  description: 'Partially updates a candidate. All fields are optional. Embedding is regenerated if resumeText or skills change.',
  tags: ['candidates'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { required: true, content: { 'application/json': { schema: UpdateCandidate } } },
  },
  responses: {
    ...ok('Updated candidate profile.', Candidate),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/candidates/{id}',
  summary: 'Delete a candidate profile',
  description: 'Permanently removes a candidate profile and all associated applications.',
  tags: ['candidates'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    ...ok('Deleted candidate profile.', Candidate),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

// Employers

openApiRegistry.registerPath({
  method: 'post',
  path: '/employers',
  summary: 'Create an employer profile',
  description: 'Creates a new employer profile for the authenticated user.',
  tags: ['employers'],
  request: { body: { required: true, content: { 'application/json': { schema: CreateEmployer } } } },
  responses: {
    ...ok('Employer profile created.', Employer),
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/employers',
  summary: 'List all employers',
  description: 'Returns all employers. Use ?search= to filter by company name or job title.',
  tags: ['employers'],
  request: {
    query: z.object({
      search: z.string().optional().openapi({ description: 'Filter by company name or job title.', example: 'tech startup' }),
    }),
  },
  responses: { ...ok('Array of employers.', z.array(Employer)) },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/employers/me',
  summary: 'Get my employer profile',
  description: 'Returns the employer profile of the authenticated user. Requires a valid session cookie.',
  tags: ['employers'],
  responses: {
    ...ok('The authenticated user\'s employer profile.', Employer),
    401: { description: 'Not authenticated', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Profile not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/employers/{id}',
  summary: 'Get an employer by ID',
  tags: ['employers'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    ...ok('The employer profile.', Employer),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/employers/{id}/jobs',
  summary: 'List jobs by employer',
  description: 'Returns all published and draft job postings for a specific employer.',
  tags: ['employers'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { ...ok('Job postings by this employer.', z.array(Job)) },
});

openApiRegistry.registerPath({
  method: 'patch',
  path: '/employers/{id}',
  summary: 'Update an employer profile',
  description: 'Partially updates an employer. All fields are optional.',
  tags: ['employers'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { required: true, content: { 'application/json': { schema: UpdateEmployer } } },
  },
  responses: {
    ...ok('Updated employer profile.', Employer),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/employers/{id}',
  summary: 'Delete an employer profile',
  description: 'Permanently removes an employer profile and all associated job postings.',
  tags: ['employers'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    ...ok('Deleted employer profile.', Employer),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

// Jobs

openApiRegistry.registerPath({
  method: 'post',
  path: '/jobs',
  summary: 'Create a job posting',
  description: 'Creates a new job posting. Status defaults to published. Salary is auto-calculated if omitted.',
  tags: ['jobs'],
  request: { body: { required: true, content: { 'application/json': { schema: CreateJob } } } },
  responses: {
    ...ok('Job posting created.', Job),
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/jobs',
  summary: 'List all published job postings',
  description: 'Returns all published job postings.',
  tags: ['jobs'],
  responses: { ...ok('Array of published jobs.', z.array(Job)) },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/jobs/search',
  summary: 'Search jobs',
  description: 'Hybrid keyword + filter search. Supports work mode, location, education, salary, experience, and optional Cohere rerank.',
  tags: ['jobs'],
  request: { query: JobSearchQuery },
  responses: { ...ok('Matching jobs with optional AI scoring.', z.array(Job)) },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/jobs/{id}',
  summary: 'Get a job by ID',
  tags: ['jobs'],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ description: 'Job UUID', example: '660e8400-e29b-41d4-a716-446655440001' }),
    }),
  },
  responses: {
    ...ok('The job posting.', Job),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'patch',
  path: '/jobs/{id}',
  summary: 'Update a job posting',
  description: 'Partially updates a job posting. Embedding is regenerated if title or description changes.',
  tags: ['jobs'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { required: true, content: { 'application/json': { schema: z.record(z.string(), z.unknown()).openapi({ description: 'Partial job fields to update' }) } } },
  },
  responses: {
    ...ok('Updated job posting.', Job),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/jobs/{id}',
  summary: 'Delete a job posting',
  description: 'Permanently removes a job posting and all associated applications.',
  tags: ['jobs'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    ...ok('Deleted job posting.', Job),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

// Applications

openApiRegistry.registerPath({
  method: 'post',
  path: '/applications',
  summary: 'Submit a job application',
  description: 'Creates an application for a candidate against a job. Status defaults to submitted. Duplicates are rejected.',
  tags: ['applications'],
  request: { body: { required: true, content: { 'application/json': { schema: CreateApplication } } } },
  responses: {
    ...ok('Application submitted.', Application),
    400: { description: 'Validation error or duplicate', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/applications',
  summary: 'List applications',
  description: 'Returns all applications. Filter by candidateId or jobId, or return all if no filter provided.',
  tags: ['applications'],
  request: {
    query: z.object({
      candidateId: z.string().uuid().optional().openapi({ description: 'Filter by candidate UUID' }),
      jobId: z.string().uuid().optional().openapi({ description: 'Filter by job UUID' }),
    }),
  },
  responses: { ...ok('Array of applications.', z.array(Application)) },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/applications/{id}',
  summary: 'Get an application by ID',
  tags: ['applications'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    ...ok('The application.', Application),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'patch',
  path: '/applications/{id}',
  summary: 'Update an application',
  description: 'Partially updates an application. Most commonly used to change status (shortlist, reject, accept).',
  tags: ['applications'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { required: true, content: { 'application/json': { schema: z.record(z.string(), z.unknown()).openapi({ description: 'Partial application fields to update' }) } } },
  },
  responses: {
    ...ok('Updated application.', Application),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/applications/{id}',
  summary: 'Withdraw an application',
  description: 'Permanently removes an application.',
  tags: ['applications'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    ...ok('Withdrawn application.', Application),
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

// Saved Jobs

openApiRegistry.registerPath({
  method: 'post',
  path: '/saved-jobs',
  summary: 'Bookmark a job',
  description: 'Bookmarks a job for a candidate. Duplicate bookmarks are silently ignored.',
  tags: ['saved-jobs'],
  request: { body: { required: true, content: { 'application/json': { schema: CreateSavedJob } } } },
  responses: {
    ...ok('Job bookmarked.', SavedJob),
    400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/saved-jobs',
  summary: 'List a candidate\'s bookmarked jobs',
  tags: ['saved-jobs'],
  request: {
    query: z.object({
      candidateId: z.string().uuid().openapi({ description: 'Candidate UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    }),
  },
  responses: { ...ok('Bookmarked jobs.', z.array(SavedJob)) },
});

openApiRegistry.registerPath({
  method: 'delete',
  path: '/saved-jobs/{id}',
  summary: 'Remove a bookmark',
  tags: ['saved-jobs'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    ...ok('Bookmark removed.', SavedJob),
    404: { description: 'Bookmark not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

// Auth (better-auth)

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/sign-in',
  summary: 'Sign in',
  description: 'Authenticates with email and password. Sets a session cookie on success.',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email().openapi({ description: 'Email address', example: 'alice@example.com' }),
            password: z.string().min(1).openapi({ description: 'Password' }),
          }).openapi('SignInRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Sign-in successful. Session cookie is set.',
      content: {
        'application/json': {
          schema: z.object({
            user: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
              emailVerified: z.boolean(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
            session: z.object({
              token: z.string(),
              expiresAt: z.string(),
            }),
          }).openapi('SignInResponse'),
        },
      },
    },
    401: { description: 'Invalid credentials', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/sign-up',
  summary: 'Register',
  description: 'Creates a new user account. Sets a session cookie on success.',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1).openapi({ description: 'Display name', example: 'Alice Smith' }),
            email: z.string().email().openapi({ description: 'Email address', example: 'alice@example.com' }),
            password: z.string().min(8).openapi({ description: 'Password (min 8 chars)' }),
          }).openapi('SignUpRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Account created. Session cookie is set.',
      content: {
        'application/json': {
          schema: z.object({
            user: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
              emailVerified: z.boolean(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
            session: z.object({
              token: z.string(),
              expiresAt: z.string(),
            }),
          }).openapi('SignUpResponse'),
        },
      },
    },
    400: { description: 'Validation error or email already in use', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/sign-out',
  summary: 'Sign out',
  description: 'Invalidates the current session and clears the session cookie.',
  tags: ['auth'],
  responses: {
    200: {
      description: 'Signed out successfully.',
      content: { 'application/json': { schema: z.object({ status: z.boolean() }).openapi('SignOutResponse') } },
    },
  },
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/auth/get-session',
  summary: 'Get current session',
  description: 'Returns the authenticated user and session from the session cookie. Returns null if not authenticated.',
  tags: ['auth'],
  responses: {
    200: {
      description: 'Current user and session, or null if unauthenticated.',
      content: {
        'application/json': {
          schema: z.object({
            session: z.object({
              token: z.string(),
              expiresAt: z.string(),
              userId: z.string(),
            }).nullable(),
            user: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
              emailVerified: z.boolean(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }).nullable(),
          }).openapi('SessionResponse'),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/request-password-reset',
  summary: 'Request password reset',
  description: 'Sends a password reset email if the account exists. Always returns success to prevent email enumeration.',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email().openapi({ description: 'Email address of the account', example: 'alice@example.com' }),
            redirectTo: z.string().optional().openapi({ description: 'URL the reset link should redirect to.', example: 'https://yourapp.com/reset-password' }),
          }).openapi('RequestPasswordResetRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Reset email sent if the address exists. Always returns success.',
      content: {
        'application/json': {
          schema: z.object({
            status: z.boolean().openapi({ example: true }),
            message: z.string().openapi({ example: 'If this email exists in our system, check your email for the reset link' }),
          }).openapi('RequestPasswordResetResponse'),
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/auth/reset-password',
  summary: 'Reset password',
  description: 'Resets the password using a valid reset token. Token expires after 1 hour by default.',
  tags: ['auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            newPassword: z.string().min(8).openapi({ description: 'New password (min 8 chars)' }),
            token: z.string().openapi({ description: 'Reset token from the email link' }),
          }).openapi('ResetPasswordRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset successfully.',
      content: { 'application/json': { schema: z.object({ status: z.boolean().openapi({ example: true }) }).openapi('ResetPasswordResponse') } },
    },
    400: { description: 'Invalid or expired token', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

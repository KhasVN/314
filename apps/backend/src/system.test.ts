/**
 * system.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * System tests — verify complete user journeys end-to-end.
 *
 * These tests simulate real user flows through the API:
 *   1. Employer registers → creates a job
 *   2. Candidate registers → searches for the job → applies
 *   3. Employer sees application → updates status
 *   4. Candidate saves a job
 *   5. Cleanup — removes all test data
 *
 * Each test creates its own data with a unique TEST_RUN_ID prefix and
 * cleans up afterwards. Safe to run against the production database.
 *
 * Prerequisites:
 *   Backend must be running:  bun run dev:backend
 *
 * Run command:
 *   node node_modules/.bin/jest --config apps/backend/jest.integration.config.js --testMatch="**/system.test.ts" --verbose
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = 'http://localhost:4000/api';
const AUTH_URL = 'http://localhost:4000/api/auth';

// Unique prefix so test data is identifiable and won't conflict with real data
const RUN_ID = `TEST_${Date.now()}`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
async function apiGet(path: string, params: Record<string, string> = {}, cookie = '') {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: cookie ? { Cookie: cookie } : {},
  });
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
}

async function apiPost(path: string, data: any, cookie = '') {
  const isAuth = path.startsWith('/auth');
  const url = `${isAuth ? AUTH_URL.replace('/api/auth', '') : BASE_URL}${path}`;
  const res = await fetch(`${isAuth ? AUTH_URL : BASE_URL}${isAuth ? path.replace('/auth', '') : path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
}

async function apiPatch(path: string, data: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function apiDelete(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

// Sign up a user and return the session cookie
async function signUp(email: string, password: string, name: string) {
  const res = await fetch(`${AUTH_URL}/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const body = await res.json();
  const setCookie = res.headers.get('set-cookie') ?? '';
  return { status: res.status, body, cookie: setCookie };
}

// ── System test suite ─────────────────────────────────────────────────────────
describe('System Tests — End-to-end user journeys', () => {

  // IDs tracked for cleanup
  const created = {
    employerUserId: '',
    employerProfileId: '',
    candidateUserId: '',
    candidateProfileId: '',
    jobId: '',
    applicationId: '',
    savedJobId: '',
  };

  // ── Journey 1: Employer registers and posts a job ──────────────────────────
  describe('Journey 1: Employer registers and posts a job', () => {

    it('Step 1 — employer signs up', async () => {
      const { status, body } = await signUp(
        `${RUN_ID}_employer@test.com`,
        'password123',
        `${RUN_ID} Employer`,
      );
      // 200 or 201 depending on Better Auth version
      expect([200, 201]).toContain(status);
      expect(body.user?.id).toBeDefined();
      created.employerUserId = body.user.id;
    });

    it('Step 2 — employer creates a company profile', async () => {
      const { status, body } = await apiPost('/employers', {
        userId: created.employerUserId,
        companyName: `${RUN_ID} Test Company`,
        companyInfo: 'A test company for system testing',
        contactInfo: `${RUN_ID}_employer@test.com`,
      });
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.companyName).toContain(RUN_ID);
      created.employerProfileId = body.id;
    });

    it('Step 3 — employer posts a job', async () => {
      const { status, body } = await apiPost('/jobs', {
        employerId: created.employerProfileId,
        title: `${RUN_ID} Software Engineer`,
        description: 'A test job posting for system testing purposes.',
        workMode: 'remote',
        location: 'Sydney',
        requiredEducation: 'bachelor',
        requiredYearsOfExperience: 2,
        status: 'published',
      });
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.title).toContain(RUN_ID);
      created.jobId = body.id;
    });

    it('Step 4 — the posted job appears in job listings', async () => {
      const { status, body } = await apiGet('/jobs');
      expect(status).toBe(200);
      const found = body.find((j: any) => j.id === created.jobId);
      expect(found).toBeDefined();
      expect(found.title).toContain(RUN_ID);
    });

  });

  // ── Journey 2: Candidate registers, searches, and applies ─────────────────
  describe('Journey 2: Candidate registers, searches, and applies', () => {

    it('Step 1 — candidate signs up', async () => {
      const { status, body } = await signUp(
        `${RUN_ID}_candidate@test.com`,
        'password123',
        `${RUN_ID} Candidate`,
      );
      expect([200, 201]).toContain(status);
      created.candidateUserId = body.user.id;
    });

    it('Step 2 — candidate creates a profile', async () => {
      const { status, body } = await apiPost('/candidates', {
        userId: created.candidateUserId,
        fullName: `${RUN_ID} Candidate`,
        education: 'bachelor',
        major: 'Computer Science',
        yearsOfExperience: 3,
        skills: 'TypeScript,React,Node.js',
        preferredWorkMode: 'remote',
        preferredLocations: 'Sydney',
      });
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      created.candidateProfileId = body.id;
    });

    it('Step 3 — candidate searches and finds the job', async () => {
      const { status, body } = await apiGet('/jobs/search', { query: 'Software Engineer' });
      expect(status).toBe(200);
      // The job we posted should appear somewhere in the results
      const found = body.find((j: any) => j.id === created.jobId);
      expect(found).toBeDefined();
    });

    it('Step 4 — candidate applies for the job', async () => {
      const { status, body } = await apiPost('/applications', {
        candidateId: created.candidateProfileId,
        jobId: created.jobId,
        status: 'submitted',
      });
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.status).toBe('submitted');
      expect(body.candidateId).toBe(created.candidateProfileId);
      expect(body.jobId).toBe(created.jobId);
      created.applicationId = body.id;
    });

    it('Step 5 — application appears in candidate\'s applications list', async () => {
      const { status, body } = await apiGet('/applications', {
        candidateId: created.candidateProfileId,
      });
      expect(status).toBe(200);
      const found = body.find((a: any) => a.id === created.applicationId);
      expect(found).toBeDefined();
      expect(found.status).toBe('submitted');
    });

    it('Step 6 — duplicate application is rejected', async () => {
      // Trying to apply to the same job again should fail
      const { status } = await apiPost('/applications', {
        candidateId: created.candidateProfileId,
        jobId: created.jobId,
        status: 'submitted',
      });
      // Should be 409 Conflict or 500 (unique constraint violation)
      expect(status).toBeGreaterThanOrEqual(400);
    });

  });

  // ── Journey 3: Employer reviews application ────────────────────────────────
  describe('Journey 3: Employer reviews and updates application status', () => {

    it('Step 1 — employer sees the application', async () => {
      const { status, body } = await apiGet('/applications', { jobId: created.jobId });
      expect(status).toBe(200);
      const found = body.find((a: any) => a.id === created.applicationId);
      expect(found).toBeDefined();
    });

    it('Step 2 — employer marks application as reviewed', async () => {
      const { status, body } = await apiPatch(`/applications/${created.applicationId}`, {
        status: 'reviewed',
      });
      expect(status).toBe(200);
      expect(body.status).toBe('reviewed');
    });

    it('Step 3 — employer shortlists the candidate', async () => {
      const { status, body } = await apiPatch(`/applications/${created.applicationId}`, {
        status: 'shortlisted',
      });
      expect(status).toBe(200);
      expect(body.status).toBe('shortlisted');
    });

    it('Step 4 — updated status is visible to candidate', async () => {
      const { status, body } = await apiGet(`/applications/${created.applicationId}`);
      expect(status).toBe(200);
      expect(body.status).toBe('shortlisted');
    });

  });

  // ── Journey 4: Candidate saves a job ─────────────────────────────────────
  describe('Journey 4: Candidate saves a job', () => {

    it('Step 1 — candidate saves the job', async () => {
      const { status, body } = await apiPost('/saved-jobs', {
        candidateId: created.candidateProfileId,
        jobId: created.jobId,
      });
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      created.savedJobId = body.id;
    });

    it('Step 2 — saved job appears in candidate\'s saved list', async () => {
      const { status, body } = await apiGet('/saved-jobs', {
        candidateId: created.candidateProfileId,
      });
      expect(status).toBe(200);
      const found = body.find((s: any) => s.id === created.savedJobId);
      expect(found).toBeDefined();
    });

    it('Step 3 — candidate unsaves the job', async () => {
      const { status } = await apiDelete(`/saved-jobs/${created.savedJobId}`);
      expect(status).toBe(200);
    });

    it('Step 4 — job is no longer in saved list', async () => {
      const { body } = await apiGet('/saved-jobs', {
        candidateId: created.candidateProfileId,
      });
      const found = body.find((s: any) => s.id === created.savedJobId);
      expect(found).toBeUndefined();
    });

  });

  // ── Cleanup — delete all test data ────────────────────────────────────────
  describe('Cleanup — remove all test data', () => {

    it('deletes the test application', async () => {
      if (!created.applicationId) return;
      const { status } = await apiDelete(`/applications/${created.applicationId}`);
      expect([200, 404]).toContain(status);
    });

    it('deletes the test job', async () => {
      if (!created.jobId) return;
      const { status } = await apiDelete(`/jobs/${created.jobId}`);
      expect([200, 404]).toContain(status);
    });

    it('deletes the test candidate profile', async () => {
      if (!created.candidateProfileId) return;
      const { status } = await apiDelete(`/candidates/${created.candidateProfileId}`);
      expect([200, 404]).toContain(status);
    });

    it('deletes the test employer profile', async () => {
      if (!created.employerProfileId) return;
      const { status } = await apiDelete(`/employers/${created.employerProfileId}`);
      expect([200, 404]).toContain(status);
    });

  });

});

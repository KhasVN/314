const BASE = 'http://localhost:4000/api';

async function get(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function post(path: string, data: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function patch(path: string, data: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function del(path: string) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

let employerProfileId = '';
let candidateProfileId = '';

// IDs for data created during the test (cleaned up at the end)
const created = { jobId: '', applicationId: '', savedJobId: '' };

describe('System Tests — End-to-end user journeys', () => {

  // Resolve real IDs before all tests run
  beforeAll(async () => {
    const employers  = await get('/employers');
    const candidates = await get('/candidates');

    if (employers.body.length === 0)  throw new Error('No employer profiles in DB. Add one first.');
    if (candidates.body.length === 0) throw new Error('No candidate profiles in DB. Add one first.');

    employerProfileId  = employers.body[0].id;
    candidateProfileId = candidates.body[0].id;
  });

  // Employer posts a job
  describe('Journey 1: Employer posts a job', () => {

    it('Step 1 — employer profile exists in the database', async () => {
      const { status, body } = await get(`/employers/${employerProfileId}`);
      expect(status).toBe(200);
      expect(body.id).toBe(employerProfileId);
    });

    it('Step 2 — employer creates a new job posting', async () => {
      const { status, body } = await post('/jobs', {
        employerId: employerProfileId,
        title: 'System Test Software Engineer',
        description: 'System test job — will be deleted after this test run.',
        workMode: 'remote',
        location: 'Sydney',
        requiredEducation: 'bachelor',
        requiredYearsOfExperience: 2,
        status: 'published',
      });
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      created.jobId = body.id;
    });

    it('Step 3 — posted job appears in the public job list', async () => {
      const { status, body } = await get('/jobs');
      expect(status).toBe(200);
      const found = body.find((j: any) => j.id === created.jobId);
      expect(found).toBeDefined();
    });

    it('Step 4 — job can be found via keyword search', async () => {
      const { status, body } = await get('/jobs/search', { query: 'System Test Software Engineer' });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

  });

  // Candidate searches and applies
  describe('Journey 2: Candidate searches and applies', () => {

    it('Step 1 — candidate profile exists in the database', async () => {
      const { status, body } = await get(`/candidates/${candidateProfileId}`);
      expect(status).toBe(200);
      expect(body.id).toBe(candidateProfileId);
    });

    it('Step 2 — candidate searches for remote software engineer jobs', async () => {
      const { status, body } = await get('/jobs/search', {
        query: 'software engineer',
        workMode: 'remote',
      });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('Step 3 — candidate applies for the system test job', async () => {
      const { status, body } = await post('/applications', {
        candidateId: candidateProfileId,
        jobId: created.jobId,
        status: 'submitted',
      });
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.status).toBe('submitted');
      created.applicationId = body.id;
    });

    it('Step 4 — application appears in candidate application list', async () => {
      const { status, body } = await get('/applications', {
        candidateId: candidateProfileId,
      });
      expect(status).toBe(200);
      const found = body.find((a: any) => a.id === created.applicationId);
      expect(found).toBeDefined();
      expect(found.status).toBe('submitted');
    });

    it('Step 5 — duplicate application is blocked', async () => {
      const { status } = await post('/applications', {
        candidateId: candidateProfileId,
        jobId: created.jobId,
        status: 'submitted',
      });
      expect(status).toBeGreaterThanOrEqual(400);
    });

  });

  // Employer reviews application
  describe('Journey 3: Employer reviews and updates application status', () => {

    it('Step 1 — employer can see the application on their job', async () => {
      const { status, body } = await get('/applications', { jobId: created.jobId });
      expect(status).toBe(200);
      const found = body.find((a: any) => a.id === created.applicationId);
      expect(found).toBeDefined();
    });

    it('Step 2 — employer marks application as reviewed', async () => {
      const { status, body } = await patch(`/applications/${created.applicationId}`, {
        status: 'reviewed',
      });
      expect(status).toBe(200);
      expect(body.status).toBe('reviewed');
    });

    it('Step 3 — employer shortlists the candidate', async () => {
      const { status, body } = await patch(`/applications/${created.applicationId}`, {
        status: 'shortlisted',
      });
      expect(status).toBe(200);
      expect(body.status).toBe('shortlisted');
    });

    it('Step 4 — updated status is visible when re-fetching the application', async () => {
      const { status, body } = await get(`/applications/${created.applicationId}`);
      expect(status).toBe(200);
      expect(body.status).toBe('shortlisted');
    });

  });

  // Candidate saves a job 
  describe('Journey 4: Candidate saves a job', () => {

    it('Step 1 — candidate saves the job', async () => {
      const { status, body } = await post('/saved-jobs', {
        candidateId: candidateProfileId,
        jobId: created.jobId,
      });
      expect(status).toBe(201);
      expect(body.id).toBeDefined();
      created.savedJobId = body.id;
    });

    it('Step 2 — saved job appears in candidate saved list', async () => {
      const { status, body } = await get('/saved-jobs', {
        candidateId: candidateProfileId,
      });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      const found = body.find((s: any) => s.id === created.savedJobId);
      expect(found).toBeDefined();
    });

    it('Step 3 — candidate unsaves the job', async () => {
      const { status } = await del(`/saved-jobs/${created.savedJobId}`);
      expect(status).toBe(200);
    });

    it('Step 4 — job no longer appears in saved list after unsave', async () => {
      const { status, body } = await get('/saved-jobs', {
        candidateId: candidateProfileId,
      });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      const found = body.find((s: any) => s.id === created.savedJobId);
      expect(found).toBeUndefined();
    });

  });

  // Cleanup
  describe('Cleanup — remove all test data', () => {

    it('deletes the test application', async () => {
      if (!created.applicationId) return;
      const { status } = await del(`/applications/${created.applicationId}`);
      expect([200, 404]).toContain(status);
    });

    it('deletes the test job posting', async () => {
      if (!created.jobId) return;
      const { status } = await del(`/jobs/${created.jobId}`);
      expect([200, 404]).toContain(status);
    });

  });

});

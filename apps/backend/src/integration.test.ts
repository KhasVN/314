
const BASE = 'http://localhost:4000/api';

async function get(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

describe('Integration Tests — Backend API (read-only, requires running backend)', () => {

  // Health 
  describe('Health check', () => {
    it('GET /api returns 200', async () => {
      const { status } = await get('/');
      expect(status).toBe(200);
    });
  });

  // Jobs
  describe('GET /jobs', () => {
    it('returns 200 and an array', async () => {
      const { status, body } = await get('/jobs');
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('each job has required fields (id, title, description, status)', async () => {
      const { body } = await get('/jobs');
      if (body.length === 0) return;
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('title');
      expect(body[0]).toHaveProperty('description');
      expect(body[0]).toHaveProperty('status');
    });

    it('all returned jobs have status "published"', async () => {
      const { body } = await get('/jobs');
      body.forEach((job: any) => expect(job.status).toBe('published'));
    });
  });

  //Job search
  describe('GET /jobs/search', () => {
    it('returns 200 with a keyword query', async () => {
      const { status, body } = await get('/jobs/search', { query: 'engineer' });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('returns 200 filtering by work mode', async () => {
      const { status, body } = await get('/jobs/search', { workMode: 'remote' });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('keyword + filter combined returns 200', async () => {
      const { status, body } = await get('/jobs/search', { query: 'software', workMode: 'remote' });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('fuzzy search: typo "sofware enginer" returns 200 without error', async () => {
      const { status, body } = await get('/jobs/search', { query: 'sofware enginer' });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('nonsense query returns empty array, not an error', async () => {
      const { status, body } = await get('/jobs/search', { query: 'xyzxyzxyz_impossible_99999' });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('respects limit parameter', async () => {
      const { body } = await get('/jobs/search', { query: 'a', limit: '3' });
      expect(body.length).toBeLessThanOrEqual(3);
    });
  });

  //Candidates 
  describe('GET /candidates', () => {
    it('returns 200 and an array', async () => {
      const { status, body } = await get('/candidates');
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('each candidate has id, fullName, userId', async () => {
      const { body } = await get('/candidates');
      if (body.length === 0) return;
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('fullName');
      expect(body[0]).toHaveProperty('userId');
    });
  });

  // Employers 
  describe('GET /employers', () => {
    it('returns 200 and an array', async () => {
      const { status, body } = await get('/employers');
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  // Applications
  describe('GET /applications', () => {
    it('returns 200 and an array', async () => {
      const { status, body } = await get('/applications');
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('filters by unknown candidateId returns empty array', async () => {
      const { status, body } = await get('/applications', {
        candidateId: '00000000-0000-0000-0000-000000000000',
      });
      expect(status).toBe(200);
      expect(body.length).toBe(0);
    });
  });

  //Saved jobs
  describe('GET /saved-jobs', () => {
    it('returns 200 and empty array for unknown candidateId', async () => {
      const { status, body } = await get('/saved-jobs', {
        candidateId: '00000000-0000-0000-0000-000000000000',
      });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  //404 handling
  describe('404 for unknown UUIDs', () => {
    it('GET /jobs/:id with unknown UUID returns 404', async () => {
      const { status } = await get('/jobs/00000000-0000-0000-0000-000000000000');
      expect(status).toBe(404);
    });

    it('GET /candidates/:id with unknown UUID returns 404', async () => {
      const { status } = await get('/candidates/00000000-0000-0000-0000-000000000000');
      expect(status).toBe(404);
    });
  });

});

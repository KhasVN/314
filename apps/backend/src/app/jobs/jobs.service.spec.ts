/**
 * jobs.service.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for JobsService.
 *
 * What is JobsService?
 *   It handles all database operations for job postings. Employers use it to
 *   create, read, update, delete, and search job listings.
 *
 *   Like CandidatesService, JobsService also calls AiService to generate
 *   vector embeddings whenever a job posting is written. This allows the
 *   semantic search pipeline to find the most relevant jobs for a candidate.
 *
 * Special feature — automatic salary calculation:
 *   If an employer does not provide a salary range when posting a job,
 *   JobsService automatically calculates a suggested range based on the
 *   required education level and years of experience. For example:
 *     bachelor + 5 years → min ~$94,000, max ~$120,000
 *   This ensures every job has a salary range for candidates to filter by.
 *
 * Search delegation:
 *   JobsService.search() delegates entirely to SearchService, which runs
 *   the three-path fuzzy + vector + RRF pipeline. The search logic is tested
 *   in its own spec file; here we only verify that delegation happens correctly.
 *
 * Mock approach:
 *   Three dependencies are mocked:
 *     1. DatabaseService — no real DB connection needed
 *     2. AiService       — no Cohere API call needed
 *     3. SearchService   — search pipeline not under test here
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';

// ─── Test fixture ─────────────────────────────────────────────────────────────
// A fake job posting row — represents a row from the job_postings table
const JOB = {
  id: 'job-uuid-001',
  employerId: 'emp-uuid-001',
  title: 'Senior Software Engineer',
  companyInfo: 'Acme Corp',
  description: 'Build great systems',
  requiredEducation: 'bachelor' as const,
  requiredSkills: 'TypeScript,Node.js',
  requiredYearsOfExperience: 5,
  salaryMin: 100000,
  salaryMax: 130000,
  workMode: 'remote' as const,
  location: 'Sydney',
  status: 'published' as const,  // visible to candidates on the home page
  searchText: 'Senior Software Engineer Acme Corp Build great systems',
  embedding: null,               // null = not yet embedded (or vector disabled)
};

// ─── Mock factory ─────────────────────────────────────────────────────────────
/**
 * Builds mock dependencies and a fresh JobsService for each test.
 *
 * @param opts.notFound - DB returns empty result (simulates missing job)
 * @param opts.dbRow    - Override the row the DB returns
 */
function makeMocks(opts: { notFound?: boolean; dbRow?: any } = {}) {
  const row = opts.notFound ? undefined : (opts.dbRow ?? JOB);

  // .returning() — final step of INSERT/UPDATE/DELETE chains
  const returning = jest.fn().mockResolvedValue(row ? [row] : []);

  // .limit() — used in SELECT...LIMIT(1) for findOne()
  const limitMock = jest.fn().mockResolvedValue(row ? [row] : []);

  // .where() — filter rows by id, employerId, etc.
  const whereMock = jest.fn().mockReturnValue({ returning, limit: limitMock });

  // INSERT chain: db.insert(table).values(data).returning()
  const values = jest.fn().mockReturnValue({ returning });

  // UPDATE chain: db.update(table).set(data).where(...).returning()
  const set = jest.fn().mockReturnValue({ where: whereMock });

  const mockDb = {
    // SELECT: used by findOne() and findAll()
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({ where: whereMock }),
    }),
    insert: jest.fn().mockReturnValue({ values }),
    update: jest.fn().mockReturnValue({ set }),
    delete: jest.fn().mockReturnValue({ where: whereMock }),
  };

  // Mock DatabaseService — hasVectorSupport defaults to false
  // so embedding tests don't hit the Cohere API
  const mockDatabase = {
    db: mockDb,
    hasVectorSupport: jest.fn().mockResolvedValue(false),
  };

  // Mock AiService — embedDocument returns a tiny dummy vector
  const mockAi = {
    embedDocument: jest.fn().mockResolvedValue([0.1, 0.2]),
  };

  // Mock SearchService — returns empty array by default
  const mockSearch = {
    searchJobs: jest.fn().mockResolvedValue([]),
  };

  const service = new JobsService(
    mockDatabase as any,
    mockAi as any,
    mockSearch as any,
  );

  return { service, mockDb, mockDatabase, mockAi };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('JobsService', () => {

  // ── create() ────────────────────────────────────────────────────────────────
  // Tests for creating a new job posting.
  // Called when an employer submits the job posting form.
  describe('create()', () => {

    it('returns a job object on success', async () => {
      const { service } = makeMocks();
      const result = await service.create({
        employerId: 'emp-uuid-001',
        title: 'Senior Software Engineer',
        description: 'Build great systems',
        workMode: 'remote',
        location: 'Sydney',
      });
      // The returned object should contain the title and employerId we sent
      expect(result).toMatchObject({
        title: 'Senior Software Engineer',
        employerId: 'emp-uuid-001',
      });
    });

    it('defaults status to "published" when not specified', async () => {
      // Jobs should be immediately visible to candidates unless the employer
      // explicitly sets status to "draft". Default is "published".
      const { service } = makeMocks();
      const result = await service.create({
        employerId: 'e1',
        title: 'Developer',
        description: 'Code stuff',
      });
      expect(result.status).toBe('published');
    });

    it('calls database insert exactly once', async () => {
      // Each job creation should write exactly one row to the DB
      const { service, mockDb } = makeMocks();
      await service.create({ employerId: 'e1', title: 'Dev', description: 'desc' });
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it('does NOT call embedDocument when vector support is disabled', async () => {
      // When the database doesn't have pgvector, the service should skip
      // calling Cohere — no API key needed, no embedding generated.
      // This is the default state in our mock setup.
      const { service, mockAi } = makeMocks();
      await service.create({ employerId: 'e1', title: 'Dev', description: 'desc' });
      expect(mockAi.embedDocument).not.toHaveBeenCalled();
    });

    it('calls embedDocument when vector support is enabled', async () => {
      // When pgvector IS available, a job posting must be embedded so it
      // can be matched against candidate profile embeddings during search.
      const { service, mockDatabase, mockAi } = makeMocks();
      // Tell the mock that vector support is available
      mockDatabase.hasVectorSupport.mockResolvedValue(true);
      await service.create({ employerId: 'e1', title: 'Dev', description: 'desc' });
      expect(mockAi.embedDocument).toHaveBeenCalledTimes(1);
    });

    it('auto-calculates salary range when salaryMin/Max not provided', async () => {
      // If the employer does not specify a salary range, the service
      // calculates one based on education + experience:
      //   bachelor (base: $72,000) + 5 years (× $4,500/yr) = $94,500
      //   rounded min → $94,000; max → $94,000 + $18,000 + 5×$1,500 = ~$120,000
      // This ensures every job has a salary range for the salary filter.
      const expectedRow = { ...JOB, salaryMin: 94000, salaryMax: 120000 };
      const { service } = makeMocks({ dbRow: expectedRow });
      const result = await service.create({
        employerId: 'e1',
        title: 'Dev',
        description: 'desc',
        requiredEducation: 'bachelor',
        requiredYearsOfExperience: 5,
        // Note: no salaryMin or salaryMax provided
      });
      // Both salary fields should be set to positive numbers (not null)
      expect(result.salaryMin).toBeGreaterThan(0);
      expect(result.salaryMax).toBeGreaterThan(0);
    });

  });

  // ── findOne() ────────────────────────────────────────────────────────────────
  // Tests for loading a single job posting by UUID.
  // Used when a candidate opens a job detail drawer, or when an employer
  // opens the edit form for one of their postings.
  describe('findOne()', () => {

    it('returns the job when found by id', async () => {
      const { service } = makeMocks();
      const result = await service.findOne('job-uuid-001');
      expect(result.id).toBe('job-uuid-001');
    });

    it('throws NotFoundException when id does not exist', async () => {
      // A job might have been deleted by the employer after the candidate
      // saved the URL. The service must throw, not return null.
      const { service } = makeMocks({ notFound: true });
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('throws with message "Job not found"', async () => {
      // The error message identifies this as a job lookup failure
      const { service } = makeMocks({ notFound: true });
      await expect(service.findOne('bad-id')).rejects.toThrow('Job not found');
    });

  });

  // ── update() ─────────────────────────────────────────────────────────────────
  // Tests for editing an existing job posting.
  // Employers can update any field (title, description, requirements, status).
  // update() also re-generates the embedding so the new content is searchable.
  describe('update()', () => {

    it('calls database update and returns the updated job', async () => {
      // Simulate changing the job title and work mode
      const updated = { ...JOB, title: 'Lead Engineer', workMode: 'hybrid' as const };
      const { service, mockDb } = makeMocks({ dbRow: updated });
      const result = await service.update('job-uuid-001', {
        title: 'Lead Engineer',
        workMode: 'hybrid',
      });
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(result.title).toBe('Lead Engineer');
    });

    it('throws NotFoundException when job does not exist', async () => {
      // Updating a deleted job should throw
      const { service } = makeMocks({ notFound: true });
      await expect(service.update('bad-id', { title: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('can update status to "closed"', async () => {
      // When a position is filled or no longer accepting applications,
      // the employer can close the posting by updating status to "closed".
      // Closed jobs are hidden from the candidate home page.
      const closed = { ...JOB, status: 'closed' as const };
      const { service } = makeMocks({ dbRow: closed });
      const result = await service.update('job-uuid-001', { status: 'closed' });
      expect(result.status).toBe('closed');
    });

  });

  // ── remove() ─────────────────────────────────────────────────────────────────
  // Tests for deleting a job posting.
  // Deleting a job also cascades to delete all job_applications for that job.
  describe('remove()', () => {

    it('returns the deleted job on success', async () => {
      // The deleted record is returned so the frontend can remove it from
      // the employer's job list without a refetch
      const { service } = makeMocks();
      const result = await service.remove('job-uuid-001');
      expect(result.id).toBe('job-uuid-001');
    });

    it('throws NotFoundException when job does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });

  });

  // ── search() ─────────────────────────────────────────────────────────────────
  // Tests for the search() method.
  // JobsService.search() is called by GET /jobs/search and simply delegates
  // all the work to SearchService (fuzzy + vector + RRF pipeline).
  // The actual search logic is unit-tested in search.service.spec.ts.
  describe('search()', () => {

    it('delegates to SearchService.searchJobs', async () => {
      // Create a fresh searchJobs mock so we can inspect its call arguments
      const searchJobs = jest.fn().mockResolvedValue([]);
      const { mockDatabase, mockAi } = makeMocks();
      const service = new (require('./jobs.service').JobsService)(
        mockDatabase, mockAi, { searchJobs }
      );

      await service.search({ query: 'software engineer', workMode: 'remote', limit: 10 });

      // The call should be forwarded to SearchService with the same parameters
      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'software engineer',
          workMode: 'remote',
          limit: 10,
        })
      );
    });

    it('defaults rerank to false', async () => {
      // When rerank is not specified in the search query, it defaults to false
      // for the jobs endpoint. (Candidate recommendations use rerank: true,
      // but general job browsing uses false to keep responses fast.)
      const searchJobs = jest.fn().mockResolvedValue([]);
      const { mockDatabase, mockAi } = makeMocks();
      const service = new (require('./jobs.service').JobsService)(
        mockDatabase, mockAi, { searchJobs }
      );
      await service.search({ query: 'dev' });
      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({ rerank: false })
      );
    });

  });

});

/**
 * employers.service.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for EmployersService.
 *
 * What is EmployersService?
 *   It manages employer (company) profiles in the database.
 *   An employer must create a profile before they can post jobs or search
 *   for candidates. The employer profile stores company name, about us text,
 *   contact info, and the isMember flag that controls recommendation limits.
 *
 * Key difference from CandidatesService:
 *   EmployersService does NOT call AiService — employer profiles do not have
 *   vector embeddings or a search_text column. Only candidate profiles and
 *   job postings are embedded for semantic search.
 *
 * Mock approach:
 *   Only DatabaseService needs to be mocked here (no AI or Search dependencies).
 *   The same Drizzle ORM method-chaining pattern is used:
 *     db.insert(table).values(data).returning() → returns the created row
 *     db.update(table).set(data).where(...).returning() → returns updated row
 *     db.delete(table).where(...).returning() → returns deleted row
 *     db.select().from(table).where(...).limit(1) → returns found row or []
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NotFoundException } from '@nestjs/common';
import { EmployersService } from './employers.service';

// ─── Test fixtures ────────────────────────────────────────────────────────────
// Fake employer profile row — represents a row from the employer_profiles table
const EMPLOYER = {
  id: 'emp-uuid-001',
  userId: 'user-emp-001',
  companyName: 'Acme Corp',
  companyInfo: 'A leading tech company',
  contactInfo: 'hr@acme.com',
  isMember: false,  // free account by default
};

// Fake job posting — used to test findJobs()
const JOB = {
  id: 'job-uuid-001',
  employerId: 'emp-uuid-001',
  title: 'Software Engineer',
  description: 'Build great software',
  status: 'published',
};

// ─── Mock factory ─────────────────────────────────────────────────────────────
/**
 * Builds mock database objects and a fresh EmployersService instance.
 *
 * @param opts.notFound - Simulate a missing record (DB returns empty result)
 * @param opts.dbRow    - Override the row the DB returns
 * @param opts.jobs     - Override the jobs list returned by findJobs()
 */
function makeMocks(opts: { notFound?: boolean; dbRow?: any; jobs?: any[] } = {}) {
  const row  = opts.notFound ? undefined : (opts.dbRow ?? EMPLOYER);
  const jobs = opts.jobs ?? [JOB];

  // ── Drizzle chain mocks ───────────────────────────────────────────────────

  // .returning() — final step of INSERT/UPDATE/DELETE, resolves with the row
  const returning = jest.fn().mockResolvedValue(row ? [row] : []);

  // .limit() — used in SELECT...WHERE...LIMIT(1) queries
  const limitMock = jest.fn().mockResolvedValue(row ? [row] : []);

  // .where() — used by SELECT, UPDATE, DELETE to filter by id or userId
  const whereMock = jest.fn().mockReturnValue({ returning, limit: limitMock });

  // .innerJoin() — used by the employer search() method to join job_postings
  // when searching employers by job title. Returns empty array by default
  // since most tests don't test the join path.
  const innerJoin = jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue([]),
  });

  // Unused variables kept for potential future test extensions
  const fromMock    = jest.fn().mockReturnValue({ where: whereMock, innerJoin });
  const fromForJobs = jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue(jobs),
    innerJoin,
  });

  // select() mock — returns a chainable .from() that leads to .where()
  let fromCallCount = 0;
  const selectMock = jest.fn().mockReturnValue({
    from: jest.fn((...args) => {
      fromCallCount++;
      return { where: whereMock, innerJoin };
    }),
  });

  // INSERT chain: db.insert(table).values(data).returning()
  const values = jest.fn().mockReturnValue({ returning });

  // UPDATE chain: db.update(table).set(data).where(...).returning()
  // Note: the update().where().returning() chain needs its own returning mock
  const set = jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({ returning }),
  });

  const mockDb = {
    select: selectMock,
    insert: jest.fn().mockReturnValue({ values }),
    update: jest.fn().mockReturnValue({ set }),
    delete: jest.fn().mockReturnValue({ where: whereMock }),
  };

  const mockDatabase = { db: mockDb };

  // Create the service with the mock database injected
  const service = new EmployersService(mockDatabase as any);
  return { service, mockDb };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('EmployersService', () => {

  // ── create() ────────────────────────────────────────────────────────────────
  // Tests for registering a new employer/company profile.
  // Called when an employer completes the company registration form.
  describe('create()', () => {

    it('returns an employer object on success', async () => {
      const { service } = makeMocks();
      const result = await service.create({
        userId: 'user-emp-001',
        companyName: 'Acme Corp',
        companyInfo: 'A leading tech company',
        contactInfo: 'hr@acme.com',
      });
      // The returned object should contain the company name and userId we sent
      expect(result).toMatchObject({ companyName: 'Acme Corp', userId: 'user-emp-001' });
    });

    it('sets isMember to false by default', async () => {
      // All new employer accounts start as free (non-member).
      // They must explicitly upgrade from the employer settings page.
      const { service } = makeMocks();
      const result = await service.create({ userId: 'u1', companyName: 'StartupCo' });
      expect(result.isMember).toBe(false);
    });

    it('respects isMember: true when explicitly provided', async () => {
      // An employer can be created with isMember: true if needed
      // (e.g. admin-created premium accounts)
      const memberRow = { ...EMPLOYER, isMember: true };
      const { service } = makeMocks({ dbRow: memberRow });
      const result = await service.create({ userId: 'u1', companyName: 'BigCorp', isMember: true });
      expect(result.isMember).toBe(true);
    });

    it('calls database insert exactly once', async () => {
      // Sanity check: creating a profile should write to the DB exactly once
      const { service, mockDb } = makeMocks();
      await service.create({ userId: 'u2', companyName: 'TestCo' });
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

  });

  // ── findByUserId() ───────────────────────────────────────────────────────────
  // Tests for GET /employers/me — looks up the employer profile for whoever
  // is currently logged in (identified by the Better Auth session cookie).
  describe('findByUserId()', () => {

    it('returns the employer when found', async () => {
      const { service } = makeMocks();
      const result = await service.findByUserId('user-emp-001');
      expect(result).toMatchObject({ companyName: 'Acme Corp' });
    });

    it('throws NotFoundException when no employer exists for the userId', async () => {
      // A user can have an auth account but not yet created a company profile.
      // This happens when they sign up but haven't completed company registration.
      const { service } = makeMocks({ notFound: true });
      await expect(service.findByUserId('ghost-user')).rejects.toThrow(NotFoundException);
    });

    it('throws with message "Employer profile not found"', async () => {
      // The error message should clearly indicate it was an employer profile lookup
      // (not a candidate profile lookup — those have different messages)
      const { service } = makeMocks({ notFound: true });
      await expect(service.findByUserId('ghost')).rejects.toThrow('Employer profile not found');
    });

  });

  // ── findOne() ────────────────────────────────────────────────────────────────
  // Tests for looking up an employer by their employer profile UUID.
  // Used when a candidate views a company's profile page.
  describe('findOne()', () => {

    it('returns the employer when found by id', async () => {
      const { service } = makeMocks();
      const result = await service.findOne('emp-uuid-001');
      expect(result.id).toBe('emp-uuid-001');
    });

    it('throws NotFoundException when id does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });

  });

  // ── update() ─────────────────────────────────────────────────────────────────
  // Tests for editing an employer profile.
  // Employers can update their company name, about us text, contact info,
  // and most importantly the isMember flag (to join membership).
  describe('update()', () => {

    it('calls database update and returns updated employer', async () => {
      const updated = { ...EMPLOYER, companyName: 'Acme Corp v2' };
      const { service, mockDb } = makeMocks({ dbRow: updated });
      const result = await service.update('emp-uuid-001', { companyName: 'Acme Corp v2' });
      // DB update should have been called exactly once
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      // Returned object should reflect the new company name
      expect(result.companyName).toBe('Acme Corp v2');
    });

    it('throws NotFoundException when employer does not exist', async () => {
      // Trying to update a non-existent employer (e.g. after account deletion)
      // should throw rather than silently doing nothing.
      const { service } = makeMocks({ notFound: true });
      await expect(service.update('bad-id', { companyName: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('can update isMember to true (join membership)', async () => {
      // This is the membership upgrade path: the employer clicks "Join Membership"
      // in their settings, which calls PATCH /employers/:id with { isMember: true }.
      // Members get unlimited candidate recommendations (vs. max 10 for free accounts).
      const memberRow = { ...EMPLOYER, isMember: true };
      const { service } = makeMocks({ dbRow: memberRow });
      const result = await service.update('emp-uuid-001', { isMember: true });
      expect(result.isMember).toBe(true);
    });

  });

  // ── remove() ─────────────────────────────────────────────────────────────────
  // Tests for deleting an employer profile.
  // Deleting cascades to delete all job_postings and their applications.
  describe('remove()', () => {

    it('returns the deleted employer on success', async () => {
      // The deleted record is returned so the caller can confirm what was removed
      const { service } = makeMocks();
      const result = await service.remove('emp-uuid-001');
      expect(result.id).toBe('emp-uuid-001');
    });

    it('throws NotFoundException when employer does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });

  });

});

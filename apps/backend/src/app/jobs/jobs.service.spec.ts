import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';

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
  status: 'published' as const,  
  searchText: 'Senior Software Engineer Acme Corp Build great systems',
  embedding: null,              
};


function makeMocks(opts: { notFound?: boolean; dbRow?: any } = {}) {
  const row = opts.notFound ? undefined : (opts.dbRow ?? JOB);

  const returning = jest.fn().mockResolvedValue(row ? [row] : []);

  const limitMock = jest.fn().mockResolvedValue(row ? [row] : []);

  const whereMock = jest.fn().mockReturnValue({ returning, limit: limitMock });

  const values = jest.fn().mockReturnValue({ returning });

  const set = jest.fn().mockReturnValue({ where: whereMock });

  const mockDb = {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({ where: whereMock }),
    }),
    insert: jest.fn().mockReturnValue({ values }),
    update: jest.fn().mockReturnValue({ set }),
    delete: jest.fn().mockReturnValue({ where: whereMock }),
  };

  const mockDatabase = {
    db: mockDb,
    hasVectorSupport: jest.fn().mockResolvedValue(false),
  };

  const mockAi = {
    embedDocument: jest.fn().mockResolvedValue([0.1, 0.2]),
  };

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

describe('JobsService', () => {

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
      expect(result).toMatchObject({
        title: 'Senior Software Engineer',
        employerId: 'emp-uuid-001',
      });
    });

    it('defaults status to "published" when not specified', async () => {
      const { service } = makeMocks();
      const result = await service.create({
        employerId: 'e1',
        title: 'Developer',
        description: 'Code stuff',
      });
      expect(result.status).toBe('published');
    });

    it('calls database insert exactly once', async () => {
      const { service, mockDb } = makeMocks();
      await service.create({ employerId: 'e1', title: 'Dev', description: 'desc' });
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it('does NOT call embedDocument when vector support is disabled', async () => {
      const { service, mockAi } = makeMocks();
      await service.create({ employerId: 'e1', title: 'Dev', description: 'desc' });
      expect(mockAi.embedDocument).not.toHaveBeenCalled();
    });

    it('calls embedDocument when vector support is enabled', async () => {
      const { service, mockDatabase, mockAi } = makeMocks();
      // Tell the mock that vector support is available
      mockDatabase.hasVectorSupport.mockResolvedValue(true);
      await service.create({ employerId: 'e1', title: 'Dev', description: 'desc' });
      expect(mockAi.embedDocument).toHaveBeenCalledTimes(1);
    });

    it('auto-calculates salary range when salaryMin/Max not provided', async () => {
      const expectedRow = { ...JOB, salaryMin: 94000, salaryMax: 120000 };
      const { service } = makeMocks({ dbRow: expectedRow });
      const result = await service.create({
        employerId: 'e1',
        title: 'Dev',
        description: 'desc',
        requiredEducation: 'bachelor',
        requiredYearsOfExperience: 5,
      });
      expect(result.salaryMin).toBeGreaterThan(0);
      expect(result.salaryMax).toBeGreaterThan(0);
    });

  });

  describe('findOne()', () => {

    it('returns the job when found by id', async () => {
      const { service } = makeMocks();
      const result = await service.findOne('job-uuid-001');
      expect(result.id).toBe('job-uuid-001');
    });

    it('throws NotFoundException when id does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('throws with message "Job not found"', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.findOne('bad-id')).rejects.toThrow('Job not found');
    });

  });

  describe('update()', () => {

    it('calls database update and returns the updated job', async () => {
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
      const { service } = makeMocks({ notFound: true });
      await expect(service.update('bad-id', { title: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('can update status to "closed"', async () => {
      const closed = { ...JOB, status: 'closed' as const };
      const { service } = makeMocks({ dbRow: closed });
      const result = await service.update('job-uuid-001', { status: 'closed' });
      expect(result.status).toBe('closed');
    });

  });

  describe('remove()', () => {

    it('returns the deleted job on success', async () => {
      const { service } = makeMocks();
      const result = await service.remove('job-uuid-001');
      expect(result.id).toBe('job-uuid-001');
    });

    it('throws NotFoundException when job does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });

  });

  describe('search()', () => {

    it('delegates to SearchService.searchJobs', async () => {
      const searchJobs = jest.fn().mockResolvedValue([]);
      const { mockDatabase, mockAi } = makeMocks();
      const service = new (require('./jobs.service').JobsService)(
        mockDatabase, mockAi, { searchJobs }
      );

      await service.search({ query: 'software engineer', workMode: 'remote', limit: 10 });

      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'software engineer',
          workMode: 'remote',
          limit: 10,
        })
      );
    });

    it('defaults rerank to false', async () => {
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

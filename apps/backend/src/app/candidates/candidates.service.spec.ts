
import { NotFoundException } from '@nestjs/common';
import { CandidatesService } from './candidates.service';

const CANDIDATE = {
  id: 'cand-uuid-001', userId: 'user-001', fullName: 'Alice Smith',
  contactInfo: 'alice@example.com', education: 'bachelor' as const,
  major: 'Computer Science', yearsOfExperience: 3, skills: 'Python,React',
  workExperience: '3 years at TechCo', preferredLocations: 'Sydney',
  preferredWorkMode: 'hybrid', resumeText: null, isMember: false,
  searchText: null, embedding: null,
};

function makeMocks(opts: { notFound?: boolean; dbRow?: any } = {}) {
  const row = opts.notFound ? undefined : (opts.dbRow ?? CANDIDATE);
  const returning = jest.fn().mockResolvedValue(row ? [row] : []);
  const where = jest.fn().mockReturnValue({ returning, limit: jest.fn().mockResolvedValue(row ? [row] : []) });
  const values = jest.fn().mockReturnValue({ returning });
  const set = jest.fn().mockReturnValue({ where });
  const mockDb = {
    select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(row ? [row] : []) }) }) }),
    insert: jest.fn().mockReturnValue({ values }),
    update: jest.fn().mockReturnValue({ set }),
    delete: jest.fn().mockReturnValue({ where }),
  };
  const mockDatabase = { db: mockDb, hasVectorSupport: jest.fn().mockResolvedValue(false) };
  const mockAi = { embedDocument: jest.fn().mockResolvedValue([0.1, 0.2]) };
  const mockSearch = { searchCandidates: jest.fn().mockResolvedValue([]) };
  const service = new CandidatesService(mockDatabase as any, mockAi as any, mockSearch as any);
  return { service, mockDb, mockDatabase, mockAi };
}

describe('CandidatesService', () => {

  describe('create()', () => {
    it('returns a candidate object on success', async () => {
      const { service } = makeMocks();
      const result = await service.create({ userId: 'user-001', fullName: 'Alice Smith' });
      expect(result).toMatchObject({ fullName: 'Alice Smith', userId: 'user-001' });
    });

    it('sets isMember to false by default', async () => {
      const { service } = makeMocks();
      const result = await service.create({ userId: 'u1', fullName: 'Bob' });
      expect(result.isMember).toBe(false);
    });

    it('calls database insert exactly once', async () => {
      const { service, mockDb } = makeMocks();
      await service.create({ userId: 'u2', fullName: 'Carol' });
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it('does NOT call embedDocument when vector support is disabled', async () => {
      const { service, mockAi } = makeMocks();
      await service.create({ userId: 'u3', fullName: 'Dave' });
      expect(mockAi.embedDocument).not.toHaveBeenCalled();
    });

    it('calls embedDocument when vector support is enabled', async () => {
      const { service, mockDatabase, mockAi } = makeMocks();
      mockDatabase.hasVectorSupport.mockResolvedValue(true);
      await service.create({ userId: 'u4', fullName: 'Eve' });
      expect(mockAi.embedDocument).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUserId()', () => {
    it('returns the candidate when found', async () => {
      const { service } = makeMocks();
      const result = await service.findByUserId('user-001');
      expect(result).toMatchObject({ userId: 'user-001' });
    });

    it('throws NotFoundException when no profile exists', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.findByUserId('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne()', () => {
    it('returns the candidate when found by id', async () => {
      const { service } = makeMocks();
      const result = await service.findOne('cand-uuid-001');
      expect(result.id).toBe('cand-uuid-001');
    });

    it('throws NotFoundException when id does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('calls database update and returns the updated candidate', async () => {
      const { service, mockDb } = makeMocks({ dbRow: { ...CANDIDATE, fullName: 'Alice Updated' } });
      const result = await service.update('cand-uuid-001', { fullName: 'Alice Updated' });
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(result.fullName).toBe('Alice Updated');
    });

    it('throws NotFoundException when candidate does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.update('bad-id', { fullName: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('returns the deleted candidate', async () => {
      const { service } = makeMocks();
      const result = await service.remove('cand-uuid-001');
      expect(result.id).toBe('cand-uuid-001');
    });

    it('throws NotFoundException when candidate does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

});

/**
 * applications.service.spec.ts — Unit tests for ApplicationsService
 *
 * No database, no network. Tests business logic in isolation.
 * Covers create, findOne, update (all 4 status transitions), remove, findAll.
 */
import { NotFoundException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

const APP = {
  id: 'app-001', candidateId: 'cand-001', jobId: 'job-001',
  status: 'submitted' as const, coverLetter: null,
};

function makeMocks(opts: { notFound?: boolean; dbRow?: any } = {}) {
  const row = opts.notFound ? undefined : (opts.dbRow ?? APP);
  const returning = jest.fn().mockResolvedValue(row ? [row] : []);
  const limitMock = jest.fn().mockResolvedValue(row ? [row] : []);
  const whereMock = jest.fn().mockReturnValue({ returning, limit: limitMock });
  const values = jest.fn().mockReturnValue({ returning });
  const set = jest.fn().mockReturnValue({ where: whereMock });
  const mockDb = {
    select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: whereMock }) }),
    insert: jest.fn().mockReturnValue({ values }),
    update: jest.fn().mockReturnValue({ set }),
    delete: jest.fn().mockReturnValue({ where: whereMock }),
  };
  const service = new ApplicationsService({ db: mockDb } as any);
  return { service, mockDb };
}

describe('ApplicationsService', () => {

  describe('create()', () => {
    it('returns an application with status submitted by default', async () => {
      const { service } = makeMocks();
      const result = await service.create({ candidateId: 'c1', jobId: 'j1' });
      expect(result.status).toBe('submitted');
    });

    it('stores coverLetter as null when not provided', async () => {
      const { service } = makeMocks();
      const result = await service.create({ candidateId: 'c1', jobId: 'j1' });
      expect(result.coverLetter).toBeNull();
    });

    it('calls database insert exactly once', async () => {
      const { service, mockDb } = makeMocks();
      await service.create({ candidateId: 'c1', jobId: 'j1' });
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne()', () => {
    it('returns the application when found', async () => {
      const { service } = makeMocks();
      const result = await service.findOne('app-001');
      expect(result.id).toBe('app-001');
    });

    it('throws NotFoundException when not found', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.findOne('bad-id')).rejects.toThrow('Application not found');
    });
  });

  describe('update() — status transitions', () => {
    it('updates status to reviewed', async () => {
      const { service } = makeMocks({ dbRow: { ...APP, status: 'reviewed' } });
      const result = await service.update('app-001', { status: 'reviewed' });
      expect(result.status).toBe('reviewed');
    });

    it('updates status to shortlisted', async () => {
      const { service } = makeMocks({ dbRow: { ...APP, status: 'shortlisted' } });
      const result = await service.update('app-001', { status: 'shortlisted' });
      expect(result.status).toBe('shortlisted');
    });

    it('updates status to accepted', async () => {
      const { service } = makeMocks({ dbRow: { ...APP, status: 'accepted' } });
      const result = await service.update('app-001', { status: 'accepted' });
      expect(result.status).toBe('accepted');
    });

    it('updates status to rejected', async () => {
      const { service } = makeMocks({ dbRow: { ...APP, status: 'rejected' } });
      const result = await service.update('app-001', { status: 'rejected' });
      expect(result.status).toBe('rejected');
    });

    it('throws NotFoundException when application does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.update('bad-id', { status: 'reviewed' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('returns the deleted application', async () => {
      const { service } = makeMocks();
      const result = await service.remove('app-001');
      expect(result.id).toBe('app-001');
    });

    it('throws NotFoundException when not found', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll()', () => {
    it('calls select without errors when no filters provided', () => {
      const { service, mockDb } = makeMocks();
      service.findAll();
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });

    it('accepts candidateId filter without throwing', () => {
      const { service } = makeMocks();
      expect(() => service.findAll({ candidateId: 'cand-001' })).not.toThrow();
    });

    it('accepts jobId filter without throwing', () => {
      const { service } = makeMocks();
      expect(() => service.findAll({ jobId: 'job-001' })).not.toThrow();
    });
  });

});

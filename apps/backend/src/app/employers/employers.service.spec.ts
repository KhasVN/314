
import { NotFoundException } from '@nestjs/common';
import { EmployersService } from './employers.service';

const EMPLOYER = {
  id: 'emp-uuid-001',
  userId: 'user-emp-001',
  companyName: 'Acme Corp',
  companyInfo: 'A leading tech company',
  contactInfo: 'hr@acme.com',
  isMember: false,  
};

const JOB = {
  id: 'job-uuid-001',
  employerId: 'emp-uuid-001',
  title: 'Software Engineer',
  description: 'Build great software',
  status: 'published',
};


function makeMocks(opts: { notFound?: boolean; dbRow?: any; jobs?: any[] } = {}) {
  const row  = opts.notFound ? undefined : (opts.dbRow ?? EMPLOYER);
  const jobs = opts.jobs ?? [JOB];


  const returning = jest.fn().mockResolvedValue(row ? [row] : []);

  const limitMock = jest.fn().mockResolvedValue(row ? [row] : []);

  const whereMock = jest.fn().mockReturnValue({ returning, limit: limitMock });

  const innerJoin = jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue([]),
  });

  const fromMock    = jest.fn().mockReturnValue({ where: whereMock, innerJoin });
  const fromForJobs = jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue(jobs),
    innerJoin,
  });

  let fromCallCount = 0;
  const selectMock = jest.fn().mockReturnValue({
    from: jest.fn((...args) => {
      fromCallCount++;
      return { where: whereMock, innerJoin };
    }),
  });

  const values = jest.fn().mockReturnValue({ returning });

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

describe('EmployersService', () => {

  describe('create()', () => {

    it('returns an employer object on success', async () => {
      const { service } = makeMocks();
      const result = await service.create({
        userId: 'user-emp-001',
        companyName: 'Acme Corp',
        companyInfo: 'A leading tech company',
        contactInfo: 'hr@acme.com',
      });
      expect(result).toMatchObject({ companyName: 'Acme Corp', userId: 'user-emp-001' });
    });

    it('sets isMember to false by default', async () => {
      const { service } = makeMocks();
      const result = await service.create({ userId: 'u1', companyName: 'StartupCo' });
      expect(result.isMember).toBe(false);
    });

    it('respects isMember: true when explicitly provided', async () => {
      const memberRow = { ...EMPLOYER, isMember: true };
      const { service } = makeMocks({ dbRow: memberRow });
      const result = await service.create({ userId: 'u1', companyName: 'BigCorp', isMember: true });
      expect(result.isMember).toBe(true);
    });

    it('calls database insert exactly once', async () => {
      const { service, mockDb } = makeMocks();
      await service.create({ userId: 'u2', companyName: 'TestCo' });
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

  });

  describe('findByUserId()', () => {

    it('returns the employer when found', async () => {
      const { service } = makeMocks();
      const result = await service.findByUserId('user-emp-001');
      expect(result).toMatchObject({ companyName: 'Acme Corp' });
    });

    it('throws NotFoundException when no employer exists for the userId', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.findByUserId('ghost-user')).rejects.toThrow(NotFoundException);
    });

    it('throws with message "Employer profile not found"', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.findByUserId('ghost')).rejects.toThrow('Employer profile not found');
    });

  });

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

  describe('update()', () => {

    it('calls database update and returns updated employer', async () => {
      const updated = { ...EMPLOYER, companyName: 'Acme Corp v2' };
      const { service, mockDb } = makeMocks({ dbRow: updated });
      const result = await service.update('emp-uuid-001', { companyName: 'Acme Corp v2' });
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(result.companyName).toBe('Acme Corp v2');
    });

    it('throws NotFoundException when employer does not exist', async () => {
      const { service } = makeMocks({ notFound: true });
      await expect(service.update('bad-id', { companyName: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('can update isMember to true (join membership)', async () => {
      const memberRow = { ...EMPLOYER, isMember: true };
      const { service } = makeMocks({ dbRow: memberRow });
      const result = await service.update('emp-uuid-001', { isMember: true });
      expect(result.isMember).toBe(true);
    });

  });

  describe('remove()', () => {

    it('returns the deleted employer on success', async () => {
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

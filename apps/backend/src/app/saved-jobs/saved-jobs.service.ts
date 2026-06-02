import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { savedJobs } from '../../db/domain-schema';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SavedJobsService {
  constructor(private readonly database: DatabaseService) {}

  async create(candidateId: string, jobId: string) {
    const [saved] = await this.database.db
      .insert(savedJobs)
      .values({ id: randomUUID(), candidateId, jobId })
      .returning();
    return saved;
  }

  findAll(candidateId: string) {
    return this.database.db
      .select()
      .from(savedJobs)
      .where(eq(savedJobs.candidateId, candidateId));
  }

  async remove(id: string) {
    const [removed] = await this.database.db
      .delete(savedJobs)
      .where(eq(savedJobs.id, id))
      .returning();
    if (!removed) throw new NotFoundException('Saved job not found');
    return removed;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { jobApplications } from '../../db/domain-schema';
import { DatabaseService } from '../database/database.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly database: DatabaseService) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const [application] = await this.database.db
      .insert(jobApplications)
      .values({
        id: randomUUID(),
        candidateId: createApplicationDto.candidateId,
        jobId: createApplicationDto.jobId,
        status: createApplicationDto.status ?? 'submitted',
        coverLetter: createApplicationDto.coverLetter,
      })
      .returning();

    return application;
  }

  // ── findAll ───────────────────────────────────────────────────
  // Fetches job applications from the database with optional filters.
  // If candidateId is provided → returns only that candidate's applications
  // If jobId is provided       → returns only applications for that job
  // If neither is provided     → returns all applications in the database
  findAll(filters?: { candidateId?: string; jobId?: string }) {
    const query = this.database.db.select().from(jobApplications);
    if (filters?.candidateId) {
      return query.where(eq(jobApplications.candidateId, filters.candidateId));
    }
    if (filters?.jobId) {
      return query.where(eq(jobApplications.jobId, filters.jobId));
    }
    return query;
  }

  async findOne(id: string) {
    const [application] = await this.database.db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, id))
      .limit(1);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    const [application] = await this.database.db
      .update(jobApplications)
      .set(updateApplicationDto)
      .where(eq(jobApplications.id, id))
      .returning();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async remove(id: string) {
    const [application] = await this.database.db
      .delete(jobApplications)
      .where(eq(jobApplications.id, id))
      .returning();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }
}

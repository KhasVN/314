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

  findAll() {
    return this.database.db.select().from(jobApplications);
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

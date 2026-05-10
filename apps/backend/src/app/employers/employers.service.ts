import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, or, ilike } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { employerProfiles, jobPostings } from '../../db/domain-schema';
import { DatabaseService } from '../database/database.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';

@Injectable()
export class EmployersService {
  constructor(private readonly database: DatabaseService) {}

  async create(createEmployerDto: CreateEmployerDto) {
    const [employer] = await this.database.db
      .insert(employerProfiles)
      .values({
        id: randomUUID(),
        userId: createEmployerDto.userId,
        companyName: createEmployerDto.companyName,
        companyInfo: createEmployerDto.companyInfo,
        contactInfo: createEmployerDto.contactInfo,
        isMember: createEmployerDto.isMember ?? false,
      })
      .returning();

    return employer;
  }

  findAll() {
    return this.database.db.select().from(employerProfiles);
  }

  async findByUserId(userId: string) {
    const [employer] = await this.database.db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, userId))
      .limit(1);

    if (!employer) {
      throw new NotFoundException('Employer profile not found');
    }

    return employer;
  }

  // ── SEARCH employers by company name OR job title ─────────
  // Searches employer_profiles.company_name and job_postings.title
  // using case-insensitive ILIKE matching (fuzzy search).
  // Returns unique employers that match either field.
  async search(query: string) {
    if (!query?.trim()) return this.findAll();

    const pattern = `%${query.trim()}%`;

    // Search by company name directly
    const byName = await this.database.db
      .select()
      .from(employerProfiles)
      .where(
        or(
          ilike(employerProfiles.companyName, pattern),
          ilike(employerProfiles.companyInfo, pattern),
        )
      );

    // Search by job title — find employers who have matching job postings
    const byJobTitle = await this.database.db
      .select({ employer: employerProfiles })
      .from(jobPostings)
      .innerJoin(employerProfiles, eq(jobPostings.employerId, employerProfiles.id))
      .where(ilike(jobPostings.title, pattern));

    // Merge and deduplicate by employer id
    const seen = new Set<string>();
    const results = [...byName];
    for (const row of byJobTitle) {
      if (!seen.has(row.employer.id)) {
        seen.add(row.employer.id);
        if (!results.find(e => e.id === row.employer.id)) {
          results.push(row.employer);
        }
      }
    }
    return results;
  }
  
  async findOne(id: string) {
    const [employer] = await this.database.db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.id, id))
      .limit(1);

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    return employer;
  }

  // Get all job postings for a specific employer
  async findJobs(employerId: string) {
    return this.database.db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.employerId, employerId));
  }
  
  async update(id: string, updateEmployerDto: UpdateEmployerDto) {
    const [employer] = await this.database.db
      .update(employerProfiles)
      .set(updateEmployerDto)
      .where(eq(employerProfiles.id, id))
      .returning();

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    return employer;
  }

  async remove(id: string) {
    const [employer] = await this.database.db
      .delete(employerProfiles)
      .where(eq(employerProfiles.id, id))
      .returning();

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    return employer;
  }
}

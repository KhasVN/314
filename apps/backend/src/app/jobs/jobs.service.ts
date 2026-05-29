import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { JobSearchQueryDto } from '@talent-matching/dtos';
import { jobPostings } from '../../db/domain-schema';
import { AiService } from '../ai/ai.service';
import { buildSearchText } from '../ai/search-text';
import { DatabaseService } from '../database/database.service';
import { SearchService } from '../search/search.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly ai: AiService,
    private readonly searchService: SearchService,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const id = randomUUID();
    const salary = this.salaryRange(createJobDto);
    const next = { ...createJobDto, ...salary };
    const searchText = this.toSearchText(next);
    const embedding = await this.safeEmbedding(searchText);
    const [job] = await this.database.db
      .insert(jobPostings)
      .values({
        id,
        employerId: next.employerId,
        title: next.title,
        companyInfo: next.companyInfo,
        description: next.description,
        requiredEducation: next.requiredEducation,
        requiredSkills: next.requiredSkills,
        requiredYearsOfExperience: next.requiredYearsOfExperience,
        salaryMin: next.salaryMin,
        salaryMax: next.salaryMax,
        workMode: next.workMode,
        location: next.location,
        status: next.status ?? 'published',
        searchText,
        embedding: embedding.length ? embedding : null,
      })
      .returning();

    return job;
  }

  findAll() {
    return this.database.db
      .select({
        id: jobPostings.id,
        employerId: jobPostings.employerId,
        title: jobPostings.title,
        description: sql<string>`''`,
        companyInfo: jobPostings.companyInfo,
        requiredEducation: jobPostings.requiredEducation,
        requiredSkills: jobPostings.requiredSkills,
        requiredYearsOfExperience: jobPostings.requiredYearsOfExperience,
        salaryMin: jobPostings.salaryMin,
        salaryMax: jobPostings.salaryMax,
        workMode: jobPostings.workMode,
        location: jobPostings.location,
        status: jobPostings.status,
      })
      .from(jobPostings);
  }

  async findOne(id: string) {
    const [job] = await this.database.db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, id))
      .limit(1);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const current = await this.findOne(id);
    const next = { ...current, ...updateJobDto };
    const salary = this.salaryRange(next);
    next.salaryMin = salary.salaryMin;
    next.salaryMax = salary.salaryMax;
    const searchText = this.toSearchText(next);
    const embedding = await this.safeEmbedding(searchText);
    const [job] = await this.database.db
      .update(jobPostings)
      .set({
        title: next.title,
        companyInfo: next.companyInfo,
        description: next.description,
        requiredEducation: next.requiredEducation,
        requiredSkills: next.requiredSkills,
        requiredYearsOfExperience: next.requiredYearsOfExperience,
        salaryMin: next.salaryMin,
        salaryMax: next.salaryMax,
        workMode: next.workMode,
        location: next.location,
        status: next.status,
        searchText,
        embedding: embedding.length ? embedding : current.embedding,
      })
      .where(eq(jobPostings.id, id))
      .returning();

    return job;
  }

  async remove(id: string) {
    const [job] = await this.database.db
      .delete(jobPostings)
      .where(eq(jobPostings.id, id))
      .returning();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  search(query: JobSearchQueryDto) {
    return this.searchService.searchJobs({
      query: query.query,
      candidateId: query.candidateId,
      workMode: query.workMode,
      location: query.location,
      requiredEducation: query.requiredEducation,
      yearsOfExperience: query.yearsOfExperience,
      salaryMin: query.salaryMin,
      salaryMax: query.salaryMax,
      limit: query.limit,
      rerank: query.rerank ?? false,
    });
  }

  private toSearchText(job: CreateJobDto | (CreateJobDto & { id?: string })) {
    return buildSearchText([
      job.title,
      job.companyInfo,
      job.description,
      job.requiredEducation,
      job.requiredSkills,
      job.requiredYearsOfExperience,
      job.salaryMin,
      job.salaryMax,
      job.workMode,
      job.location,
    ]);
  }

  private async safeEmbedding(text: string) {
    if (!(await this.database.hasVectorSupport())) {
      return [];
    }

    try {
      return await this.ai.embedDocument(text);
    } catch {
      return [];
    }
  }

  private salaryRange(job: {
    requiredEducation?: string | null;
    requiredYearsOfExperience?: number | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
  }) {
    if (job.salaryMin != null || job.salaryMax != null) {
      const min = job.salaryMin ?? job.salaryMax ?? null;
      const max = job.salaryMax ?? job.salaryMin ?? null;
      return { salaryMin: min, salaryMax: max && min ? Math.max(max, min) : max };
    }

    const educationBase: Record<string, number> = {
      high_school: 52000,
      diploma: 60000,
      bachelor: 72000,
      master: 85000,
      phd: 98000,
      other: 58000,
    };
    const base = educationBase[job.requiredEducation ?? 'other'] ?? educationBase.other;
    const years = job.requiredYearsOfExperience ?? 0;
    const min = base + years * 4500;
    return {
      salaryMin: Math.round(min / 1000) * 1000,
      salaryMax: Math.round((min + 18000 + years * 1500) / 1000) * 1000,
    };
  }

}

import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { jobPostings } from '../../db/domain-schema';
import { AiService } from '../ai/ai.service';
import { buildBm25Document, buildSearchText } from '../ai/search-text';
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
    const searchText = this.toSearchText(createJobDto);
    const embedding = await this.safeEmbedding(searchText);
    const [job] = await this.database.db
      .insert(jobPostings)
      .values({
        id,
        employerId: createJobDto.employerId,
        title: createJobDto.title,
        companyInfo: createJobDto.companyInfo,
        description: createJobDto.description,
        requiredEducation: createJobDto.requiredEducation,
        requiredSkills: createJobDto.requiredSkills,
        requiredYearsOfExperience: createJobDto.requiredYearsOfExperience,
        workMode: createJobDto.workMode,
        location: createJobDto.location,
        status: createJobDto.status ?? 'published',
        searchText,
        bm25Description: buildBm25Document(id, createJobDto.description),
        bm25Document: buildBm25Document(id, searchText),
        embedding: embedding.length ? embedding : null,
      })
      .returning();

    await this.searchService.rebuildJobIndexes();
    return job;
  }

  findAll() {
    return this.database.db.select().from(jobPostings);
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
        workMode: next.workMode,
        location: next.location,
        status: next.status,
        searchText,
        bm25Description: buildBm25Document(id, next.description),
        bm25Document: buildBm25Document(id, searchText),
        embedding: embedding.length ? embedding : current.embedding,
      })
      .where(eq(jobPostings.id, id))
      .returning();

    await this.searchService.rebuildJobIndexes();
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

    await this.searchService.rebuildJobIndexes();
    return job;
  }

  search(query: Record<string, string | undefined>) {
    return this.searchService.searchJobs({
      query: query.query,
      candidateId: query.candidateId,
      workMode: query.workMode as any,
      location: query.location,
      requiredEducation: query.requiredEducation as any,
      yearsOfExperience: this.optionalNumber(query.yearsOfExperience),
      limit: this.optionalNumber(query.limit),
      rerank: query.rerank !== 'false',
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

  private optionalNumber(value: string | undefined) {
    if (!value) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}

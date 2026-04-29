import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { candidateProfiles } from '../../db/domain-schema';
import { AiService } from '../ai/ai.service';
import { buildSearchText } from '../ai/search-text';
import { DatabaseService } from '../database/database.service';
import { SearchService } from '../search/search.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly ai: AiService,
    private readonly searchService: SearchService,
  ) {}

  async create(createCandidateDto: CreateCandidateDto) {
    const id = randomUUID();
    const searchText = this.toSearchText(createCandidateDto);
    const embedding = await this.safeEmbedding(searchText);
    const [candidate] = await this.database.db
      .insert(candidateProfiles)
      .values({
        id,
        userId: createCandidateDto.userId,
        fullName: createCandidateDto.fullName,
        contactInfo: createCandidateDto.contactInfo,
        education: createCandidateDto.education,
        major: createCandidateDto.major,
        yearsOfExperience: createCandidateDto.yearsOfExperience,
        skills: createCandidateDto.skills,
        resumeText: createCandidateDto.resumeText,
        searchText,
        embedding: embedding.length ? embedding : null,
      })
      .returning();

    return candidate;
  }

  findAll() {
    return this.database.db.select().from(candidateProfiles);
  }

  async findOne(id: string) {
    const [candidate] = await this.database.db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.id, id))
      .limit(1);

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto) {
    const current = await this.findOne(id);
    const next = { ...current, ...updateCandidateDto };
    const searchText = this.toSearchText(next);
    const embedding = await this.safeEmbedding(searchText);
    const [candidate] = await this.database.db
      .update(candidateProfiles)
      .set({
        fullName: next.fullName,
        contactInfo: next.contactInfo,
        education: next.education,
        major: next.major,
        yearsOfExperience: next.yearsOfExperience,
        skills: next.skills,
        resumeText: next.resumeText,
        searchText,
        embedding: embedding.length ? embedding : current.embedding,
      })
      .where(eq(candidateProfiles.id, id))
      .returning();

    return candidate;
  }

  async remove(id: string) {
    const [candidate] = await this.database.db
      .delete(candidateProfiles)
      .where(eq(candidateProfiles.id, id))
      .returning();

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  search(query: Record<string, string | undefined>) {
    return this.searchService.searchCandidates({
      query: query.query,
      jobId: query.jobId,
      education: query.education as any,
      location: query.location,
      minYearsOfExperience: this.optionalNumber(query.minYearsOfExperience),
      limit: this.optionalNumber(query.limit),
      rerank: query.rerank !== 'false',
    });
  }

  private toSearchText(candidate: CreateCandidateDto) {
    return buildSearchText([
      candidate.fullName,
      candidate.contactInfo,
      candidate.education,
      candidate.major,
      candidate.yearsOfExperience,
      candidate.skills,
      candidate.resumeText,
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

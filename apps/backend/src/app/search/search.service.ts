import { Injectable } from '@nestjs/common';
import { and, eq, inArray, sql, type SQL } from 'drizzle-orm';
import {
  candidateProfiles,
  employerProfiles,
  jobPostings,
  type educationLevel,
  type workMode,
} from '../../db/domain-schema';
import { AiService } from '../ai/ai.service';
import { DatabaseService } from '../database/database.service';

type RankedId = {
  id: string;
  rank: number;
};

type SearchRow = {
  id: string;
};

type SearchResult<T> = T & {
  rrfScore: number;
  rerankScore?: number;
};

type EducationLevel = (typeof educationLevel.enumValues)[number];
type WorkMode = (typeof workMode.enumValues)[number];

export type JobSearchInput = {
  query?: string;
  candidateId?: string;
  workMode?: WorkMode;
  location?: string;
  requiredEducation?: EducationLevel;
  yearsOfExperience?: number;
  salaryMin?: number;
  salaryMax?: number;
  limit?: number;
  rerank?: boolean;
};

export type CandidateSearchInput = {
  query?: string;
  jobId?: string;
  employerId?: string;
  education?: EducationLevel;
  location?: string;
  workMode?: WorkMode;
  minYearsOfExperience?: number;
  limit?: number;
  rerank?: boolean;
};

@Injectable()
export class SearchService {
  constructor(
    private readonly database: DatabaseService,
    private readonly ai: AiService,
  ) {}

  async searchJobs(input: JobSearchInput) {
    const query = input.query?.trim() ?? '';
    const candidate = input.candidateId
      ? await this.findCandidate(input.candidateId)
      : undefined;
    const limit = this.limit(input.limit, Boolean(candidate?.isMember));
    const poolLimit = Math.max(limit * 5, 30);
    const yearsOfExperience =
      input.yearsOfExperience ?? candidate?.yearsOfExperience ?? undefined;
    const education =
      input.requiredEducation ?? candidate?.education ?? undefined;
    const vector = await this.vectorForSearch(candidate?.embedding, query);

    const lists = await Promise.all([
      this.rankJobsByFuzzy(
        query,
        input,
        education,
        yearsOfExperience,
        poolLimit,
      ),
      this.rankJobsByVector(
        vector,
        input,
        education,
        yearsOfExperience,
        poolLimit,
      ),
    ]);

    let fused = this.fuse(lists).slice(0, Math.max(limit * 2, limit));

    if (fused.length === 0) {
      fused = await this.browseJobsRanked(
        input,
        education,
        yearsOfExperience,
        Math.max(limit * 2, limit),
      );
    }
    const rows = await this.findJobsByIds(fused.map((item) => item.id));
    const scored = this.attachScores(rows, fused, (row) => row.id);

    return input.rerank === false
      ? scored.slice(0, limit)
      : this.rerank(query, scored, limit, (job) =>
          [
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
          ]
            .filter(Boolean)
            .join(' '),
        );
  }

  async searchCandidates(input: CandidateSearchInput) {
    let resolvedJobId = input.jobId;
    if (!resolvedJobId && input.employerId) {
      resolvedJobId =
        (await this.findLatestPublishedJobIdForEmployer(input.employerId)) ??
        undefined;
    }

    const job = resolvedJobId ? await this.findJob(resolvedJobId) : undefined;
    const query = (
      input.query ??
      job?.searchText ??
      job?.description ??
      ''
    ).trim();
    const minYearsOfExperience =
      input.minYearsOfExperience ?? job?.requiredYearsOfExperience ?? undefined;
    const education = input.education ?? job?.requiredEducation ?? undefined;
    const limit = this.limit(input.limit, Boolean(job?.employerIsMember));
    const poolLimit = Math.max(limit * 5, 30);
    const vector = await this.vectorForSearch(job?.embedding, query);

    const lists = await Promise.all([
      this.rankCandidatesByFuzzy(
        query,
        input,
        education,
        minYearsOfExperience,
        poolLimit,
      ),
      this.rankCandidatesByVector(
        vector,
        input,
        education,
        minYearsOfExperience,
        poolLimit,
      ),
    ]);

    let fused = this.fuse(lists).slice(0, Math.max(limit * 2, limit));

    if (fused.length === 0) {
      fused = await this.browseCandidatesRanked(
        input,
        education,
        minYearsOfExperience,
        Math.max(limit * 2, limit),
      );
    }

    const rows = await this.findCandidatesByIds(fused.map((item) => item.id));
    const scored = this.attachScores(rows, fused, (row) => row.id);

    return input.rerank === false
      ? scored.slice(0, limit)
      : this.rerank(query, scored, limit, (candidate) =>
          [
            candidate.fullName,
            candidate.education,
            candidate.major,
            candidate.yearsOfExperience,
            candidate.skills,
            candidate.workExperience,
            candidate.preferredLocations,
            candidate.preferredWorkMode,
            candidate.resumeText,
          ]
            .filter(Boolean)
            .join(' '),
        );
  }

  private async browseJobsRanked(
    input: JobSearchInput,
    education: EducationLevel | undefined,
    yearsOfExperience: number | undefined,
    limit: number,
  ): Promise<{ id: string; score: number }[]> {
    try {
      const result = await this.database.db.execute<SearchRow>(sql`
        SELECT jp.id::text AS id
        FROM job_postings jp
        ${this.where([
          ...this.jobFilters(input, education, yearsOfExperience, 'jp'),
        ])}
        ORDER BY jp.title ASC
        LIMIT ${limit}
      `);
      const ranked = this.rank(this.rows(result));
      return ranked.map((r, i) => ({
        id: r.id,
        score: 1 / (60 + i + 1),
      }));
    } catch {
      return [];
    }
  }

  private async browseCandidatesRanked(
    input: CandidateSearchInput,
    education: EducationLevel | undefined,
    minYearsOfExperience: number | undefined,
    limit: number,
  ): Promise<{ id: string; score: number }[]> {
    try {
      const result = await this.database.db.execute<SearchRow>(sql`
        SELECT cp.id::text AS id
        FROM candidate_profiles cp
        ${this.where([
          ...this.candidateFilters(
            input,
            education,
            minYearsOfExperience,
            'cp',
          ),
        ])}
        ORDER BY cp.full_name ASC
        LIMIT ${limit}
      `);
      const ranked = this.rank(this.rows(result));
      return ranked.map((r, i) => ({
        id: r.id,
        score: 1 / (60 + i + 1),
      }));
    } catch {
      return [];
    }
  }

  private async findLatestPublishedJobIdForEmployer(
    employerId: string,
  ): Promise<string | null> {
    const [row] = await this.database.db
      .select({ id: jobPostings.id })
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.employerId, employerId),
          eq(jobPostings.status, 'published'),
        ),
      )
      .orderBy(jobPostings.title)
      .limit(1);
    return row?.id ?? null;
  }

  private async rankJobsByFuzzy(
    query: string,
    input: JobSearchInput,
    education: EducationLevel | undefined,
    yearsOfExperience: number | undefined,
    limit: number,
  ): Promise<RankedId[]> {
    if (!query) {
      return [];
    }

    try {
      const result = await this.database.db.execute<SearchRow>(sql`
        SELECT jp.id::text AS id
        FROM job_postings jp
        ${this.where([
          ...this.jobFilters(input, education, yearsOfExperience, 'jp'),
          sql`(jp.search_text ILIKE ${`%${query}%`} OR jp.search_text % ${query})`,
        ])}
        ORDER BY similarity(COALESCE(jp.search_text, ''), ${query}) DESC
        LIMIT ${limit}
      `);

      return this.rank(this.rows(result));
    } catch {
      return [];
    }
  }

  private async rankJobsByVector(
    vector: number[],
    input: JobSearchInput,
    education: EducationLevel | undefined,
    yearsOfExperience: number | undefined,
    limit: number,
  ): Promise<RankedId[]> {
    if (vector.length === 0 || !(await this.database.hasVectorSupport())) {
      return [];
    }

    try {
      const result = await this.database.db.execute<SearchRow>(sql`
        SELECT jp.id::text AS id
        FROM job_postings jp
        ${this.where([
          ...this.jobFilters(input, education, yearsOfExperience, 'jp'),
          sql`jp.embedding IS NOT NULL`,
        ])}
        ORDER BY jp.embedding <=> ${this.vector(vector)}::vector(1536)
        LIMIT ${limit}
      `);

      return this.rank(this.rows(result));
    } catch {
      return [];
    }
  }

  private async rankCandidatesByFuzzy(
    query: string,
    input: CandidateSearchInput,
    education: EducationLevel | undefined,
    minYearsOfExperience: number | undefined,
    limit: number,
  ): Promise<RankedId[]> {
    if (!query) {
      return [];
    }

    try {
      const result = await this.database.db.execute<SearchRow>(sql`
        SELECT cp.id::text AS id
        FROM candidate_profiles cp
        ${this.where([
          ...this.candidateFilters(
            input,
            education,
            minYearsOfExperience,
            'cp',
          ),
          sql`(cp.search_text ILIKE ${`%${query}%`} OR cp.search_text % ${query})`,
        ])}
        ORDER BY similarity(COALESCE(cp.search_text, ''), ${query}) DESC
        LIMIT ${limit}
      `);

      return this.rank(this.rows(result));
    } catch {
      return [];
    }
  }

  private async rankCandidatesByVector(
    vector: number[],
    input: CandidateSearchInput,
    education: EducationLevel | undefined,
    minYearsOfExperience: number | undefined,
    limit: number,
  ): Promise<RankedId[]> {
    if (vector.length === 0 || !(await this.database.hasVectorSupport())) {
      return [];
    }

    try {
      const result = await this.database.db.execute<SearchRow>(sql`
        SELECT cp.id::text AS id
        FROM candidate_profiles cp
        ${this.where([
          ...this.candidateFilters(
            input,
            education,
            minYearsOfExperience,
            'cp',
          ),
          sql`cp.embedding IS NOT NULL`,
        ])}
        ORDER BY cp.embedding <=> ${this.vector(vector)}::vector
        LIMIT ${limit}
      `);

      return this.rank(this.rows(result));
    } catch {
      return [];
    }
  }

  private jobFilters(
    input: JobSearchInput,
    education: EducationLevel | undefined,
    yearsOfExperience: number | undefined,
    alias: string,
  ): SQL[] {
    const t = (column: string) => sql.raw(`${alias}.${column}`);
    const filters: SQL[] = [sql`${t('status')} = 'published'`];

    if (input.workMode) {
      filters.push(sql`${t('work_mode')} = ${input.workMode}`);
    }

    if (input.location) {
      filters.push(sql`${t('location')} ILIKE ${`%${input.location}%`}`);
    }

    if (education) {
      filters.push(
        sql`(${t('required_education')} IS NULL OR ${this.educationRank(t('required_education'))} <= ${this.educationRankValue(education)})`,
      );
    }

    if (yearsOfExperience !== undefined) {
      filters.push(
        sql`(${t('required_years_of_experience')} IS NULL OR ${t('required_years_of_experience')} <= ${yearsOfExperience})`,
      );
    }

    if (input.salaryMin !== undefined) {
      filters.push(sql`(${t('salary_max')} IS NULL OR ${t('salary_max')} >= ${input.salaryMin})`);
    }

    if (input.salaryMax !== undefined) {
      filters.push(sql`(${t('salary_min')} IS NULL OR ${t('salary_min')} <= ${input.salaryMax})`);
    }

    return filters;
  }

  private candidateFilters(
    input: CandidateSearchInput,
    education: EducationLevel | undefined,
    minYearsOfExperience: number | undefined,
    alias: string,
  ): SQL[] {
    const t = (column: string) => sql.raw(`${alias}.${column}`);
    const filters: SQL[] = [];

    if (education) {
      filters.push(
        sql`${this.educationRank(t('education'))} >= ${this.educationRankValue(education)}`,
      );
    }

    if (input.location) {
      filters.push(
        sql`(COALESCE(${t('contact_info')}, '') ILIKE ${`%${input.location}%`} OR COALESCE(${t('preferred_locations')}, '') ILIKE ${`%${input.location}%`} OR COALESCE(${t('search_text')}, '') ILIKE ${`%${input.location}%`})`,
      );
    }

    if (input.workMode) {
      filters.push(
        sql`(${t('preferred_work_mode')} IS NULL OR ${t('preferred_work_mode')} = ${input.workMode})`,
      );
    }

    if (minYearsOfExperience !== undefined) {
      filters.push(
        sql`(${t('years_of_experience')} IS NOT NULL AND ${t('years_of_experience')} >= ${minYearsOfExperience})`,
      );
    }

    return filters;
  }

  private where(filters: SQL[]) {
    return filters.length ? sql`WHERE ${sql.join(filters, sql` AND `)}` : sql``;
  }

  private educationRank(column: SQL) {
    return sql<number>`CASE ${column}
      WHEN 'high_school' THEN 1
      WHEN 'diploma' THEN 2
      WHEN 'bachelor' THEN 3
      WHEN 'master' THEN 4
      WHEN 'phd' THEN 5
      ELSE 0
    END`;
  }

  private educationRankValue(level: EducationLevel) {
    return {
      high_school: 1,
      diploma: 2,
      bachelor: 3,
      master: 4,
      phd: 5,
      other: 0,
    }[level];
  }

  private vector(vector: number[]) {
    return sql`${`[${vector.join(',')}]`}`;
  }

  private async vectorForSearch(embedding: unknown, query: string) {
    if (!(await this.database.hasVectorSupport())) {
      return [];
    }

    const storedVector = this.asVector(embedding);
    return storedVector.length ? storedVector : this.safeEmbedQuery(query);
  }

  private asVector(value: unknown): number[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is number => typeof item === 'number');
    }

    if (typeof value !== 'string') {
      return [];
    }

    const trimmed = value.trim().replace(/^\[/, '').replace(/\]$/, '');
    if (!trimmed) {
      return [];
    }

    return trimmed
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item));
  }

  private rank(rows: SearchRow[]): RankedId[] {
    return rows.map((row, index) => ({ id: row.id, rank: index + 1 }));
  }

  private fuse(lists: RankedId[][], k = 60) {
    const scores = new Map<string, number>();

    for (const list of lists) {
      for (const item of list) {
        scores.set(item.id, (scores.get(item.id) ?? 0) + 1 / (k + item.rank));
      }
    }

    return [...scores.entries()]
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);
  }

  private rows<T>(result: T[] | { rows: T[] }): T[] {
    return Array.isArray(result) ? result : result.rows;
  }

  private async findCandidate(id: string) {
    const [candidate] = await this.database.db
      .select()
      .from(candidateProfiles)
      .where(sql`${candidateProfiles.id} = ${id}`)
      .limit(1);
    return candidate;
  }

  private async findJob(id: string) {
    const [job] = await this.database.db
      .select({
        id: jobPostings.id,
        employerId: jobPostings.employerId,
        title: jobPostings.title,
        companyInfo: jobPostings.companyInfo,
        description: jobPostings.description,
        requiredEducation: jobPostings.requiredEducation,
        requiredSkills: jobPostings.requiredSkills,
        requiredYearsOfExperience: jobPostings.requiredYearsOfExperience,
        salaryMin: jobPostings.salaryMin,
        salaryMax: jobPostings.salaryMax,
        workMode: jobPostings.workMode,
        location: jobPostings.location,
        status: jobPostings.status,
        searchText: jobPostings.searchText,
        embedding: jobPostings.embedding,
        employerIsMember: employerProfiles.isMember,
      })
      .from(jobPostings)
      .leftJoin(
        employerProfiles,
        sql`${jobPostings.employerId} = ${employerProfiles.id}`,
      )
      .where(sql`${jobPostings.id} = ${id}`)
      .limit(1);
    return job;
  }

  private async findJobsByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database.db
      .select({
        id: jobPostings.id,
        employerId: jobPostings.employerId,
        title: jobPostings.title,
        companyInfo: jobPostings.companyInfo,
        description: sql<string>`left(${jobPostings.description}, 800)`,
        requiredEducation: jobPostings.requiredEducation,
        requiredSkills: jobPostings.requiredSkills,
        requiredYearsOfExperience: jobPostings.requiredYearsOfExperience,
        salaryMin: jobPostings.salaryMin,
        salaryMax: jobPostings.salaryMax,
        workMode: jobPostings.workMode,
        location: jobPostings.location,
        status: jobPostings.status,
      })
      .from(jobPostings)
      .where(inArray(jobPostings.id, ids));
  }

  private async findCandidatesByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database.db
      .select({
        id: candidateProfiles.id,
        userId: candidateProfiles.userId,
        fullName: candidateProfiles.fullName,
        contactInfo: candidateProfiles.contactInfo,
        education: candidateProfiles.education,
        major: candidateProfiles.major,
        yearsOfExperience: candidateProfiles.yearsOfExperience,
        skills: candidateProfiles.skills,
        workExperience: candidateProfiles.workExperience,
        preferredLocations: candidateProfiles.preferredLocations,
        preferredWorkMode: candidateProfiles.preferredWorkMode,
        isMember: candidateProfiles.isMember,
        resumeText: candidateProfiles.resumeText,
      })
      .from(candidateProfiles)
      .where(inArray(candidateProfiles.id, ids));
  }

  private attachScores<T>(
    rows: T[],
    fused: { id: string; score: number }[],
    getId: (row: T) => string,
  ): SearchResult<T>[] {
    const scoreById = new Map(fused.map((item) => [item.id, item.score]));
    const orderById = new Map(fused.map((item, index) => [item.id, index]));

    return rows
      .map((row) => ({ ...row, rrfScore: scoreById.get(getId(row)) ?? 0 }))
      .sort(
        (a, b) =>
          (orderById.get(getId(a)) ?? 0) - (orderById.get(getId(b)) ?? 0),
      );
  }

  private async rerank<T extends { id: string; rrfScore: number }>(
    query: string,
    rows: T[],
    limit: number,
    toText: (row: T) => string,
  ): Promise<(T & { rerankScore?: number })[]> {
    if (!query || rows.length === 0) {
      return rows.slice(0, limit);
    }

    try {
      const reranked = await this.ai.rerank(
        query,
        rows.map((row) => ({ id: row.id, text: toText(row) })),
        limit,
      );
      const rowById = new Map(rows.map((row) => [row.id, row]));

      return reranked
        .map((item) => ({
          ...rowById.get(item.id)!,
          rerankScore: item.relevanceScore,
        }))
        .filter((row) => Boolean(row.id));
    } catch {
      return rows.slice(0, limit);
    }
  }

  private async safeEmbedQuery(query: string): Promise<number[]> {
    if (!query) {
      return [];
    }

    try {
      return await this.ai.embedQuery(query);
    } catch {
      return [];
    }
  }

  private limit(limit: number | undefined, isMember: boolean) {
    return isMember ? (limit ?? 1000) : Math.min(limit ?? 10, 10);
  }
}

import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const educationLevel = pgEnum('education_level', [
  'high_school',
  'diploma',
  'bachelor',
  'master',
  'phd',
  'other',
]);

export const workMode = pgEnum('work_mode', [
  'remote',
  'on_site',
  'hybrid',
]);

export const jobStatus = pgEnum('job_status', [
  'draft',
  'published',
  'closed',
]);

export const applicationStatus = pgEnum('application_status', [
  'submitted',
  'reviewed',
  'shortlisted',
  'rejected',
  'accepted',
]);

export const candidateProfiles = pgTable(
  'candidate_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    contactInfo: text('contact_info'),
    education: educationLevel('education'),
    major: text('major'),
    yearsOfExperience: integer('years_of_experience'),
    skills: text('skills'),
    resumeText: text('resume_text'),
    searchText: text('search_text'),
    bm25Document: text('bm25_document'),
    embedding: vector('embedding', { dimensions: 1536 }),
  },
  (table) => [
    uniqueIndex('candidate_profiles_user_id_unique').on(table.userId),
    uniqueIndex('candidate_profiles_bm25_document_unique').on(table.bm25Document),
    index('candidate_profiles_search_text_trgm_idx').using(
      'gin',
      table.searchText.op('gin_trgm_ops'),
    ),
    index('candidate_profiles_bm25_document_trgm_idx').using(
      'gin',
      table.bm25Document.op('gin_trgm_ops'),
    ),
    index('candidate_profiles_embedding_hnsw_idx').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  ],
);

export const employerProfiles = pgTable(
  'employer_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    companyName: text('company_name').notNull(),
    companyInfo: text('company_info'),
    contactInfo: text('contact_info'),
  },
  (table) => [
    uniqueIndex('employer_profiles_user_id_unique').on(table.userId),
  ],
);

export const jobPostings = pgTable(
  'job_postings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employerId: uuid('employer_id')
      .notNull()
      .references(() => employerProfiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    companyInfo: text('company_info'),
    description: text('description').notNull(),
    requiredEducation: educationLevel('required_education'),
    requiredSkills: text('required_skills'),
    requiredYearsOfExperience: integer('required_years_of_experience'),
    workMode: workMode('work_mode'),
    location: text('location'),
    status: jobStatus('status').default('published').notNull(),
    searchText: text('search_text'),
    bm25Description: text('bm25_description'),
    bm25Document: text('bm25_document'),
    bm25Title: text('bm25_title'),
    embedding: vector('embedding', { dimensions: 1536 }),
  },
  (table) => [
    index('job_postings_employer_id_idx').on(table.employerId),
    uniqueIndex('job_postings_bm25_description_unique').on(table.bm25Description),
    uniqueIndex('job_postings_bm25_document_unique').on(table.bm25Document),
    uniqueIndex('job_postings_bm25_title_unique').on(table.bm25Title),
    index('job_postings_description_trgm_idx').using(
      'gin',
      table.description.op('gin_trgm_ops'),
    ),
    index('job_postings_title_trgm_idx').using(
      'gin',
      table.title.op('gin_trgm_ops'),
    ),
    index('job_postings_required_skills_trgm_idx').using(
      'gin',
      table.requiredSkills.op('gin_trgm_ops'),
    ),
    index('job_postings_location_trgm_idx').using(
      'gin',
      table.location.op('gin_trgm_ops'),
    ),
    index('job_postings_search_text_trgm_idx').using(
      'gin',
      table.searchText.op('gin_trgm_ops'),
    ),
    index('job_postings_bm25_description_trgm_idx').using(
      'gin',
      table.bm25Description.op('gin_trgm_ops'),
    ),
    index('job_postings_bm25_document_trgm_idx').using(
      'gin',
      table.bm25Document.op('gin_trgm_ops'),
    ),
    index('job_postings_embedding_hnsw_idx').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  ],
);

export const jobApplications = pgTable(
  'job_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id')
      .notNull()
      .references(() => jobPostings.id, { onDelete: 'cascade' }),
    status: applicationStatus('status').default('submitted').notNull(),
    coverLetter: text('cover_letter'),
  },
  (table) => [
    index('job_applications_candidate_id_idx').on(table.candidateId),
    index('job_applications_job_id_idx').on(table.jobId),
    uniqueIndex('job_applications_candidate_job_unique').on(
      table.candidateId,
      table.jobId,
    ),
  ],
);

export const candidateProfilesRelations = relations(
  candidateProfiles,
  ({ one, many }) => ({
    user: one(user, {
      fields: [candidateProfiles.userId],
      references: [user.id],
    }),
    applications: many(jobApplications),
  }),
);

export const employerProfilesRelations = relations(
  employerProfiles,
  ({ one, many }) => ({
    user: one(user, {
      fields: [employerProfiles.userId],
      references: [user.id],
    }),
    jobs: many(jobPostings),
  }),
);

export const jobPostingsRelations = relations(
  jobPostings,
  ({ one, many }) => ({
    employer: one(employerProfiles, {
      fields: [jobPostings.employerId],
      references: [employerProfiles.id],
    }),
    applications: many(jobApplications),
  }),
);

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  candidate: one(candidateProfiles, {
    fields: [jobApplications.candidateId],
    references: [candidateProfiles.id],
  }),
  job: one(jobPostings, {
    fields: [jobApplications.jobId],
    references: [jobPostings.id],
  }),
}));

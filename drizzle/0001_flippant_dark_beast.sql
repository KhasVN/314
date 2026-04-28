CREATE TYPE "public"."application_status" AS ENUM('submitted', 'reviewed', 'shortlisted', 'rejected', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('high_school', 'diploma', 'bachelor', 'master', 'phd', 'other');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('remote', 'on_site', 'hybrid');--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"contact_info" text,
	"education" "education_level",
	"major" text,
	"years_of_experience" integer,
	"skills" text,
	"resume_text" text,
	"search_text" text,
	"bm25_document" text,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "employer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text NOT NULL,
	"company_info" text,
	"contact_info" text
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"cover_letter" text
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" uuid NOT NULL,
	"title" text NOT NULL,
	"company_info" text,
	"description" text NOT NULL,
	"required_education" "education_level",
	"required_skills" text,
	"required_years_of_experience" integer,
	"work_mode" "work_mode",
	"location" text,
	"status" "job_status" DEFAULT 'published' NOT NULL,
	"search_text" text,
	"bm25_description" text,
	"bm25_document" text,
	"embedding" vector(1536)
);
--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD CONSTRAINT "employer_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_candidate_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_job_postings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_employer_id_employer_profiles_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_profiles_user_id_unique" ON "candidate_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_profiles_bm25_document_unique" ON "candidate_profiles" USING btree ("bm25_document");--> statement-breakpoint
CREATE INDEX "candidate_profiles_search_text_trgm_idx" ON "candidate_profiles" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "candidate_profiles_bm25_document_trgm_idx" ON "candidate_profiles" USING gin ("bm25_document" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "candidate_profiles_embedding_hnsw_idx" ON "candidate_profiles" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "employer_profiles_user_id_unique" ON "employer_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_applications_candidate_id_idx" ON "job_applications" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "job_applications_job_id_idx" ON "job_applications" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_applications_candidate_job_unique" ON "job_applications" USING btree ("candidate_id","job_id");--> statement-breakpoint
CREATE INDEX "job_postings_employer_id_idx" ON "job_postings" USING btree ("employer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_postings_bm25_description_unique" ON "job_postings" USING btree ("bm25_description");--> statement-breakpoint
CREATE UNIQUE INDEX "job_postings_bm25_document_unique" ON "job_postings" USING btree ("bm25_document");--> statement-breakpoint
CREATE INDEX "job_postings_description_trgm_idx" ON "job_postings" USING gin ("description" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "job_postings_search_text_trgm_idx" ON "job_postings" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "job_postings_bm25_description_trgm_idx" ON "job_postings" USING gin ("bm25_description" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "job_postings_bm25_document_trgm_idx" ON "job_postings" USING gin ("bm25_document" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "job_postings_embedding_hnsw_idx" ON "job_postings" USING hnsw ("embedding" vector_cosine_ops);
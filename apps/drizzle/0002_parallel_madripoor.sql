ALTER TABLE "job_postings" ADD COLUMN "bm25_title" text;--> statement-breakpoint
CREATE UNIQUE INDEX "job_postings_bm25_title_unique" ON "job_postings" USING btree ("bm25_title");--> statement-breakpoint
CREATE INDEX "job_postings_title_trgm_idx" ON "job_postings" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "job_postings_required_skills_trgm_idx" ON "job_postings" USING gin ("required_skills" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "job_postings_location_trgm_idx" ON "job_postings" USING gin ("location" gin_trgm_ops);
DROP INDEX "candidate_profiles_bm25_document_unique";--> statement-breakpoint
DROP INDEX "candidate_profiles_bm25_document_trgm_idx";--> statement-breakpoint
DROP INDEX "job_postings_bm25_description_unique";--> statement-breakpoint
DROP INDEX "job_postings_bm25_document_unique";--> statement-breakpoint
DROP INDEX "job_postings_bm25_title_unique";--> statement-breakpoint
DROP INDEX "job_postings_bm25_description_trgm_idx";--> statement-breakpoint
DROP INDEX "job_postings_bm25_document_trgm_idx";--> statement-breakpoint
ALTER TABLE "candidate_profiles" DROP COLUMN "bm25_document";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "bm25_description";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "bm25_document";--> statement-breakpoint
ALTER TABLE "job_postings" DROP COLUMN "bm25_title";
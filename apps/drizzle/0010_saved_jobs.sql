-- Migration: create saved_jobs table
-- Allows candidates to bookmark jobs for later viewing under My Jobs → Saved Jobs.
-- ON DELETE CASCADE means saved records are auto-cleaned when the candidate or job is deleted.

CREATE TABLE IF NOT EXISTS "saved_jobs" (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "candidate_id" uuid NOT NULL REFERENCES "candidate_profiles"("id") ON DELETE CASCADE,
  "job_id"       uuid NOT NULL REFERENCES "job_postings"("id") ON DELETE CASCADE,
  CONSTRAINT "saved_jobs_candidate_job_unique" UNIQUE ("candidate_id", "job_id")
);

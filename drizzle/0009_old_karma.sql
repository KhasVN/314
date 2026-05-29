ALTER TABLE "job_postings" ADD COLUMN "salary_min" integer;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "salary_max" integer;
--> statement-breakpoint
UPDATE "job_postings"
SET
  "salary_min" = (ROUND((
    CASE "required_education"
      WHEN 'high_school' THEN 52000
      WHEN 'diploma' THEN 60000
      WHEN 'bachelor' THEN 72000
      WHEN 'master' THEN 85000
      WHEN 'phd' THEN 98000
      ELSE 58000
    END + COALESCE("required_years_of_experience", 0) * 4500
  ) / 1000.0) * 1000)::integer,
  "salary_max" = (ROUND((
    CASE "required_education"
      WHEN 'high_school' THEN 52000
      WHEN 'diploma' THEN 60000
      WHEN 'bachelor' THEN 72000
      WHEN 'master' THEN 85000
      WHEN 'phd' THEN 98000
      ELSE 58000
    END + 18000 + COALESCE("required_years_of_experience", 0) * 6000
  ) / 1000.0) * 1000)::integer
WHERE "salary_min" IS NULL AND "salary_max" IS NULL;
ALTER TABLE "candidate_profiles" ADD COLUMN "is_member" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD COLUMN "is_member" boolean DEFAULT false NOT NULL;
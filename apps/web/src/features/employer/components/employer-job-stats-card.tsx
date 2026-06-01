'use client';

import type { JobDto } from '@talent-matching/dtos';

// Shows a summary of applicants for a single job posting.
// Uses placeholder numbers since the backend does not yet expose application counts.
// When the backend is ready, replace the fake numbers with real API data.
export function EmployerJobStatsCard({ job }: { job: JobDto }) {
  // Fake applicant count derived from job id so each job shows a different number.
  // Replace this with a real API call when available e.g. employerApi.jobs.stats(job.id)
  const fakeApplicantCount = (job.id.charCodeAt(0) % 30) + 3;
  const fakeNewCount = Math.max(1, Math.floor(fakeApplicantCount * 0.3));

  return (
    <div className="mt-1 flex gap-3">
      <div className="flex items-center gap-1.5 rounded-lg bg-[#f3f2f1] px-2.5 py-1">
        <span className="text-[11px] font-bold text-[#2d2d2d]">{fakeApplicantCount}</span>
        <span className="text-[11px] text-[#595959]">applicants</span>
      </div>
      {fakeNewCount > 0 && (
        <div className="flex items-center gap-1.5 rounded-lg bg-[#eef4ff] px-2.5 py-1">
          <span className="text-[11px] font-bold text-[#2557a7]">{fakeNewCount} new</span>
        </div>
      )}
    </div>
  );
}
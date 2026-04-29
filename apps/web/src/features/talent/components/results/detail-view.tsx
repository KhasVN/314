import type { CandidateDto, JobDto } from '@talent-matching/dtos';

type Item = JobDto | CandidateDto;

interface DetailSection {
  title: string;
  content?: string;
  badges?: { label: string; variant: 'outline' | 'secondary' | 'ghost' }[];
}

interface DetailProps<T extends Item> {
  item: T | null;
  getHeader: (item: T) => { meta: string; title: string; score?: number };
  getSections: (item: T) => DetailSection[];
}

function Detail<T extends Item>({ item, getHeader, getSections }: DetailProps<T>) {
  if (!item) {
    return (
      <div className="h-full flex items-center justify-center text-primary/40">
        <p>Select to view details</p>
      </div>
    );
  }

  const header = getHeader(item);

  return (
    <div className="h-full overflow-auto">
      <div className="border-b border-base-300 pb-4 mb-4">
        <p className="text-xs uppercase text-primary/50 mb-1">{header.meta}</p>
        <h2 className="text-2xl font-semibold uppercase leading-tight">{header.title}</h2>
        {header.score !== undefined && (
          <span className="badge badge-outline badge-sm rounded-none mt-2">Score: {header.score.toFixed(3)}</span>
        )}
      </div>

      <div className="space-y-4">
        {getSections(item).map((section, i) => (
          <section key={i}>
            <h3 className="text-xs uppercase text-primary/50 mb-2">{section.title}</h3>
            {section.content && <p className="text-sm leading-relaxed">{section.content}</p>}
            {section.badges && (
              <div className="flex flex-wrap gap-2">
                {section.badges.map((badge, j) => (
                  <span key={j} className={`badge badge-${badge.variant} rounded-none`}>
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export function JobDetail({ job }: { job: JobDto | null }) {
  return (
    <Detail
      item={job}
      getHeader={(j) => ({ meta: j.companyInfo || 'Job posting', title: j.title, score: j.rerankScore })}
      getSections={(j) => [
        { title: 'Description', content: j.description },
        {
          title: '',
          badges: [
            ...(j.workMode ? [{ label: j.workMode, variant: 'outline' as const }] : []),
            ...(j.location ? [{ label: j.location, variant: 'secondary' as const }] : []),
            ...(j.requiredEducation ? [{ label: j.requiredEducation, variant: 'ghost' as const }] : []),
            ...(j.requiredYearsOfExperience !== null
              ? [{ label: `${j.requiredYearsOfExperience}+ years experience`, variant: 'ghost' as const }]
              : []),
          ],
        },
        ...(j.requiredSkills ? [{ title: 'Required Skills', content: j.requiredSkills }] : []),
        ...(j.companyInfo ? [{ title: 'Company Information', content: j.companyInfo }] : []),
      ]}
    />
  );
}

export function CandidateDetail({ candidate }: { candidate: CandidateDto | null }) {
  return (
    <Detail
      item={candidate}
      getHeader={(c) => ({ meta: c.major || 'Candidate profile', title: c.fullName, score: c.rerankScore })}
      getSections={(c) => [
        { title: 'Contact Information', content: c.contactInfo || 'Not provided' },
        {
          title: '',
          badges: [
            ...(c.education ? [{ label: c.education, variant: 'secondary' as const }] : []),
            ...(c.yearsOfExperience !== null
              ? [{ label: `${c.yearsOfExperience} years experience`, variant: 'ghost' as const }]
              : []),
            ...(c.major ? [{ label: c.major, variant: 'outline' as const }] : []),
          ],
        },
        ...(c.skills ? [{ title: 'Skills', content: c.skills }] : []),
        ...(c.resumeText ? [{ title: 'Resume', content: c.resumeText }] : []),
      ]}
    />
  );
}

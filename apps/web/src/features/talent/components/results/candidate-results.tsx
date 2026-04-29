import type { CandidateDto } from '@talent-matching/dtos';
import { Results } from './result-card';

export function CandidateResults({
  items,
  selectedId,
  onSelect,
}: {
  items: CandidateDto[];
  selectedId?: string;
  onSelect: (c: CandidateDto) => void;
}) {
  return (
    <Results
      items={items}
      selectedId={selectedId}
      onSelect={onSelect}
      getMeta={(c) => c.major || 'Candidate profile'}
      getTitle={(c) => c.fullName}
      getDescription={(c) => c.skills || c.resumeText || ''}
      getBadges={(c) => [
        ...(c.education ? [{ label: c.education, variant: 'secondary' as const }] : []),
        ...(c.yearsOfExperience !== null
          ? [{ label: `${c.yearsOfExperience} years`, variant: 'ghost' as const }]
          : []),
      ]}
    />
  );
}

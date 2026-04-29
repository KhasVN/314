import type { CandidateDto } from '@talent-matching/dtos';
import { Results } from './result-card';

type Badge = { label: string; variant: 'outline' | 'secondary' | 'ghost' };

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
      getDescription={candidateDescription}
      getBadges={candidateBadges}
    />
  );
}

function candidateDescription(candidate: CandidateDto) {
  return (
    candidate.skills || candidate.workExperience || candidate.resumeText || ''
  );
}

function candidateBadges(candidate: CandidateDto) {
  const badges: Badge[] = [];

  if (candidate.isMember) {
    badges.push({ label: 'Member', variant: 'outline' });
  }
  if (candidate.education) {
    badges.push({ label: candidate.education, variant: 'secondary' });
  }
  if (candidate.preferredWorkMode) {
    badges.push({ label: candidate.preferredWorkMode, variant: 'ghost' });
  }
  if (candidate.yearsOfExperience !== null) {
    badges.push({
      label: `${candidate.yearsOfExperience} years`,
      variant: 'ghost',
    });
  }

  return badges;
}

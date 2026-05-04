import type { JobDto } from '@talent-matching/dtos';
import { Results } from './result-card';

export function JobResults({
  items,
  selectedId,
  onSelect,
}: {
  items: JobDto[];
  selectedId?: string;
  onSelect: (job: JobDto) => void;
}) {
  return (
    <Results
      items={items}
      selectedId={selectedId}
      onSelect={onSelect}
      getMeta={(j) => j.companyInfo || 'Job posting'}
      getTitle={(j) => j.title}
      getDescription={(j) => j.description}
      getBadges={(j) => [
        ...(j.workMode ? [{ label: j.workMode, variant: 'outline' as const }] : []),
        ...(j.location ? [{ label: j.location, variant: 'secondary' as const }] : []),
        ...(j.requiredYearsOfExperience !== null
          ? [{ label: `${j.requiredYearsOfExperience}+ years`, variant: 'ghost' as const }]
          : []),
      ]}
    />
  );
}

import type { CandidateDto, JobDto } from '@talent-matching/dtos';

type Item = JobDto | CandidateDto;

interface ResultsProps<T extends Item> {
  items: T[];
  selectedId?: string;
  onSelect: (item: T) => void;
  getMeta: (item: T) => string;
  getTitle: (item: T) => string;
  getDescription: (item: T) => string;
  getBadges: (item: T) => { label: string; variant: 'outline' | 'secondary' | 'ghost' }[];
}

export function Results<T extends Item>({
  items,
  selectedId,
  onSelect,
  getMeta,
  getTitle,
  getDescription,
  getBadges,
}: ResultsProps<T>) {
  if (!items.length) return <EmptyResult />;

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <article
          key={item.id}
          onClick={() => onSelect(item)}
          className={`card border rounded-none cursor-pointer transition-colors hover:border-primary ${
            selectedId === item.id ? 'bg-accent/20 border-primary' : 'bg-base-100 border-base-300'
          }`}
        >
          <div className="card-body p-4 py-3">
            <div className="flex justify-between items-center text-xs uppercase text-primary/50 mb-1">
              <span className="truncate">{getMeta(item)}</span>
              <Score value={(item as JobDto).rerankScore ?? (item as CandidateDto).rerankScore} />
            </div>
            <h2 className="card-title text-lg font-semibold uppercase leading-tight truncate">{getTitle(item)}</h2>
            <p className="text-sm text-primary/70 truncate mt-1">{getDescription(item)}</p>
            <div className="card-actions gap-2 mt-2 flex-wrap">
              {getBadges(item).map((badge, i) => (
                <span key={i} className={`badge badge-${badge.variant} badge-sm rounded-none`}>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="card bg-base-100 border border-base-300 rounded-none p-6">
      <div className="card-body">
        <p className="text-sm uppercase opacity-60">No results</p>
        <h2 className="mt-2 text-2xl font-semibold uppercase leading-tight">Try another search</h2>
      </div>
    </div>
  );
}

function Score({ value }: { value?: number }) {
  return value === undefined ? null : <span className="badge badge-outline badge-sm rounded-none">{value.toFixed(3)}</span>;
}

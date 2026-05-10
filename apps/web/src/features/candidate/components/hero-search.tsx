'use client';

import { useState, type FormEvent } from 'react';
import type { JobSearchQueryDto } from '@talent-matching/dtos';
import { FilterSidebar } from './filter-sidebar';

type Props = {
  onSearch: (params: JobSearchQueryDto) => void;
  onClear: () => void;
  onFilter: (params: JobSearchQueryDto | null) => void;
};

const POPULAR_TAGS = ['Software Engineer', 'Data Analyst', 'Remote', 'Marketing'];

export function HeroSearch({ onSearch, onClear, onFilter }: Props) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({
      query: keyword.trim() || undefined,
      location: location.trim() || undefined,
      limit: 100,
    });
  };

  const handleTag = (tag: string) => {
    setKeyword(tag);
    onSearch({ query: tag, limit: 100 });
  };

  const handleClear = () => {
    setKeyword('');
    setLocation('');
    onClear();
  };

  return (
    <section className="relative z-10 overflow-visible border-b border-[#e4e2e0] bg-white px-4 py-5 lg:px-6">
      <div className="mx-auto max-w-7xl overflow-visible">
        <div className="squircle mx-auto flex max-w-[840px] flex-col border border-[#2d2d2d] bg-white shadow-[0_2px_8px_rgba(45,45,45,0.18)] focus-within:ring-2 focus-within:ring-[#2557a7] min-[760px]:h-14 min-[760px]:flex-row min-[760px]:items-center">
          <form onSubmit={handleSubmit} className="contents">
          <label className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3 min-[760px]:py-0">
            <svg className="h-5 w-5 shrink-0 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
            </svg>
            <span className="sr-only">What</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title, keywords, or company"
              className="w-full rounded-md border-0 bg-transparent text-base text-[#2d2d2d] placeholder:text-[#767676] focus:outline-none focus:ring-2 focus:ring-[#2557a7]/20"
            />
          </label>
          <label className="flex min-w-0 items-center gap-3 border-t border-[#d4d2d0] px-5 py-3 min-[760px]:w-64 min-[760px]:border-l min-[760px]:border-t-0 min-[760px]:py-0">
            <svg className="h-5 w-5 shrink-0 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            <span className="sr-only">Where</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or remote"
              className="w-full rounded-md border-0 bg-transparent text-base text-[#2d2d2d] placeholder:text-[#767676] focus:outline-none focus:ring-2 focus:ring-[#2557a7]/20"
            />
          </label>
          <div className="flex gap-2 p-2 min-[760px]:pl-0">
            <button
              type="submit"
              className="squircle-button min-h-11 bg-[#2557a7] px-6 text-sm font-bold text-white hover:bg-[#164081] md:min-w-[98px]"
            >
              Find jobs
            </button>
            {(keyword || location) && (
              <button type="button" className="squircle-button px-4 text-sm font-semibold text-[#2557a7] hover:bg-[#eef4ff]" onClick={handleClear}>
                Reset
              </button>
            )}
          </div>
          </form>
        </div>

        <div className="mx-auto mt-4 flex max-w-[840px] flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-[#595959]">Popular jobs:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className="squircle-button px-2 py-1 text-[#2557a7] underline underline-offset-2 hover:bg-[#eef4ff] hover:text-[#164081]"
              onClick={() => handleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="relative z-20 mx-auto mt-5 max-w-[840px] overflow-visible">
          <FilterSidebar onFilter={onFilter} />
        </div>
      </div>
    </section>
  );
}

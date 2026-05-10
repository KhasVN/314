'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { LinkedoutCard } from '@features/candidate/components/linkedout-ui';
import { candidateApi } from '@features/candidate/api';
import type { EmployerDto, JobDto } from '@talent-matching/dtos';
import { useScrollReveal } from '@/lib/use-scroll-reveal';

export function CompanyReviewsPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selectedCompany, setSelected] = useState<EmployerDto | null>(null);

  const { data: allEmployers = [], isLoading: loadingAll } = useSWR(
    'employers-all',
    () => candidateApi.employers.list(),
  );

  const { data: searchResults = [], isLoading: loadingSearch } = useSWR(
    submitted ? ['employer-search', submitted] : null,
    () => candidateApi.employers.search(submitted),
  );

  const displayList = submitted ? searchResults : allEmployers;
  const isLoading = submitted ? loadingSearch : loadingAll;

  const companyReveal = useScrollReveal(displayList, {
    pageSize: 20,
    resetKey: submitted || 'all',
  });

  const { data: companyJobs = [] } = useSWR(
    selectedCompany ? ['company-jobs', selectedCompany.id] : null,
    () => candidateApi.employers.jobs(selectedCompany!.id),
  );

  const jobsReveal = useScrollReveal(selectedCompany ? companyJobs : [], {
    pageSize: 25,
    resetKey: selectedCompany?.id ?? '_none',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelected(null);
    setSubmitted(query.trim());
  };

  const hue = (name: string) => (name.charCodeAt(0) * 47) % 360;

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#2d2d2d]">Browse companies</h1>
          <p className="mt-2 text-sm text-[#595959]">Search employer profiles and open roles from the database.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-10">
          <label className="mb-2 block text-sm font-bold text-[#2d2d2d]">Company name or job title</label>
          <div className="squircle flex flex-col gap-3 border border-[#2d2d2d] bg-white p-2 shadow-[0_2px_8px_rgba(45,45,45,0.12)] sm:flex-row sm:items-stretch">
            <div className="flex min-h-12 flex-1 items-center gap-3 px-3">
              <svg className="h-5 w-5 shrink-0 text-[#767676]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Acme, Software Engineer…"
                className="w-full border-0 bg-transparent text-base text-[#2d2d2d] placeholder:text-[#767676] focus:outline-none focus:ring-2 focus:ring-[#2557a7]/20"
              />
              {query && (
                <button
                  type="button"
                  className="squircle-button shrink-0 px-2 py-1 text-sm text-[#767676] hover:bg-[#f3f2f1]"
                  onClick={() => {
                    setQuery('');
                    setSubmitted('');
                    setSelected(null);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              className="squircle-button min-h-12 shrink-0 bg-[#2557a7] px-8 text-sm font-bold text-white hover:bg-[#164081] sm:min-w-[140px]"
            >
              Search
            </button>
          </div>
          <Link href="/candidate" className="squircle-button mt-3 inline-block px-2 py-1 text-sm font-semibold text-[#2557a7] hover:bg-[#eef4ff]">
            Looking for jobs instead? →
          </Link>
        </form>

        <div
          className={`grid gap-6 ${selectedCompany ? 'lg:grid-cols-2' : 'grid-cols-1'}`}
        >
          <div>
            <h2 className="mb-4 text-lg font-bold text-[#2d2d2d]">
              {submitted ? `Results for “${submitted}”` : 'All companies'}
              {displayList.length > 0 && (
                <span className="ml-2 text-sm font-normal text-[#767676]">({displayList.length})</span>
              )}
            </h2>

            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-24 w-full rounded-box" />
                ))}
              </div>
            )}

            {!isLoading && submitted && searchResults.length === 0 && (
              <LinkedoutCard className="p-8 text-center">
                <p className="text-lg font-semibold text-[#2d2d2d]">No companies found</p>
                <p className="mt-1 text-sm text-[#595959]">Try another name or job title.</p>
              </LinkedoutCard>
            )}

            {!isLoading && displayList.length > 0 && (
              <div className="space-y-3">
                {companyReveal.visibleItems.map((company) => {
                  const selected = selectedCompany?.id === company.id;
                  return (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => setSelected(selected ? null : company)}
                      className={`w-full text-left transition-colors ${
                        selected ? 'ring-2 ring-[#2557a7]' : ''
                      }`}
                    >
                      <LinkedoutCard
                        className={`p-4 ${selected ? 'border-[#2557a7] bg-[#eef4ff]' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center text-lg font-bold text-[#2d2d2d]"
                            style={{
                              borderRadius: '1rem',
                              background: `hsl(${hue(company.companyName)}, 65%, 90%)`,
                              color: `hsl(${hue(company.companyName)}, 65%, 30%)`,
                            }}
                          >
                            {company.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-[#2d2d2d]">{company.companyName}</p>
                            {company.companyInfo && (
                              <p className="truncate text-sm text-[#595959]">{company.companyInfo}</p>
                            )}
                            {company.isMember && (
                              <span className="mt-1 inline-block rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] font-bold text-[#2557a7]">
                                Member
                              </span>
                            )}
                          </div>
                        </div>
                      </LinkedoutCard>
                    </button>
                  );
                })}
                {companyReveal.hasMore && (
                  <div ref={companyReveal.sentinelRef} className="h-2 w-full shrink-0" aria-hidden />
                )}
              </div>
            )}
          </div>

          {selectedCompany && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <LinkedoutCard className="p-6">
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center text-xl font-bold"
                      style={{
                        borderRadius: '1rem',
                        background: `hsl(${hue(selectedCompany.companyName)}, 65%, 90%)`,
                        color: `hsl(${hue(selectedCompany.companyName)}, 65%, 30%)`,
                      }}
                    >
                      {selectedCompany.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2d2d2d]">{selectedCompany.companyName}</h3>
                      {selectedCompany.contactInfo && (
                        <p className="mt-1 text-sm text-[#595959]">{selectedCompany.contactInfo}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="squircle-button px-2 py-1 text-lg leading-none text-[#767676] hover:bg-[#f3f2f1]"
                    onClick={() => setSelected(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {selectedCompany.companyInfo && (
                  <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-[#2d2d2d]">
                    {selectedCompany.companyInfo}
                  </p>
                )}

                <Link
                  href="/candidate"
                  className="squircle-button mb-6 block w-full bg-[#2557a7] py-3 text-center text-sm font-bold text-white hover:bg-[#164081]"
                >
                  Search jobs on Linkedout
                </Link>

                <h4 className="mb-3 text-sm font-bold text-[#2d2d2d]">
                  Open jobs
                  <span className="ml-2 font-normal text-[#767676]">({companyJobs.length})</span>
                </h4>

                {companyJobs.length === 0 ? (
                  <p className="text-sm text-[#595959]">No open postings for this employer.</p>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {jobsReveal.visibleItems.map((job: JobDto) => (
                        <li key={job.id}>
                          <Link
                            href="/candidate"
                            className="squircle-button block border border-[#e4e2e0] bg-[#f3f2f1] px-4 py-3 text-sm font-semibold text-[#2557a7] hover:bg-[#eef4ff]"
                          >
                            {job.title}
                            <span className="mt-1 block text-xs font-normal text-[#595959]">
                              {[job.location, job.workMode?.replace('_', '-')]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {jobsReveal.hasMore && (
                      <div ref={jobsReveal.sentinelRef} className="h-2 w-full shrink-0" aria-hidden />
                    )}
                  </>
                )}
              </LinkedoutCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

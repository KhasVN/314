'use client';

// ═══════════════════════════════════════════════════════════════
// company-reviews-page.tsx — Company Reviews page
//
// Accessible by both registered and unregistered users.
// Search by company name OR job title.
//
// DATA FLOW:
//   Search query → GET /api/employers?search=query
//     → returns matching employer profiles from DB
//   Click company → GET /api/employers/:id/jobs
//     → shows all job postings by that company
//
// BACKEND:
//   employers.service.ts search() — searches employer_profiles
//   by company_name ILIKE and job_postings.title ILIKE
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import useSWR from 'swr';
import { CandidateNavbar } from '../candidate-shared/candidate-navbar';
import { talentApi } from '../talent/api';
import type { EmployerDto, JobDto } from '@talent-matching/dtos';

export function CompanyReviewsPage() {
  const [selectedId, setSelectedId]     = useState('');
  const [query, setQuery]               = useState('');
  const [submitted, setSubmitted]       = useState('');
  const [selectedCompany, setSelected]  = useState<EmployerDto | null>(null);

  // Fetch candidate list for navbar
  const { data: candidates = [] } = useSWR('cr-cands', talentApi.candidates.list);

  // ── Fetch search results from backend ─────────────────────
  // GET /api/employers?search=query
  // Uses ILIKE matching on company_name and job title
  const { data: results = [], isLoading } = useSWR(
    submitted ? ['employer-search', submitted] : null,
    () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/employers?search=${encodeURIComponent(submitted)}`)
      .then(r => r.json()) as Promise<EmployerDto[]>
  );

  // ── Fetch all employers on initial load (popular companies) ─
  const { data: allEmployers = [] } = useSWR(
    'all-employers',
    talentApi.employers.list
  );

  // ── Fetch jobs for selected company ───────────────────────
  // GET /api/employers/:id/jobs
  const { data: companyJobs = [] } = useSWR(
    selectedCompany ? ['company-jobs', selectedCompany.id] : null,
    () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/employers/${selectedCompany!.id}/jobs`)
      .then(r => r.json()) as Promise<JobDto[]>
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelected(null);
    setSubmitted(query.trim());
  };

  const displayList = submitted ? results : allEmployers;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <CandidateNavbar
        candidates={candidates}
        selectedCandidateId={selectedId}
        onCandidateChange={setSelectedId}
        activePage="company-reviews"
      />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Find great places to work
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>
            Search companies from our database by name or job title
          </p>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} style={{ marginBottom: 40 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Company name or job title
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 12, padding: '0 16px', gap: 10, border: '1.5px solid #e0e7ff', boxShadow: '0 1px 4px rgba(99,102,241,0.06)' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. Google, Data Analyst, Software Engineer..."
                style={{ flex: 1, padding: '13px 0', background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#111827' }}
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSubmitted(''); setSelected(null); }}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18, padding: 0 }}>✕</button>
              )}
            </div>
            <button type="submit" style={{ padding: '0 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Find Companies
            </button>
          </div>
          <a href="/candidate" style={{ display: 'inline-block', marginTop: 10, fontSize: 14, color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
            Do you want to search for jobs instead? →
          </a>
        </form>

        {/* SPLIT VIEW: company list + company detail */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedCompany ? '1fr 1fr' : '1fr', gap: 24 }}>

          {/* LEFT: COMPANY LIST */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
              {submitted ? `Results for "${submitted}"` : 'Popular companies'}
              {displayList.length > 0 && (
                <span style={{ fontSize: 14, fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>({displayList.length})</span>
              )}
            </h2>

            {/* Loading */}
            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1.5px solid #e0e7ff' }}>
                    <div style={{ height: 16, background: '#f1f5f9', borderRadius: 8, width: '60%', marginBottom: 10 }}/>
                    <div style={{ height: 12, background: '#f8fafc', borderRadius: 8, width: '40%' }}/>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!isLoading && submitted && results.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 16, border: '1.5px solid #e0e7ff' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>No companies found</p>
                <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Try a different company name or job title</p>
              </div>
            )}

            {/* Company cards */}
            {!isLoading && displayList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayList.map((company, i) => (
                  <button key={company.id} onClick={() => setSelected(selectedCompany?.id === company.id ? null : company)}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', background: '#fff', borderRadius: 14, border: `1.5px solid ${selectedCompany?.id === company.id ? '#6366f1' : '#e0e7ff'}`, cursor: 'pointer', textAlign: 'left', boxShadow: selectedCompany?.id === company.id ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none', transition: 'all 0.15s' }}>

                    {/* Company avatar */}
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `hsl(${(company.companyName.charCodeAt(0) * 47) % 360}, 65%, 88%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: `hsl(${(company.companyName.charCodeAt(0) * 47) % 360}, 65%, 35%)`, flexShrink: 0 }}>
                      {company.companyName.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {company.companyName}
                      </p>
                      {company.companyInfo && (
                        <p style={{ fontSize: 13, color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {company.companyInfo}
                        </p>
                      )}
                      {company.isMember && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: '#ede9fe', padding: '1px 8px', borderRadius: 9999, marginTop: 4, display: 'inline-block' }}>⭐ Member</span>
                      )}
                    </div>

                    {/* Arrow */}
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={selectedCompany?.id === company.id ? '#6366f1' : '#9ca3af'} strokeWidth={2} style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: COMPANY DETAIL */}
          {selectedCompany && (
            <div>
              <div style={{ position: 'sticky', top: 80 }}>

                {/* Company header */}
                <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: `hsl(${(selectedCompany.companyName.charCodeAt(0) * 47) % 360}, 65%, 88%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, color: `hsl(${(selectedCompany.companyName.charCodeAt(0) * 47) % 360}, 65%, 35%)`, flexShrink: 0 }}>
                      {selectedCompany.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{selectedCompany.companyName}</h2>
                      {selectedCompany.contactInfo && (
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          {selectedCompany.contactInfo}
                        </p>
                      )}
                      {selectedCompany.isMember && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: '#ede9fe', padding: '2px 8px', borderRadius: 9999, marginTop: 4, display: 'inline-block' }}>⭐ Member company</span>
                      )}
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
                  </div>

                  {/* Company info */}
                  {selectedCompany.companyInfo && (
                    <div style={{ padding: '12px 14px', background: '#f8f7ff', borderRadius: 12, marginBottom: 16 }}>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{selectedCompany.companyInfo}</p>
                    </div>
                  )}

                  {/* View jobs button */}
                  <a href={`/candidate?company=${encodeURIComponent(selectedCompany.companyName)}`}
                    style={{ display: 'block', padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
                    View all jobs at {selectedCompany.companyName}
                  </a>
                </div>

                {/* Open jobs at this company */}
                <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Open jobs
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#9ca3af' }}>{companyJobs.length} positions</span>
                  </h3>

                  {companyJobs.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No open positions at the moment</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {companyJobs.map(job => (
                        <a key={job.id} href="/candidate"
                          style={{ display: 'block', padding: '12px 14px', background: '#f8f7ff', borderRadius: 12, border: '1px solid #e0e7ff', textDecoration: 'none' }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', margin: '0 0 4px' }}>{job.title}</p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {job.location && <span style={{ fontSize: 11, color: '#6b7280' }}>📍 {job.location}</span>}
                            {job.workMode && <span style={{ fontSize: 11, color: '#6b7280' }}>💼 {job.workMode.replace('_', '-')}</span>}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

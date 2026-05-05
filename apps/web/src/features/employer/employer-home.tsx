'use client';

// ═══════════════════════════════════════════════════════════════
// employer-home.tsx  —  EMPLOYER DASHBOARD
// Shows list of candidates, search/filter, Top-10 recommendations
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { talentApi } from '../talent/api';
import type { CandidateDto, CandidateSearchQueryDto } from '@talent-matching/dtos';

// ── TYPES ────────────────────────────────────────────────────
type WorkMode = 'remote' | 'on_site' | 'hybrid' | '';
type Education = 'high_school' | 'diploma' | 'bachelor' | 'master' | 'phd' | '';

export function EmployerHome() {
  const router = useRouter();

  const [activeTab, setActiveTab]           = useState<'all' | 'recommended'>('all');
  const [selectedEmployerId, setSelectedEmployerId] = useState('');
  const [selectedCandidate, setSelectedCandidate]   = useState<CandidateDto | null>(null);

  // ── FILTER STATE ─────────────────────────────────────────────
  const [keyword, setKeyword]         = useState('');
  const [education, setEducation]     = useState<Education>('');
  const [workMode, setWorkMode]       = useState<WorkMode>('');
  const [minExp, setMinExp]           = useState('');
  const [maxExp, setMaxExp]           = useState('');
  const [searchParams, setSearchParams] = useState<CandidateSearchQueryDto | null>(null);

  // ── DELETE JOB MODAL ─────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingJobId, setDeletingJobId]     = useState('');
  const [deleteError, setDeleteError]         = useState('');

  // ── DATA FETCHING ─────────────────────────────────────────────
  const { data: allCandidates = [], isLoading: loadingAll } = useSWR(
    'employer-all-candidates', talentApi.candidates.list
  );

  const { data: allEmployers = [] } = useSWR(
    'employer-list', talentApi.employers.list
  );

  const { data: searchResults, isLoading: loadingSearch } = useSWR(
    searchParams ? ['emp-candidate-search', searchParams] : null,
    () => talentApi.candidates.search(searchParams!)
  );

  const { data: recommendedCandidates = [], isLoading: loadingRecs } = useSWR(
    selectedEmployerId ? ['emp-recommendations', selectedEmployerId] : null,
    () => talentApi.candidates.search({ employerId: selectedEmployerId, limit: 10, rerank: true } as any)
  );

  const { data: myJobs = [], mutate: mutateJobs } = useSWR(
    'employer-jobs', talentApi.jobs.list
  );

  const displayCandidates: CandidateDto[] =
    activeTab === 'recommended' ? recommendedCandidates :
    searchParams ? (searchResults ?? []) : allCandidates;

  const isLoading =
    activeTab === 'recommended' ? loadingRecs :
    searchParams ? loadingSearch : loadingAll;

  // ── HANDLERS ─────────────────────────────────────────────────
  const handleSearch = () => {
    const params: CandidateSearchQueryDto = {};
    if (keyword.trim())  params.query     = keyword.trim();
    if (education)       params.education = education as any;
    if (workMode)        params.workMode = workMode as any;
    if (minExp)          params.minYearsOfExperience = parseInt(minExp);
    setSearchParams(params);
    setActiveTab('all');
    setSelectedCandidate(null);
  };

  const handleClear = () => {
    setKeyword(''); setEducation(''); setWorkMode('');
    setMinExp(''); setMaxExp('');
    setSearchParams(null);
    setSelectedCandidate(null);
  };

  const handleDeleteJob = async () => {
    if (!deletingJobId) return;
    try {
      await talentApi.jobs.remove(deletingJobId);
      setShowDeleteModal(false);
      setDeletingJobId('');
      await mutateJobs();
    } catch (err: any) {
      setDeleteError(err?.message ?? 'Failed to delete job.');
    }
  };

  const sectionLabel =
    activeTab === 'recommended' ? 'Top 10 recommended candidates' :
    searchParams ? 'Search results' : 'All candidates';

  const selectedEmployer = allEmployers.find(e => e.id === selectedEmployerId);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e0e7ff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <Logo />
            <span style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>TalentMatch</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 6, marginLeft: 4 }}>EMPLOYER</span>
          </a>

          {/* Employer selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 340 }}>
            <select
              value={selectedEmployerId}
              onChange={e => { setSelectedEmployerId(e.target.value); setActiveTab('all'); }}
              style={{ flex: 1, padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, color: '#111827', background: '#fafafa', outline: 'none' }}
            >
              <option value="">Select your company profile</option>
              {allEmployers.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.companyName}</option>
              ))}
            </select>
          </div>

          {/* Nav actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => router.push('/employer/job-posting')}
              style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              + Post a job
            </button>
            <a href="/employer/login" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb' }}>Sign out</a>
          </div>
        </div>
      </header>

      {/* ── HERO SEARCH ── */}
      <div style={{ background: 'linear-gradient(160deg, #f0fdf9 0%, #f8f7ff 100%)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Find the right candidate</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>
            {selectedEmployer ? `Logged in as ${selectedEmployer.companyName}` : 'Select your company profile to get personalised recommendations'}
          </p>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by skill, major, or keyword..."
              style={{ flex: 1, minWidth: 200, padding: '11px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', background: '#fff' }}
            />

            {/* Filters */}
            <select value={education} onChange={e => setEducation(e.target.value as Education)}
              style={selStyle}>
              <option value="">Any education</option>
              <option value="high_school">High school</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
              <option value="phd">PhD</option>
            </select>

            <select value={workMode} onChange={e => setWorkMode(e.target.value as WorkMode)}
              style={selStyle}>
              <option value="">Any work mode</option>
              <option value="remote">Remote</option>
              <option value="on_site">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <select value={minExp} onChange={e => setMinExp(e.target.value)} style={selStyle}>
              <option value="">Min exp</option>
              <option value="0">0 yrs</option>
              <option value="1">1 yr</option>
              <option value="2">2 yrs</option>
              <option value="3">3 yrs</option>
              <option value="5">5 yrs</option>
            </select>

            <button onClick={handleSearch} style={{ padding: '11px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Search
            </button>
            {searchParams && (
              <button onClick={handleClear} style={{ padding: '11px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, color: '#6b7280', cursor: 'pointer' }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Left: My Jobs sidebar */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e0e7ff', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>My job postings</p>
              <span style={{ fontSize: 12, background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>{myJobs.length}</span>
            </div>
            {myJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 10px' }}>No jobs posted yet</p>
                <button onClick={() => router.push('/employer/jobs/create')}
                  style={{ fontSize: 12, color: '#10b981', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                  + Post your first job
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myJobs.slice(0, 5).map(job => (
                  <div key={job.id} style={{ padding: '10px 12px', background: '#f8f7ff', borderRadius: 10, border: '1px solid #e0e7ff' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>{job.title}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 6px' }}>{job.workMode?.replace('_', '-')}</p>
                    <button
                      onClick={() => { setDeletingJobId(job.id); setShowDeleteModal(true); }}
                      style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right: Candidate list */}
        <section style={{ flex: 1, minWidth: 0 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
            <TabButton active={activeTab === 'all'} onClick={() => { setActiveTab('all'); setSelectedCandidate(null); }} label="All candidates" count={allCandidates.length} />
            <TabButton active={activeTab === 'recommended'} onClick={() => { if (selectedEmployerId) { setActiveTab('recommended'); setSelectedCandidate(null); } }} label="Recommended for you" count={recommendedCandidates.length} disabled={!selectedEmployerId} hint={!selectedEmployerId ? 'Select your company profile first' : undefined} />
          </div>

          {/* Count */}
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
            {isLoading ? 'Loading...' : <><strong style={{ color: '#0f172a' }}>{displayCandidates.length}</strong> {sectionLabel}</>}
          </p>

          {/* Loading skeleton */}
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #f1f5f9', animation: 'pulse 1.5s infinite' }}>
                  <div style={{ height: 14, background: '#f1f5f9', borderRadius: 6, width: '40%', marginBottom: 10 }} />
                  <div style={{ height: 12, background: '#f8fafc', borderRadius: 6, width: '60%', marginBottom: 10 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ height: 20, background: '#f1f5f9', borderRadius: 9999, width: 60 }} />
                    <div style={{ height: 20, background: '#f1f5f9', borderRadius: 9999, width: 80 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && displayCandidates.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                {activeTab === 'recommended' ? 'No recommendations yet' : 'No candidates found'}
              </h3>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                {activeTab === 'recommended' ? 'Make sure your company profile is selected' : 'Try different keywords or filters'}
              </p>
            </div>
          )}

          {/* Candidate cards */}
          {!isLoading && displayCandidates.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  rank={activeTab === 'recommended' ? index + 1 : undefined}
                  isSelected={selectedCandidate?.id === candidate.id}
                  onClick={() => setSelectedCandidate(selectedCandidate?.id === candidate.id ? null : candidate)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Candidate detail drawer */}
        {selectedCandidate && (
          <CandidateDrawer
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}

      </main>

      {/* ── DELETE JOB MODAL ── */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 8px' }}>Delete job posting?</h2>
            <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', margin: '0 0 24px' }}>This will permanently remove the job from the platform.</p>
            {deleteError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, textAlign: 'center' }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteError(''); setDeletingJobId(''); }}
                style={{ flex: 1, padding: '11px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDeleteJob}
                style={{ flex: 1, padding: '11px 16px', borderRadius: 10, border: 'none', background: '#dc2626', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── CANDIDATE CARD ────────────────────────────────────────────
function CandidateCard({ candidate, rank, isSelected, onClick }: {
  candidate: CandidateDto; rank?: number; isSelected: boolean; onClick: () => void;
}) {
  const skills = candidate.skills?.split(',').map(s => s.trim()).filter(Boolean) ?? [];

  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 16, padding: '18px 20px',
      border: `1.5px solid ${isSelected ? '#6366f1' : '#e5e7eb'}`,
      cursor: 'pointer', transition: 'border-color 0.15s',
      boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {rank && (
              <span style={{ fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '2px 8px', borderRadius: 9999 }}>
                #{rank}
              </span>
            )}
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{candidate.fullName}</h3>
          </div>

          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
            {candidate.education && <span>🎓 {candidate.education.replace('_', ' ')}</span>}
            {candidate.major && <span>📚 {candidate.major}</span>}
            {candidate.yearsOfExperience !== undefined && <span>💼 {candidate.yearsOfExperience} yrs exp</span>}
            {candidate.preferredWorkMode && <span>🏠 {candidate.preferredWorkMode.replace('_', '-')}</span>}
          </div>

          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.slice(0, 6).map(s => (
                <span key={s} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 9999, background: '#ede9fe', color: '#7c3aed', fontWeight: 600 }}>{s}</span>
              ))}
              {skills.length > 6 && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 9999, background: '#f1f5f9', color: '#64748b' }}>+{skills.length - 6} more</span>
              )}
            </div>
          )}
        </div>

        {candidate.preferredLocations && (
          <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>📍 {candidate.preferredLocations}</span>
        )}
      </div>
    </div>
  );
}

// ── CANDIDATE DRAWER ──────────────────────────────────────────
function CandidateDrawer({ candidate, onClose }: { candidate: CandidateDto; onClose: () => void }) {
  const skills = candidate.skills?.split(',').map(s => s.trim()).filter(Boolean) ?? [];

  return (
    <aside style={{ width: 320, flexShrink: 0, position: 'sticky', top: 80 }}>
      <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Candidate profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#9ca3af', cursor: 'pointer' }}>×</button>
        </div>

        {/* Avatar */}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{candidate.fullName?.[0]?.toUpperCase()}</span>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{candidate.fullName}</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>{candidate.contactInfo}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Education', value: candidate.education?.replace('_', ' ') },
            { label: 'Major', value: candidate.major },
            { label: 'Experience', value: candidate.yearsOfExperience !== undefined ? `${candidate.yearsOfExperience} years` : undefined },
            { label: 'Work mode', value: candidate.preferredWorkMode?.replace('_', '-') },
            { label: 'Location', value: candidate.preferredLocations },
          ].filter(r => r.value).map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#9ca3af' }}>{r.label}</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{r.value}</span>
            </div>
          ))}
        </div>

        {candidate.workExperience && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', margin: '0 0 6px' }}>Experience summary</p>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{candidate.workExperience}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', margin: '0 0 8px' }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.map(s => (
                <span key={s} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 9999, background: '#ede9fe', color: '#7c3aed', fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── TAB BUTTON ────────────────────────────────────────────────
function TabButton({ active, onClick, label, count, disabled, hint }: {
  active: boolean; onClick: () => void; label: string;
  count: number; disabled?: boolean; hint?: string;
}) {
  return (
    <button onClick={disabled ? undefined : onClick} title={hint} style={{
      padding: '10px 16px', fontSize: 13, fontWeight: 600, border: 'none', background: 'none',
      borderBottom: `2px solid ${active ? '#6366f1' : 'transparent'}`,
      color: active ? '#6366f1' : disabled ? '#d1d5db' : '#6b7280',
      cursor: disabled ? 'not-allowed' : 'pointer', marginBottom: -1,
    }}>
      {label}
      {count > 0 && (
        <span style={{ marginLeft: 6, fontSize: 11, padding: '2px 7px', borderRadius: 9999, background: active ? '#ede9fe' : '#f1f5f9', color: active ? '#7c3aed' : '#9ca3af', fontWeight: 700 }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── LOGO ──────────────────────────────────────────────────────
function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
      <circle cx="18" cy="22" r="10" fill="url(#empHomeLogoG)" />
      <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95" />
      <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="10" r="4" fill="#8b5cf6" />
      <circle cx="37" cy="22" r="4" fill="#6366f1" />
      <circle cx="34" cy="34" r="4" fill="#8b5cf6" />
      <defs>
        <linearGradient id="empHomeLogoG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const selStyle: React.CSSProperties = { padding: '11px 12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, color: '#374151', background: '#fff', outline: 'none' };

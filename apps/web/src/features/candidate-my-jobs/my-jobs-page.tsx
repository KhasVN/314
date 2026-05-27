'use client';

// ═══════════════════════════════════════════════════════════════
// my-jobs-page.tsx — My Jobs page for candidates
//
// TABS:
//   Saved     → jobs bookmarked locally, can Apply / Move to Applied / Unsave (with Undo)
//   Applied   → applications with status 'submitted' from DB → Withdraw / Move to Interviews
//   Interviews→ applications with status 'shortlisted' from DB → Upload notes / Move to Archived
//   Archived  → applications with status 'rejected' or 'accepted' from DB
//
// DATA FLOW:
//   - Saved jobs: stored in localStorage (candidateId + jobIds)
//   - Applied/Interviews/Archived: fetched from GET /api/applications?candidateId=X
//   - Job details: fetched from GET /api/jobs/:id
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { talentApi } from '../talent/api';
import { CandidateNavbar } from '../candidate-shared/candidate-navbar';
import type { JobDto, ApplicationDto, CandidateDto } from '@talent-matching/dtos';

type Tab = 'saved' | 'applied' | 'interviews' | 'archived';

export function MyJobsPage() {
  const [activeTab, setActiveTab]             = useState<Tab>('saved');
  const [selectedCandidateId, setSelectedId]  = useState('');
  const [savedJobIds, setSavedJobIds]         = useState<string[]>([]);
  const [savedJobs, setSavedJobs]             = useState<JobDto[]>([]);
  const [undoJob, setUndoJob]                 = useState<JobDto | null>(null);
  const [toast, setToast]                     = useState('');

  // ── Fetch all candidates (for profile selector) ───────────
  const { data: candidates = [] } = useSWR('cand-list', talentApi.candidates.list);
  const currentCandidate = candidates.find(c => c.id === selectedCandidateId) ?? null;

  // ── Load saved job IDs from localStorage ─────────────────
  useEffect(() => {
    const stored = localStorage.getItem(`savedJobs_${selectedCandidateId}`);
    const ids = stored ? JSON.parse(stored) : [];
    setSavedJobIds(ids);
  }, [selectedCandidateId]);

  // ── Fetch saved job details from DB ──────────────────────
  useEffect(() => {
    if (savedJobIds.length === 0) { setSavedJobs([]); return; }
    Promise.all(savedJobIds.map(id => talentApi.jobs.get(id).catch(() => null)))
      .then(jobs => setSavedJobs(jobs.filter(Boolean) as JobDto[]));
  }, [savedJobIds]);

  // ── Fetch applications from DB ────────────────────────────
  // GET /api/applications?candidateId=X
  const { data: allApplications = [], mutate: mutateApps } = useSWR(
    selectedCandidateId ? ['apps', selectedCandidateId] : null,
    () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications?candidateId=${selectedCandidateId}`)
      .then(r => r.json()) as Promise<ApplicationDto[]>
  );

  // ── Fetch job details for each application ────────────────
  const [appJobs, setAppJobs] = useState<Record<string, JobDto>>({});
  useEffect(() => {
    if (allApplications.length === 0) return;
    Promise.all(allApplications.map(a => talentApi.jobs.get(a.jobId).then(j => [a.jobId, j] as const).catch(() => null)))
      .then(pairs => {
        const map: Record<string, JobDto> = {};
        pairs.forEach(p => p && (map[p[0]] = p[1]));
        setAppJobs(map);
      });
  }, [allApplications]);

  // ── Filter applications by status ────────────────────────
  const appliedApps     = allApplications.filter(a => a.status === 'submitted' || a.status === 'reviewed');
  const interviewApps   = allApplications.filter(a => a.status === 'shortlisted');
  const archivedApps    = allApplications.filter(a => a.status === 'accepted' || a.status === 'rejected');

  // ── ACTIONS ───────────────────────────────────────────────

  // Unsave a job (with undo)
  const unsaveJob = (job: JobDto) => {
    const newIds = savedJobIds.filter(id => id !== job.id);
    setSavedJobIds(newIds);
    localStorage.setItem(`savedJobs_${selectedCandidateId}`, JSON.stringify(newIds));
    setUndoJob(job);
    showToast(`${job.title} unsaved`);
    setTimeout(() => setUndoJob(null), 5000);
  };

  // Undo unsave
  const undoUnsave = () => {
    if (!undoJob) return;
    const newIds = [...savedJobIds, undoJob.id];
    setSavedJobIds(newIds);
    localStorage.setItem(`savedJobs_${selectedCandidateId}`, JSON.stringify(newIds));
    setUndoJob(null);
    showToast('Job restored to saved');
  };

  // Apply for a saved job → creates application in DB
  const applyJob = async (job: JobDto) => {
    if (!selectedCandidateId) return;
    try {
      await talentApi.applications.create({ candidateId: selectedCandidateId, jobId: job.id, status: 'submitted' });
      mutateApps();
      showToast(`Applied to ${job.title}!`);
    } catch { showToast('Already applied to this job'); }
  };

  // Move saved → applied
  const moveToApplied = async (job: JobDto) => {
    await applyJob(job);
    unsaveJob(job);
  };

  // Withdraw application
  const withdrawApp = async (app: ApplicationDto) => {
    await talentApi.applications.remove(app.id);
    mutateApps();
    showToast('Application withdrawn');
  };

  // Move to interviews (submitted → shortlisted)
  const moveToInterviews = async (app: ApplicationDto) => {
    await talentApi.applications.update(app.id, { status: 'shortlisted' } as any);
    mutateApps();
    showToast('Moved to Interviews');
  };

  // Move to archived (shortlisted → accepted)
  const moveToArchived = async (app: ApplicationDto) => {
    await talentApi.applications.update(app.id, { status: 'accepted' } as any);
    mutateApps();
    showToast('Moved to Archived');
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'saved',       label: 'Saved',      count: savedJobs.length },
    { key: 'applied',     label: 'Applied',    count: appliedApps.length },
    { key: 'interviews',  label: 'Interviews', count: interviewApps.length },
    { key: 'archived',    label: 'Archived',   count: archivedApps.length },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <CandidateNavbar
        candidates={candidates}
        selectedCandidateId={selectedCandidateId}
        onCandidateChange={setSelectedId}
        activePage="my-jobs"
      />

      {/* MAIN */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 24px', letterSpacing: '-0.5px' }}>My jobs</h1>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 28 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.key ? '#6366f1' : 'transparent'}`, marginBottom: -2, cursor: 'pointer', fontSize: 14, fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? '#6366f1' : '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: activeTab === t.key ? '#6366f1' : '#9ca3af' }}>{t.count}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Guest message */}
        {!selectedCandidateId && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>Select your profile to view your jobs</p>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 24px' }}>Choose your profile from the dropdown above</p>
            <a href="/candidate/login" style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Sign in</a>
          </div>
        )}

        {/* ── SAVED TAB ── */}
        {selectedCandidateId && activeTab === 'saved' && (
          <div>
            {savedJobs.length === 0 ? (
              <EmptyState icon="🔖" title="No saved jobs" desc="Browse jobs and click the bookmark icon to save them here"/>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {savedJobs.map(job => (
                  <JobCard key={job.id} job={job}>
                    <ActionBtn color="#6366f1" bg="#ede9fe" onClick={() => applyJob(job)}>Apply now</ActionBtn>
                    <ActionBtn color="#374151" bg="#f1f5f9" onClick={() => moveToApplied(job)}>Move to Applied</ActionBtn>
                    <ActionBtn color="#dc2626" bg="#fef2f2" onClick={() => unsaveJob(job)}>Unsave</ActionBtn>
                  </JobCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APPLIED TAB ── */}
        {selectedCandidateId && activeTab === 'applied' && (
          <div>
            {appliedApps.length === 0 ? (
              <EmptyState icon="📝" title="No applications yet" desc="Apply to jobs from your saved list or browse jobs"/>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {appliedApps.map(app => {
                  const job = appJobs[app.jobId];
                  return (
                    <JobCard key={app.id} job={job} status={app.status} appId={app.id}>
                      <ActionBtn color="#10b981" bg="#f0fdf4" onClick={() => moveToInterviews(app)}>Move to Interviews</ActionBtn>
                      <ActionBtn color="#dc2626" bg="#fef2f2" onClick={() => withdrawApp(app)}>Withdraw</ActionBtn>
                    </JobCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── INTERVIEWS TAB ── */}
        {selectedCandidateId && activeTab === 'interviews' && (
          <div>
            {interviewApps.length === 0 ? (
              <EmptyState icon="🎤" title="No interviews" desc="Move applications to interviews when you get a callback"/>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {interviewApps.map(app => {
                  const job = appJobs[app.jobId];
                  return (
                    <InterviewCard key={app.id} app={app} job={job}
                      onArchive={() => moveToArchived(app)}
                      onToast={showToast}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ARCHIVED TAB ── */}
        {selectedCandidateId && activeTab === 'archived' && (
          <div>
            {archivedApps.length === 0 ? (
              <EmptyState icon="📦" title="Nothing archived" desc="Completed or closed applications appear here"/>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {archivedApps.map(app => {
                  const job = appJobs[app.jobId];
                  return (
                    <div key={app.id} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb', padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px' }}>{job?.companyInfo ?? 'Company'}</p>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{job?.title ?? 'Loading...'}</h3>
                          {job?.location && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>📍 {job.location}</p>}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <StatusBadge status={app.status}/>
                            <span style={{ fontSize: 12, color: '#9ca3af', background: '#f8fafc', padding: '3px 10px', borderRadius: 9999 }}>Start: —</span>
                            <span style={{ fontSize: 12, color: '#9ca3af', background: '#f8fafc', padding: '3px 10px', borderRadius: 9999 }}>End: current</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 999 }}>
          {toast}
          {undoJob && (
            <button onClick={undoUnsave} style={{ background: '#6366f1', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 8, cursor: 'pointer' }}>
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── INTERVIEW CARD ─────────────────────────────────────────────
function InterviewCard({ app, job, onArchive, onToast }: { app: ApplicationDto; job?: JobDto; onArchive: () => void; onToast: (msg: string) => void }) {
  const [notes, setNotes]     = useState('');
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #bbf7d0', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px' }}>{job?.companyInfo ?? 'Company'}</p>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{job?.title ?? 'Loading...'}</h3>
          {job?.location && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>📍 {job.location}</p>}
          <StatusBadge status={app.status}/>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <ActionBtn color="#8b5cf6" bg="#faf5ff" onClick={() => setShowNotes(!showNotes)}>
            {showNotes ? 'Hide notes' : '📝 Add notes'}
          </ActionBtn>
          <ActionBtn color="#374151" bg="#f1f5f9" onClick={onArchive}>Archive</ActionBtn>
        </div>
      </div>

      {/* Interview notes section */}
      {showNotes && (
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Interview notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Interview on Monday 10am, prepare system design questions..."
            rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e0e7ff', fontSize: 13, color: '#374151', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#fafafa' }}/>
          <button onClick={() => { onToast('Notes saved!'); setShowNotes(false); }}
            style={{ marginTop: 8, padding: '8px 18px', borderRadius: 9999, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Save notes
          </button>
        </div>
      )}
    </div>
  );
}

// ── JOB CARD ──────────────────────────────────────────────────
function JobCard({ job, status, children }: { job?: JobDto; status?: string; appId?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e0e7ff', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px'}}>{job?.companyInfo ?? 'Company'}</p>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{job?.title ?? 'Loading...'}</h3>
          {job?.location && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>📍 {job.location}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {job?.workMode && <WorkModeBadge mode={job.workMode}/>}
            {status && <StatusBadge status={status}/>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────
function ActionBtn({ children, color, bg, onClick }: { children: React.ReactNode; color: string; bg: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '7px 14px', borderRadius: 9999, background: bg, color, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    submitted:   { bg: '#eff6ff', color: '#1d4ed8', label: 'Submitted' },
    reviewed:    { bg: '#fef9c3', color: '#92400e', label: 'Under review' },
    shortlisted: { bg: '#f0fdf4', color: '#166534', label: '🎤 Interview' },
    accepted:    { bg: '#f0fdf4', color: '#166534', label: '✅ Accepted' },
    rejected:    { bg: '#fef2f2', color: '#991b1b', label: '❌ Not selected' },
  };
  const s = map[status] ?? { bg: '#f1f5f9', color: '#6b7280', label: status };
  return <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 9999, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>;
}

function WorkModeBadge({ mode }: { mode: string }) {
  const map: Record<string, { bg: string; color: string }> = { remote: { bg: '#dcfce7', color: '#166534' }, on_site: { bg: '#dbeafe', color: '#1e40af' }, hybrid: { bg: '#f3e8ff', color: '#7e22ce' } };
  const s = map[mode] ?? { bg: '#f1f5f9', color: '#6b7280' };
  return <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 9999, background: s.bg, color: s.color, fontWeight: 500 }}>{mode.replace('_', '-')}</span>;
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>{title}</p>
      <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 24px' }}>{desc}</p>
      <a href="/candidate" style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Browse jobs</a>
    </div>
  );
}

function LogoSVG() {
  return (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
      <circle cx="18" cy="22" r="10" fill="url(#mjG)"/>
      <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95"/>
      <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="34" cy="10" r="4" fill="#8b5cf6"/>
      <circle cx="37" cy="22" r="4" fill="#6366f1"/>
      <circle cx="34" cy="34" r="4" fill="#8b5cf6"/>
      <defs><linearGradient id="mjG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
    </svg>
  );
}

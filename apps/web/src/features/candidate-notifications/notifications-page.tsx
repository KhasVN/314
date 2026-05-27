'use client';

// ═══════════════════════════════════════════════════════════════
// notifications-page.tsx
// Shows job match notifications and application updates.
// If no notifications → shows "Nothing right now" with Find Jobs.
// Data pulled from applications in DB for the selected candidate.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../talent/api';
import { CandidateNavbar } from '../candidate-shared/candidate-navbar';
import type { ApplicationDto, JobDto } from '@talent-matching/dtos';

export function NotificationsPage() {
  const [selectedId, setSelectedId] = useState('');
  const { data: candidates = [] }   = useSWR('notif-cands', talentApi.candidates.list);
  const currentCandidate = candidates.find(c => c.id === selectedId) ?? null;

  // Fetch applications as notification source
  const { data: applications = [] } = useSWR(
    selectedId ? ['notif-apps', selectedId] : null,
    async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications?candidateId=${selectedId}`);
      return res.json() as Promise<ApplicationDto[]>;
    }
  );

  // Build notification messages from application statuses
  const notifications = applications.map(app => ({
    id: app.id,
    jobId: app.jobId,
    message: statusToMessage(app.status),
    status: app.status,
    icon: statusToIcon(app.status),
    color: statusToColor(app.status),
    time: 'Recently',
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <CandidateNavbar
        candidates={candidates}
        selectedCandidateId={selectedId}
        onCandidateChange={setSelectedId}
        activePage="notifications"
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 28px', letterSpacing: '-0.5px' }}>Notifications</h1>

        {/* Guest or no profile selected */}
        {!selectedId && (
          <NoNotifications/>
        )}

        {/* Has profile but no notifications */}
        {selectedId && notifications.length === 0 && (
          <NoNotifications/>
        )}

        {/* Has notifications */}
        {selectedId && notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => (
              <NotifCard key={n.id} notif={n}/>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

function NotifCard({ notif }: { notif: { id: string; jobId: string; message: string; icon: string; color: string; time: string } }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e0e7ff', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      {/* Icon */}
      <div style={{ width: 44, height: 44, borderRadius: 12, background: notif.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {notif.icon}
      </div>
      {/* Content */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, color: '#0f172a', margin: '0 0 4px', fontWeight: 500, lineHeight: 1.5 }}>{notif.message}</p>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{notif.time}</p>
      </div>
      {/* Link to my jobs */}
      <a href="/candidate/my-jobs" style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 2 }}>View →</a>
    </div>
  );
}

function NoNotifications() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      {/* Bell illustration */}
      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 28px' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </div>
        {/* Orange dot */}
        <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: '#f97316', border: '2px solid #fff' }}/>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Nothing right now. Check back later!</h2>
      <p style={{ fontSize: 15, color: '#64748b', margin: '0 auto 32px', maxWidth: 400, lineHeight: 1.6 }}>
        This is where we'll notify you about your job applications and other useful information to help you with your job search.
      </p>
      <a href="/candidate" style={{ display: 'inline-block', padding: '13px 40px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
        Find jobs
      </a>
    </div>
  );
}

function statusToMessage(status: string): string {
  const map: Record<string, string> = {
    submitted:   'Your application has been submitted successfully.',
    reviewed:    'An employer has reviewed your application.',
    shortlisted: '🎉 You\'ve been shortlisted for an interview!',
    accepted:    '✅ Congratulations! Your application was accepted.',
    rejected:    'Your application was not selected this time. Keep applying!',
  };
  return map[status] ?? 'Your application status has been updated.';
}

function statusToIcon(status: string): string {
  const map: Record<string, string> = { submitted: '📝', reviewed: '👀', shortlisted: '🎤', accepted: '✅', rejected: '📋' };
  return map[status] ?? '🔔';
}

function statusToColor(status: string): string {
  const map: Record<string, string> = { submitted: '#eff6ff', reviewed: '#fef9c3', shortlisted: '#f0fdf4', accepted: '#f0fdf4', rejected: '#fef2f2' };
  return map[status] ?? '#f8f7ff';
}

'use client';

// ═══════════════════════════════════════════════════════════════
// candidate-navbar.tsx — SHARED navbar for ALL candidate pages
//
// Used by: candidate home, my-jobs, notifications, profile, settings
//
// LAYOUT:
//   [Logo TalentMatch] [Home]   ...   [MyJobs🔖] [🔔] [👤Account] | Employers/Post Job
//
// Each icon navigates to its own page (no dropdowns/panels for icons).
// Account → dropdown with Profile / Settings / Sign out / Close account
// Active page icon is highlighted in indigo.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import type { CandidateDto } from '@talent-matching/dtos';

type ActivePage = 'home' | 'my-jobs' | 'notifications' | 'profile' | 'settings' | 'company-reviews' | 'other';

type Props = {
  candidates: CandidateDto[];
  selectedCandidateId: string;
  onCandidateChange?: (id: string) => void;
  activePage?: ActivePage;
};

export function CandidateNavbar({ candidates, selectedCandidateId, onCandidateChange, activePage = 'other' }: Props) {
  const [accountOpen, setAccountOpen] = useState(false);
  const currentCandidate = candidates.find(c => c.id === selectedCandidateId) ?? null;
  const isGuest = !currentCandidate;

  const handleSignOut = () => {
    if (onCandidateChange) onCandidateChange('');
    window.location.href = '/candidate/login';
  };

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center' }}>

          {/* LOGO → /home */}
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0, marginRight: 6 }}>
            <LogoSVG/>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.3px' }}>TalentMatch</span>
          </a>

          {/* HOME nav link → /candidate */}
          <a href="/candidate" style={{ fontSize: 14, fontWeight: activePage === 'home' ? 600 : 500, color: activePage === 'home' ? '#6366f1' : '#6b7280', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: activePage === 'home' ? '#f8f7ff' : 'transparent' }}>
            Home
          </a>
 
          {/* COMPANY REVIEWS link */}
          <a href="/candidate/company-reviews" style={{ fontSize: 14, fontWeight: activePage === 'company-reviews' ? 600 : 500, color: activePage === 'company-reviews' ? '#6366f1' : '#6b7280', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: activePage === 'company-reviews' ? '#f8f7ff' : 'transparent', marginRight: 'auto' }}>
            Company reviews
          </a>

          {/* RIGHT SIDE ICONS */}
          <div style={{ display: 'flex', alignItems: 'center' }}>

            {/* MY JOBS — navigates to /candidate/my-jobs */}
            <a href="/candidate/my-jobs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 10, textDecoration: 'none', color: activePage === 'my-jobs' ? '#6366f1' : '#6b7280', background: activePage === 'my-jobs' ? '#f8f7ff' : 'transparent', fontSize: 10, fontWeight: 600 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
              My Jobs
            </a>

            {/* NOTIFICATIONS — navigates to /candidate/notifications */}
            <a href="/candidate/notifications" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 10, textDecoration: 'none', color: activePage === 'notifications' ? '#6366f1' : '#6b7280', background: activePage === 'notifications' ? '#f8f7ff' : 'transparent', fontSize: 10, fontWeight: 600 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              Notifications
            </a>

            {/* ACCOUNT — dropdown */}
            <button onClick={() => setAccountOpen(o => !o)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 10, border: 'none', background: (accountOpen || activePage === 'profile' || activePage === 'settings') ? '#f8f7ff' : 'transparent', color: (accountOpen || activePage === 'profile' || activePage === 'settings') ? '#6366f1' : '#6b7280', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Account
            </button>

            {/* DIVIDER */}
            <div style={{ width: 1, height: 36, background: '#e5e7eb', margin: '0 12px' }}/>

            {/* EMPLOYERS / POST JOB */}
            <a href="/" style={{ fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Employers / Post Job
            </a>

          </div>
        </div>
      </header>

      {/* ACCOUNT DROPDOWN */}
      {accountOpen && (
        <>
          <div onClick={() => setAccountOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }}/>
          <div style={{ position: 'fixed', top: 68, right: 24, zIndex: 200, background: '#fff', borderRadius: 16, border: '1.5px solid #e0e7ff', boxShadow: '0 8px 32px rgba(99,102,241,0.12)', width: 240, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>

            {isGuest ? (
              <div style={{ padding: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Welcome!</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>Sign in to access your account</p>
                <a href="/candidate/login" onClick={() => setAccountOpen(false)} style={{ display: 'block', padding: 10, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 8 }}>Sign in</a>
                <a href="/candidate/register" onClick={() => setAccountOpen(false)} style={{ display: 'block', padding: 10, borderRadius: 10, border: '1.5px solid #e0e7ff', color: '#6366f1', textAlign: 'center', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Register free</a>
              </div>
            ) : (
              <>
                {/* User header */}
                <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                      {currentCandidate.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{currentCandidate.fullName}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{currentCandidate.contactInfo}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '8px 0' }}>
                  <DropItem icon="👤" label="Profile" href="/candidate/profile" active={activePage === 'profile'} onClick={() => setAccountOpen(false)}/>
                  <DropItem icon="⚙️" label="Settings" href="/candidate/settings" active={activePage === 'settings'} onClick={() => setAccountOpen(false)}/>
                  <DropItem icon="📋" label="My Jobs" href="/candidate/my-jobs" active={activePage === 'my-jobs'} onClick={() => setAccountOpen(false)}/>
                  <DropItem icon="🔔" label="Notifications" href="/candidate/notifications" active={activePage === 'notifications'} onClick={() => setAccountOpen(false)}/>
                  <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }}/>
                  <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 14, color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}>
                    <span>🚪</span> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

function DropItem({ icon, label, href, active, onClick }: { icon: string; label: string; href: string; active?: boolean; onClick: () => void }) {
  return (
    <a href={href} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: active ? '#f8f7ff' : 'none', fontSize: 14, color: active ? '#6366f1' : '#374151', textDecoration: 'none', fontWeight: active ? 600 : 500 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>{label}
    </a>
  );
}

function LogoSVG() {
  return (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
      <circle cx="18" cy="22" r="10" fill="url(#cnG)"/>
      <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95"/>
      <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="34" cy="10" r="4" fill="#8b5cf6"/>
      <circle cx="37" cy="22" r="4" fill="#6366f1"/>
      <circle cx="34" cy="34" r="4" fill="#8b5cf6"/>
      <defs><linearGradient id="cnG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
    </svg>
  );
}

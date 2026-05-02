// ═══════════════════════════════════════════════════════════════
// navbar.tsx — matches home page theme
// White background, indigo/purple accents, Option A logo
// ═══════════════════════════════════════════════════════════════

import type { CandidateDto } from '@talent-matching/dtos';

type Props = {
  candidates: CandidateDto[];
  selectedCandidateId: string;
  onCandidateChange: (id: string) => void;
  onDeleteProfile: () => void;
};

export function Navbar({ candidates, selectedCandidateId, onCandidateChange, onDeleteProfile }: Props) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

        {/* LOGO */}
        <a href="/candidate" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
            <circle cx="18" cy="22" r="10" fill="url(#nbLogoG)"/>
            <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95"/>
            <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="34" cy="10" r="4" fill="#8b5cf6"/>
            <circle cx="37" cy="22" r="4" fill="#6366f1"/>
            <circle cx="34" cy="34" r="4" fill="#8b5cf6"/>
            <defs>
              <linearGradient id="nbLogoG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.3px' }}>TalentMatch</span>
        </a>

        {/* NAV LINKS */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a href="/candidate" style={{ fontSize: 14, color: '#6366f1', fontWeight: 600, textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: '#f8f7ff' }}>Home</a>
          <a href="/home" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 500 }}>About</a>
        </nav>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

          {/* PROFILE SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', fontWeight: 500 }}>Your profile:</span>
            <select
              value={selectedCandidateId}
              onChange={(e) => onCandidateChange(e.target.value)}
              style={{ fontSize: 13, border: '1.5px solid #e0e7ff', borderRadius: 8, padding: '5px 10px', color: '#374151', outline: 'none', background: '#f8f7ff', maxWidth: 160, cursor: 'pointer' }}
            >
              <option value="">Select profile</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>

          {/* DELETE PROFILE — only when profile selected */}
          {selectedCandidateId && (
            <button onClick={onDeleteProfile}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete
            </button>
          )}

          {/* SIGN IN */}
          <a href="/candidate/login" style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', textDecoration: 'none', padding: '6px 12px', borderRadius: 8 }}>Sign in</a>

          {/* POST A JOB */}
          <a href="/" style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '7px 16px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Post a job
          </a>

        </div>
      </div>
    </header>
  );
}

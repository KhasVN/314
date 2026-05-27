'use client';

// ═══════════════════════════════════════════════════════════════
// navbar.tsx — Candidate homepage navbar
//
// LAYOUT:
//   [Logo TalentMatch] [Home] ... [MyJobs 🔖] [💬] [🔔] [👤 Account] | Employers/Post Job
//
// FEATURES:
//   • Logo → /home
//   • Home → /candidate (job feed)
//   • My Jobs → /candidate/my-jobs (registered) or login prompt (guest)
//   • Notifications → panel
//   • Account → person icon dropdown (no ? for guest, just person icon)
//   • | Employers / Post Job → admin dashboard
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import type { CandidateDto } from '@talent-matching/dtos';

type Props = {
  candidates: CandidateDto[];
  selectedCandidateId: string;
  onCandidateChange: (id: string) => void;
  onDeleteProfile: () => void;
  savedJobIds?: Set<string>;
};

type Panel = 'none' | 'notifications' | 'account' | 'profile' | 'settings';

export function Navbar({ candidates, selectedCandidateId, onCandidateChange, onDeleteProfile, savedJobIds }: Props) {
  const [openPanel, setOpenPanel] = useState<Panel>('none');

  const currentCandidate = candidates.find(c => c.id === selectedCandidateId) ?? null;
  const isGuest = !currentCandidate;

  const toggle = (panel: Panel) => setOpenPanel(p => p === panel ? 'none' : panel);
  const close = () => setOpenPanel('none');

  // My Jobs click — guest → login, logged in → my-jobs page
  const handleMyJobs = () => {
    if (isGuest) {
      window.location.href = '/candidate/login';
    } else {
      window.location.href = '/candidate/my-jobs';
    }
  };

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 0 }}>

          {/* ── LOGO → /home ── */}
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0, marginRight: 6 }}>
            <LogoSVG/>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.3px' }}>TalentMatch</span>
          </a>

          {/* ── HOME nav link — left-aligned beside logo ── */}
          <a href="/candidate" style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, marginRight: 'auto' }}>Home</a>

          {/* ── RIGHT SIDE ── */}
          <div style={{ display: 'flex', alignItems: 'center' }}>

            {/* Profile selector — hidden label, compact */}
            <select value={selectedCandidateId} onChange={e => { onCandidateChange(e.target.value); close(); }}
              style={{ fontSize: 12, border: '1px solid #e0e7ff', borderRadius: 8, padding: '4px 8px', color: '#374151', outline: 'none', background: '#f8f7ff', maxWidth: 130, cursor: 'pointer', marginRight: 8 }}>
              <option value="">Guest</option>
              {candidates.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>

            {/* MY JOBS */}
            <NavIconBtn label="My Jobs" onClick={handleMyJobs}
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>}
            />

            {/* MESSAGES */}
            <NavIconBtn label="Messages" onClick={close}
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>}
            />

            {/* NOTIFICATIONS */}
            <NavIconBtn label="Notifications" onClick={() => toggle('notifications')} active={openPanel === 'notifications'}
              icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>}
            />

            {/* ACCOUNT — person icon, no "?" */}
            <button onClick={() => toggle('account')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 10, border: 'none', background: openPanel === 'account' || openPanel === 'profile' || openPanel === 'settings' ? '#f8f7ff' : 'transparent', color: openPanel === 'account' || openPanel === 'profile' || openPanel === 'settings' ? '#6366f1' : '#6b7280', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
              {/* Always show person icon — no "?" */}
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Account</span>
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

      {/* BACKDROP */}
      {openPanel !== 'none' && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.1)' }}/>
      )}

      {/* ══ NOTIFICATIONS PANEL ════════════════════════════════ */}
      {openPanel === 'notifications' && (
        <SidePanel title="Notifications" onClose={close}>
          {isGuest ? (
            <GuestPrompt message="Sign in to receive job match alerts and application updates." onClose={close}/>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>All caught up!</p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>You'll be notified when new jobs match your profile</p>
            </div>
          )}
        </SidePanel>
      )}

      {/* ══ ACCOUNT DROPDOWN ═══════════════════════════════════ */}
      {openPanel === 'account' && (
        <div style={{ position: 'fixed', top: 68, right: 24, zIndex: 200, background: '#fff', borderRadius: 16, border: '1.5px solid #e0e7ff', boxShadow: '0 8px 32px rgba(99,102,241,0.12)', width: 240, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
          {isGuest ? (
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Welcome!</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>Sign in to access your account</p>
              <a href="/candidate/login" onClick={close} style={{ display: 'block', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 8 }}>Sign in</a>
              <a href="/candidate/register" onClick={close} style={{ display: 'block', padding: '10px', borderRadius: 10, border: '1.5px solid #e0e7ff', color: '#6366f1', textAlign: 'center', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Register free</a>
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
              <div style={{ padding: '8px 0' }}>
                <MenuBtn icon="👤" label="Profile" onClick={() => setOpenPanel('profile')}/>
                <MenuBtn icon="⚙️" label="Settings" onClick={() => setOpenPanel('settings')}/>
                <MenuBtn icon="📋" label="My Jobs" onClick={() => { close(); window.location.href = '/candidate/my-jobs'; }}/>
                <MenuBtn icon="❓" label="Help" onClick={close}/>
                <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }}/>
                <MenuBtn icon="🚪" label="Sign out" color="#dc2626" onClick={() => { onCandidateChange(''); close(); }}/>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ PROFILE PANEL ══════════════════════════════════════ */}
      {openPanel === 'profile' && currentCandidate && (
        <SidePanel title="My profile" onClose={close} wide>
          <div style={{ padding: '0 16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: 16, background: 'linear-gradient(135deg, #f8f7ff, #f0f4ff)', borderRadius: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
                {currentCandidate.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{currentCandidate.fullName}</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{currentCandidate.contactInfo}</p>
                {currentCandidate.isMember && <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: '#ede9fe', padding: '2px 8px', borderRadius: 9999, marginTop: 4, display: 'inline-block' }}>MEMBER ⭐</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ProfileRow icon="🎓" label="Education" value={formatEducation(currentCandidate.education)}/>
              <ProfileRow icon="📚" label="Major" value={currentCandidate.major}/>
              <ProfileRow icon="📅" label="Experience" value={currentCandidate.yearsOfExperience != null ? `${currentCandidate.yearsOfExperience} years` : undefined}/>
              <ProfileRow icon="📍" label="Preferred location" value={currentCandidate.preferredLocations}/>
              <ProfileRow icon="💼" label="Work mode" value={currentCandidate.preferredWorkMode?.replace('_', '-')}/>
              {currentCandidate.skills && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>⚡ Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {currentCandidate.skills.split(',').map(s => (
                      <span key={s.trim()} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 9999, background: '#f8f7ff', border: '1px solid #e0e7ff', color: '#6366f1', fontWeight: 500 }}>{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {currentCandidate.workExperience && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>💼 Work experience</p>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0, background: '#f8fafc', padding: '10px 12px', borderRadius: 10 }}>{currentCandidate.workExperience}</p>
                </div>
              )}
              {/* Resume upload */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>📄 Resume</p>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '2px dashed #e0e7ff', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 10px' }}>{currentCandidate.resumeText ? 'Resume uploaded ✅' : 'No resume uploaded yet'}</p>
                  <label style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 9999, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {currentCandidate.resumeText ? 'Replace resume' : 'Upload resume (PDF)'}
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}/>
                  </label>
                </div>
              </div>
              <button onClick={() => { close(); onDeleteProfile(); }} style={{ padding: 10, borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                🗑️ Delete this profile
              </button>
            </div>
          </div>
        </SidePanel>
      )}

      {/* ══ SETTINGS PANEL ═════════════════════════════════════ */}
      {openPanel === 'settings' && currentCandidate && (
        <SidePanel title="Settings" onClose={close} wide>
          <SettingsContent candidate={currentCandidate}/>
        </SidePanel>
      )}
    </>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────
function SettingsContent({ candidate }: { candidate: CandidateDto }) {
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError]     = useState('');
  const [notifs, setNotifs]       = useState(true);
  const [emailAlerts, setEmails]  = useState(true);

  const handlePw = (e: React.FormEvent) => {
    e.preventDefault(); setPwError('');
    if (newPw.length < 8) return setPwError('Minimum 8 characters.');
    if (newPw !== confirmPw) return setPwError('Passwords do not match.');
    setPwSuccess(true); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSuccess(false), 3000);
  };

  return (
    <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Change password */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e0e7ff', padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>🔐 Change password</h3>
        <form onSubmit={handlePw} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div><label style={sLabel}>New password</label><input type="password" placeholder="Min 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} style={sInp}/></div>
          <div>
            <label style={sLabel}>Confirm new password</label>
            <input type="password" placeholder="Re-enter" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={{ ...sInp, borderColor: confirmPw && newPw !== confirmPw ? '#ef4444' : '#e5e7eb' }}/>
            {confirmPw && newPw !== confirmPw && <p style={{ fontSize: 12, color: '#ef4444', margin: '3px 0 0' }}>Passwords do not match</p>}
          </div>
          {pwError && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{pwError}</p>}
          {pwSuccess && <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>✓ Password updated!</p>}
          <button type="submit" style={{ padding: 10, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Update password</button>
        </form>
      </div>
      {/* Notifications */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e0e7ff', padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>🔔 Notifications</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Toggle label="Job match notifications" desc="Get notified when new jobs match your profile" value={notifs} onChange={setNotifs}/>
          <Toggle label="Email alerts" desc="Receive recommendations via email" value={emailAlerts} onChange={setEmails}/>
        </div>
      </div>
      {/* Account info */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e0e7ff', padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>👤 Account info</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['Name', candidate.fullName], ['Email', candidate.contactInfo ?? ''], ['Membership', candidate.isMember ? 'Member ⭐' : 'Free plan']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#9ca3af' }}>{k}</span>
              <span style={{ color: '#374151', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────
function LogoSVG() {
  return (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
      <circle cx="18" cy="22" r="10" fill="url(#nbG)"/>
      <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95"/>
      <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="34" cy="10" r="4" fill="#8b5cf6"/>
      <circle cx="37" cy="22" r="4" fill="#6366f1"/>
      <circle cx="34" cy="34" r="4" fill="#8b5cf6"/>
      <defs><linearGradient id="nbG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
    </svg>
  );
}

function NavIconBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 10, border: 'none', background: active ? '#f8f7ff' : 'transparent', color: active ? '#6366f1' : '#6b7280', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
      {icon}<span>{label}</span>
    </button>
  );
}

function SidePanel({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', top: 60, right: 0, zIndex: 200, background: '#fff', width: wide ? 380 : 320, height: 'calc(100vh - 60px)', borderLeft: '1.5px solid #e0e7ff', boxShadow: '-4px 0 24px rgba(99,102,241,0.08)', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#9ca3af', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
    </div>
  );
}

function GuestPrompt({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{ padding: '32px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Sign in required</p>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px', lineHeight: 1.6 }}>{message}</p>
      <a href="/candidate/login" onClick={onClose} style={{ display: 'block', padding: 11, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 10 }}>Sign in</a>
      <a href="/candidate/register" onClick={onClose} style={{ display: 'block', padding: 11, borderRadius: 10, border: '1.5px solid #e0e7ff', color: '#6366f1', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Register free</a>
    </div>
  );
}

function MenuBtn({ icon, label, onClick, color }: { icon: string; label: string; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 14, color: color ?? '#374151', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>{label}
    </button>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap' }}>{icon} {label}</span>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div><p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>{label}</p><p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{desc}</p></div>
      <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? '#6366f1' : '#e5e7eb', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}/>
      </button>
    </div>
  );
}

function formatEducation(level?: string | null) {
  const map: Record<string, string> = { high_school: 'High school', diploma: 'Diploma', bachelor: "Bachelor's", master: "Master's", phd: 'PhD', other: 'Other' };
  return level ? (map[level] ?? level) : undefined;
}

const sLabel: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const sInp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box' };

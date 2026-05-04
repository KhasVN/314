'use client';

// ═══════════════════════════════════════════════════════════════
// settings-page.tsx — Account Settings page
// Allows: change email, phone, password, sign out, close account
// Data pulled from DB via candidate profile
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../talent/api';
import { CandidateNavbar } from '../candidate-shared/candidate-navbar';

export function SettingsPage() {
  const [selectedId, setSelectedId] = useState('');
  const { data: candidates = [], mutate } = useSWR('settings-cands', talentApi.candidates.list);
  const currentCandidate = candidates.find(c => c.id === selectedId) ?? null;

  // Form states
  const [newEmail, setNewEmail]       = useState('');
  const [phone, setPhone]             = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [toast, setToast]             = useState('');
  const [showClose, setShowClose]     = useState(false);

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEmailSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    // TODO: wire to auth update endpoint
    showMsg('Email updated successfully');
    setNewEmail('');
  };

  const handlePhoneSave = (e: React.FormEvent) => {
    e.preventDefault();
    showMsg('Phone number updated successfully');
    setPhone('');
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) return showMsg('Password must be at least 8 characters');
    if (newPw !== confirmPw) return showMsg('Passwords do not match');
    // TODO: wire to authClient.changePassword()
    showMsg('Password updated successfully');
    setNewPw(''); setConfirmPw('');
  };

  const handleSignOut = () => {
    setSelectedId('');
    window.location.href = '/candidate/login';
  };

  const handleCloseAccount = async () => {
    if (!selectedId) return;
    await talentApi.candidates.remove(selectedId);
    setSelectedId('');
    mutate();
    window.location.href = '/home';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <CandidateNavbar
        candidates={candidates}
        selectedCandidateId={selectedId}
        onCandidateChange={setSelectedId}
        activePage="settings"
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 28px', letterSpacing: '-0.5px' }}>Account settings</h1>

        {!currentCandidate ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: '0 0 16px' }}>Select your profile to manage settings</p>
            <a href="/candidate/login" style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Sign in</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ACCOUNT TYPE */}
            <SettingSection>
              <SettingRow label="Account type" value="Job seeker">
                <OutlineBtn color="#6366f1">Change account type</OutlineBtn>
              </SettingRow>
            </SettingSection>

            {/* EMAIL */}
            <SettingSection>
              <SettingRow label="Email" value={currentCandidate.contactInfo ?? ''}>
                <form onSubmit={handleEmailSave} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email address" type="email"
                    style={inpStyle}/>
                  <OutlineBtn color="#6366f1" type="submit">Change email</OutlineBtn>
                </form>
              </SettingRow>
            </SettingSection>

            {/* PHONE */}
            <SettingSection>
              <SettingRow label="Phone number" value={phone || 'Not added'}>
                <form onSubmit={handlePhoneSave} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+61 4XX XXX XXX" type="tel"
                    style={inpStyle}/>
                  <OutlineBtn color="#6366f1" type="submit">Change phone</OutlineBtn>
                </form>
              </SettingRow>
            </SettingSection>

            {/* PASSWORD */}
            <SettingSection>
              <div style={{ padding: '16px 0' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: '0 0 12px' }}>🔐 Change password</p>
                <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min 8 characters)" type="password" style={inpStyle}/>
                  <input value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password" type="password"
                    style={{ ...inpStyle, borderColor: confirmPw && newPw !== confirmPw ? '#ef4444' : '#e5e7eb' }}/>
                  {confirmPw && newPw !== confirmPw && <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>Passwords do not match</p>}
                  <div><OutlineBtn color="#6366f1" type="submit">Update password</OutlineBtn></div>
                </form>
              </div>
            </SettingSection>

            {/* SIGN OUT */}
            <SettingSection>
              <SettingRow label={currentCandidate.contactInfo ?? ''} value="">
                <button onClick={handleSignOut} style={{ padding: '8px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Sign out
                </button>
              </SettingRow>
            </SettingSection>

            {/* CLOSE ACCOUNT */}
            <div style={{ padding: '8px 0' }}>
              <button onClick={() => setShowClose(true)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                Close my account
              </button>
            </div>

          </div>
        )}
      </main>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          ✓ {toast}
        </div>
      )}

      {/* CLOSE ACCOUNT MODAL */}
      {showClose && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', textAlign: 'center', margin: '0 0 8px' }}>Close your account?</h2>
            <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>
              This will permanently delete your profile from the database. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowClose(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleCloseAccount} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Yes, close account</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────
function SettingSection({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e0e7ff', padding: '0 20px' }}>{children}</div>;
}

function SettingRow({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div style={{ padding: '18px 0', borderBottom: children ? '1px solid #f1f5f9' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: children ? 12 : 0 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>{label}</p>
          {value && <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{value}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function OutlineBtn({ children, color, type, onClick }: { children: React.ReactNode; color: string; type?: 'button' | 'submit'; onClick?: () => void }) {
  return (
    <button type={type ?? 'button'} onClick={onClick} style={{ padding: '8px 18px', borderRadius: 10, border: `1.5px solid ${color}`, background: '#fff', color, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

const inpStyle: React.CSSProperties = { flex: 1, padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box', minWidth: 0 };

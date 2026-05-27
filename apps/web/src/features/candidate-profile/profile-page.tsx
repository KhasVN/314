'use client';

// ═══════════════════════════════════════════════════════════════
// profile-page.tsx
// Shows candidate profile data pulled from database.
// Allows uploading resume.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../talent/api';
import { CandidateNavbar } from '../candidate-shared/candidate-navbar';

export function ProfilePage() {
  const [selectedId, setSelectedId] = useState('');
  const { data: candidates = [] }   = useSWR('profile-cands', talentApi.candidates.list);
  const currentCandidate = candidates.find(c => c.id === selectedId) ?? null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <CandidateNavbar
        candidates={candidates}
        selectedCandidateId={selectedId}
        onCandidateChange={setSelectedId}
        activePage="profile"
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        {!currentCandidate ? (
          /* No profile selected */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ede9fe', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Select your profile</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>Choose your profile from the Account menu to view your details</p>
            <a href="/candidate/register" style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Create profile</a>
          </div>
        ) : (
          <div>
            {/* Profile header */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: '28px 28px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                {/* Avatar */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 28, flexShrink: 0 }}>
                  {currentCandidate.fullName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  {/* Name — clickable to edit */}
                  <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                    {currentCandidate.fullName}
                  </h1>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    {currentCandidate.contactInfo}
                  </p>
                  {currentCandidate.preferredLocations && (
                    <p style={{ fontSize: 14, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                      {currentCandidate.preferredLocations}
                    </p>
                  )}
                  {currentCandidate.isMember && (
                    <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, color: '#6366f1', background: '#ede9fe', padding: '3px 10px', borderRadius: 9999 }}>⭐ MEMBER</span>
                  )}
                </div>
              </div>

              {/* Employers visibility badge */}
              <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>👁️</span>
                <p style={{ fontSize: 13, color: '#166534', fontWeight: 500, margin: 0 }}>Employers can find you</p>
              </div>
            </div>

            {/* RESUME section */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>📄 Resume</h2>
              {currentCandidate.resumeText ? (
                <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>📋</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#166534', margin: 0 }}>Resume uploaded</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Your resume is visible to employers</p>
                    </div>
                  </div>
                  <label style={{ padding: '7px 16px', borderRadius: 9999, background: '#fff', border: '1px solid #bbf7d0', color: '#166534', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Replace
                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}/>
                  </label>
                </div>
              ) : (
                <div style={{ padding: 20, background: '#fafafa', borderRadius: 12, border: '2px dashed #e0e7ff', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 14px' }}>No resume uploaded yet</p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <label style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Upload resume
                      <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}/>
                    </label>
                    <button style={{ padding: '10px 24px', borderRadius: 12, border: '1.5px solid #e0e7ff', background: '#fff', color: '#6366f1', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Build resume
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE DETAILS */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>📋 Profile details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Education', value: formatEdu(currentCandidate.education), icon: '🎓' },
                  { label: 'Field of study', value: currentCandidate.major, icon: '📚' },
                  { label: 'Years of experience', value: currentCandidate.yearsOfExperience != null ? `${currentCandidate.yearsOfExperience} years` : null, icon: '📅' },
                  { label: 'Preferred work mode', value: currentCandidate.preferredWorkMode?.replace('_', '-'), icon: '💼' },
                ].filter(r => r.value).map((row, i, arr) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <span style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{row.icon}</span>{row.label}
                    </span>
                    <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SKILLS */}
            {currentCandidate.skills && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24, marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>⚡ Skills</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {currentCandidate.skills.split(',').map(s => (
                    <span key={s.trim()} style={{ fontSize: 13, padding: '5px 14px', borderRadius: 9999, background: '#f8f7ff', border: '1px solid #e0e7ff', color: '#6366f1', fontWeight: 500 }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* WORK EXPERIENCE */}
            {currentCandidate.workExperience && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>💼 Work experience</h2>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{currentCandidate.workExperience}</p>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

function formatEdu(level?: string | null) {
  const map: Record<string, string> = { high_school: 'High school', diploma: 'Diploma', bachelor: "Bachelor's degree", master: "Master's degree", phd: 'PhD', other: 'Other' };
  return level ? (map[level] ?? level) : null;
}

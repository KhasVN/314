'use client';

// hero-search.tsx — matches home page theme
// Light purple gradient banner, indigo/purple accents

import { useState, type FormEvent } from 'react';
import type { JobSearchQueryDto } from '@talent-matching/dtos';

type Props = {
  onSearch: (params: JobSearchQueryDto) => void;
  onClear: () => void;
};

const POPULAR_TAGS = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Remote', 'Marketing', 'UX Designer'];

export function HeroSearch({ onSearch, onClear }: Props) {
  const [keyword, setKeyword]   = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({ query: keyword.trim() || undefined, location: location.trim() || undefined, limit: 100 });
  };

  const handleTag = (tag: string) => {
    setKeyword(tag);
    onSearch({ query: tag, limit: 100 });
  };

  const handleClear = () => {
    setKeyword('');
    setLocation('');
    onClear();
  };

  return (
    <section style={{ background: 'linear-gradient(160deg, #f8f7ff 0%, #f0f4ff 60%, #faf5ff 100%)', padding: '48px 24px 40px', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -60, right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: -40, left: '5%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, marginBottom: 16, letterSpacing: '0.04em' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}/>
          INTELLIGENT TALENT MATCHING
        </div>

        <h1 style={{ fontWeight: 900, color: '#0f172a', margin: '0 0 6px', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.5px' }}>
          Find your next role
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 24px' }}>
          Search thousands of jobs matched to your skills and experience
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

            {/* Keyword */}
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 12, padding: '0 16px', gap: 10, border: '1.5px solid #e0e7ff', boxShadow: '0 1px 4px rgba(99,102,241,0.06)' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                placeholder="Job title, keywords, or company"
                style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#111827' }}/>
              {keyword && <button type="button" onClick={handleClear} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, padding: 0 }}>✕</button>}
            </div>

            {/* Location */}
            <div style={{ width: 220, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 12, padding: '0 16px', gap: 10, border: '1.5px solid #e0e7ff', boxShadow: '0 1px 4px rgba(99,102,241,0.06)' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="City or remote"
                style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#111827' }}/>
            </div>

            {/* Submit */}
            <button type="submit" style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Find jobs
            </button>
          </div>

          {/* Popular tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Popular:</span>
            {POPULAR_TAGS.map(tag => (
              <button key={tag} type="button" onClick={() => handleTag(tag)}
                style={{ fontSize: 12, padding: '4px 12px', borderRadius: 9999, background: '#fff', border: '1px solid #e0e7ff', color: '#6366f1', fontWeight: 500, cursor: 'pointer' }}>
                {tag}
              </button>
            ))}
          </div>
        </form>

      </div>
    </section>
  );
}

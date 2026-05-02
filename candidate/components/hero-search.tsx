'use client';

// ═══════════════════════════════════════════════════════════════
// hero-search.tsx  —  HERO SEARCH BANNER
//
// The large blue banner at the top of the page.
// Contains: headline, keyword input, location input, search button.
// Also shows popular quick-search tags below the bar.
//
// When submitted, calls onSearch() with the query params.
// The parent (candidate-home.tsx) sends these to the backend
// via GET /api/jobs/search which runs fuzzy + vector search.
// ═══════════════════════════════════════════════════════════════

import { useState, type FormEvent } from 'react';
import type { JobSearchQueryDto } from '@talent-matching/dtos';

type Props = {
  onSearch: (params: JobSearchQueryDto) => void;
  onClear: () => void;
};

// ── POPULAR TAGS — quick fill for common searches ─────────────
const POPULAR_TAGS = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Remote', 'Marketing', 'UX Designer'];

export function HeroSearch({ onSearch, onClear }: Props) {

  // ── LOCAL FORM STATE ──────────────────────────────────────
  const [keyword, setKeyword]   = useState(''); // job title / keyword input
  const [location, setLocation] = useState(''); // location / city input

  // ── HANDLE FORM SUBMIT ────────────────────────────────────
  // Packages form inputs into the search query and calls parent
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({
      query:    keyword.trim()  || undefined,
      location: location.trim() || undefined,
      limit: 100,
    });
  };

  // ── HANDLE QUICK TAG CLICK ────────────────────────────────
  const handleTag = (tag: string) => {
    setKeyword(tag);
    onSearch({ query: tag, limit: 100 });
  };

  // ── HANDLE CLEAR ─────────────────────────────────────────
  const handleClear = () => {
    setKeyword('');
    setLocation('');
    onClear();
  };

  return (
    <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1a56db 60%, #2563eb 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ── HEADLINE ── */}
        <h1 className="text-white font-bold mb-1" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
          Find your next job
        </h1>
        <p className="text-blue-200 text-sm mb-6">
          Search thousands of jobs — powered by intelligent matching
        </p>

        {/* ── SEARCH BAR ── */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">

          {/* KEYWORD INPUT — searches title, description, skills in DB */}
          <div className="flex-1 flex items-center bg-white rounded-full px-4 gap-3 shadow-lg">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title, keywords, or company"
              className="w-full py-3.5 text-gray-800 bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
            {keyword && (
              <button type="button" onClick={handleClear} className="text-gray-300 hover:text-gray-500 text-lg">✕</button>
            )}
          </div>

          {/* LOCATION INPUT — filters by job.location field in DB */}
          <div className="flex items-center bg-white rounded-full px-4 gap-3 sm:w-56 shadow-lg">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or remote"
              className="w-full py-3.5 text-gray-800 bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
          </div>

          {/* SEARCH BUTTON */}
          <button
            type="submit"
            className="px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: '#059669' }}
          >
            Find jobs
          </button>

        </form>

        {/* ── POPULAR QUICK-SEARCH TAGS ── */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-blue-300 text-xs">Popular:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTag(tag)}
              className="text-xs px-3 py-1 rounded-full text-white transition-colors hover:bg-white/30"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}

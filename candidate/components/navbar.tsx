// ═══════════════════════════════════════════════════════════════
// navbar.tsx  —  TOP NAVIGATION BAR
//
// Sticky header shown on every page.
// Contains: logo, nav links, profile selector (for recommendations),
// sign in button, and "Post a job" CTA.
//
// The profile selector lets a candidate choose "themselves" from
// the database — this drives the Top-10 recommendation engine.
// ═══════════════════════════════════════════════════════════════

import type { CandidateDto } from '@talent-matching/dtos';

type Props = {
  candidates: CandidateDto[];          // all candidates from DB (for profile selector)
  selectedCandidateId: string;         // currently selected profile
  onCandidateChange: (id: string) => void; // called when user picks their profile
};

export function Navbar({ candidates, selectedCandidateId, onCandidateChange }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* ── LOGO ── */}
        <a href="/candidate" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: '#1a56db' }}>
            T
          </div>
          <span className="font-bold text-gray-900 text-base hidden sm:block">TalentMatch</span>
        </a>

        {/* ── NAV LINKS ── */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/candidate" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-0.5">Home</a>
          <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Company reviews</a>
          <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Salary guide</a>
        </nav>

        {/* ── RIGHT SIDE ── */}
        <div className="flex items-center gap-3">

          {/* PROFILE SELECTOR — picks "you" to get personalised recommendations */}
          {/* Fetches all candidates from DB and lists them in a dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden lg:block whitespace-nowrap">Your profile:</span>
            <select
              value={selectedCandidateId}
              onChange={(e) => onCandidateChange(e.target.value)}
              className="text-xs border border-gray-200 rounded-full px-2 py-1.5 text-gray-700 outline-none focus:border-blue-400 bg-gray-50 max-w-[160px]"
            >
              <option value="">Select profile</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>

          {/* SIGN IN */}
          <a href="#" className="hidden sm:block text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">
            Sign in
          </a>

          {/* POST A JOB — links to admin dashboard */}
          <a href="/" className="text-sm font-semibold px-4 py-1.5 rounded-full text-white transition-opacity hover:opacity-90 whitespace-nowrap" style={{ background: '#1a56db' }}>
            Post a job
          </a>
        </div>

      </div>
    </header>
  );
}

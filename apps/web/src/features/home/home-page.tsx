// ═══════════════════════════════════════════════════════════════
// features/home/home-page.tsx  —  PUBLIC LANDING PAGE
// Modern light design — fresh, clean, attractive
// ═══════════════════════════════════════════════════════════════

export function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827' }}>

      {/* ━━━ NAVBAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Sticky white navbar with subtle border                  */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo — indigo gradient */}
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="18" cy="22" r="10" fill="url(#logoG)"/>
            <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95"/>
            <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="34" cy="10" r="4" fill="#8b5cf6"/>
            <circle cx="37" cy="22" r="4" fill="#6366f1"/>
            <circle cx="34" cy="34" r="4" fill="#8b5cf6"/>
            <defs>
              <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.3px' }}>TalentMatch</span>
          </a>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <a href="/candidate" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, fontWeight: 500 }}>Browse jobs</a>
            <a href="/candidate/register" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, fontWeight: 500 }}>Register</a>
            <a href="/candidate/login" style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', background: '#ede9fe', padding: '8px 18px', borderRadius: 10, textDecoration: 'none', marginLeft: 8 }}>Candidate sign in</a><a href="/employer/login" style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', padding: '8px 18px', borderRadius: 10, textDecoration: 'none', marginLeft: 8 }}>Employer sign in</a>
          </nav>

        </div>
      </header>

      {/* ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Light purple-tinted hero with large headline            */}
      <section style={{ background: 'linear-gradient(160deg, #f8f7ff 0%, #f0f4ff 50%, #faf5ff 100%)', padding: '90px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: -80, right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -60, left: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#7c3aed', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 9999, marginBottom: 24, letterSpacing: '0.04em' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}/>
          INTELLIGENT TALENT MATCHING
        </div>

        {/* Main headline */}
        <h1 style={{ fontWeight: 900, margin: '0 0 20px', lineHeight: 1.08, fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', letterSpacing: '-2px', color: '#0f172a' }}>
          Find your perfect job<br/>
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            powered by intelligent matching
          </span>
        </h1>

        {/* Subheadline */}
        <p style={{ fontSize: 18, color: '#64748b', margin: '0 auto 40px', maxWidth: 520, lineHeight: 1.7, fontWeight: 400 }}>
          Intelligent matching that connects the right candidates with the right employers — going beyond keywords to truly understand talent.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <a href="/candidate/register" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Get started free →
          </a>
          <a href="/candidate" style={{ background: '#fff', color: '#374151', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1.5px solid #e5e7eb' }}>
            Browse jobs
          </a>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
          {['✓ Free to register', '✓ Intelligent matching', '✓ 100+ job postings', '✓ Two-way recommendations'].map(t => (
            <span key={t} style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{t}</span>
          ))}
        </div>

      </section>

      {/* ━━━ ROLE PICKER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Two side-by-side cards for candidate and employer       */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>Get started today</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.5px' }}>Who are you?</h2>
            <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>Choose your path and get started in minutes</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 760, margin: '0 auto' }}>

            {/* CANDIDATE CARD */}
            <div style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid #e0e7ff', background: 'linear-gradient(160deg, #f8f7ff, #fff)' }}>
              {/* Card top accent */}
              <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}/>
              <div style={{ padding: '36px 32px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>I'm a candidate</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 8px' }}>Find jobs matched to your skills, education, and preferences using intelligent matching.</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {['Get Top-10 matched job recommendations', 'Smart skill-based matching', 'Browse all available jobs', 'Track your applications'].map(f => (
                    <li key={f} style={{ fontSize: 13, color: '#6b7280', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#7c3aed', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/candidate/register" style={{ display: 'block', padding: '13px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center', marginBottom: 12 }}>
                  Register as candidate
                </a>
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                  Have an account?{' '}
                  <a href="/candidate/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
                </p>
              </div>
            </div>

            {/* EMPLOYER CARD */}
            <div style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid #d1fae5', background: 'linear-gradient(160deg, #f0fdf9, #fff)' }}>
              <div style={{ height: 4, background: 'linear-gradient(90deg, #10b981, #059669)' }}/>
              <div style={{ padding: '36px 32px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>I'm an employer</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 8px' }}>Find the right talent for your company using intelligent matching.</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {['Get Top-10 matched candidates', 'Post job descriptions', 'Filter by skills and education', 'Manage applications easily'].map(f => (
                    <li key={f} style={{ fontSize: 13, color: '#6b7280', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/employer/register" style={{ display: 'block', padding: '13px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center', marginBottom: 12 }}>
                  Register as employer
                </a>
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                  Have an account?{' '}
                  <a href="/" style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>Go to dashboard</a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Step-by-step process for candidates                     */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>Simple process</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.5px' }}>How it works</h2>
            <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>Get matched with your dream job in 3 easy steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '📝', title: 'Create your profile', desc: 'Fill in your education, skills, experience, and preferences. Takes less than 5 minutes.', color: '#ede9fe', border: '#ddd6fe' },
              { step: '02', icon: '🤖', title: 'System analyses your profile', desc: 'Our system uses vector embeddings to understand your skills and match them to relevant jobs.', color: '#e0f2fe', border: '#bae6fd' },
              { step: '03', icon: '🎯', title: 'Get matched jobs', desc: 'Receive your Top-10 personalised job recommendations ranked by relevance to your profile.', color: '#dcfce7', border: '#bbf7d0' },
              { step: '04', icon: '🚀', title: 'Apply with confidence', desc: 'Apply to jobs you are genuinely matched for. Track your application status in real time.', color: '#fef9c3', border: '#fde68a' },
            ].map(s => (
              <div key={s.step} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#d1d5db', letterSpacing: '0.05em' }}>STEP {s.step}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Platform feature highlights with icons                  */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>Platform features</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.5px' }}>Why TalentMatch?</h2>
            <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>Built with intelligent matching to go beyond a regular job board</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { bg: '#f8f7ff', border: '#e0e7ff', icon: '🧠', iconBg: '#ede9fe', title: 'Semantic search', desc: 'Uses vector embeddings to understand the meaning behind your profile — not just keyword matching.' },
              { bg: '#f0fdf9', border: '#d1fae5', icon: '🔄', iconBg: '#d1fae5', title: 'Two-way matching', desc: 'Candidates find jobs that fit them. Employers find candidates that fit their JD. Both sides get personalised recommendations.' },
              { bg: '#fff7ed', border: '#fed7aa', icon: '⚡', iconBg: '#fed7aa', title: 'Fuzzy search', desc: 'Handles typos and synonyms. Searching "sofware enginer" or "programmer" still returns "software engineer" jobs.' },
              { bg: '#f0f9ff', border: '#bae6fd', icon: '📊', iconBg: '#bae6fd', title: 'Smart filters', desc: 'Filter by work mode, location, education level, and years of experience to narrow down exactly what you need.' },
              { bg: '#fdf4ff', border: '#e9d5ff', icon: '⭐', iconBg: '#e9d5ff', title: 'Membership tiers', desc: 'Free users get Top-10 matches. Members unlock unlimited recommendations for maximum job-seeking power.' },
              { bg: '#f0fdf4', border: '#bbf7d0', icon: '📋', iconBg: '#bbf7d0', title: 'Application tracking', desc: 'Track every application through submitted, reviewed, shortlisted, accepted, or rejected — all in one place.' },
            ].map(f => (
              <div key={f.title} style={{ background: f.bg, borderRadius: 20, padding: '28px 24px', border: `1px solid ${f.border}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Platform numbers in a colourful strip                   */}
      <section style={{ padding: '0 24px 80px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', borderRadius: 28, padding: '56px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 32, textAlign: 'center' }}>
            {[
              { n: '100+', l: 'Job postings' },
              { n: 'IMS',  l: 'Intelligent vector search' },
              { n: '2-way', l: 'Smart recommendations' },
              { n: '5',    l: 'Application statuses' },
              { n: 'Free', l: 'To get started' },
            ].map(s => (
              <div key={s.n}>
                <p style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-1px' }}>{s.n}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 500 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Final call to action before footer                      */}
      <section style={{ padding: '0 24px 80px', background: '#f8fafc', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 80 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Ready to find your match?
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', margin: '0 0 32px', lineHeight: 1.7 }}>
            Join TalentMatch today. Create your profile in minutes and let our system find the perfect job for you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/candidate/register" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              Register as candidate →
            </a>
            <a href="/employer/register" style={{ background: '#fff', color: '#374151', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1.5px solid #e5e7eb' }}>
              Register as employer
            </a>
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{ background: '#0f172a', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
            <circle cx="18" cy="22" r="10" fill="url(#logoGF)"/>
            <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95"/>
            <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="34" cy="10" r="4" fill="#8b5cf6"/>
            <circle cx="37" cy="22" r="4" fill="#6366f1"/>
            <circle cx="34" cy="34" r="4" fill="#8b5cf6"/>
            <defs>
              <linearGradient id="logoGF" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>TalentMatch</span>
            <span style={{ fontSize: 13, color: '#475569', marginLeft: 8 }}>CSIT314 Group Project</span>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { l: 'Browse jobs', h: '/candidate' },
              { l: 'For employers', h: '/employer' },
              { l: 'Register', h: '/candidate/register' },
              { l: 'Sign in', h: '/candidate/login' },
            ].map(link => (
              <a key={link.h} href={link.h} style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>{link.l}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>© 2025 TalentMatch · Intelligent Talent Matching Platform</p>
        </div>
      </footer>

    </div>
  );
}

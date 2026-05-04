'use client';

// ═══════════════════════════════════════════════════════════════
// candidate-register-page.tsx
// Theme: matches home page — white bg, indigo/purple gradients
// Uses Better Auth signUp + saves candidate profile to DB
//
// DYNAMIC SKILLS:
// Instead of a hardcoded list, skills are suggested based on
// what the user types in the "Field of study / major" field.
// The MAJOR_SKILLS_MAP maps keywords to relevant skill chips.
// If no major matches, a general set of skills is shown.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';
import { talentApi } from '../talent/api';

type Form = {
  fullName: string; email: string; password: string; confirmPassword: string;
  education: string; major: string; yearsOfExperience: string;
  workExperience: string; preferredLocations: string; preferredWorkMode: string;
};

const EMPTY: Form = {
  fullName: '', email: '', password: '', confirmPassword: '',
  education: '', major: '', yearsOfExperience: '',
  workExperience: '', preferredLocations: '', preferredWorkMode: '',
};

// ── MAJOR → SKILLS MAPPING ────────────────────────────────────
// Each key is a keyword to match against the user's typed major.
// Skills are suggested dynamically — not hardcoded to one list.
// Keywords are matched case-insensitively against the major field.
const MAJOR_SKILLS_MAP: Record<string, string[]> = {
  // ── Computer Science / Software Engineering ──
  'computer science':   ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS', 'Java', 'C++', 'Algorithms', 'Data Structures'],
  'software':           ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Git', 'Docker', 'REST APIs', 'Agile', 'Testing', 'CI/CD'],
  'information technology': ['Networking', 'Cybersecurity', 'Linux', 'Cloud Computing', 'AWS', 'Azure', 'SQL', 'IT Support', 'Docker', 'Python'],
  'cybersecurity':      ['Network Security', 'Penetration Testing', 'Firewalls', 'Linux', 'Python', 'Cryptography', 'SIEM', 'Risk Assessment', 'Ethical Hacking'],
  'web':                ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Node.js', 'REST APIs', 'Figma', 'Git', 'Responsive Design'],
  'mobile':             ['React Native', 'Swift', 'Kotlin', 'Flutter', 'iOS', 'Android', 'Firebase', 'REST APIs', 'Git'],
  'artificial intelligence': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Pandas', 'NumPy', 'Statistics'],
  'machine learning':   ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Statistics', 'SQL', 'Data Visualisation', 'Deep Learning'],

  // ── Data ──
  'data science':       ['Python', 'R', 'SQL', 'Machine Learning', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Statistics', 'Data Visualisation', 'Excel'],
  'data analytics':     ['SQL', 'Excel', 'Tableau', 'Power BI', 'Python', 'R', 'Statistics', 'Data Visualisation', 'Google Analytics', 'ETL'],
  'data engineering':   ['Python', 'SQL', 'Apache Spark', 'Kafka', 'Airflow', 'AWS', 'Azure', 'ETL', 'PostgreSQL', 'MongoDB', 'Docker'],
  'database':           ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Oracle', 'Database Design', 'Query Optimisation', 'ETL', 'Data Modelling'],
  'statistics':         ['R', 'Python', 'SPSS', 'Stata', 'Excel', 'Statistical Modelling', 'Hypothesis Testing', 'Data Visualisation', 'SAS'],
  'mathematics':        ['MATLAB', 'Python', 'R', 'Statistics', 'Linear Algebra', 'Calculus', 'Mathematical Modelling', 'Excel', 'LaTeX'],

  // ── Business ──
  'business':           ['Project Management', 'Leadership', 'Communication', 'Microsoft Office', 'Excel', 'PowerPoint', 'Business Analysis', 'Strategic Planning', 'CRM'],
  'management':         ['Project Management', 'Leadership', 'Team Management', 'Budgeting', 'Strategic Planning', 'Communication', 'Problem Solving', 'CRM', 'Agile'],
  'entrepreneurship':   ['Business Development', 'Pitching', 'Financial Planning', 'Marketing', 'Leadership', 'Networking', 'Product Management', 'Strategic Planning'],
  'supply chain':       ['Logistics', 'SAP', 'Inventory Management', 'Procurement', 'Excel', 'Supply Chain Management', 'ERP', 'Data Analysis', 'Operations'],
  'operations':         ['Process Improvement', 'Lean', 'Six Sigma', 'ERP', 'SAP', 'Excel', 'Supply Chain', 'Project Management', 'Budgeting'],
  'project management': ['Agile', 'Scrum', 'JIRA', 'MS Project', 'Risk Management', 'Budgeting', 'Stakeholder Management', 'Leadership', 'Communication'],

  // ── Finance / Accounting ──
  'accounting':         ['Excel', 'MYOB', 'Xero', 'QuickBooks', 'Financial Reporting', 'Tax', 'Auditing', 'Bookkeeping', 'Financial Analysis', 'SAP'],
  'finance':            ['Financial Analysis', 'Excel', 'Bloomberg', 'Financial Modelling', 'Valuation', 'Risk Management', 'Investment Analysis', 'Power BI', 'SQL'],
  'economics':          ['Econometrics', 'R', 'Stata', 'Excel', 'Financial Analysis', 'Policy Analysis', 'Data Analysis', 'Statistics', 'Research'],
  'actuarial':          ['Excel', 'R', 'Python', 'Statistics', 'Risk Modelling', 'SAS', 'Financial Maths', 'Actuarial Software', 'Data Analysis'],
  'banking':            ['Financial Analysis', 'Risk Management', 'Excel', 'Bloomberg', 'Credit Analysis', 'AML', 'Compliance', 'Financial Modelling'],

  // ── Marketing / Communication ──
  'marketing':          ['Digital Marketing', 'SEO', 'SEM', 'Google Analytics', 'Social Media', 'Content Creation', 'Email Marketing', 'Adobe Creative Suite', 'HubSpot', 'Copywriting'],
  'digital marketing':  ['SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'Google Analytics', 'Content Marketing', 'Email Marketing', 'HubSpot', 'Social Media Management'],
  'communication':      ['Copywriting', 'Public Relations', 'Media Relations', 'Social Media', 'Content Creation', 'Presentation', 'Journalism', 'Adobe Creative Suite'],
  'public relations':   ['Media Relations', 'Copywriting', 'Press Releases', 'Crisis Management', 'Social Media', 'Stakeholder Engagement', 'Event Management'],
  'journalism':         ['Writing', 'Research', 'Interviewing', 'Editing', 'Social Media', 'Video Production', 'Photography', 'CMS', 'Content Management'],
  'advertising':        ['Creative Strategy', 'Copywriting', 'Adobe Creative Suite', 'Social Media', 'Campaign Management', 'Market Research', 'Analytics'],

  // ── Design ──
  'design':             ['Figma', 'Adobe Photoshop', 'Illustrator', 'InDesign', 'UI/UX Design', 'Wireframing', 'Prototyping', 'Typography', 'Branding'],
  'graphic design':     ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Typography', 'Branding', 'Print Design', 'Motion Graphics', 'Canva'],
  'ux':                 ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Information Architecture', 'Adobe XD', 'Design Thinking'],
  'ui':                 ['Figma', 'Adobe XD', 'HTML', 'CSS', 'JavaScript', 'Wireframing', 'Prototyping', 'Design Systems', 'Responsive Design'],
  'fashion':            ['Trend Forecasting', 'Garment Construction', 'Adobe Illustrator', 'Pattern Making', 'Textile Knowledge', 'Fashion Styling', 'Merchandising'],
  'architecture':       ['AutoCAD', 'Revit', 'SketchUp', '3ds Max', 'Rhino', 'Adobe Creative Suite', 'BIM', 'Building Codes', 'Project Management'],

  // ── Engineering ──
  'engineering':        ['CAD', 'AutoCAD', 'Project Management', 'MATLAB', 'Python', 'Problem Solving', 'Technical Drawing', 'Quality Control', 'Safety Management'],
  'mechanical':         ['AutoCAD', 'SolidWorks', 'MATLAB', 'FEA', 'Thermodynamics', 'Manufacturing', 'CAD/CAM', 'Project Management', 'Quality Control'],
  'electrical':         ['Circuit Design', 'MATLAB', 'AutoCAD', 'PLC', 'Power Systems', 'Embedded Systems', 'C++', 'Signal Processing', 'PCB Design'],
  'civil':              ['AutoCAD', 'Revit', 'Structural Analysis', 'Project Management', 'Concrete Design', 'Geotechnical', 'CAD', 'BIM', 'Cost Estimation'],
  'chemical':           ['Process Design', 'MATLAB', 'Aspen Plus', 'Laboratory Skills', 'Safety Management', 'Chemical Analysis', 'Quality Control', 'R&D'],
  'biomedical':         ['MATLAB', 'Medical Device Knowledge', 'Laboratory Skills', 'Python', 'Biostatistics', 'Regulatory Affairs', 'Research', 'Clinical Trials'],
  'environmental':      ['Environmental Impact Assessment', 'GIS', 'AutoCAD', 'Data Analysis', 'Report Writing', 'Field Work', 'Sustainability', 'Compliance'],

  // ── Health / Science ──
  'nursing':            ['Patient Care', 'Clinical Assessment', 'Medical Records', 'Medication Administration', 'Teamwork', 'Communication', 'Emergency Response'],
  'medicine':           ['Clinical Skills', 'Patient Assessment', 'Medical Research', 'Diagnostic Skills', 'Communication', 'Teamwork', 'Evidence-Based Practice'],
  'psychology':         ['Counselling', 'Research Methods', 'SPSS', 'Assessment Tools', 'Report Writing', 'Active Listening', 'CBT', 'Case Management'],
  'biology':            ['Laboratory Skills', 'PCR', 'Cell Culture', 'Microscopy', 'Data Analysis', 'Research', 'Scientific Writing', 'Python', 'SPSS'],
  'chemistry':          ['Laboratory Skills', 'Analytical Chemistry', 'HPLC', 'GC-MS', 'NMR', 'Research', 'Data Analysis', 'Scientific Writing', 'Safety'],
  'pharmacy':           ['Pharmacology', 'Drug Dispensing', 'Patient Counselling', 'Medical Terminology', 'Regulatory Affairs', 'Research', 'Quality Assurance'],
  'public health':      ['Epidemiology', 'Health Promotion', 'Research Methods', 'SPSS', 'Policy Analysis', 'Data Analysis', 'Program Evaluation', 'Communication'],
  'nutrition':          ['Nutritional Assessment', 'Meal Planning', 'Research', 'Client Education', 'Food Science', 'Health Promotion', 'Data Analysis'],

  // ── Education ──
  'education':          ['Curriculum Development', 'Classroom Management', 'Assessment', 'Communication', 'Lesson Planning', 'Learning Management Systems', 'Differentiated Instruction'],
  'teaching':           ['Lesson Planning', 'Curriculum Design', 'Classroom Management', 'Assessment', 'Student Engagement', 'Communication', 'Digital Literacy'],

  // ── Law ──
  'law':                ['Legal Research', 'Contract Drafting', 'Negotiation', 'Legal Writing', 'Compliance', 'Case Management', 'Microsoft Word', 'Attention to Detail'],
  'legal':              ['Legal Research', 'Contract Review', 'Compliance', 'Legal Writing', 'Due Diligence', 'Negotiation', 'Corporate Law', 'Litigation Support'],

  // ── Hospitality / Tourism ──
  'hospitality':        ['Customer Service', 'Event Management', 'Food & Beverage', 'Hotel Management', 'Reservations Systems', 'Communication', 'Teamwork', 'Revenue Management'],
  'tourism':            ['Customer Service', 'Travel Planning', 'GDS Systems', 'Communication', 'Cultural Awareness', 'Sales', 'Event Management', 'Marketing'],

  // ── Human Resources ──
  'human resources':    ['Recruitment', 'Onboarding', 'Performance Management', 'Employee Relations', 'HRIS', 'Payroll', 'Compliance', 'Training & Development', 'Communication'],
  'hr':                 ['Recruitment', 'Onboarding', 'Performance Management', 'Employee Relations', 'HRIS', 'Payroll', 'Compliance', 'Training & Development'],

  // ── General fallback ──
  'general':            ['Communication', 'Problem Solving', 'Teamwork', 'Microsoft Office', 'Time Management', 'Critical Thinking', 'Leadership', 'Adaptability', 'Customer Service'],
};

// ── HELPER: Get suggested skills from major input ─────────────
// Searches MAJOR_SKILLS_MAP keys for partial keyword matches.
// Returns the first matched skill list, or general skills if
// no match found. Case-insensitive matching.
function getSuggestedSkills(major: string): string[] {
  if (!major.trim()) return MAJOR_SKILLS_MAP['general'];
  const lower = major.toLowerCase();
  for (const [keyword, skills] of Object.entries(MAJOR_SKILLS_MAP)) {
    if (lower.includes(keyword)) return skills;
  }
  // No exact match — return general skills
  return MAJOR_SKILLS_MAP['general'];
}

export function CandidateRegisterPage() {
  const router = useRouter();
  const [form, setForm]          = useState<Form>(EMPTY);
  const [skills, setSkills]      = useState<string[]>([]);
  const [customSkill, setCustom] = useState('');
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState('');
  const [done, setDone]          = useState(false);
  const [step, setStep]          = useState(1);

  // ── DYNAMIC SKILLS LIST ───────────────────────────────────────
  // Re-computed every time the major field changes.
  // useMemo ensures it only recalculates when form.major changes.
  const suggestedSkills = useMemo(
    () => getSuggestedSkills(form.major),
    [form.major]
  );

  const set = (f: keyof Form, v: string) => { setForm(p => ({...p, [f]: v})); setError(''); };
  const toggleSkill = (s: string) => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const addCustom = () => { const t = customSkill.trim(); if (t && !skills.includes(t)) setSkills(p => [...p, t]); setCustom(''); };

  const handleNext = () => {
    if (step === 1) {
      if (!form.fullName.trim()) return setError('Full name is required.');
      if (!form.email.trim())    return setError('Email is required.');
      if (!form.password)        return setError('Password is required.');
      if (form.password.length < 8) return setError('Password must be at least 8 characters.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const auth = await authClient.signUp.email({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (auth.error) {
        setError(auth.error.message ?? 'Registration failed. Email may already exist.');
        setStep(1);
        return;
      }
      const userId = auth.data?.user?.id ?? (auth.data as any)?.id;
      if (!userId) { setError('Could not get user ID. Please try again.'); return; }

      await talentApi.candidates.create({
        userId,
        fullName:           form.fullName.trim(),
        contactInfo:        form.email.trim().toLowerCase(),
        education:          (form.education as any) || undefined,
        major:              form.major.trim() || undefined,
        yearsOfExperience:  form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
        workExperience:     form.workExperience.trim() || undefined,
        skills:             skills.length > 0 ? skills.join(', ') : undefined,
        preferredLocations: form.preferredLocations.trim() || undefined,
        preferredWorkMode:  (form.preferredWorkMode as any) || undefined,
        isMember: false,
      });

      setDone(true);
      setTimeout(() => router.push('/candidate'), 2000);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS ───────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f8f7ff 0%, #f0f4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 400, border: '1.5px solid #e0e7ff' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>You're all set!</h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Account and profile saved to database.</p>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 4px' }}>Login anytime with:</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>{form.email}</p>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>Redirecting to your job feed...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* NAVBAR */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Logo/>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.3px' }}>TalentMatch</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/home" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>← Back to home</a>
            <a href="/candidate/login" style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '7px 18px', borderRadius: 10, textDecoration: 'none' }}>Sign in</a>
          </div>
        </div>
      </header>

      {/* HERO STRIP */}
      <div style={{ background: 'linear-gradient(160deg, #f8f7ff 0%, #f0f4ff 60%, #faf5ff 100%)', padding: '40px 24px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, marginBottom: 16, letterSpacing: '0.04em' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}/>
          CANDIDATE REGISTRATION
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Create your profile</h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 28px' }}>Fill in your details to start getting matched with jobs</p>

        {/* Step progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {[{ n: 1, label: 'Account' }, { n: 2, label: 'Profile' }, { n: 3, label: 'Skills' }].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: step > s.n ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : step === s.n ? '#6366f1' : '#f1f5f9', color: step >= s.n ? '#fff' : '#9ca3af' }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step >= s.n ? '#6366f1' : '#9ca3af' }}>{s.label}</span>
              </div>
              {s.n < 3 && <div style={{ width: 32, height: 2, borderRadius: 1, background: step > s.n ? '#6366f1' : '#e5e7eb' }}/>}
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '24px 24px 80px' }}>
        <form onSubmit={step < 3 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>

          {/* ── STEP 1: ACCOUNT ── */}
          {step === 1 && (
            <FormCard title="Account credentials" icon="🔐" subtitle="Used to log in every time">
              <Field label="Full name" required>
                <input style={inp} placeholder="e.g. John Smith" value={form.fullName} onChange={e => set('fullName', e.target.value)}/>
              </Field>
              <Field label="Email address" required hint="This will be your login username">
                <input style={inp} type="email" placeholder="e.g. john@email.com" value={form.email} onChange={e => set('email', e.target.value)}/>
              </Field>
              <Field label="Password" required hint="Minimum 8 characters">
                <input style={inp} type="password" placeholder="Create a strong password" value={form.password} onChange={e => set('password', e.target.value)}/>
              </Field>
              <Field label="Confirm password" required>
                <input style={{ ...inp, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : '#e5e7eb' }}
                  type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}/>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>Passwords do not match</p>
                )}
              </Field>
            </FormCard>
          )}

          {/* ── STEP 2: PROFILE ── */}
          {step === 2 && (
            <>
              <FormCard title="Education" icon="🎓">
                <Field label="Highest education level">
                  <select style={inp} value={form.education} onChange={e => set('education', e.target.value)}>
                    <option value="">Select level</option>
                    <option value="high_school">High school</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor's degree</option>
                    <option value="master">Master's degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                {/* MAJOR INPUT — typing here updates skill suggestions in Step 3 */}
                <Field label="Field of study / major" hint="Type your major and we'll suggest relevant skills in the next step">
                  <input style={inp} placeholder="e.g. Computer Science, Accounting, Marketing"
                    value={form.major} onChange={e => set('major', e.target.value)}/>
                  {/* Live preview of matched skills category */}
                  {form.major.trim() && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f8f7ff', borderRadius: 8, border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12 }}>✨</span>
                      <p style={{ fontSize: 12, color: '#6366f1', margin: 0, fontWeight: 500 }}>
                        We'll suggest <strong>{getSuggestedSkills(form.major).length} skills</strong> for <strong>{form.major}</strong> in the next step
                      </p>
                    </div>
                  )}
                </Field>
              </FormCard>

              <FormCard title="Experience" icon="💼">
                <Field label="Years of work experience">
                  <select style={inp} value={form.yearsOfExperience} onChange={e => set('yearsOfExperience', e.target.value)}>
                    <option value="">Select years</option>
                    <option value="0">0 — Entry level</option>
                    <option value="1">1 year</option>
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="5">5 years</option>
                    <option value="7">7 years</option>
                    <option value="10">10+ years</option>
                  </select>
                </Field>
                <Field label="Work experience summary" hint="Brief description of previous roles">
                  <textarea style={{ ...inp, height: 'auto', resize: 'vertical' } as any} rows={4}
                    placeholder="e.g. 3 years as a software developer at XYZ..."
                    value={form.workExperience} onChange={e => set('workExperience', e.target.value)}/>
                </Field>
              </FormCard>
            </>
          )}

          {/* ── STEP 3: SKILLS + PREFERENCES ── */}
          {step === 3 && (
            <>
              <FormCard title="Skills" icon="⚡">

                {/* Dynamic skills header — shows which major drove the suggestions */}
                <div style={{ marginBottom: 12 }}>
                  {form.major.trim() ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>
                        Suggested skills for
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', background: '#ede9fe', padding: '2px 10px', borderRadius: 9999 }}>
                        {form.major}
                      </span>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 10px' }}>
                      General skills — go back and enter your major for personalised suggestions
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                    Click to select · You can also add custom skills below
                  </p>
                </div>

                {/* DYNAMIC skill chips — change based on form.major */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {suggestedSkills.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                      padding: '5px 13px', borderRadius: 9999, fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', border: '1.5px solid',
                      background: skills.includes(s) ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff',
                      color: skills.includes(s) ? '#fff' : '#374151',
                      borderColor: skills.includes(s) ? '#6366f1' : '#e5e7eb',
                      transition: 'all 0.15s',
                    }}>
                      {skills.includes(s) ? '✓ ' : '+ '}{s}
                    </button>
                  ))}
                </div>

                {/* Custom skill input */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp, flex: 1 }} placeholder="Add a skill not listed above..."
                    value={customSkill} onChange={e => setCustom(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}/>
                  <button type="button" onClick={addCustom} style={{ padding: '0 16px', borderRadius: 10, background: '#f1f5f9', border: '1px solid #e5e7eb', fontWeight: 600, cursor: 'pointer', fontSize: 13, color: '#374151' }}>Add</button>
                </div>

                {/* Selected skills display */}
                {skills.length > 0 && (
                  <div style={{ marginTop: 10, padding: 12, background: '#f8f7ff', borderRadius: 12, border: '1px solid #e0e7ff' }}>
                    <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, margin: '0 0 8px' }}>
                      Selected ({skills.length}):
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {skills.map(s => (
                        <span key={s} style={{ padding: '3px 10px', borderRadius: 9999, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {s}
                          <button type="button" onClick={() => toggleSkill(s)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </FormCard>

              <FormCard title="Job preferences" icon="🎯">
                <Field label="Preferred work location" hint="City or region">
                  <input style={inp} placeholder="e.g. Sydney, Melbourne, Remote"
                    value={form.preferredLocations} onChange={e => set('preferredLocations', e.target.value)}/>
                </Field>
                <Field label="Preferred work mode">
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { v: 'remote',  l: 'Remote',  c: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                      { v: 'on_site', l: 'On-site', c: '#6366f1', bg: '#f8f7ff', border: '#e0e7ff' },
                      { v: 'hybrid',  l: 'Hybrid',  c: '#8b5cf6', bg: '#faf5ff', border: '#e9d5ff' },
                    ].map(o => (
                      <button key={o.v} type="button"
                        onClick={() => set('preferredWorkMode', form.preferredWorkMode === o.v ? '' : o.v)}
                        style={{ flex: 1, padding: '12px 8px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: '2px solid', background: form.preferredWorkMode === o.v ? o.bg : '#fff', color: form.preferredWorkMode === o.v ? o.c : '#6b7280', borderColor: form.preferredWorkMode === o.v ? o.border : '#e5e7eb' }}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </Field>
              </FormCard>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12 }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                style={{ flex: '0 0 auto', padding: '13px 24px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                ← Back
              </button>
            )}
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating account...' : step < 3 ? 'Continue →' : 'Create my account →'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 16 }}>
            Already have an account?{' '}
            <a href="/candidate/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Sign in →</a>
          </p>

        </form>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
      <circle cx="18" cy="22" r="10" fill="url(#regLogoG)"/>
      <circle cx="18" cy="22" r="5" fill="#fff" opacity="0.95"/>
      <line x1="27" y1="15" x2="33" y2="10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="29" y1="22" x2="36" y2="22" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="27" y1="29" x2="33" y2="34" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="34" cy="10" r="4" fill="#8b5cf6"/>
      <circle cx="37" cy="22" r="4" fill="#6366f1"/>
      <circle cx="34" cy="34" r="4" fill="#8b5cf6"/>
      <defs>
        <linearGradient id="regLogoG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function FormCard({ title, icon, subtitle, children }: { title: string; icon: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e0e7ff', padding: 24, marginBottom: 16 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>{title}
        </h2>
        {subtitle && <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0 26px' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 5px' }}>{hint}</p>}
      {children}
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', background: '#fafafa', outline: 'none', boxSizing: 'border-box' };

'use client';

// filter-sidebar.tsx — matches home page theme
// White card with indigo/purple accents

import { useState } from 'react';
import type { JobSearchQueryDto } from '@talent-matching/dtos';

type Props = { onFilter: (params: JobSearchQueryDto) => void; };

export function FilterSidebar({ onFilter }: Props) {
  const [workMode,  setWorkMode]  = useState('');
  const [education, setEducation] = useState('');
  const [minYears,  setMinYears]  = useState('');

  const apply = (wm = workMode, edu = education, yrs = minYears) => {
    onFilter({
      workMode:          (wm  as JobSearchQueryDto['workMode'])          || undefined,
      requiredEducation: (edu as JobSearchQueryDto['requiredEducation']) || undefined,
      yearsOfExperience: yrs ? Number(yrs) : undefined,
      limit: 100,
    });
  };

  const reset = () => { setWorkMode(''); setEducation(''); setMinYears(''); onFilter({ limit: 100 }); };

  return (
    <aside style={{ display: 'none' }} className="lg-sidebar">
      <style>{`@media(min-width:1024px){.lg-sidebar{display:block!important}}`}</style>
      <div style={{ width: 220, background: '#fff', borderRadius: 20, padding: 20, border: '1.5px solid #e0e7ff', position: 'sticky', top: 80, fontFamily: 'system-ui, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Filters</h2>
          <button onClick={reset} style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Reset all</button>
        </div>

        {/* WORK MODE */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Work mode</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { value: '',        label: 'Any mode',  dot: '#d1d5db' },
              { value: 'remote',  label: 'Remote',    dot: '#10b981' },
              { value: 'on_site', label: 'On-site',   dot: '#6366f1' },
              { value: 'hybrid',  label: 'Hybrid',    dot: '#8b5cf6' },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="workMode" value={opt.value} checked={workMode === opt.value}
                  onChange={() => { setWorkMode(opt.value); apply(opt.value, education, minYears); }}
                  style={{ accentColor: '#6366f1', cursor: 'pointer' }}/>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }}/>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: workMode === opt.value ? 600 : 400 }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 20px' }}/>

        {/* EDUCATION */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Education required</h3>
          <select value={education}
            onChange={e => { setEducation(e.target.value); apply(workMode, e.target.value, minYears); }}
            style={{ width: '100%', fontSize: 13, border: '1.5px solid #e0e7ff', borderRadius: 8, padding: '7px 10px', color: '#374151', outline: 'none', background: '#f8f7ff', cursor: 'pointer' }}>
            <option value="">Any level</option>
            <option value="high_school">High school</option>
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor's</option>
            <option value="master">Master's</option>
            <option value="phd">PhD</option>
          </select>
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 20px' }}/>

        {/* EXPERIENCE */}
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Experience required</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { value: '',   label: 'Any level' },
              { value: '0',  label: 'Entry level' },
              { value: '2',  label: 'Junior (2 yrs)' },
              { value: '5',  label: 'Mid (5 yrs)' },
              { value: '10', label: 'Senior (10 yrs)' },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="minYears" value={opt.value} checked={minYears === opt.value}
                  onChange={() => { setMinYears(opt.value); apply(workMode, education, opt.value); }}
                  style={{ accentColor: '#6366f1', cursor: 'pointer' }}/>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: minYears === opt.value ? 600 : 400 }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}

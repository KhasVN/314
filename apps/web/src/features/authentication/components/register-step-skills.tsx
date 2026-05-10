'use client';

import type { RegisterFormValues } from '@features/authentication/types';
import { REGISTER_INPUT_CLASS, RegisterField, RegisterFormCard } from './register-form-primitives';

const WORK_MODES = ['remote', 'on_site', 'hybrid'] as const;
const WORK_MODE_LABELS: Record<(typeof WORK_MODES)[number], string> = {
  remote: 'Remote',
  on_site: 'On-site',
  hybrid: 'Hybrid',
};

type Props = {
  form: RegisterFormValues;
  suggestedSkills: string[];
  selectedSkills: string[];
  customSkill: string;
  onChange: (field: keyof RegisterFormValues, value: string) => void;
  onCustomSkillChange: (value: string) => void;
  onToggleSkill: (skill: string) => void;
  onAddCustomSkill: () => void;
};

export function RegisterStepSkills({
  form,
  suggestedSkills,
  selectedSkills,
  customSkill,
  onChange,
  onCustomSkillChange,
  onToggleSkill,
  onAddCustomSkill,
}: Props) {
  return (
    <>
      <RegisterFormCard title="Skills" icon="⚡">
        <div className="mb-3">
          {form.major.trim() ? (
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-slate-500">Suggested skills for</span>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[13px] font-bold text-[#2557a7]">
                {form.major}
              </span>
            </div>
          ) : (
            <p className="mb-2.5 text-[13px] text-slate-500">
              General skills — go back and enter your major for personalised suggestions
            </p>
          )}
          <p className="m-0 text-xs text-slate-400">Click to select · You can also add custom skills below</p>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {suggestedSkills.map((sk) => {
            const on = selectedSkills.includes(sk);
            return (
              <button
                key={sk}
                type="button"
                onClick={() => onToggleSkill(sk)}
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  on
                    ? 'border-[#2557a7] bg-[#2557a7] text-white'
                    : 'border-[#d4d2d0] bg-white text-[#374151] hover:border-[#2557a7]'
                }`}
              >
                {on ? '✓ ' : '+ '}
                {sk}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            className={`${REGISTER_INPUT_CLASS} flex-1`}
            placeholder="Add a skill not listed above..."
            value={customSkill}
            onChange={(e) => onCustomSkillChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddCustomSkill())}
          />
          <button
            type="button"
            onClick={onAddCustomSkill}
            className="shrink-0 rounded-lg border border-[#e5e7eb] bg-slate-50 px-4 text-[13px] font-semibold text-[#374151] transition-colors hover:bg-slate-100"
          >
            Add
          </button>
        </div>

        {selectedSkills.length > 0 && (
          <div className="mt-2.5 rounded-xl border border-[#e0e7ff] bg-[#f8f7ff] p-3">
            <p className="mb-2 text-xs font-bold text-[#2557a7]">Selected ({selectedSkills.length}):</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-[#2557a7] px-2.5 py-0.5 text-xs text-white"
                >
                  {s}
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 leading-none text-white hover:opacity-80"
                    onClick={() => onToggleSkill(s)}
                    aria-label={`Remove ${s}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </RegisterFormCard>

      <RegisterFormCard title="Job preferences" icon="🎯">
        <RegisterField label="Preferred work location" hint="City or region">
          <input
            className={REGISTER_INPUT_CLASS}
            placeholder="e.g. Sydney, Melbourne, Remote"
            value={form.preferredLocations}
            onChange={(e) => onChange('preferredLocations', e.target.value)}
          />
        </RegisterField>
        <RegisterField label="Preferred work mode">
          <div className="flex gap-2.5">
            {WORK_MODES.map((v) => {
              const sel = form.preferredWorkMode === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange('preferredWorkMode', sel ? '' : v)}
                  className={`flex-1 rounded-xl border-2 px-2 py-3 text-sm font-semibold transition-colors ${
                    sel
                      ? 'border-[#9bb8e5] bg-[#eef4ff] text-[#2557a7]'
                      : 'border-[#e5e7eb] bg-white text-[#6b7280]'
                  }`}
                >
                  {WORK_MODE_LABELS[v]}
                </button>
              );
            })}
          </div>
        </RegisterField>
      </RegisterFormCard>
    </>
  );
}

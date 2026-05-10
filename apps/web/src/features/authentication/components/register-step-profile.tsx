'use client';

import { getSuggestedSkills } from '@features/authentication/major-skills-map';
import type { RegisterFormValues } from '@features/authentication/types';
import { REGISTER_INPUT_CLASS, RegisterField, RegisterFormCard } from './register-form-primitives';

type Props = {
  form: RegisterFormValues;
  onChange: (field: keyof RegisterFormValues, value: string) => void;
};

export function RegisterStepProfile({ form, onChange }: Props) {
  return (
    <>
      <RegisterFormCard title="Education" icon="🎓">
        <RegisterField label="Highest education level">
          <select className={REGISTER_INPUT_CLASS} value={form.education} onChange={(e) => onChange('education', e.target.value)}>
            <option value="">Select level</option>
            <option value="high_school">High school</option>
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor's degree</option>
            <option value="master">Master's degree</option>
            <option value="phd">PhD</option>
            <option value="other">Other</option>
          </select>
        </RegisterField>

        <RegisterField label="Field of study / major" hint="Type your major and we'll suggest relevant skills in the next step">
          <input
            className={REGISTER_INPUT_CLASS}
            placeholder="e.g. Computer Science, Accounting, Marketing"
            value={form.major}
            onChange={(e) => onChange('major', e.target.value)}
          />
          {form.major.trim() && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#e0e7ff] bg-[#f8f7ff] px-3 py-2">
              <span className="text-xs text-[#2557a7]">+</span>
              <p className="m-0 text-xs font-medium text-[#2557a7]">
                We&apos;ll suggest <strong>{getSuggestedSkills(form.major).length} skills</strong> for{' '}
                <strong>{form.major}</strong> in the next step
              </p>
            </div>
          )}
        </RegisterField>
      </RegisterFormCard>

      <RegisterFormCard title="Experience" icon="💼">
        <RegisterField label="Years of work experience">
          <select
            className={REGISTER_INPUT_CLASS}
            value={form.yearsOfExperience}
            onChange={(e) => onChange('yearsOfExperience', e.target.value)}
          >
            <option value="">Select years</option>
            <option value="0">0 — Entry level</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="5">5 years</option>
            <option value="7">7 years</option>
            <option value="10">10+ years</option>
          </select>
        </RegisterField>
        <RegisterField label="Work experience summary" hint="Brief description of previous roles">
          <textarea
            className={`${REGISTER_INPUT_CLASS} min-h-[120px] resize-y`}
            rows={4}
            placeholder="e.g. 3 years as a software developer at XYZ..."
            value={form.workExperience}
            onChange={(e) => onChange('workExperience', e.target.value)}
          />
        </RegisterField>
      </RegisterFormCard>
    </>
  );
}

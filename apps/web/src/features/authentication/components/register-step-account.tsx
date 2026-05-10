'use client';

import type { RegisterFormValues } from '@features/authentication/types';
import { REGISTER_INPUT_CLASS, RegisterField, RegisterFormCard } from './register-form-primitives';

type Props = {
  form: RegisterFormValues;
  onChange: (field: keyof RegisterFormValues, value: string) => void;
};

export function RegisterStepAccount({ form, onChange }: Props) {
  return (
    <RegisterFormCard title="Account credentials" icon="🔐" subtitle="Used to log in every time">
      <RegisterField label="Full name" required>
        <input
          className={REGISTER_INPUT_CLASS}
          placeholder="e.g. John Smith"
          value={form.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
      </RegisterField>
      <RegisterField label="Email address" required hint="This will be your login username">
        <input
          className={REGISTER_INPUT_CLASS}
          type="email"
          placeholder="e.g. john@email.com"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </RegisterField>
      <RegisterField label="Password" required hint="Minimum 8 characters">
        <input
          className={REGISTER_INPUT_CLASS}
          type="password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={(e) => onChange('password', e.target.value)}
        />
      </RegisterField>
      <RegisterField label="Confirm password" required>
        <input
          className={`${REGISTER_INPUT_CLASS} ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-[#c9262d]' : ''}`}
          type="password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={(e) => onChange('confirmPassword', e.target.value)}
        />
        {form.confirmPassword && form.password !== form.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
        )}
      </RegisterField>
    </RegisterFormCard>
  );
}

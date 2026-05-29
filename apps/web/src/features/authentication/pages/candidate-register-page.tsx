'use client';

import { LinkedoutButton } from '@features/candidate/components/linkedout-ui';
import { RegisterPageHeader } from '../components/register-page-header';
import { RegisterStepAccount } from '../components/register-step-account';
import { RegisterStepProfile } from '../components/register-step-profile';
import { RegisterStepSkills } from '../components/register-step-skills';
import { RegisterSuccessView } from '../components/register-success-view';
import { useCandidateRegister } from '../hooks/use-candidate-register';

export function CandidateRegisterPage() {
  const reg = useCandidateRegister();

  if (reg.done) {
    return <RegisterSuccessView email={reg.form.email} manualSignIn={reg.manualSignInRequired} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4ff] via-white to-[#f6f8fc] font-sans">
      <RegisterPageHeader step={reg.step} />

      <div className="mx-auto max-w-xl px-4 pb-20 pt-6">
        <form onSubmit={reg.step < 3 ? (e) => { e.preventDefault(); reg.handleNext(); } : reg.handleSubmit}>
          {reg.step === 1 && <RegisterStepAccount form={reg.form} onChange={reg.setField} />}
          {reg.step === 2 && <RegisterStepProfile form={reg.form} onChange={reg.setField} />}
          {reg.step === 3 && (
            <RegisterStepSkills
              form={reg.form}
              suggestedSkills={reg.suggestedSkills}
              selectedSkills={reg.skills}
              customSkill={reg.customSkill}
              onChange={reg.setField}
              onCustomSkillChange={reg.setCustomSkill}
              onToggleSkill={reg.toggleSkill}
              onAddCustomSkill={reg.addCustomSkill}
            />
          )}

          {reg.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {reg.error}
            </div>
          )}

          <div className="mt-2 flex gap-3">
            {reg.step > 1 && (
              <LinkedoutButton type="button" variant="secondary" onClick={() => reg.setStep((s) => s - 1)} className="shrink-0 px-6">
                ← Back
              </LinkedoutButton>
            )}
            <LinkedoutButton type="submit" disabled={reg.loading} className="min-h-[52px] flex-1 text-[15px]">
              {reg.loading ? 'Creating account...' : reg.step < 3 ? 'Continue' : 'Create my account'}
            </LinkedoutButton>
          </div>

          <p className="mt-4 text-center text-[13px] text-[#9ca3af]">
            Already have an account?{' '}
            <a href="/candidate/login" className="font-bold text-[#2557a7] no-underline hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

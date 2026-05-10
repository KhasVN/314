'use client';

import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';
import { useCandidateSettingsPage } from '../hooks/use-candidate-settings-page';

export function SettingsPage() {
  const s = useCandidateSettingsPage();

  return (
    <div className="min-h-screen bg-white font-sans">

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-12">
        <h1 className="mb-7 text-3xl font-bold tracking-tight text-[#2d2d2d]">Account settings</h1>

        {!s.profile ? (
          <LinkedoutCard className="p-10 text-center">
            <p className="mb-4 text-base font-semibold text-[#374151]">Sign in to manage your account</p>
            <LinkedoutButton href="/candidate/login">Sign in</LinkedoutButton>
          </LinkedoutCard>
        ) : (
          <div className="flex flex-col gap-4">
            <SettingSection>
              <SettingRow label="Account type" value="Job seeker">
                <span className="text-[13px] text-[#595959]">Managed by profile type</span>
              </SettingRow>
            </SettingSection>

            <SettingSection>
              <SettingRow
                label="Membership"
                value={s.profile.isMember ? 'Active member' : 'Free account'}
              >
                {s.profile.isMember ? (
                  <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-[13px] font-bold text-[#2557a7]">
                    Unlimited recommendations enabled
                  </span>
                ) : (
                  <LinkedoutButton
                    type="button"
                    className="text-[13px]"
                    disabled={s.joiningMembership}
                    onClick={s.handleJoinMembership}
                  >
                    {s.joiningMembership ? 'Joining...' : 'Join membership'}
                  </LinkedoutButton>
                )}
              </SettingRow>
            </SettingSection>

            <SettingSection>
              <SettingRow label="Email" value={s.profile.contactInfo ?? ''} />
            </SettingSection>

            <SettingSection>
              <SettingRow label={s.profile.contactInfo ?? ''} value="">
                <LinkedoutButton type="button" variant="secondary" className="text-[13px]" onClick={s.handleSignOut}>
                  Sign out
                </LinkedoutButton>
              </SettingRow>
            </SettingSection>

            <div className="py-2">
              <button
                type="button"
                onClick={() => s.setShowClose(true)}
                className="border-0 bg-transparent p-0 text-sm font-bold text-red-600 underline"
              >
                Close my account
              </button>
            </div>
          </div>
        )}
      </main>

      {s.showClose && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mb-2 text-center text-lg font-bold text-[#0f172a]">Close your account?</h2>
            <p className="mb-6 text-center text-sm leading-relaxed text-[#6b7280]">
              This will permanently delete your profile from the database. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <LinkedoutButton type="button" variant="secondary" className="flex-1" onClick={() => s.setShowClose(false)}>
                Cancel
              </LinkedoutButton>
              <LinkedoutButton type="button" variant="danger" className="flex-1" onClick={s.handleCloseAccount}>
                Yes, close account
              </LinkedoutButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingSection({ children }: { children: React.ReactNode }) {
  return <LinkedoutCard className="px-5 py-0">{children}</LinkedoutCard>;
}

function SettingRow({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className={`py-[18px] ${children ? 'border-b border-slate-100' : ''}`}>
      <div className={`flex items-center justify-between gap-4 ${children ? 'mb-3' : ''}`}>
        <div>
          <p className="text-sm font-semibold text-[#2d2d2d]">{label}</p>
          {value ? <p className="mt-0.5 text-[13px] text-[#6b7280]">{value}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

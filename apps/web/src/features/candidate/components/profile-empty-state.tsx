'use client';

import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';

export function ProfileEmptyState() {
  return (
    <LinkedoutCard className="mx-auto max-w-md p-10 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef4ff]">
        <svg className="h-9 w-9 text-[#2557a7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[#0f172a]">No candidate profile yet</h2>
      <p className="mt-2 text-sm text-slate-500">Sign in or register to view and edit your profile.</p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <LinkedoutButton href="/candidate/register">Create profile</LinkedoutButton>
        <LinkedoutButton href="/candidate/login" variant="secondary">
          Sign in
        </LinkedoutButton>
      </div>
    </LinkedoutCard>
  );
}

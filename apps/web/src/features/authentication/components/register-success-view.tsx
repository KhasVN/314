'use client';

import Link from 'next/link';
import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';

export function RegisterSuccessView({
  email,
  variant = 'candidate',
  manualSignIn,
}: {
  email: string;
  variant?: 'candidate' | 'employer';
  manualSignIn?: boolean;
}) {
  const home = variant === 'employer' ? '/employer' : '/candidate';
  const login = variant === 'employer' ? '/employer/login' : '/candidate/login';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4ff] to-white">
      <main className="flex min-h-[calc(100vh-62px)] items-center justify-center px-4 py-12">
        <LinkedoutCard className="max-w-md border border-[#d4d2d0] p-10 text-center shadow-[0_12px_48px_rgba(37,87,167,0.12)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2557a7] shadow-inner">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2d2d2d]">
            {manualSignIn ? 'Account ready' : "You're signed in"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#595959]">
            {manualSignIn
              ? 'Your profile was saved. We could not start a browser session automatically — sign in once with the password you chose.'
              : 'Your profile is saved and your session is active. Continue to your dashboard when you are ready.'}
          </p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#767676]">Email</p>
          <p className="mt-1 text-base font-bold text-[#2557a7]">{email}</p>

          <div className="mt-10 flex flex-col gap-3">
            {manualSignIn ? (
              <LinkedoutButton href={login} className="w-full justify-center py-3">
                Sign in
              </LinkedoutButton>
            ) : (
              <LinkedoutButton href={home} className="w-full justify-center py-3">
                Go to dashboard
              </LinkedoutButton>
            )}
            <Link
              href={home}
              className="text-center text-sm font-semibold text-[#2557a7] underline-offset-2 hover:underline"
            >
              {manualSignIn ? 'Try dashboard anyway' : 'Open home feed'}
            </Link>
          </div>
        </LinkedoutCard>
      </main>
    </div>
  );
}

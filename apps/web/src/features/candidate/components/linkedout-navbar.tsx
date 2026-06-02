'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { authClient } from '@lib/auth-client';
import { candidateApi } from '@features/candidate/api';
import { employerApi } from '@features/employer/api';
import { LinkedoutLogo } from './linkedout-ui';

const navTab = (on: boolean) =>
  `flex h-[62px] items-center border-b-2 px-1 text-sm ${
    on ? 'border-[#2557a7] text-[#2d2d2d]' : 'border-transparent text-[#2d2d2d] hover:border-[#2557a7]'
  }`;

const menu =
  'dropdown-content menu z-[300] mt-2 w-56 rounded-lg border border-[#d4d2d0] bg-white p-2 shadow-lg';

type Variant = 'candidate' | 'employer';

type Props = {
  variant: Variant;
  activePage?: string;
};

export function LinkedoutNavbar({ variant, activePage = 'other' }: Props) {
  const { data: session } = authClient.useSession();
  const { data: profile } = useSWR(
    session?.user && variant === 'candidate' ? 'candidate-profile' : null,
    () => candidateApi.candidates.meOptional(),
  );
  const { data: employer } = useSWR(
    session?.user && variant === 'employer' ? 'employer-profile' : null,
    () => employerApi.employers.meOptional(),
  );

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = variant === 'candidate' ? '/candidate/login' : '/employer/login';
  };

  const accountLabel =
    variant === 'employer'
      ? session?.user
        ? 'Menu'
        : 'Sign in'
      : session?.user && profile?.fullName
        ? profile.fullName
        : session?.user
          ? (session.user as { name?: string }).name ?? 'Account'
          : 'Sign in';

  return (
    <header className="sticky top-0 z-[200] border-b border-[#e4e2e0] bg-white">
      <div className="mx-auto flex min-h-[62px] max-w-7xl items-center gap-6 px-4 lg:px-6">
        <LinkedoutLogo href={variant === 'employer' ? '/employer' : '/candidate'} />

        {variant === 'candidate' ? (
          <>
            <Link href="/candidate" className={navTab(activePage === 'home')}>
              Home
            </Link>
            <Link
              href="/candidate/company-reviews"
              className={`hidden sm:flex ${navTab(activePage === 'companies')}`}
            >
              Companies
            </Link>
          </>
        ) : (
          <>
            <Link href="/employer" className={navTab(activePage === 'home')}>
              Home
            </Link>
            <Link
              href="/employer/job-posting"
              className={`hidden sm:flex ${navTab(activePage === 'post')}`}
            >
              Post job
            </Link>
          </>
        )}

        <div className="ml-auto flex flex-none items-center gap-1">
          {variant === 'candidate' ? (
            <>
              <Link
                href="/candidate/my-jobs"
                className={`hidden rounded px-3 py-2 text-sm font-semibold text-[#2557a7] hover:bg-[#eef4ff] md:inline-flex ${
                  activePage === 'my-jobs' ? 'bg-[#eef4ff]' : ''
                }`}
              >
                My jobs
              </Link>
            </>
          ) : (
            <Link
              href="/candidate"
              className="hidden rounded px-3 py-2 text-sm font-semibold text-[#2557a7] hover:bg-[#eef4ff] md:inline-flex"
            >
              Job seeker
            </Link>
          )}

          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              className="squircle-button px-3 py-2 text-sm font-semibold text-[#2557a7] hover:bg-[#eef4ff]"
            >
              {accountLabel}
            </button>
            <ul tabIndex={0} className={menu}>
              {variant === 'candidate' ? (
                !session?.user ? (
                  <>
                    <li>
                      <Link href="/candidate/login">Sign in</Link>
                    </li>
                    <li>
                      <Link href="/candidate/register">Register</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="menu-title text-xs">
                      {profile?.fullName?.trim() ||
                        (session.user as { name?: string }).name ||
                        'Account'}
                    </li>
                    <li>
                      <Link href="/candidate/profile">Profile</Link>
                    </li>
                    <li>
                      <Link href="/candidate/settings">Settings</Link>
                    </li>
                    <li>
                      <button type="button" onClick={signOut}>
                        Sign out
                      </button>
                    </li>
                  </>
                )
              ) : !session?.user ? (
                <>
                  <li>
                    <Link href="/employer/login">Employer sign in</Link>
                  </li>
                  <li>
                    <Link href="/employer/register">Register company</Link>
                  </li>
                </>
              ) : (
                <>
                  {employer && (
                    <li className="menu-title px-2 text-xs font-normal text-[#595959]">
                      {employer.companyName}
                    </li>
                  )}
                  <li>
                    <Link href="/employer">Dashboard</Link>
                  </li>
                  <li>
                    <Link href="/employer/job-posting">New posting</Link>
                  </li>
                  <li>
                    <Link href="/employer/settings">Settings</Link>
                  </li>
                  <li>
                    <button type="button" onClick={signOut}>
                      Sign out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          <span className="mx-2 hidden h-6 w-px bg-[#d4d2d0] md:block" />
          {variant === 'candidate' ? (
            <Link
              href="/employer"
              className="hidden rounded px-3 py-2 text-sm text-[#2d2d2d] hover:bg-[#f3f2f1] md:inline-flex"
            >
              Employers / Post Job
            </Link>
          ) : (
            <Link
              href="/candidate"
              className="hidden rounded px-3 py-2 text-sm text-[#2d2d2d] hover:bg-[#f3f2f1] md:inline-flex"
            >
              Browse jobs
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { LinkedoutNavbar } from '@features/candidate/components/linkedout-navbar';

function navState(pathname: string | null): { variant: 'candidate' | 'employer'; activePage: string } {
  const p = pathname ?? '';
  if (p.startsWith('/employer')) {
    if (p === '/employer' || p === '/employer/') return { variant: 'employer', activePage: 'home' };
    if (p.includes('/job-posting')) return { variant: 'employer', activePage: 'post' };
    return { variant: 'employer', activePage: 'other' };
  }
  if (p.startsWith('/home')) return { variant: 'candidate', activePage: 'other' };
  if (p === '/candidate' || p === '/candidate/') return { variant: 'candidate', activePage: 'home' };
  if (p.includes('/company-reviews')) return { variant: 'candidate', activePage: 'companies' };
  if (p.includes('/my-jobs')) return { variant: 'candidate', activePage: 'my-jobs' };
  if (p.includes('/profile')) return { variant: 'candidate', activePage: 'profile' };
  if (p.includes('/settings')) return { variant: 'candidate', activePage: 'settings' };
  return { variant: 'candidate', activePage: 'other' };
}

export default function LinkedoutGroupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { variant, activePage } = navState(pathname);
  return (
    <>
      <LinkedoutNavbar variant={variant} activePage={activePage} />
      {children}
    </>
  );
}

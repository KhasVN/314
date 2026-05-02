// ═══════════════════════════════════════════════════════════════
// apps/web/src/app/home/page.tsx
//
// Route entry point for the public homepage at /home
// Next.js App Router automatically maps this file to the URL:
//   yoursite.com/home
//
// This is the FIRST page visitors see before logging in.
// From here they choose to register as a candidate or employer.
// ═══════════════════════════════════════════════════════════════

import { HomePage } from '../../features/home/home-page';

export const metadata = {
  title: 'TalentMatch — Intelligent Talent Matching Platform',
  description: 'AI-powered matching connecting candidates with the right jobs and employers with the right talent.',
};

export default function Page() {
  return <HomePage />;
}

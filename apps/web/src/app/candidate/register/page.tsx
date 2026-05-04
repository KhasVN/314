// ═══════════════════════════════════════════════════════════════
// apps/web/src/app/candidate/register/page.tsx
//
// Route: /candidate/register
// This page is shown when a user clicks "Register as candidate"
// from the home page. It collects all candidate profile info
// and saves it to the database via POST /api/candidates.
// ═══════════════════════════════════════════════════════════════

import { CandidateRegisterPage } from '../../../features/candidate-register/candidate-register-page';

export const metadata = {
  title: 'Register as Candidate | TalentMatch',
  description: 'Create your candidate profile and start getting matched with jobs.',
};

export default function Page() {
  return <CandidateRegisterPage />;
}

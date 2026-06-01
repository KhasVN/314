import { Suspense } from 'react';
import { EMPLOYER_LOGIN } from '@features/authentication';
import { ResetPasswordPage } from '@features/authentication/pages/reset-password-page';

export const metadata = { title: 'Set New Password | Linkedout' };

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPage config={EMPLOYER_LOGIN} />
    </Suspense>
  );
}

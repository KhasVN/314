import { EMPLOYER_LOGIN } from '@features/authentication';
import { ForgotPasswordPage } from '@features/authentication/pages/forgot-password-page';

export const metadata = { title: 'Reset Password | Linkedout' };

export default function Page() {
  return <ForgotPasswordPage config={EMPLOYER_LOGIN} />;
}

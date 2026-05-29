import { EMPLOYER_LOGIN, LoginPage } from '@features/authentication';

export const metadata = { title: 'Employer Sign In | Linkedout' };

export default function Page() {
  return <LoginPage config={EMPLOYER_LOGIN} />;
}

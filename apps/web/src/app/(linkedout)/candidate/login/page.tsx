import { CANDIDATE_LOGIN, LoginPage } from '@features/authentication';

export const metadata = { title: 'Sign In | Linkedout' };

export default function Page() {
  return <LoginPage config={CANDIDATE_LOGIN} />;
}

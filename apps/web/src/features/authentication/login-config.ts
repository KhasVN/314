export type LoginConfig = {
  redirectPath: string;
  gradientClass: string;
  cardTitle: string;
  cardSubtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  registerHref: string;
  registerLead: string;
  registerCta: string;
  forgotPasswordHref: string;
  resetPasswordRedirectTo: string;
};

export const CANDIDATE_LOGIN: LoginConfig = {
  redirectPath: '/candidate',
  gradientClass: 'from-[#eef4ff] via-white to-[#f6f8fc]',
  cardTitle: 'Sign in',
  cardSubtitle: 'Use the email and password for your candidate account.',
  emailLabel: 'Email address',
  emailPlaceholder: 'name@example.com',
  registerHref: '/candidate/register',
  registerLead: 'New to Linkedout?',
  registerCta: 'Create an account',
  forgotPasswordHref: '/candidate/forgot-password',
  resetPasswordRedirectTo: 'http://localhost:3000/candidate/reset-password',
};

export const EMPLOYER_LOGIN: LoginConfig = {
  redirectPath: '/employer',
  gradientClass: 'from-[#f3f6fb] via-white to-[#f6f8fc]',
  cardTitle: 'Employer sign in',
  cardSubtitle: 'Work email and password for your company account.',
  emailLabel: 'Work email address',
  emailPlaceholder: 'hr@company.com',
  registerHref: '/employer/register',
  registerLead: 'Hiring on Linkedout?',
  registerCta: 'Create an employer account',
  forgotPasswordHref: '/employer/forgot-password',
  resetPasswordRedirectTo: 'http://localhost:3000/employer/reset-password',
};

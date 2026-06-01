'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@lib/auth-client';
import type { LoginConfig } from '@features/authentication/login-config';
import {
  LinkedoutButton,
  LinkedoutCard,
  LinkedoutField,
  LinkedoutInput,
} from '@features/candidate/components/linkedout-ui';

export function LoginPage({ config }: { config: LoginConfig }) {
  const router = useRouter();
  const { refetch: refetchSession } = authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email is required.');
    if (!password) return setError('Password is required.');
    setLoading(true);
    setError('');
    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe: true,
      });
      if (result.error) {
        setError(result.error.message ?? 'Invalid email or password.');
        return;
      }
      await refetchSession();
      await router.refresh();
      window.location.assign(config.redirectPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${config.gradientClass}`}>
      <main className="mx-auto flex min-h-[calc(100vh-62px)] max-w-7xl items-start justify-center px-4 py-12 sm:items-center sm:py-16 lg:px-6">
        <LinkedoutCard className="w-full max-w-[440px] border border-[#d4d2d0] p-8 shadow-[0_16px_48px_rgba(45,45,45,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#2d2d2d]">{config.cardTitle}</h2>
            <p className="mt-2 text-sm text-[#595959]">{config.cardSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <LinkedoutField label={config.emailLabel} required>
              <LinkedoutInput
                type="email"
                autoComplete="email"
                placeholder={config.emailPlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
            </LinkedoutField>

            <LinkedoutField label="Password" required>
              <LinkedoutInput
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
              <div className="mt-1 text-right">
                <Link
                  href={config.forgotPasswordHref}
                  className="text-xs font-semibold text-[#2557a7] underline-offset-2 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </LinkedoutField>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#a51d24]"
              >
                {error}
              </div>
            )}

            <LinkedoutButton type="submit" disabled={loading} className="w-full justify-center py-3 text-base">
              {loading ? 'Signing you in…' : 'Sign in'}
            </LinkedoutButton>
          </form>

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e4e2e0]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-[#767676]">or</span>
            <div className="h-px flex-1 bg-[#e4e2e0]" />
          </div>

          <p className="text-center text-sm text-[#595959]">
            {config.registerLead}{' '}
            <Link href={config.registerHref} className="font-bold text-[#2557a7] underline-offset-2 hover:underline">
              {config.registerCta}
            </Link>
          </p>
        </LinkedoutCard>
      </main>
    </div>
  );
}

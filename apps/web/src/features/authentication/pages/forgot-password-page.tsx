'use client';

import Link from 'next/link';
import { useState } from 'react';
import { authClient } from '@lib/auth-client';
import type { LoginConfig } from '@features/authentication/login-config';
import {
  LinkedoutButton,
  LinkedoutCard,
  LinkedoutField,
  LinkedoutInput,
} from '@features/candidate/components/linkedout-ui';

export function ForgotPasswordPage({ config }: { config: LoginConfig }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email is required.');
    setLoading(true);
    setError('');
    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: config.resetPasswordRedirectTo,
      });
      if (result.error) {
        setError(result.error.message ?? 'Something went wrong. Please try again.');
        return;
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${config.gradientClass}`}>
      <main className="mx-auto flex min-h-[calc(100vh-62px)] max-w-7xl items-start justify-center px-4 py-12 sm:items-center sm:py-16 lg:px-6">
        <LinkedoutCard className="w-full max-w-[440px] border border-[#d4d2d0] p-8 shadow-[0_16px_48px_rgba(45,45,45,0.08)] sm:p-10">
          {sent ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#2557a7" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#2d2d2d]">Check your email</h2>
              <p className="mt-2 text-sm text-[#595959]">
                If <span className="font-semibold">{email}</span> is registered, a password reset link has been sent. Check your inbox (and spam folder).
              </p>
              <p className="mt-3 text-xs text-[#767676]">
                Running locally? The reset link is printed in the backend terminal.
              </p>
              <Link
                href={config.forgotPasswordHref.replace('forgot-password', 'login')}
                className="mt-6 block text-sm font-semibold text-[#2557a7] underline-offset-2 hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-[#2d2d2d]">Reset your password</h2>
                <p className="mt-2 text-sm text-[#595959]">
                  Enter your email and we'll send you a reset link.
                </p>
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

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#a51d24]"
                  >
                    {error}
                  </div>
                )}

                <LinkedoutButton type="submit" disabled={loading} className="w-full justify-center py-3 text-base">
                  {loading ? 'Sending…' : 'Send reset link'}
                </LinkedoutButton>
              </form>

              <p className="mt-6 text-center text-sm text-[#595959]">
                Remember your password?{' '}
                <Link
                  href={config.forgotPasswordHref.replace('forgot-password', 'login')}
                  className="font-bold text-[#2557a7] underline-offset-2 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </LinkedoutCard>
      </main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@lib/auth-client';
import type { LoginConfig } from '@features/authentication/login-config';
import {
  LinkedoutButton,
  LinkedoutCard,
  LinkedoutField,
  LinkedoutInput,
} from '@features/candidate/components/linkedout-ui';

export function ResetPasswordPage({ config }: { config: LoginConfig }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loginHref = config.forgotPasswordHref.replace('forgot-password', 'login');

  if (!token) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${config.gradientClass}`}>
        <main className="mx-auto flex min-h-[calc(100vh-62px)] max-w-7xl items-center justify-center px-4">
          <LinkedoutCard className="w-full max-w-[440px] border border-[#d4d2d0] p-8 text-center shadow-[0_16px_48px_rgba(45,45,45,0.08)]">
            <h2 className="text-xl font-bold text-[#2d2d2d]">Invalid link</h2>
            <p className="mt-2 text-sm text-[#595959]">This reset link is missing or expired. Request a new one.</p>
            <Link href={config.forgotPasswordHref} className="mt-6 block text-sm font-bold text-[#2557a7] hover:underline">
              Request new link
            </Link>
          </LinkedoutCard>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword) return setError('Password is required.');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) {
        setError(result.error.message ?? 'Failed to reset password. The link may have expired.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push(loginHref), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${config.gradientClass}`}>
      <main className="mx-auto flex min-h-[calc(100vh-62px)] max-w-7xl items-start justify-center px-4 py-12 sm:items-center sm:py-16 lg:px-6">
        <LinkedoutCard className="w-full max-w-[440px] border border-[#d4d2d0] p-8 shadow-[0_16px_48px_rgba(45,45,45,0.08)] sm:p-10">
          {success ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#2d2d2d]">Password reset!</h2>
              <p className="mt-2 text-sm text-[#595959]">
                Your password has been updated. Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-[#2d2d2d]">Set new password</h2>
                <p className="mt-2 text-sm text-[#595959]">Choose a new password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <LinkedoutField label="New password" required hint="At least 8 characters">
                  <LinkedoutInput
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  />
                </LinkedoutField>

                <LinkedoutField label="Confirm new password" required>
                  <LinkedoutInput
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
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
                  {loading ? 'Saving…' : 'Reset password'}
                </LinkedoutButton>
              </form>
            </>
          )}
        </LinkedoutCard>
      </main>
    </div>
  );
}

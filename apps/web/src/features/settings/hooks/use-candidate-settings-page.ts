'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { settingsApi } from '@features/settings/api';

export function useCandidateSettingsPage() {
  const { data: profile, mutate } = useSWR('candidate-profile', () => settingsApi.candidates.meOptional());
  const [showClose, setShowClose] = useState(false);

  const handleSignOut = async () => {
    const { authClient } = await import('@lib/auth-client');
    await authClient.signOut();
    window.location.href = '/candidate/login';
  };

  const handleCloseAccount = async () => {
    if (!profile?.id) return;
    await settingsApi.candidates.remove(profile.id);
    mutate(undefined, { revalidate: false });
    window.location.href = '/candidate';
  };

  return {
    profile,
    showClose,
    setShowClose,
    handleSignOut,
    handleCloseAccount,
  };
}

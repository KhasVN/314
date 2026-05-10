'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { candidateApi } from '@features/candidate/api';

export function useCandidateProfilePage() {
  const { data: candidate, mutate } = useSWR('candidate-profile', () => candidateApi.candidates.meOptional());
  const [resumeText, setResumeText] = useState('');
  const [savingResume, setSavingResume] = useState(false);
  const [message, setMessage] = useState('');

  const saveResume = async () => {
    if (!candidate?.id || !resumeText.trim()) return;
    setSavingResume(true);
    try {
      await candidateApi.candidates.update(candidate.id, { resumeText: resumeText.trim() });
      await mutate();
      setResumeText('');
      setMessage('Resume summary saved.');
    } finally {
      setSavingResume(false);
      window.setTimeout(() => setMessage(''), 3000);
    }
  };

  const beginEditResume = (existing?: string | null) => setResumeText(existing ?? '');

  return {
    candidate,
    resumeText,
    setResumeText,
    savingResume,
    message,
    saveResume,
    beginEditResume,
  };
}

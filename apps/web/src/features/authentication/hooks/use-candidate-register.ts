'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@lib/auth-client';
import { establishEmailSession } from '@lib/establish-email-session';
import { authenticationApi } from '@features/authentication/api';
import { getSuggestedSkills } from '@features/authentication/major-skills-map';
import type { RegisterFormValues } from '@features/authentication/types';
import { EMPTY_REGISTER_FORM } from '@features/authentication/types';

export function useCandidateRegister() {
  const router = useRouter();
  const { refetch: refetchSession } = authClient.useSession();
  const [form, setForm] = useState<RegisterFormValues>(EMPTY_REGISTER_FORM);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [manualSignInRequired, setManualSignInRequired] = useState(false);
  const [step, setStep] = useState(1);

  const suggestedSkills = useMemo(() => getSuggestedSkills(form.major), [form.major]);

  const setField = (field: keyof RegisterFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleSkill = (skill: string) =>
    setSkills((prev) => (prev.includes(skill) ? prev.filter((x) => x !== skill) : [...prev, skill]));

  const addCustomSkill = () => {
    const next = customSkill.trim();
    if (next && !skills.includes(next)) setSkills((prev) => [...prev, next]);
    setCustomSkill('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.fullName.trim()) return setError('Full name is required.');
      if (!form.email.trim()) return setError('Email is required.');
      if (!form.password) return setError('Password is required.');
      if (form.password.length < 8) return setError('Password must be at least 8 characters.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }
    setError('');
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const emailNorm = form.email.trim().toLowerCase();
      const auth = await authClient.signUp.email({
        name: form.fullName.trim(),
        email: emailNorm,
        password: form.password,
      });
      if (auth.error) {
        setError(auth.error.message ?? 'Registration failed. Email may already exist.');
        setStep(1);
        return;
      }
      const userId = auth.data?.user?.id ?? (auth.data as { id?: string })?.id;
      if (!userId) {
        setError('Could not get user ID. Please try again.');
        return;
      }

      const sessionRes = await establishEmailSession(emailNorm, form.password);
      if (sessionRes.error) {
        setManualSignInRequired(true);
      }

      await authenticationApi.candidates.create({
        userId,
        fullName: form.fullName.trim(),
        contactInfo: emailNorm,
        education: (form.education as never) || undefined,
        major: form.major.trim() || undefined,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience, 10) : undefined,
        workExperience: form.workExperience.trim() || undefined,
        skills: skills.length > 0 ? skills.join(', ') : undefined,
        preferredLocations: form.preferredLocations.trim() || undefined,
        preferredWorkMode: (form.preferredWorkMode as never) || undefined,
        isMember: false,
      });

      if (sessionRes.error) {
        setDone(true);
        return;
      }

      await refetchSession();
      await router.refresh();
      window.location.assign('/candidate');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setField,
    skills,
    customSkill,
    setCustomSkill,
    suggestedSkills,
    toggleSkill,
    addCustomSkill,
    loading,
    error,
    done,
    manualSignInRequired,
    step,
    setStep,
    handleNext,
    handleSubmit,
  };
}

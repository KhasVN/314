'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { authClient } from '@lib/auth-client';
import { employerApi } from '@features/employer/api';
import type { JobPostingFormValues } from '@features/employer/types';
import { EMPTY_JOB_POSTING_FORM } from '@features/employer/types';

export function useEmployerJobPosting() {
  const router = useRouter();
  const [form, setForm] = useState<JobPostingFormValues>(EMPTY_JOB_POSTING_FORM);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(1);

  const { data: session } = authClient.useSession();
  const { data: myEmployer, isLoading: employerLoading } = useSWR(session?.user ? 'employer-profile' : null, () =>
    employerApi.employers.meOptional(),
  );

  useEffect(() => {
    if (myEmployer?.id) {
      setForm((p) => ({ ...p, employerId: myEmployer.id }));
    }
  }, [myEmployer?.id]);

  const setField = (field: keyof JobPostingFormValues, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setError('');
  };

  const toggleSkill = (skill: string) =>
    setSkills((prev) => (prev.includes(skill) ? prev.filter((x) => x !== skill) : [...prev, skill]));

  const addCustomSkill = () => {
    const t = customSkill.trim();
    if (t && !skills.includes(t)) setSkills((prev) => [...prev, t]);
    setCustomSkill('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.employerId) return setError('Company profile is missing. Refresh and try again.');
      if (!form.title.trim()) return setError('Job title is required.');
      if (!form.description.trim()) return setError('Job description is required.');
    }
    if (step === 2) {
      if (!form.workMode) return setError('Please select a work mode.');
      if (!form.location.trim()) return setError('Job location is required.');
    }
    setError('');
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await employerApi.jobs.create({
        employerId: form.employerId,
        title: form.title.trim(),
        description: form.description.trim(),
        requiredEducation: (form.educationLevel as never) || undefined,
        requiredSkills: skills.length > 0 ? skills.join(', ') : undefined,
        requiredYearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience, 10) : undefined,
        workMode: form.workMode as never,
        location: form.location.trim(),
      });
      setDone(true);
      window.setTimeout(() => router.push('/employer'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    myEmployer,
    employerLoading,
    form,
    setField,
    skills,
    customSkill,
    setCustomSkill,
    toggleSkill,
    addCustomSkill,
    loading,
    error,
    done,
    step,
    setStep,
    handleNext,
    handleSubmit,
  };
}

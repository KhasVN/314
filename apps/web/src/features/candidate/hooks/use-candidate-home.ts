'use client';

import { useState } from 'react';
import useSWR from 'swr';
import type { JobDto, JobSearchQueryDto } from '@talent-matching/dtos';
import { candidateApi } from '@features/candidate/api';

export function useCandidateHome() {
  const { data: profile } = useSWR('candidate-profile', () => candidateApi.candidates.meOptional());

  const [searchParams, setSearchParams] = useState<JobSearchQueryDto | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDto | null>(null);
  const [applicationNotice, setApplicationNotice] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');

  const { data: allJobs = [], isLoading: loadingAll } = useSWR(
    'candidate-all-jobs',
    candidateApi.jobs.list,
  );

  const { data: searchResults, isLoading: loadingSearch } = useSWR(
    searchParams ? ['cand-job-search', searchParams] : null,
    () => candidateApi.jobs.search(searchParams!),
  );

  const { data: recommendedJobs = [], isLoading: loadingRecs } = useSWR(
    activeTab === 'recommended' && profile?.id
      ? ['cand-recommendations', profile.id, profile.isMember]
      : null,
    () =>
      candidateApi.jobs.search({
        candidateId: profile!.id,
        limit: profile!.isMember ? 1000 : 10,
        rerank: true,
      }),
  );

  // ── Saved jobs ─────────────────────────────────────────────────────────────
  // Fetches the list of saved job records for the logged-in candidate.
  // savedJobIds is a Set<jobId> used to show the correct Saved/Save button state.
  const { data: savedRecords = [], mutate: mutateSaved } = useSWR(
    profile?.id ? ['saved-jobs', profile.id] : null,
    () => candidateApi.savedJobs.list(profile!.id),
  );
  const savedJobIds = new Set(savedRecords.map((r) => r.jobId));

  const saveJob = async (job: JobDto) => {
    if (!profile?.id) {
      window.location.href = '/candidate/login';
      return;
    }
    const existing = savedRecords.find((r) => r.jobId === job.id);
    if (existing) {
      // Already saved → unsave it
      await candidateApi.savedJobs.remove(existing.id);
      showNotice(`Removed "${job.title}" from saved jobs`);
    } else {
      // Not saved yet → save it
      await candidateApi.savedJobs.save(profile.id, job.id);
      showNotice(`"${job.title}" saved to My Jobs`);
    }
    await mutateSaved();
  };

  const displayJobs: JobDto[] =
    activeTab === 'recommended'
      ? recommendedJobs
      : searchParams
        ? (searchResults ?? [])
        : allJobs;

  const isLoading =
    activeTab === 'recommended'
      ? loadingRecs
      : searchParams
        ? loadingSearch
        : loadingAll;

  const showNotice = (msg: string) => {
    setApplicationNotice(msg);
    window.setTimeout(() => setApplicationNotice(''), 4000);
  };

  const handleSearch = (params: JobSearchQueryDto | null) => {
    setSelectedJob(null);
    setActiveTab('all');
    if (params === null) {
      setSearchParams(null);
      return;
    }
    setSearchParams((prev) => {
      const merged: JobSearchQueryDto = {
        ...(prev ?? {}),
        ...params,
        limit: params.limit ?? prev?.limit ?? 100,
      };
      for (const key of [
        'query',
        'location',
        'workMode',
        'requiredEducation',
        'yearsOfExperience',
        'salaryMin',
        'salaryMax',
        'candidateId',
        'rerank',
      ] as const satisfies readonly (keyof JobSearchQueryDto)[]) {
        if (key in params && params[key] === undefined) {
          delete merged[key];
        }
      }
      const hasTextOrFacet = Boolean(
        merged.query?.trim() ||
          merged.location?.trim() ||
          merged.workMode ||
          merged.requiredEducation ||
          merged.yearsOfExperience !== undefined ||
          merged.salaryMin !== undefined ||
          merged.salaryMax !== undefined ||
          merged.candidateId,
      );
      return hasTextOrFacet ? merged : null;
    });
  };

  const handleClear = () => {
    setSearchParams(null);
    setSelectedJob(null);
    setActiveTab('all');
  };

  const applyForJob = async (job: JobDto) => {
    if (!profile?.id) {
      window.location.href = '/candidate/login';
      return;
    }
    try {
      await candidateApi.applications.create({
        candidateId: profile.id,
        jobId: job.id,
        status: 'submitted',
      });
      showNotice(`Applied to ${job.title}`);
    } catch {
      showNotice('You may have already applied to this job.');
    }
  };

  return {
    profile,
    searchParams,
    selectedJob,
    setSelectedJob,
    applicationNotice,
    activeTab,
    setActiveTab,
    displayJobs,
    isLoading,
    handleSearch,
    handleClear,
    applyForJob,
    saveJob,
    savedJobIds,
  };
}

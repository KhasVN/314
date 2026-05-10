'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { authClient } from '@lib/auth-client';
import { employerApi } from '@features/employer/api';
import type { CandidateDto, CandidateSearchQueryDto } from '@talent-matching/dtos';

export type EmployerEducationFilter = 'high_school' | 'diploma' | 'bachelor' | 'master' | 'phd' | '';
export type EmployerWorkModeFilter = 'remote' | 'on_site' | 'hybrid' | '';

export function useEmployerHome() {
  const { data: session } = authClient.useSession();
  const { data: myEmployer, isLoading: employerLoading } = useSWR(session?.user ? 'employer-profile' : null, () =>
    employerApi.employers.meOptional(),
  );

  const employerId = myEmployer?.id ?? '';
  const dashboardReady = Boolean(session?.user && employerId);

  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDto | null>(null);

  const [keyword, setKeyword] = useState('');
  const [education, setEducation] = useState<EmployerEducationFilter>('');
  const [workMode, setWorkMode] = useState<EmployerWorkModeFilter>('');
  const [minExp, setMinExp] = useState('');
  const [searchParams, setSearchParams] = useState<CandidateSearchQueryDto | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const { data: allCandidates = [], isLoading: loadingAll } = useSWR(
    dashboardReady ? 'employer-all-candidates' : null,
    employerApi.candidates.list,
  );

  const { data: searchResults, isLoading: loadingSearch } = useSWR(
    dashboardReady && searchParams ? ['emp-candidate-search', searchParams] : null,
    () => employerApi.candidates.search(searchParams!),
  );

  const { data: recommendedCandidates = [], isLoading: loadingRecs } = useSWR(
    dashboardReady && employerId ? ['emp-recommendations', employerId] : null,
    () =>
      employerApi.candidates.search({
        employerId,
        limit: 10,
        rerank: true,
      }),
  );

  const { data: myJobs = [], mutate: mutateJobs } = useSWR(
    dashboardReady && employerId ? ['employer-my-jobs', employerId] : null,
    () => employerApi.employers.jobs(employerId),
  );

  const displayCandidates: CandidateDto[] =
    activeTab === 'recommended' ? recommendedCandidates : searchParams ? (searchResults ?? []) : allCandidates;

  const isLoading = activeTab === 'recommended' ? loadingRecs : searchParams ? loadingSearch : loadingAll;

  const handleSearch = () => {
    const params: CandidateSearchQueryDto = {};
    if (keyword.trim()) params.query = keyword.trim();
    if (education) params.education = education as CandidateSearchQueryDto['education'];
    if (workMode) params.workMode = workMode as CandidateSearchQueryDto['workMode'];
    if (minExp !== '') params.minYearsOfExperience = parseInt(minExp, 10);
    setSearchParams(Object.keys(params).length ? params : null);
    setActiveTab('all');
    setSelectedCandidate(null);
  };

  const handleClear = () => {
    setKeyword('');
    setEducation('');
    setWorkMode('');
    setMinExp('');
    setSearchParams(null);
    setSelectedCandidate(null);
  };

  const handleDeleteJob = async () => {
    if (!deletingJobId) return;
    try {
      await employerApi.jobs.remove(deletingJobId);
      setShowDeleteModal(false);
      setDeletingJobId('');
      await mutateJobs();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete job.');
    }
  };

  const sectionLabel =
    activeTab === 'recommended' ? 'Recommended candidates' : searchParams ? 'Search results' : 'All candidates';

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteError('');
    setDeletingJobId('');
  };

  return {
    session,
    employerLoading,
    myEmployer,
    employerId,
    dashboardReady,
    activeTab,
    setActiveTab,
    selectedCandidate,
    setSelectedCandidate,
    keyword,
    setKeyword,
    education,
    setEducation,
    workMode,
    setWorkMode,
    minExp,
    setMinExp,
    searchParams,
    showDeleteModal,
    setShowDeleteModal,
    deletingJobId,
    setDeletingJobId,
    deleteError,
    setDeleteError,
    allCandidates,
    recommendedCandidates,
    myJobs,
    displayCandidates,
    isLoading,
    handleSearch,
    handleClear,
    handleDeleteJob,
    sectionLabel,
    closeDeleteModal,
  };
}

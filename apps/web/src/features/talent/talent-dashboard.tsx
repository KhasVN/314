'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { AppFrame } from '@components/app-frame';
import {
  ApplicationsPanel,
  AuthPanel,
  CandidatesPanel,
  EmployersPanel,
  JobsPanel,
} from '@components/panels';
import { SearchPanel } from '@components/search-panel';
import { talentApi } from './api';

export function TalentDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const employers = useSWR('dashboard-employers', talentApi.employers.list);
  const candidates = useSWR('dashboard-candidates', talentApi.candidates.list);
  const jobs = useSWR('dashboard-jobs', talentApi.jobs.list);

  return (
    <AppFrame activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'search' && (
        <SearchPanel
          candidates={candidates.data ?? []}
          jobs={jobs.data ?? []}
        />
      )}
      {activeTab === 'employers' && <EmployersPanel />}
      {activeTab === 'candidates' && <CandidatesPanel />}
      {activeTab === 'jobs' && <JobsPanel employers={employers.data ?? []} />}
      {activeTab === 'applications' && (
        <ApplicationsPanel
          candidates={candidates.data ?? []}
          jobs={jobs.data ?? []}
        />
      )}
      {activeTab === 'auth' && <AuthPanel />}
    </AppFrame>
  );
}

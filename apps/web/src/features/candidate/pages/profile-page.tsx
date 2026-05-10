'use client';

import { ProfileDashboard } from '../components/profile-dashboard';
import { ProfileEmptyState } from '../components/profile-empty-state';
import { useCandidateProfilePage } from '../hooks/use-candidate-profile-page';

export function ProfilePage() {
  const p = useCandidateProfilePage();

  return (
    <div className="min-h-screen bg-white font-sans">

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-12">
        {!p.candidate ? (
          <ProfileEmptyState />
        ) : (
          <ProfileDashboard
            candidate={p.candidate}
            resumeText={p.resumeText}
            onResumeChange={p.setResumeText}
            savingResume={p.savingResume}
            message={p.message}
            onSaveResume={p.saveResume}
            onBeginEditResume={p.beginEditResume}
            onResumeFile={p.handleResumeFile}
          />
        )}
      </main>
    </div>
  );
}

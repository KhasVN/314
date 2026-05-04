import type { ApplicationDto, CandidateDto, JobDto } from '@talent-matching/dtos';
import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '@features/talent/api';
import { CrudSurface, FormActions, RowActions, SelectInput, SimpleTable, TextArea } from '@components/form-controls';

const applicationStatusOptions = ['submitted', 'reviewed', 'shortlisted', 'rejected', 'accepted'];

export function ApplicationsPanel({ candidates, jobs }: { candidates: CandidateDto[]; jobs: JobDto[] }) {
  const { data = [], isLoading, mutate } = useSWR('applications', talentApi.applications.list);
  const empty = {
    id: '',
    candidateId: '',
    jobId: '',
    status: 'submitted' as ApplicationDto['status'],
    coverLetter: '',
  };
  const [form, setForm] = useState(empty);

  const save = async () => {
    const payload = {
      candidateId: form.candidateId,
      jobId: form.jobId,
      status: form.status,
      coverLetter: form.coverLetter || undefined,
    };
    form.id ? await talentApi.applications.update(form.id, payload) : await talentApi.applications.create(payload);
    setForm(empty);
    await mutate();
  };

  return (
    <CrudSurface
      title="Applications"
      form={
        <>
          <SelectInput
            label="Candidate"
            value={form.candidateId}
            onChange={(v) => setForm({ ...form, candidateId: v })}
            options={[['', 'Select candidate'], ...candidates.map((c) => [c.id, c.fullName])]}
          />
          <SelectInput
            label="Job"
            value={form.jobId}
            onChange={(v) => setForm({ ...form, jobId: v })}
            options={[['', 'Select job'], ...jobs.map((j) => [j.id, j.title])]}
          />
          <SelectInput
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v as ApplicationDto['status'] })}
            options={applicationStatusOptions.map((o) => [o, o])}
          />
          <TextArea label="Cover letter" value={form.coverLetter} onChange={(v) => setForm({ ...form, coverLetter: v })} />
          <FormActions isEditing={Boolean(form.id)} onClear={() => setForm(empty)} onSave={save} />
        </>
      }
      table={
        <SimpleTable
          headers={['Candidate', 'Job', 'Status', 'Actions']}
          isLoading={isLoading}
          rows={data.map((item: ApplicationDto) => [
            item.candidateId,
            item.jobId,
            <span key={`${item.id}-status`} className="badge badge-outline rounded-none">
              {item.status}
            </span>,
            <RowActions
              key={item.id}
              onEdit={() =>
                setForm({
                  id: item.id,
                  candidateId: item.candidateId,
                  jobId: item.jobId,
                  status: item.status as ApplicationDto['status'],
                  coverLetter: item.coverLetter ?? '',
                })
              }
              onDelete={async () => {
                await talentApi.applications.remove(item.id);
                await mutate();
              }}
            />,
          ])}
        />
      }
    />
  );
}

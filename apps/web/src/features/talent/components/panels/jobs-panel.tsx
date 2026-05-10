import type { EducationLevel, EmployerDto, JobDto, WorkMode } from '@talent-matching/dtos';
import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../../api';
import { enumValue, numberOrNull } from '@features/talent/utils';
import { CrudSurface, FormActions, RowActions, SelectInput, SimpleTable, TextArea, TextInput } from '@components/form-controls';

const educationOptions = ['', 'high_school', 'diploma', 'bachelor', 'master', 'phd', 'other'];
const workModeOptions = ['', 'remote', 'on_site', 'hybrid'];
const jobStatusOptions = ['published', 'draft', 'closed'];

export function JobsPanel({ employers }: { employers: EmployerDto[] }) {
  const { data = [], isLoading, mutate } = useSWR('jobs', talentApi.jobs.list);
  const empty = {
    id: '',
    employerId: '',
    title: '',
    description: '',
    companyInfo: '',
    requiredEducation: '',
    requiredSkills: '',
    requiredYearsOfExperience: '',
    workMode: '',
    location: '',
    status: 'published' as JobDto['status'],
  };
  const [form, setForm] = useState(empty);

  const save = async () => {
    const payload = {
      employerId: form.employerId,
      title: form.title,
      description: form.description,
      companyInfo: form.companyInfo || undefined,
      requiredEducation: enumValue<EducationLevel>(form.requiredEducation),
      requiredSkills: form.requiredSkills || undefined,
      requiredYearsOfExperience: numberOrNull(form.requiredYearsOfExperience),
      workMode: enumValue<WorkMode>(form.workMode),
      location: form.location || undefined,
      status: form.status,
    };
    form.id ? await talentApi.jobs.update(form.id, payload) : await talentApi.jobs.create(payload);
    setForm(empty);
    await mutate();
  };

  return (
    <CrudSurface
      title="Jobs"
      form={
        <>
          <SelectInput
            label="Employer"
            value={form.employerId}
            onChange={(v) => setForm({ ...form, employerId: v })}
            options={[['', 'Select employer'], ...employers.map((e) => [e.id, e.companyName])]}
          />
          <TextInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <TextInput label="Company info" value={form.companyInfo} onChange={(v) => setForm({ ...form, companyInfo: v })} />
          <SelectInput
            label="Required education"
            value={form.requiredEducation}
            onChange={(v) => setForm({ ...form, requiredEducation: v })}
            options={educationOptions.map((o) => [o, o || 'Any'])}
          />
          <TextInput label="Required skills" value={form.requiredSkills} onChange={(v) => setForm({ ...form, requiredSkills: v })} />
          <TextInput label="Required years" value={form.requiredYearsOfExperience} onChange={(v) => setForm({ ...form, requiredYearsOfExperience: v })} />
          <SelectInput
            label="Work mode"
            value={form.workMode}
            onChange={(v) => setForm({ ...form, workMode: v })}
            options={workModeOptions.map((o) => [o, o || 'Any'])}
          />
          <TextInput label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <SelectInput
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v as JobDto['status'] })}
            options={jobStatusOptions.map((o) => [o, o])}
          />
          <FormActions isEditing={Boolean(form.id)} onClear={() => setForm(empty)} onSave={save} />
        </>
      }
      table={
        <SimpleTable
          headers={['Title', 'Mode', 'Location', 'Actions']}
          isLoading={isLoading}
          rows={data.map((item: JobDto) => [
            item.title,
            item.workMode ?? '',
            item.location ?? '',
            <RowActions
              key={item.id}
              onEdit={async () => {
                const fullJob = await talentApi.jobs.get(item.id);
                setForm({
                  id: fullJob.id,
                  employerId: fullJob.employerId,
                  title: fullJob.title,
                  description: fullJob.description,
                  companyInfo: fullJob.companyInfo ?? '',
                  requiredEducation: fullJob.requiredEducation ?? '',
                  requiredSkills: fullJob.requiredSkills ?? '',
                  requiredYearsOfExperience: fullJob.requiredYearsOfExperience?.toString() ?? '',
                  workMode: fullJob.workMode ?? '',
                  location: fullJob.location ?? '',
                  status: fullJob.status as JobDto['status'],
                });
              }}
              onDelete={async () => {
                await talentApi.jobs.remove(item.id);
                await mutate();
              }}
            />,
          ])}
        />
      }
    />
  );
}

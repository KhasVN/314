import type {
  CandidateDto,
  EducationLevel,
  WorkMode,
} from '@talent-matching/dtos';
import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../../api';
import { enumValue, numberOrNull } from '@features/talent/utils';
import {
  CheckboxInput,
  CrudSurface,
  FormActions,
  RowActions,
  SelectInput,
  SimpleTable,
  TextArea,
  TextInput,
} from '@components/form-controls';

const educationOptions = [
  '',
  'high_school',
  'diploma',
  'bachelor',
  'master',
  'phd',
  'other',
];
const workModeOptions = ['', 'remote', 'on_site', 'hybrid'];

export function CandidatesPanel() {
  const {
    data = [],
    isLoading,
    mutate,
  } = useSWR('candidates', talentApi.candidates.list);
  const empty = {
    id: '',
    userId: '',
    fullName: '',
    contactInfo: '',
    education: '',
    major: '',
    yearsOfExperience: '',
    skills: '',
    workExperience: '',
    preferredLocations: '',
    preferredWorkMode: '',
    resumeText: '',
    isMember: false,
  };
  const [form, setForm] = useState(empty);

  const save = async () => {
    const payload = {
      userId: form.userId,
      fullName: form.fullName,
      contactInfo: form.contactInfo || undefined,
      education: enumValue<EducationLevel>(form.education),
      major: form.major || undefined,
      yearsOfExperience: numberOrNull(form.yearsOfExperience),
      skills: form.skills || undefined,
      workExperience: form.workExperience || undefined,
      preferredLocations: form.preferredLocations || undefined,
      preferredWorkMode: enumValue<WorkMode>(form.preferredWorkMode),
      resumeText: form.resumeText || undefined,
      isMember: form.isMember,
    };
    form.id
      ? await talentApi.candidates.update(form.id, payload)
      : await talentApi.candidates.create(payload);
    setForm(empty);
    await mutate();
  };

  return (
    <CrudSurface
      title="Candidates"
      form={
        <>
          <TextInput
            label="User ID"
            value={form.userId}
            onChange={(v) => setForm({ ...form, userId: v })}
          />
          <TextInput
            label="Full name"
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
          />
          <TextInput
            label="Contact info"
            value={form.contactInfo}
            onChange={(v) => setForm({ ...form, contactInfo: v })}
          />
          <SelectInput
            label="Education"
            value={form.education}
            onChange={(v) => setForm({ ...form, education: v })}
            options={educationOptions.map((o) => [o, o || 'Any'])}
          />
          <TextInput
            label="Major"
            value={form.major}
            onChange={(v) => setForm({ ...form, major: v })}
          />
          <TextInput
            label="Years experience"
            value={form.yearsOfExperience}
            onChange={(v) => setForm({ ...form, yearsOfExperience: v })}
          />
          <TextInput
            label="Skills"
            value={form.skills}
            onChange={(v) => setForm({ ...form, skills: v })}
          />
          <TextArea
            label="Work experience"
            value={form.workExperience}
            onChange={(v) => setForm({ ...form, workExperience: v })}
          />
          <TextInput
            label="Preferred location"
            value={form.preferredLocations}
            onChange={(v) => setForm({ ...form, preferredLocations: v })}
          />
          <SelectInput
            label="Preferred work mode"
            value={form.preferredWorkMode}
            onChange={(v) => setForm({ ...form, preferredWorkMode: v })}
            options={workModeOptions.map((o) => [o, o || 'Any'])}
          />
          <TextArea
            label="Resume text"
            value={form.resumeText}
            onChange={(v) => setForm({ ...form, resumeText: v })}
          />
          <CheckboxInput
            label="Membership"
            checked={form.isMember}
            onChange={(v) => setForm({ ...form, isMember: v })}
          />
          <FormActions
            isEditing={Boolean(form.id)}
            onClear={() => setForm(empty)}
            onSave={save}
          />
        </>
      }
      table={
        <SimpleTable
          headers={['Name', 'Education', 'Mode', 'Member', 'Actions']}
          isLoading={isLoading}
          rows={data.map((item: CandidateDto) => [
            item.fullName,
            item.education ?? '',
            item.preferredWorkMode ?? '',
            item.isMember ? 'Yes' : 'No',
            <RowActions
              key={item.id}
              onEdit={() =>
                setForm({
                  id: item.id,
                  userId: item.userId,
                  fullName: item.fullName,
                  contactInfo: item.contactInfo ?? '',
                  education: item.education ?? '',
                  major: item.major ?? '',
                  yearsOfExperience: item.yearsOfExperience?.toString() ?? '',
                  skills: item.skills ?? '',
                  workExperience: item.workExperience ?? '',
                  preferredLocations: item.preferredLocations ?? '',
                  preferredWorkMode: item.preferredWorkMode ?? '',
                  resumeText: item.resumeText ?? '',
                  isMember: item.isMember ?? false,
                })
              }
              onDelete={async () => {
                await talentApi.candidates.remove(item.id);
                await mutate();
              }}
            />,
          ])}
        />
      }
    />
  );
}

import type { CandidateDto, EducationLevel } from '@talent-matching/dtos';
import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '@features/talent/api';
import { enumValue, numberOrNull } from '@features/talent/utils';
import { CrudSurface, FormActions, RowActions, SelectInput, SimpleTable, TextArea, TextInput } from '@components/form-controls';

const educationOptions = ['', 'high_school', 'diploma', 'bachelor', 'master', 'phd', 'other'];

export function CandidatesPanel() {
  const { data = [], isLoading, mutate } = useSWR('candidates', talentApi.candidates.list);
  const empty = {
    id: '',
    userId: '',
    fullName: '',
    contactInfo: '',
    education: '',
    major: '',
    yearsOfExperience: '',
    skills: '',
    resumeText: '',
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
      resumeText: form.resumeText || undefined,
    };
    form.id ? await talentApi.candidates.update(form.id, payload) : await talentApi.candidates.create(payload);
    setForm(empty);
    await mutate();
  };

  return (
    <CrudSurface
      title="Candidates"
      form={
        <>
          <TextInput label="User ID" value={form.userId} onChange={(v) => setForm({ ...form, userId: v })} />
          <TextInput label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
          <TextInput label="Contact info" value={form.contactInfo} onChange={(v) => setForm({ ...form, contactInfo: v })} />
          <SelectInput
            label="Education"
            value={form.education}
            onChange={(v) => setForm({ ...form, education: v })}
            options={educationOptions.map((o) => [o, o || 'Any'])}
          />
          <TextInput label="Major" value={form.major} onChange={(v) => setForm({ ...form, major: v })} />
          <TextInput label="Years experience" value={form.yearsOfExperience} onChange={(v) => setForm({ ...form, yearsOfExperience: v })} />
          <TextInput label="Skills" value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
          <TextArea label="Resume text" value={form.resumeText} onChange={(v) => setForm({ ...form, resumeText: v })} />
          <FormActions isEditing={Boolean(form.id)} onClear={() => setForm(empty)} onSave={save} />
        </>
      }
      table={
        <SimpleTable
          headers={['Name', 'Education', 'YOE', 'Actions']}
          isLoading={isLoading}
          rows={data.map((item: CandidateDto) => [
            item.fullName,
            item.education ?? '',
            item.yearsOfExperience ?? '',
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
                  resumeText: item.resumeText ?? '',
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

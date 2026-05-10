import { useState } from 'react';
import useSWR from 'swr';
import { talentApi } from '../../api';
import {
  CheckboxInput,
  CrudSurface,
  FormActions,
  RowActions,
  SimpleTable,
  TextArea,
  TextInput,
} from '@components/form-controls';

export function EmployersPanel() {
  const {
    data = [],
    isLoading,
    mutate,
  } = useSWR('employers', talentApi.employers.list);
  const empty = {
    id: '',
    userId: '',
    companyName: '',
    companyInfo: '',
    contactInfo: '',
    isMember: false,
  };
  const [form, setForm] = useState(empty);

  const save = async () => {
    const payload = {
      userId: form.userId,
      companyName: form.companyName,
      companyInfo: form.companyInfo || undefined,
      contactInfo: form.contactInfo || undefined,
      isMember: form.isMember,
    };
    form.id
      ? await talentApi.employers.update(form.id, payload)
      : await talentApi.employers.create(payload);
    setForm(empty);
    await mutate();
  };

  return (
    <CrudSurface
      title="Employers"
      form={
        <>
          <TextInput
            label="User ID"
            value={form.userId}
            onChange={(v) => setForm({ ...form, userId: v })}
          />
          <TextInput
            label="Company name"
            value={form.companyName}
            onChange={(v) => setForm({ ...form, companyName: v })}
          />
          <TextArea
            label="Company info"
            value={form.companyInfo}
            onChange={(v) => setForm({ ...form, companyInfo: v })}
          />
          <TextInput
            label="Contact info"
            value={form.contactInfo}
            onChange={(v) => setForm({ ...form, contactInfo: v })}
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
          headers={['Company', 'User', 'Member', 'Actions']}
          isLoading={isLoading}
          rows={data.map((item) => [
            item.companyName,
            item.userId,
            item.isMember ? 'Yes' : 'No',
            <RowActions
              key={item.id}
              onEdit={() =>
                setForm({
                  id: item.id,
                  userId: item.userId,
                  companyName: item.companyName,
                  companyInfo: item.companyInfo ?? '',
                  contactInfo: item.contactInfo ?? '',
                  isMember: item.isMember ?? false,
                })
              }
              onDelete={async () => {
                await talentApi.employers.remove(item.id);
                await mutate();
              }}
            />,
          ])}
        />
      }
    />
  );
}

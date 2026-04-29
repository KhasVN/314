import type { ReactNode } from 'react';

export function TextInput({
  label,
  onChange,
  type = 'text',
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="form-control">
      <span className="label-text text-xs uppercase text-primary/50 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input input-bordered rounded-none bg-base-100"
      />
    </label>
  );
}

export function TextArea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="form-control">
      <span className="label-text text-xs uppercase text-primary/50 mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="textarea textarea-bordered rounded-none bg-base-100 min-h-[8rem]"
      />
    </label>
  );
}

export function SelectInput({
  emptyLabel = 'Any',
  label,
  onChange,
  options,
  value,
}: {
  emptyLabel?: string;
  label: string;
  onChange: (value: string) => void;
  options: string[][];
  value: string;
}) {
  return (
    <label className="form-control">
      <span className="label-text text-xs uppercase text-primary/50 mb-1">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="select select-bordered rounded-none bg-base-100"
      >
        <option value="">{emptyLabel}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormActions({
  isEditing,
  onClear,
  onSave,
}: {
  isEditing: boolean;
  onClear: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-5 flex gap-3">
      <button className="btn btn-primary rounded-none" onClick={onSave}>
        {isEditing ? 'Update' : 'Create'}
      </button>
      <button className="btn btn-ghost rounded-none" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

export function RowActions({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
  return (
    <div className="join">
      <button className="btn btn-sm btn-ghost join-item rounded-none" onClick={onEdit}>
        Edit
      </button>
      <button className="btn btn-sm btn-error join-item rounded-none" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

export function CrudSurface({
  form,
  table,
  title,
}: {
  form: ReactNode;
  table: ReactNode;
  title: string;
}) {
  return (
    <section className="crud-surface">
      <div className="crud-heading">
        <p>
          Workspace <span>/</span> {title}
        </p>
        <h1>{title}</h1>
      </div>
      <div className="crud-grid">
        <section className="editor-panel">{form}</section>
        <section className="table-panel">{table}</section>
      </div>
    </section>
  );
}

export function SimpleTable({
  headers,
  isLoading,
  rows,
}: {
  headers: string[];
  isLoading: boolean;
  rows: ReactNode[][];
}) {
  if (isLoading) {
    return <span className="loading loading-spinner loading-lg" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="text-xs uppercase text-primary/50">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

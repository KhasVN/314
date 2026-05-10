'use client';

import { LinkedoutCard } from '@features/candidate/components/linkedout-ui';

export function JobPostingFormCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <LinkedoutCard className="mb-4 p-6">
      <h2 className="mb-5 flex items-center gap-2 text-[15px] font-bold text-[#2d2d2d]">
        <span className="text-lg">{icon}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </LinkedoutCard>
  );
}

export function JobPostingField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-[#2d2d2d]">
        {label}
        {required && <span className="ml-1 text-[#c9262d]">*</span>}
      </label>
      {hint && <p className="mb-2 text-xs text-[#767676]">{hint}</p>}
      {children}
    </div>
  );
}

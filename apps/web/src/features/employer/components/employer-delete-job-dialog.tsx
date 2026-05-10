'use client';

import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';

export function EmployerDeleteJobDialog({
  open,
  deleteError,
  onDismissOverlay,
  onCancel,
  onConfirmDelete,
}: {
  open: boolean;
  deleteError: string;
  onDismissOverlay: () => void;
  onCancel: () => void;
  onConfirmDelete: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close dialog" onClick={onDismissOverlay} />
      <LinkedoutCard className="relative z-[401] w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-[#2d2d2d]">Delete job posting?</h3>
        <p className="mt-2 text-sm text-[#595959]">This removes the job from search results.</p>
        {deleteError && <p className="mt-2 text-sm text-[#c9262d]">{deleteError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <LinkedoutButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </LinkedoutButton>
          <LinkedoutButton type="button" variant="danger" onClick={onConfirmDelete}>
            Delete
          </LinkedoutButton>
        </div>
      </LinkedoutCard>
    </div>
  );
}

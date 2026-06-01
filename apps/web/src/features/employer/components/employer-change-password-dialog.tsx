// ============================================================
// FILE: employer-change-password-dialog.tsx
// PURPOSE: A pop-up dialog that allows an employer to change
//          their account password from the employer dashboard.
// ============================================================

// 'use client' tells Next.js this component runs in the browser
// (not on the server). Required for anything that uses React
// state, event handlers, or browser APIs.
'use client';

// useState is a React hook that lets us remember values
// that can change over time (like what the user has typed).
import { useState } from 'react';

// authClient is our authentication library.
// We use it to call changePassword() which talks to the backend.
import { authClient } from '@lib/auth-client';

// Reusable UI building blocks from the shared component library.
// LinkedoutButton = styled button, LinkedoutCard = styled card/box.
import { LinkedoutButton, LinkedoutCard } from '@features/candidate/components/linkedout-ui';

// JobPostingField = a labelled wrapper for form inputs (label + hint text).
import { JobPostingField } from './job-posting-form-primitives';

// LinkedoutInput = a styled text input box.
import { LinkedoutInput } from '@features/candidate/components/linkedout-ui';

// ============================================================
// COMPONENT DEFINITION
// This component accepts two props from its parent:
//   - open: whether the dialog is currently visible (true/false)
//   - onClose: a function to call when the dialog should close
// ============================================================
export function EmployerChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;       // true = show dialog, false = hide it
  onClose: () => void; // function with no arguments, returns nothing
}) {

  // ── STATE VARIABLES ──────────────────────────────────────
  // These are the values the component "remembers" between renders.
  // Each useState() gives us: [currentValue, functionToChangeIt]

  const [currentPassword, setCurrentPassword] = useState(''); // what user typed in "current password" field
  const [newPassword, setNewPassword] = useState('');          // what user typed in "new password" field
  const [confirmPassword, setConfirmPassword] = useState(''); // what user typed in "confirm password" field
  const [loading, setLoading] = useState(false);              // true while waiting for the API response
  const [error, setError] = useState('');                     // error message to show if something goes wrong
  const [success, setSuccess] = useState(false);              // true after password is changed successfully

  // ── EARLY RETURN ─────────────────────────────────────────
  // If `open` is false, render nothing at all (dialog is hidden).
  // This is the simplest way to show/hide a component in React.
  if (!open) return null;

  // ── HANDLE CLOSE ─────────────────────────────────────────
  // Called when the user clicks Cancel, the ✕ button, or the
  // dark overlay behind the dialog.
  // We reset ALL state back to empty/default before closing,
  // so the form is blank next time the dialog is opened.
  const handleClose = () => {
    setCurrentPassword('');  // clear the current password field
    setNewPassword('');      // clear the new password field
    setConfirmPassword('');  // clear the confirm password field
    setError('');            // remove any error message
    setSuccess(false);       // reset the success screen
    onClose();               // call the parent's close function
  };

  // ── HANDLE SUBMIT ─────────────────────────────────────────
  // Called when the user clicks "Change password" (form submission).
  // `async` means this function can do slow things (like API calls)
  // and wait for them to finish before moving on.
  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault() stops the browser from refreshing the page
    // when the form is submitted (default browser behaviour we don't want).
    e.preventDefault();

    // Clear any previous error message before validating again
    setError('');

    // ── VALIDATION ───────────────────────────────────────
    // Check the inputs before sending to the server.
    // Each `return` stops the function early if a rule is broken.

    if (!currentPassword) return setError('Current password is required.');
    if (!newPassword) return setError('New password is required.');
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    // ── API CALL ─────────────────────────────────────────
    // All validation passed — now actually change the password.

    setLoading(true); // show "Saving…" on the button

    try {
      // Call the auth library's changePassword method.
      // `await` pauses here until the server responds.
      await authClient.changePassword({
        currentPassword,          // the user's old password (to verify identity)
        newPassword,              // the new password to set
        revokeOtherSessions: false, // keep other devices logged in (set true to log them out)
      });

      // If we get here, the password was changed successfully
      setSuccess(true); // switch the dialog to the success screen
    } catch (err: unknown) {
      // If something went wrong (wrong current password, server error, etc.)
      // show an error message. We check if it's an Error object to get the message.
      setError(err instanceof Error ? err.message : 'Failed to change password. Check your current password.');
    } finally {
      // `finally` runs whether the try succeeded or the catch ran.
      // Always turn off the loading spinner when done.
      setLoading(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────
  // Everything below is JSX — the visual output of this component.
  return (
    // Outer overlay: covers the whole screen with a semi-transparent dark background.
    // `fixed inset-0` = position fixed, covering top/right/bottom/left edges.
    // `z-[400]` = stacks on top of other content (high z-index number = in front).
    // `flex items-center justify-center` = centres the card both vertically and horizontally.
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">

      {/* Dark clickable overlay behind the dialog card.
          Clicking it calls handleClose() to dismiss the dialog.
          It is a <button> (not a <div>) for accessibility — screen readers
          can focus and activate it with keyboard. */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40" // bg-black/40 = black at 40% opacity
        aria-label="Close dialog"                 // screen reader label
        onClick={handleClose}
      />

      {/* The white dialog card. `relative z-[401]` puts it in FRONT of the overlay.
          `max-w-md` limits the width so it doesn't stretch too wide on large screens. */}
      <LinkedoutCard className="relative z-[401] w-full max-w-md p-6">

        {/* Conditional rendering: show SUCCESS screen OR the FORM.
            The ternary `condition ? A : B` means: if success is true show A, else show B. */}
        {success ? (

          // ── SUCCESS STATE ─────────────────────────────
          // Shown after the password is changed successfully.
          <div className="py-4 text-center">
            {/* Green checkmark circle icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              {/* SVG = inline vector graphic. This draws a checkmark (✓). */}
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#2d2d2d]">Password changed</h3>
            <p className="mt-2 text-sm text-[#595959]">Your password has been updated successfully.</p>
            {/* "Done" button closes the dialog */}
            <LinkedoutButton type="button" className="mt-6 w-full" onClick={handleClose}>
              Done
            </LinkedoutButton>
          </div>

        ) : (

          // ── FORM STATE ────────────────────────────────
          // The default view: the password change form.
          // <> ... </> is a React Fragment — a wrapper that adds no extra HTML element.
          <>
            {/* Dialog header row: title on the left, ✕ close button on the right */}
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#2d2d2d]">Change password</h3>
              <button
                type="button"
                className="squircle-button px-2 py-1 text-sm font-semibold text-[#595959] hover:bg-[#f3f2f1]"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            {/* The form element. onSubmit calls handleSubmit when submitted.
                `flex flex-col gap-4` stacks the fields vertically with spacing. */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* ── FIELD 1: Current password ── */}
              {/* JobPostingField wraps the input with a label ("Current password") and a red * for required */}
              <JobPostingField label="Current password" required>
                <LinkedoutInput
                  type="password"       // hides characters as dots
                  placeholder="Enter current password"
                  value={currentPassword}  // controlled input: value comes from state
                  onChange={(e) => {
                    setCurrentPassword(e.target.value); // update state on every keystroke
                    setError('');                        // clear error as user types
                  }}
                  autoComplete="current-password" // tells browser's password manager this is the current password
                />
              </JobPostingField>

              {/* ── FIELD 2: New password ── */}
              {/* hint="At least 8 characters" shows grey helper text below the label */}
              <JobPostingField label="New password" required hint="At least 8 characters">
                <LinkedoutInput
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError(''); // clear error as user types
                  }}
                  autoComplete="new-password" // tells browser this is a new password field
                />
              </JobPostingField>

              {/* ── FIELD 3: Confirm new password ── */}
              <JobPostingField label="Confirm new password" required>
                <LinkedoutInput
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(''); // clear error as user types
                  }}
                  autoComplete="new-password"
                />
              </JobPostingField>

              {/* ── ERROR MESSAGE ── */}
              {/* Only renders if `error` is not an empty string.
                  The `&&` operator means: if left side is true, render the right side. */}
              {error && (
                <div className="rounded-xl border border-[#f3b8bc] bg-[#fff5f5] px-4 py-3 text-sm text-[#c9262d]">
                  {error} {/* display the error string */}
                </div>
              )}

              {/* ── BUTTONS ROW ── */}
              {/* Two buttons side by side: Cancel (secondary style) and Submit (primary style) */}
              <div className="flex gap-3 pt-1">
                <LinkedoutButton type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                  Cancel
                </LinkedoutButton>
                <LinkedoutButton
                  type="submit"           // clicking this submits the form → calls handleSubmit
                  disabled={loading}      // grey out and disable while waiting for the API
                  className="flex-1"
                >
                  {/* Show different text depending on loading state */}
                  {loading ? 'Saving…' : 'Change password'}
                </LinkedoutButton>
              </div>

            </form>
          </>
        )}
      </LinkedoutCard>
    </div>
  );
}
"use client";

import type { ReactNode } from "react";

/**
 * Shared confirm-gate wrapper for destructive server-action forms — same
 * pattern as the original DeleteAccountForm, generalized so remove-member,
 * delete-partner, etc. don't each need their own copy.
 */
export function ConfirmForm({
  action,
  confirmMessage,
  children,
  className
}: {
  action: (formData: FormData) => Promise<void>;
  confirmMessage: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}

"use client";

import type { ReactNode } from "react";

export function ConfirmDeleteForm({
  action,
  confirmMessage,
  children,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}

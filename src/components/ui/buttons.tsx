"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-60";
  const styles =
    variant === "danger"
      ? "bg-loss text-white hover:opacity-90"
      : "bg-accent text-bg hover:opacity-90";
  return (
    <button type="submit" disabled={pending} className={`${base} ${styles}`}>
      {pending ? (pendingText ?? "Saving…") : children}
    </button>
  );
}

export function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent"
    >
      {children}
    </Link>
  );
}

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold uppercase tracking-wide text-ink">
            Slab Ledger
          </span>
          <p className="mt-1 text-sm text-ink-soft">Your collection, priced and tracked.</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}

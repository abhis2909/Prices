import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { logoutUser } from "@/lib/actions/auth";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cards", label: "Cards" },
  { href: "/holdings", label: "Holdings" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="font-display text-lg font-semibold uppercase tracking-wide text-ink"
            >
              Slab Ledger
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-ink-soft">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-ink">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-ink-soft">
            <span className="hidden font-mono text-xs sm:inline">{user.email}</span>
            <form action={logoutUser}>
              <button type="submit" className="font-medium hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}

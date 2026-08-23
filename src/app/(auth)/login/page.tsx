import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in — Slab Ledger" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center font-display text-xl font-semibold uppercase tracking-wide">
        Sign in
      </h1>
      <LoginForm />
      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/register" className="font-medium text-accent-strong">
          Create an account
        </Link>
      </p>
    </div>
  );
}

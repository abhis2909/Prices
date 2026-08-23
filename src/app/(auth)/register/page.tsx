import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Create account — Slab Ledger" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center font-display text-xl font-semibold uppercase tracking-wide">
        Create your account
      </h1>
      <RegisterForm />
      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-strong">
          Sign in
        </Link>
      </p>
    </div>
  );
}

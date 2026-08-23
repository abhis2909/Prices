"use client";

import { useActionState } from "react";
import { loginUser } from "@/lib/actions/auth";
import { TextField, FormError } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/buttons";

export function LoginForm() {
  const [state, action] = useActionState(loginUser, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}

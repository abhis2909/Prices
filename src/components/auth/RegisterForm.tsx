"use client";

import { useActionState } from "react";
import { registerUser } from "@/lib/actions/auth";
import { TextField, FormError } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/buttons";

export function RegisterForm() {
  const [state, action] = useActionState(registerUser, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <TextField
        label="Name"
        name="name"
        autoComplete="name"
        required
        error={state?.fieldErrors?.name}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state?.fieldErrors?.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters."
        error={state?.fieldErrors?.password}
      />
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}

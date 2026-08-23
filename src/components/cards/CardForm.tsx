"use client";

import { useActionState } from "react";
import { TextField, TextAreaField, FormError } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/buttons";
import type { ActionState } from "@/lib/actions/types";

type CardFormValues = {
  sport?: string;
  year?: number;
  setName?: string;
  cardNumber?: string;
  player?: string;
  parallel?: string | null;
  notes?: string | null;
};

export function CardForm({
  action,
  defaultValues,
  submitLabel = "Save card",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: CardFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Sport"
          name="sport"
          defaultValue={defaultValues?.sport}
          placeholder="Baseball"
          required
          error={state?.fieldErrors?.sport}
        />
        <TextField
          label="Year"
          name="year"
          type="number"
          defaultValue={defaultValues?.year}
          required
          error={state?.fieldErrors?.year}
        />
      </div>
      <TextField
        label="Set"
        name="setName"
        defaultValue={defaultValues?.setName}
        placeholder="Topps Chrome"
        required
        error={state?.fieldErrors?.setName}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Card number"
          name="cardNumber"
          defaultValue={defaultValues?.cardNumber}
          placeholder="US15"
          required
          error={state?.fieldErrors?.cardNumber}
        />
        <TextField
          label="Player"
          name="player"
          defaultValue={defaultValues?.player}
          required
          error={state?.fieldErrors?.player}
        />
      </div>
      <TextField
        label="Parallel"
        name="parallel"
        defaultValue={defaultValues?.parallel ?? undefined}
        placeholder="Refractor /499 (optional)"
        error={state?.fieldErrors?.parallel}
      />
      <TextAreaField
        label="Notes"
        name="notes"
        defaultValue={defaultValues?.notes ?? undefined}
        error={state?.fieldErrors?.notes}
      />
      <div>
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

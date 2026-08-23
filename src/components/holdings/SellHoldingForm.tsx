"use client";

import { useActionState } from "react";
import { markHoldingSold } from "@/lib/actions/holdings";
import { TextField, FormError } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/buttons";
import type { ActionState } from "@/lib/actions/types";

export function SellHoldingForm({ holdingId }: { holdingId: string }) {
  const action = markHoldingSold.bind(null, holdingId) as (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  const [state, formAction] = useActionState(action, null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormError message={state?.error} />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Sold price"
          name="soldPrice"
          type="number"
          step="0.01"
          min="0"
          required
          error={state?.fieldErrors?.soldPrice}
        />
        <TextField
          label="Sold on"
          name="soldDate"
          type="date"
          defaultValue={today}
          required
          error={state?.fieldErrors?.soldDate}
        />
      </div>
      <div>
        <SubmitButton pendingText="Recording sale…">Mark as sold</SubmitButton>
      </div>
    </form>
  );
}

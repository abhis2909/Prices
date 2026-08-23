"use client";

import { useActionState } from "react";
import { TextField, SelectField, TextAreaField, FormError } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/buttons";
import type { ActionState } from "@/lib/actions/types";

type CardOption = {
  id: string;
  year: number;
  setName: string;
  player: string;
  parallel: string | null;
};

type HoldingFormValues = {
  cardId?: string;
  grade?: string;
  serialNumber?: string | null;
  quantity?: number;
  purchasePrice?: unknown;
  purchaseDate?: Date | string;
  purchaseSource?: string | null;
  notes?: string | null;
};

function toDateInputValue(value?: Date | string) {
  if (!value) return undefined;
  return new Date(value).toISOString().slice(0, 10);
}

export function HoldingForm({
  action,
  cards,
  defaultValues,
  submitLabel = "Save holding",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  cards: CardOption[];
  defaultValues?: HoldingFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <SelectField
        label="Card"
        name="cardId"
        defaultValue={defaultValues?.cardId}
        required
        error={state?.fieldErrors?.cardId}
      >
        <option value="" disabled>
          Choose a card…
        </option>
        {cards.map((c) => (
          <option key={c.id} value={c.id}>
            {c.year} {c.setName} · {c.player}
            {c.parallel ? ` · ${c.parallel}` : ""}
          </option>
        ))}
      </SelectField>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Grade"
          name="grade"
          defaultValue={defaultValues?.grade}
          placeholder="Raw, PSA 10…"
          required
          error={state?.fieldErrors?.grade}
        />
        <TextField
          label="Serial number"
          name="serialNumber"
          defaultValue={defaultValues?.serialNumber ?? undefined}
          placeholder="142/499 (optional)"
          error={state?.fieldErrors?.serialNumber}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          min="1"
          defaultValue={defaultValues?.quantity ?? 1}
          required
          error={state?.fieldErrors?.quantity}
        />
        <TextField
          label="Purchase price"
          name="purchasePrice"
          type="number"
          step="0.01"
          min="0"
          defaultValue={
            defaultValues?.purchasePrice !== undefined
              ? String(defaultValues.purchasePrice)
              : undefined
          }
          required
          error={state?.fieldErrors?.purchasePrice}
        />
        <TextField
          label="Purchase date"
          name="purchaseDate"
          type="date"
          defaultValue={toDateInputValue(defaultValues?.purchaseDate)}
          required
          error={state?.fieldErrors?.purchaseDate}
        />
      </div>
      <TextField
        label="Purchase source"
        name="purchaseSource"
        defaultValue={defaultValues?.purchaseSource ?? undefined}
        placeholder="eBay, card show… (optional)"
        error={state?.fieldErrors?.purchaseSource}
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

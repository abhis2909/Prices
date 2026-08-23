"use client";

import { useActionState } from "react";
import { addPriceSnapshot } from "@/lib/actions/prices";
import { TextField, FormError } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/buttons";

export function AddPriceForm({ cardId, gradeSuggestions }: { cardId: string; gradeSuggestions: string[] }) {
  const [state, formAction] = useActionState(addPriceSnapshot, null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormError message={state?.error} />
      <input type="hidden" name="cardId" value={cardId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TextField
          label="Grade"
          name="grade"
          placeholder="Raw, PSA 10…"
          list="grade-suggestions"
          required
          error={state?.fieldErrors?.grade}
        />
        <TextField
          label="Price"
          name="medianPrice"
          type="number"
          step="0.01"
          min="0"
          required
          error={state?.fieldErrors?.medianPrice}
        />
        <TextField
          label="Observed on"
          name="observedAt"
          type="date"
          defaultValue={today}
          required
          error={state?.fieldErrors?.observedAt}
        />
        <div className="flex items-end">
          <SubmitButton pendingText="Logging…">Log price</SubmitButton>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Listing URL"
          name="listingUrl"
          id="price-listingUrl"
          type="url"
          placeholder="Link to the eBay listing (optional)"
          error={state?.fieldErrors?.listingUrl}
        />
        <TextField
          label="Photo URL"
          name="imageUrl"
          id="price-imageUrl"
          type="url"
          placeholder="Listing photo, for your own receipt (optional)"
          error={state?.fieldErrors?.imageUrl}
        />
      </div>
      <datalist id="grade-suggestions">
        {gradeSuggestions.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
    </form>
  );
}

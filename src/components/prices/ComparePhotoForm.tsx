"use client";

import { useActionState } from "react";
import { compareCardPhoto, type CompareState } from "@/lib/actions/compare";
import { TextField, FormError } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/buttons";

const verdictStyle: Record<"MATCH" | "MISMATCH" | "UNCERTAIN", string> = {
  MATCH: "border-gain/40 bg-gain/10 text-gain",
  MISMATCH: "border-loss/40 bg-loss/10 text-loss",
  UNCERTAIN: "border-accent/40 bg-accent/10 text-accent-strong",
};

export function ComparePhotoForm({ cardId }: { cardId: string }) {
  const [state, formAction] = useActionState<CompareState, FormData>(compareCardPhoto, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="cardId" value={cardId} />
      <FormError message={state?.error} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <TextField
            label="Listing photo URL"
            name="imageUrl"
            id="compare-imageUrl"
            type="url"
            placeholder="https://i.ebayimg.com/…"
            required
            error={state?.fieldErrors?.imageUrl}
          />
        </div>
        <SubmitButton pendingText="Checking…">Compare with AI</SubmitButton>
      </div>
      {state?.verdict && (
        <div className={`rounded-md border px-3 py-2 ${verdictStyle[state.verdict]}`}>
          <span className="font-mono text-xs font-semibold uppercase tracking-wide">
            {state.verdict}
          </span>
          <p className="mt-0.5 text-sm">{state.reason}</p>
        </div>
      )}
    </form>
  );
}

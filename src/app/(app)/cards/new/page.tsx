import { CardForm } from "@/components/cards/CardForm";
import { createCard } from "@/lib/actions/cards";

export const metadata = { title: "Add a card — Slab Ledger" };

export default function NewCardPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">Add a card</h1>
      <div className="rounded-lg border border-line bg-surface p-6">
        <CardForm action={createCard} submitLabel="Add card" />
      </div>
    </div>
  );
}

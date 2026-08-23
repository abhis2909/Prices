import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createHolding } from "@/lib/actions/holdings";
import { HoldingForm } from "@/components/holdings/HoldingForm";

export default async function NewHoldingPage({
  searchParams,
}: {
  searchParams: Promise<{ cardId?: string }>;
}) {
  const user = await requireUser();
  const { cardId } = await searchParams;

  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: [{ year: "desc" }, { player: "asc" }],
    select: { id: true, year: true, setName: true, player: true, parallel: true },
  });

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line py-20 text-center">
        <h1 className="font-display text-xl font-semibold uppercase tracking-wide">
          Add a card first
        </h1>
        <p className="max-w-sm text-sm text-ink-soft">
          A holding is a copy you own of a catalog card — add the card itself first.
        </p>
        <Link
          href="/cards/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
        >
          Add a card
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">
        Add a holding
      </h1>
      <div className="rounded-lg border border-line bg-surface p-6">
        <HoldingForm action={createHolding} cards={cards} defaultValues={{ cardId }} submitLabel="Add holding" />
      </div>
    </div>
  );
}

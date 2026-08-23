import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { updateHolding } from "@/lib/actions/holdings";
import { HoldingForm } from "@/components/holdings/HoldingForm";

export default async function EditHoldingPage({
  params,
}: {
  params: Promise<{ holdingId: string }>;
}) {
  const { holdingId } = await params;
  const user = await requireUser();

  const [holding, cards] = await Promise.all([
    prisma.holding.findFirst({ where: { id: holdingId, userId: user.id } }),
    prisma.card.findMany({
      where: { userId: user.id },
      orderBy: [{ year: "desc" }, { player: "asc" }],
      select: { id: true, year: true, setName: true, player: true, parallel: true },
    }),
  ]);
  if (!holding) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">Edit holding</h1>
      <div className="rounded-lg border border-line bg-surface p-6">
        <HoldingForm
          action={updateHolding.bind(null, holding.id)}
          cards={cards}
          defaultValues={holding}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}

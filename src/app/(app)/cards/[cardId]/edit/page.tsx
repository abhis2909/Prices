import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { updateCard } from "@/lib/actions/cards";
import { CardForm } from "@/components/cards/CardForm";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const user = await requireUser();

  const card = await prisma.card.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">Edit card</h1>
      <div className="rounded-lg border border-line bg-surface p-6">
        <CardForm action={updateCard.bind(null, card.id)} defaultValues={card} submitLabel="Save changes" />
      </div>
    </div>
  );
}

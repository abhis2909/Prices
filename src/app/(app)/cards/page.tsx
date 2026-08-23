import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { LinkButton } from "@/components/ui/buttons";

export const metadata = { title: "Cards — Slab Ledger" };

export default async function CardsPage() {
  const user = await requireUser();
  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: [{ year: "desc" }, { player: "asc" }],
    include: { _count: { select: { holdings: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">Cards</h1>
        <LinkButton href="/cards/new">Add a card</LinkButton>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-soft">
          No cards yet. Add the catalog entry for a card before recording a holding of it.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Set</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Parallel</th>
                <th className="px-4 py-3 text-right font-medium">Holdings</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 tabular-nums">
                    <Link href={`/cards/${card.id}`} className="hover:text-accent-strong">
                      {card.year}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/cards/${card.id}`} className="hover:text-accent-strong">
                      {card.setName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{card.player}</td>
                  <td className="px-4 py-3 text-ink-soft">{card.parallel ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{card._count.holdings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

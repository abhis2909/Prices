import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getLatestPricesForUser } from "@/lib/portfolio";
import { formatCurrency, formatDate } from "@/lib/money";
import { LinkButton } from "@/components/ui/buttons";

export const metadata = { title: "Holdings — Slab Ledger" };

export default async function HoldingsPage() {
  const user = await requireUser();

  const [holdings, prices] = await Promise.all([
    prisma.holding.findMany({
      where: { userId: user.id },
      include: { card: true },
      orderBy: [{ status: "asc" }, { purchaseDate: "desc" }],
    }),
    getLatestPricesForUser(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">Holdings</h1>
        <LinkButton href="/holdings/new">Add a holding</LinkButton>
      </div>

      {holdings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-soft">
          No holdings yet. Add a card, then record a copy you own of it.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 font-medium">Card</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 text-right font-medium">Cost</th>
                <th className="px-4 py-3 text-right font-medium">Market</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const priced = prices.get(`${h.cardId}::${h.grade}`);
                return (
                  <tr key={h.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/holdings/${h.id}`} className="hover:text-accent-strong">
                        {h.card.year} {h.card.setName} {h.card.player}
                        {h.card.parallel ? ` · ${h.card.parallel}` : ""}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{h.grade}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(h.purchasePrice)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {h.status === "SOLD" ? (
                        formatCurrency(h.soldPrice)
                      ) : priced ? (
                        formatCurrency(priced.price)
                      ) : (
                        <span className="text-ink-soft">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          h.status === "OWNED"
                            ? "bg-pine/15 text-pine"
                            : "bg-surface-2 text-ink-soft"
                        }`}
                      >
                        {h.status === "OWNED" ? "Owned" : `Sold ${formatDate(h.soldDate!)}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

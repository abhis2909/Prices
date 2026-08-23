import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { computeTotals, getLatestPricesForUser } from "@/lib/portfolio";
import { formatCurrency, formatDate, formatPercent, formatSignedCurrency } from "@/lib/money";
import { StatTile } from "@/components/portfolio/StatTile";
import { PortfolioHistoryChart } from "@/components/portfolio/PortfolioHistoryChart";
import { SubmitButton } from "@/components/ui/buttons";
import { recordPortfolioSnapshot } from "@/lib/actions/portfolio";

export const metadata = { title: "Dashboard — Slab Ledger" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [holdings, snapshots, cardCount] = await Promise.all([
    prisma.holding.findMany({
      where: { userId: user.id, status: "OWNED" },
      include: { card: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.portfolioSnapshot.findMany({
      where: { userId: user.id },
      orderBy: { asOfDate: "asc" },
    }),
    prisma.card.count({ where: { userId: user.id } }),
  ]);

  const prices = await getLatestPricesForUser(user.id);
  const totals = computeTotals(holdings, prices);
  const gainTone = totals.gain > 0 ? "gain" : totals.gain < 0 ? "loss" : "neutral";

  if (cardCount === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line py-20 text-center">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">
          Log your first card
        </h1>
        <p className="max-w-sm text-sm text-ink-soft">
          Add a card to the catalog, then record a holding for the copy you own — cost basis and
          return will show up here.
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {holdings.length} holding{holdings.length === 1 ? "" : "s"} owned across {cardCount}{" "}
            card{cardCount === 1 ? "" : "s"}.
          </p>
        </div>
        <form action={recordPortfolioSnapshot}>
          <SubmitButton pendingText="Recording…">Record today&rsquo;s snapshot</SubmitButton>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Cost basis" value={formatCurrency(totals.costBasis)} />
        <StatTile label="Market value" value={formatCurrency(totals.marketValue)} />
        <StatTile
          label="Unrealized gain"
          value={formatSignedCurrency(totals.gain)}
          tone={gainTone}
        />
        <StatTile label="Return" value={formatPercent(totals.gainPct)} tone={gainTone} />
      </div>

      {totals.unpricedHoldingCount > 0 && (
        <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-strong">
          {totals.unpricedHoldingCount} holding{totals.unpricedHoldingCount === 1 ? "" : "s"} have
          no logged market price yet, and are carried at cost until you add one. Open a card and
          log a price to sharpen the total above.
        </p>
      )}

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Value over time
        </h2>
        <PortfolioHistoryChart points={snapshots} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Recent holdings
          </h2>
          <Link href="/holdings" className="text-sm font-medium text-accent-strong">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 font-medium">Card</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Purchased</th>
                <th className="px-4 py-3 text-right font-medium">Cost</th>
                <th className="px-4 py-3 text-right font-medium">Market</th>
              </tr>
            </thead>
            <tbody>
              {holdings.slice(0, 6).map((h) => {
                const priced = prices.get(`${h.cardId}::${h.grade}`);
                return (
                  <tr key={h.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/cards/${h.cardId}`} className="hover:text-accent-strong">
                        {h.card.year} {h.card.setName} {h.card.player}
                        {h.card.parallel ? ` · ${h.card.parallel}` : ""}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{h.grade}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(h.purchaseDate)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(h.purchasePrice)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {priced ? formatCurrency(priced.price) : (
                        <span className="text-ink-soft">&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

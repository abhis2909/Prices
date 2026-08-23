import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteCard } from "@/lib/actions/cards";
import { formatCurrency, formatDate } from "@/lib/money";
import { LinkButton, SubmitButton } from "@/components/ui/buttons";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { AddPriceForm } from "@/components/prices/AddPriceForm";
import { ComparePhotoForm } from "@/components/prices/ComparePhotoForm";

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const user = await requireUser();

  const card = await prisma.card.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) notFound();

  const [holdings, priceSnapshots] = await Promise.all([
    prisma.holding.findMany({ where: { cardId, userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.priceSnapshot.findMany({ where: { cardId }, orderBy: { observedAt: "desc" }, take: 25 }),
  ]);

  const gradeSuggestions = Array.from(new Set(holdings.map((h) => h.grade)));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">{card.sport}</p>
          <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">
            {card.year} {card.setName} · {card.player}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            #{card.cardNumber}
            {card.parallel ? ` · ${card.parallel}` : ""}
          </p>
          {card.notes && <p className="mt-3 max-w-xl text-sm text-ink">{card.notes}</p>}
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/cards/${card.id}/edit`}>Edit</LinkButton>
          <ConfirmDeleteForm
            action={deleteCard.bind(null, card.id)}
            confirmMessage="Delete this card and all its holdings and price history? This can't be undone."
          >
            <SubmitButton variant="danger" pendingText="Deleting…">
              Delete
            </SubmitButton>
          </ConfirmDeleteForm>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Holdings
          </h2>
          <LinkButton href={`/holdings/new?cardId=${card.id}`}>Add a holding</LinkButton>
        </div>
        {holdings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line py-10 text-center text-sm text-ink-soft">
            You don&rsquo;t own a copy of this card yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Purchased</th>
                  <th className="px-4 py-3 text-right font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/holdings/${h.id}`} className="font-mono text-xs hover:text-accent-strong">
                        {h.grade}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{h.quantity}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(h.purchaseDate)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(h.purchasePrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          h.status === "OWNED"
                            ? "bg-pine/15 text-pine"
                            : "bg-surface-2 text-ink-soft"
                        }`}
                      >
                        {h.status === "OWNED" ? "Owned" : "Sold"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Price history
        </h2>
        <div className="rounded-lg border border-line bg-surface p-4">
          <AddPriceForm cardId={card.id} gradeSuggestions={gradeSuggestions} />
        </div>

        <div className="mt-4 rounded-lg border border-line bg-surface-2 p-4">
          <h3 className="mb-3 mt-0 font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Compare a listing photo with AI
          </h3>
          <ComparePhotoForm cardId={card.id} />
        </div>

        {priceSnapshots.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-line py-10 text-center text-sm text-ink-soft">
            No price observations logged yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-3 font-medium">Photo</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {priceSnapshots.map((snap) => (
                  <tr key={snap.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      {snap.imageUrl ? (
                        <a
                          href={snap.listingUrl ?? snap.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View listing photo"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- external, unpredictable host; not worth next/image remotePatterns config for a thumbnail */}
                          <img
                            src={snap.imageUrl}
                            alt=""
                            className="h-10 w-10 rounded border border-line object-cover"
                          />
                        </a>
                      ) : snap.listingUrl ? (
                        <a
                          href={snap.listingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent-strong hover:underline"
                        >
                          Listing
                        </a>
                      ) : (
                        <span className="text-ink-soft">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(snap.observedAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{snap.grade}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(snap.medianPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-soft">
                        {snap.source === "MANUAL" ? "Manual" : "eBay sold"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

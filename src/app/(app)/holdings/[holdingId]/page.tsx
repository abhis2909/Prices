import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteHolding } from "@/lib/actions/holdings";
import { getLatestPricesForUser } from "@/lib/portfolio";
import { formatCurrency, formatDate, formatSignedCurrency, toNumber } from "@/lib/money";
import { LinkButton, SubmitButton } from "@/components/ui/buttons";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { SellHoldingForm } from "@/components/holdings/SellHoldingForm";

export default async function HoldingDetailPage({
  params,
}: {
  params: Promise<{ holdingId: string }>;
}) {
  const { holdingId } = await params;
  const user = await requireUser();

  const holding = await prisma.holding.findFirst({
    where: { id: holdingId, userId: user.id },
    include: { card: true },
  });
  if (!holding) notFound();

  const costBasis = toNumber(holding.purchasePrice) * holding.quantity;

  // A sold holding's return is realized against what it actually sold for,
  // not the current market — the current market price is no longer this
  // holding's concern once it's out of the collection.
  let marketValueLabel: string;
  let marketValue: number | undefined;
  let gain: number | undefined;
  if (holding.status === "SOLD") {
    marketValueLabel = "Sold for";
    marketValue = toNumber(holding.soldPrice) * holding.quantity;
    gain = marketValue - costBasis;
  } else {
    marketValueLabel = "Market value";
    const prices = await getLatestPricesForUser(user.id);
    const priced = prices.get(`${holding.cardId}::${holding.grade}`);
    marketValue = priced ? priced.price * holding.quantity : undefined;
    gain = marketValue !== undefined ? marketValue - costBasis : undefined;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            {holding.grade}
            {holding.serialNumber ? ` · ${holding.serialNumber}` : ""}
          </p>
          <h1 className="font-display text-2xl font-semibold uppercase tracking-wide">
            <Link href={`/cards/${holding.cardId}`} className="hover:text-accent-strong">
              {holding.card.year} {holding.card.setName} · {holding.card.player}
            </Link>
          </h1>
          {holding.card.parallel && (
            <p className="mt-1 text-sm text-ink-soft">{holding.card.parallel}</p>
          )}
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/holdings/${holding.id}/edit`}>Edit</LinkButton>
          <ConfirmDeleteForm
            action={deleteHolding.bind(null, holding.id)}
            confirmMessage="Delete this holding? This can't be undone."
          >
            <SubmitButton variant="danger" pendingText="Deleting…">
              Delete
            </SubmitButton>
          </ConfirmDeleteForm>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Quantity" value={String(holding.quantity)} />
        <Stat label="Cost basis" value={formatCurrency(costBasis)} />
        <Stat
          label={marketValueLabel}
          value={marketValue !== undefined ? formatCurrency(marketValue) : "No price yet"}
        />
        <Stat
          label={holding.status === "SOLD" ? "Realized gain" : "Unrealized gain"}
          value={gain !== undefined ? formatSignedCurrency(gain) : "—"}
          tone={gain === undefined ? "neutral" : gain > 0 ? "gain" : gain < 0 ? "loss" : "neutral"}
        />
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-line bg-surface p-5 text-sm">
        <Row label="Purchased" value={formatDate(holding.purchaseDate)} />
        <Row label="Source" value={holding.purchaseSource ?? "—"} />
        {holding.notes && <Row label="Notes" value={holding.notes} full />}
      </dl>

      {holding.status === "OWNED" ? (
        <section>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Mark as sold
          </h2>
          <div className="rounded-lg border border-line bg-surface p-5">
            <SellHoldingForm holdingId={holding.id} />
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-line bg-surface-2 p-5 text-sm">
          <p className="font-medium text-ink">
            Sold {formatDate(holding.soldDate!)} for {formatCurrency(holding.soldPrice)}
          </p>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "gain" | "loss";
}) {
  const toneClass = tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-ink";
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="font-mono text-xs uppercase tracking-wide text-ink-soft">{label}</div>
      <div className={`mt-1.5 font-display text-lg font-semibold tabular-nums ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <dt className="font-mono text-xs uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/money";

export type PriceLookup = Map<
  string,
  { price: number; observedAt: Date; source: string; sampleSize: number }
>;

function priceKey(cardId: string, grade: string) {
  return `${cardId}::${grade}`;
}

/**
 * The latest PriceSnapshot per (card, grade) for a user's whole catalog, in
 * one query. `distinct` + `orderBy` compiles to `DISTINCT ON` on Postgres,
 * so this is "first row per group" rather than a fetch-everything scan.
 */
export async function getLatestPricesForUser(userId: string): Promise<PriceLookup> {
  const snapshots = await prisma.priceSnapshot.findMany({
    where: { card: { userId } },
    orderBy: { observedAt: "desc" },
    distinct: ["cardId", "grade"],
    select: {
      cardId: true,
      grade: true,
      medianPrice: true,
      observedAt: true,
      source: true,
      sampleSize: true,
    },
  });

  const map: PriceLookup = new Map();
  for (const s of snapshots) {
    map.set(priceKey(s.cardId, s.grade), {
      price: toNumber(s.medianPrice),
      observedAt: s.observedAt,
      source: s.source,
      sampleSize: s.sampleSize,
    });
  }
  return map;
}

export function latestPriceFor(prices: PriceLookup, cardId: string, grade: string) {
  return prices.get(priceKey(cardId, grade));
}

export type HoldingForPortfolio = {
  cardId: string;
  grade: string;
  quantity: number;
  purchasePrice: unknown;
  status: string;
};

export type PortfolioTotals = {
  costBasis: number;
  marketValue: number;
  gain: number;
  gainPct: number;
  pricedHoldingCount: number;
  unpricedHoldingCount: number;
};

/**
 * Cost basis is what you've put into currently-owned cards. Market value
 * prices each holding at its latest snapshot when one exists for that
 * card + grade; a holding with no snapshot yet is carried at cost (zero
 * assumed gain) rather than silently dropped from the total, and counted
 * in `unpricedHoldingCount` so the UI can flag it.
 */
export function computeTotals(
  holdings: HoldingForPortfolio[],
  prices: PriceLookup,
): PortfolioTotals {
  let costBasis = 0;
  let marketValue = 0;
  let pricedHoldingCount = 0;
  let unpricedHoldingCount = 0;

  for (const h of holdings) {
    if (h.status !== "OWNED") continue;
    const qty = h.quantity;
    const purchasePrice = toNumber(h.purchasePrice);
    costBasis += purchasePrice * qty;

    const priced = latestPriceFor(prices, h.cardId, h.grade);
    if (priced) {
      marketValue += priced.price * qty;
      pricedHoldingCount += 1;
    } else {
      marketValue += purchasePrice * qty;
      unpricedHoldingCount += 1;
    }
  }

  const gain = marketValue - costBasis;
  const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;

  return { costBasis, marketValue, gain, gainPct, pricedHoldingCount, unpricedHoldingCount };
}

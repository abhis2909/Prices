"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { computeTotals, getLatestPricesForUser } from "@/lib/portfolio";

/**
 * Phase 1 has no scheduler, so portfolio history only grows when you ask
 * for it. This snapshots today's live totals — it never trusts a prior
 * PortfolioSnapshot as an input.
 */
export async function recordPortfolioSnapshot(): Promise<void> {
  const user = await requireUser();
  const holdings = await prisma.holding.findMany({
    where: { userId: user.id, status: "OWNED" },
    select: { cardId: true, grade: true, quantity: true, purchasePrice: true, status: true },
  });
  const prices = await getLatestPricesForUser(user.id);
  const totals = computeTotals(holdings, prices);

  await prisma.portfolioSnapshot.create({
    data: {
      userId: user.id,
      costBasis: totals.costBasis,
      marketValue: totals.marketValue,
      gain: totals.gain,
      gainPct: totals.gainPct,
    },
  });

  revalidatePath("/dashboard");
}

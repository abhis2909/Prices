"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { priceSnapshotSchema } from "@/lib/validation";
import { fieldErrorsFrom, type ActionState } from "./types";

export async function addPriceSnapshot(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = priceSnapshotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { cardId, grade, medianPrice, observedAt, listingUrl, imageUrl, notes } = parsed.data;

  const card = await prisma.card.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) {
    return { error: "Card not found." };
  }

  await prisma.priceSnapshot.create({
    data: {
      cardId,
      grade,
      medianPrice,
      observedAt: new Date(observedAt),
      listingUrl,
      imageUrl,
      notes,
      source: "MANUAL",
      sampleSize: 1,
      confidence: 1,
    },
  });

  revalidatePath(`/cards/${cardId}`);
  revalidatePath("/dashboard");
  return null;
}

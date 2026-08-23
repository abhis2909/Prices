"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { holdingSchema, sellHoldingSchema } from "@/lib/validation";
import { fieldErrorsFrom, type ActionState } from "./types";

export async function createHolding(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = holdingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { cardId, purchaseDate, ...rest } = parsed.data;

  const card = await prisma.card.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) {
    return { error: "Card not found." };
  }

  await prisma.holding.create({
    data: {
      ...rest,
      cardId,
      userId: user.id,
      purchaseDate: new Date(purchaseDate),
    },
  });

  revalidatePath("/holdings");
  revalidatePath("/dashboard");
  revalidatePath(`/cards/${cardId}`);
  redirect(`/cards/${cardId}`);
}

export async function updateHolding(
  holdingId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = holdingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { cardId, purchaseDate, ...rest } = parsed.data;

  const card = await prisma.card.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) {
    return { error: "Card not found." };
  }

  const result = await prisma.holding.updateMany({
    where: { id: holdingId, userId: user.id },
    data: { ...rest, cardId, purchaseDate: new Date(purchaseDate) },
  });
  if (result.count === 0) {
    return { error: "Holding not found." };
  }

  revalidatePath("/holdings");
  revalidatePath("/dashboard");
  revalidatePath(`/cards/${cardId}`);
  revalidatePath(`/holdings/${holdingId}`);
  redirect(`/holdings/${holdingId}`);
}

export async function markHoldingSold(
  holdingId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = sellHoldingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const result = await prisma.holding.updateMany({
    where: { id: holdingId, userId: user.id },
    data: {
      status: "SOLD",
      soldPrice: parsed.data.soldPrice,
      soldDate: new Date(parsed.data.soldDate),
    },
  });
  if (result.count === 0) {
    return { error: "Holding not found." };
  }

  revalidatePath("/holdings");
  revalidatePath("/dashboard");
  revalidatePath(`/holdings/${holdingId}`);
  redirect(`/holdings/${holdingId}`);
}

export async function deleteHolding(holdingId: string): Promise<void> {
  const user = await requireUser();
  await prisma.holding.deleteMany({ where: { id: holdingId, userId: user.id } });
  revalidatePath("/holdings");
  revalidatePath("/dashboard");
  redirect("/holdings");
}

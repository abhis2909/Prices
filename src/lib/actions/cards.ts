"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { cardSchema } from "@/lib/validation";
import { fieldErrorsFrom, type ActionState } from "./types";

export async function createCard(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = cardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const card = await prisma.card.create({
    data: { ...parsed.data, userId: user.id },
  });

  revalidatePath("/cards");
  redirect(`/cards/${card.id}`);
}

export async function updateCard(
  cardId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = cardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const result = await prisma.card.updateMany({
    where: { id: cardId, userId: user.id },
    data: parsed.data,
  });
  if (result.count === 0) {
    return { error: "Card not found." };
  }

  revalidatePath("/cards");
  revalidatePath(`/cards/${cardId}`);
  redirect(`/cards/${cardId}`);
}

export async function deleteCard(cardId: string): Promise<void> {
  const user = await requireUser();
  await prisma.card.deleteMany({ where: { id: cardId, userId: user.id } });
  revalidatePath("/cards");
  redirect("/cards");
}

"use server";

import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { comparePhotoSchema } from "@/lib/validation";
import { fieldErrorsFrom } from "./types";

export type CompareState =
  | { error: string; fieldErrors?: undefined; verdict?: undefined; reason?: undefined }
  | { fieldErrors: Record<string, string>; error?: undefined; verdict?: undefined; reason?: undefined }
  | {
      verdict: "MATCH" | "MISMATCH" | "UNCERTAIN";
      reason: string;
      error?: undefined;
      fieldErrors?: undefined;
    }
  | null;

/**
 * On-demand check, independent of the (not-yet-built) automated eBay
 * pipeline: does a listing's photo plausibly show the card you say it does?
 * Nothing is saved here — this only returns a verdict for the price form
 * to display. See the design plan's "Visual verification" section.
 */
export async function compareCardPhoto(
  _prevState: CompareState,
  formData: FormData,
): Promise<CompareState> {
  const user = await requireUser();
  const parsed = comparePhotoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { cardId, imageUrl } = parsed.data;

  const card = await prisma.card.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) {
    return { error: "Card not found." };
  }

  const cardDescription = [
    `Sport: ${card.sport}`,
    `Year: ${card.year}`,
    `Set: ${card.setName}`,
    `Card number: ${card.cardNumber}`,
    `Player: ${card.player}`,
    card.parallel ? `Parallel: ${card.parallel}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  let response;
  try {
    response = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 300,
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            {
              type: "text",
              text: `This photo is from an eBay listing. Here is the card I've logged as owning:\n${cardDescription}\n\nDoes this photo plausibly show that exact card — same player, set, parallel, and (if graded) a grading label consistent with what's described? A tight crop, glare, or an off angle is fine; a different player, set, parallel, or grading company/grade is not.\n\nRespond in exactly this format and nothing else:\nVERDICT: MATCH, MISMATCH, or UNCERTAIN\nREASON: one sentence explaining why.`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { error: "AI comparison isn't configured — ANTHROPIC_API_KEY is missing or invalid." };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return { error: "Rate limited by the comparison service — try again shortly." };
    }
    if (err instanceof Anthropic.APIError) {
      return { error: `Comparison service error: ${err.message}` };
    }
    // The SDK validates credentials client-side before any request goes
    // out, so a missing key surfaces as a plain Error, not an APIError.
    if (err instanceof Error && err.message.includes("Could not resolve authentication method")) {
      return { error: "AI comparison isn't configured — ANTHROPIC_API_KEY is missing." };
    }
    console.error("compareCardPhoto: unexpected error", err);
    return { error: "Something went wrong running the comparison." };
  }

  let text = "";
  for (const block of response.content) {
    if (block.type === "text") {
      text = block.text;
      break;
    }
  }

  const verdictMatch = text.match(/VERDICT:\s*(MATCH|MISMATCH|UNCERTAIN)/i);
  const reasonMatch = text.match(/REASON:\s*([\s\S]+)/i);
  if (!verdictMatch) {
    return { error: "Couldn't parse a verdict from the comparison — try a different photo." };
  }

  return {
    verdict: verdictMatch[1].toUpperCase() as "MATCH" | "MISMATCH" | "UNCERTAIN",
    reason: reasonMatch?.[1]?.trim() ?? "No reason given.",
  };
}

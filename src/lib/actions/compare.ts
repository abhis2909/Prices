"use server";

import { ApiError } from "@google/genai";
import { gemini } from "@/lib/gemini";
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

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB — plenty for a listing photo

/**
 * Unlike Claude, Gemini's generateContent can't fetch an arbitrary external
 * image URL itself (its `fileData.fileUri` field is documented as
 * Google-Cloud-Storage-only) — the caller has to supply raw bytes. So this
 * downloads the listing photo server-side and hands Gemini the bytes
 * directly as inline base64 data.
 */
async function fetchImageAsInlineData(
  url: string,
): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error(`Couldn't download that photo (HTTP ${res.status}).`);
  }

  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim();
  if (!contentType?.startsWith("image/")) {
    throw new Error("That URL doesn't point at an image.");
  }

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("That image is too large to compare (8MB max).");
  }

  return { data: Buffer.from(buffer).toString("base64"), mimeType: contentType };
}

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

  if (!process.env.GEMINI_API_KEY) {
    return { error: "AI comparison isn't configured — GEMINI_API_KEY is missing." };
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

  let text: string | undefined;
  try {
    const image = await fetchImageAsInlineData(imageUrl);

    const response = await gemini.models.generateContent({
      // gemini-2.5-flash was retired for new users; the API's own error
      // message pointed at this replacement (verified live, not guessed).
      model: "gemini-3.6-flash",
      contents: [
        { inlineData: image },
        {
          text: `This photo is from an eBay listing. Here is the card I've logged as owning:\n${cardDescription}\n\nDoes this photo plausibly show that exact card — same player, set, parallel, and (if graded) a grading label consistent with what's described? A tight crop, glare, or an off angle is fine; a different player, set, parallel, or grading company/grade is not.\n\nRespond in exactly this format and nothing else:\nVERDICT: MATCH, MISMATCH, or UNCERTAIN\nREASON: one sentence explaining why.`,
        },
      ],
      // No thinkingConfig: gemini-3.6-flash rejected thinkingBudget: 0 with
      // a 400 (verified live) — the earlier low-effort setting doesn't
      // carry over, so this just uses the model's default.
    });

    text = response.text;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401 || err.status === 403) {
        return { error: "AI comparison isn't configured — GEMINI_API_KEY is missing or invalid." };
      }
      if (err.status === 429) {
        return { error: "Rate limited by the free tier — try again in a minute." };
      }
      return { error: `Comparison service error: ${err.message}` };
    }
    if (err instanceof Error) {
      // Our own fetchImageAsInlineData errors, or a network failure.
      return { error: err.message };
    }
    console.error("compareCardPhoto: unexpected error", err);
    return { error: "Something went wrong running the comparison." };
  }

  if (!text) {
    return { error: "Got an empty response from the comparison service — try again." };
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

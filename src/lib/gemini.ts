import { GoogleGenAI } from "@google/genai";

// Reuse a single client across hot reloads in dev, same reasoning as the
// Prisma singleton in src/lib/prisma.ts.
const globalForGemini = globalThis as unknown as {
  gemini: GoogleGenAI | undefined;
};

export const gemini =
  globalForGemini.gemini ?? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (process.env.NODE_ENV !== "production") {
  globalForGemini.gemini = gemini;
}

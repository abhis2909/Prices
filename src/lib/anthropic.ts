import Anthropic from "@anthropic-ai/sdk";

// Reuse a single client across hot reloads in dev, same reasoning as the
// Prisma singleton in src/lib/prisma.ts.
const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

// Resolves ANTHROPIC_API_KEY from the environment automatically.
export const anthropic = globalForAnthropic.anthropic ?? new Anthropic();

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}

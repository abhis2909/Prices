import type { z } from "zod";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

/** Collapse a zod error into one message per field, for inline form display. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}

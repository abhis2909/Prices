/**
 * Prisma returns Decimal fields as decimal.js-style instances, not plain
 * numbers. Money in this app is small and personal-scale, so converting to
 * a JS number for display/arithmetic is an acceptable simplification.
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (
    value !== null &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber: unknown }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(value: unknown): string {
  return currencyFormatter.format(toNumber(value));
}

export function formatSignedCurrency(value: unknown): string {
  const n = toNumber(value);
  const sign = n > 0 ? "+" : "";
  return `${sign}${currencyFormatter.format(n)}`;
}

export function formatPercent(value: unknown, digits = 1): string {
  const n = toNumber(value);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(value: Date | string): string {
  return dateFormatter.format(new Date(value));
}

export function StatTile({
  label,
  value,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "gain" | "loss";
  sub?: string;
}) {
  const toneClass = tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-ink";
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="font-mono text-xs uppercase tracking-wide text-ink-soft">{label}</div>
      <div className={`mt-1.5 font-display text-2xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-ink-soft">{sub}</div>}
    </div>
  );
}

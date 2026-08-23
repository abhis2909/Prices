import { formatCurrency, formatDate, toNumber } from "@/lib/money";

type Point = {
  asOfDate: Date;
  costBasis: unknown;
  marketValue: unknown;
};

export function PortfolioHistoryChart({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line text-center text-sm text-ink-soft">
        <p>Record a snapshot each time you check in to start a trend line.</p>
        <p className="text-xs">One data point recorded so far.</p>
      </div>
    );
  }

  const width = 720;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 64 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const values = points.flatMap((p) => [toNumber(p.costBasis), toNumber(p.marketValue)]);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const x = (i: number) => padding.left + (i / (points.length - 1)) * plotWidth;
  const y = (v: number) => padding.top + plotHeight - ((v - min) / range) * plotHeight;

  const costLine = points.map((p, i) => `${x(i)},${y(toNumber(p.costBasis))}`).join(" ");
  const valueLine = points.map((p, i) => `${x(i)},${y(toNumber(p.marketValue))}`).join(" ");

  const last = points[points.length - 1];
  const first = points[0];

  return (
    <figure>
      <div className="overflow-x-auto rounded-md border border-line bg-surface p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Cost basis and market value from ${formatDate(first.asOfDate)} to ${formatDate(last.asOfDate)}: market value ${formatCurrency(last.marketValue)} against cost basis ${formatCurrency(last.costBasis)}.`}
          className="block w-full text-ink"
          style={{ minWidth: 480 }}
        >
          <line
            x1={padding.left}
            y1={y(0)}
            x2={width - padding.right}
            y2={y(0)}
            stroke="currentColor"
            strokeOpacity={0.15}
          />
          <text
            x={padding.left - 8}
            y={y(max)}
            textAnchor="end"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="10"
            fill="currentColor"
            opacity={0.7}
          >
            {formatCurrency(max)}
          </text>
          <text
            x={padding.left - 8}
            y={y(min)}
            textAnchor="end"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="10"
            fill="currentColor"
            opacity={0.7}
          >
            {formatCurrency(min)}
          </text>

          <polyline
            points={costLine}
            fill="none"
            stroke="currentColor"
            className="text-pine"
            strokeWidth="1.6"
            strokeDasharray="4 3"
            opacity={0.85}
          />
          <polyline
            points={valueLine}
            fill="none"
            stroke="currentColor"
            className="text-accent"
            strokeWidth="2.2"
          />
          <circle
            cx={x(points.length - 1)}
            cy={y(toNumber(last.marketValue))}
            r="3.5"
            className="fill-accent"
          />

          <text
            x={padding.left}
            y={height - 8}
            fontFamily="IBM Plex Mono, monospace"
            fontSize="10"
            fill="currentColor"
            opacity={0.7}
          >
            {formatDate(first.asOfDate)}
          </text>
          <text
            x={width - padding.right}
            y={height - 8}
            textAnchor="end"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="10"
            fill="currentColor"
            opacity={0.7}
          >
            {formatDate(last.asOfDate)}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 flex items-center gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 bg-accent" /> Market value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 bg-pine" style={{ opacity: 0.85 }} /> Cost basis
        </span>
      </figcaption>
    </figure>
  );
}

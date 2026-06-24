"use client";

interface Series {
  key: string;
  color: string;
  label: string;
}

export function MultiAreaChart({
  data,
  series,
  height = 200,
}: {
  data: Record<string, number>[];
  series: Series[];
  height?: number;
}) {
  const w = 720;
  const pad = 8;
  const maxVal =
    Math.max(
      1,
      ...data.map((d) => series.reduce((s, ser) => s + (d[ser.key] || 0), 0))
    ) * 1.1;

  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => height - pad - (v / maxVal) * (height - pad * 2);

  // stacked areas
  const stacks = data.map((d) => {
    let acc = 0;
    return series.map((ser) => {
      const base = acc;
      acc += d[ser.key] || 0;
      return { base, top: acc };
    });
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={height - pad - g * (height - pad * 2)}
          y2={height - pad - g * (height - pad * 2)}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
      ))}
      {series.map((ser, si) => {
        const topPts = data.map((_, i) => `${x(i)},${y(stacks[i][si].top)}`);
        const basePts = data
          .map((_, i) => `${x(i)},${y(stacks[i][si].base)}`)
          .reverse();
        const area = `${topPts.join(" ")} ${basePts.join(" ")}`;
        return (
          <g key={ser.key}>
            <polygon points={area} fill={ser.color} fillOpacity="0.18" />
            <polyline
              points={topPts.join(" ")}
              fill="none"
              stroke={ser.color}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
    </svg>
  );
}

import { NAVY, GOLD } from "@/lib/theme";

interface MarkProps {
  size?: number;
  fg?: string;
  accent?: string;
}

export default function Mark({ size = 40, fg = NAVY, accent = GOLD }: MarkProps) {
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size * 0.52;
  const pts = [
    [-1, 0.75],
    [-0.5, -0.75],
    [0, 0.35],
    [0.5, -0.75],
    [1, 0.75],
  ].map(([x, y]) => [cx + (x as number) * r, cy + (y as number) * r]);

  return (
    <svg
      className="ml-logo"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Monzon Labs"
    >
      <polyline
        points={(pts as number[][]).map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={fg}
        strokeWidth={size * 0.055}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {(pts as number[][]).map((p, i) => (
        <circle
          key={i}
          className={i === 2 ? "ml-goldnode" : ""}
          cx={p[0]}
          cy={p[1]}
          r={i === 0 || i === 4 ? size * 0.075 : size * 0.062}
          fill={i === 2 ? accent : fg}
        />
      ))}
    </svg>
  );
}

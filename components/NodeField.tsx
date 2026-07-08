"use client";

import { useState, useRef, useEffect } from "react";
import { GOLD, PAPER, NAVY2 } from "@/lib/theme";

const BASE_NODES = [
  [60, 470],
  [210, 180],
  [360, 380],
  [510, 120],
  [660, 420],
  [830, 240],
  [1000, 460],
  [1140, 200],
];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]];

export default function NodeField() {
  const ref = useRef<SVGSVGElement>(null);
  const raf = useRef<number | null>(null);
  const [mouse, setMouse] = useState<[number, number] | null>(null);

  const toViewBox = (e: React.MouseEvent<SVGSVGElement>) => {
    const el = ref.current;
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return [
      ((e.clientX - b.left) / b.width) * 1200,
      ((e.clientY - b.top) / b.height) * 600,
    ] as [number, number];
  };

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (raf.current) return;
    const pt = toViewBox(e);
    raf.current = requestAnimationFrame(() => {
      setMouse(pt);
      raf.current = null;
    });
  };

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  const nodes = BASE_NODES.map(([x, y]) => {
    if (!mouse) return [x, y];
    const dx = x - mouse[0];
    const dy = y - mouse[1];
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const push = Math.max(0, 1 - dist / 320) * 46;
    return [x + (dx / dist) * push, y + (dy / dist) * push];
  });

  let links: Array<{ p: number[]; d: number }> = [];
  if (mouse) {
    links = nodes
      .map((p, i) => ({
        p,
        i,
        d: Math.hypot(p[0] - mouse[0], p[1] - mouse[1]),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .filter((n) => n.d < 420);
  }

  return (
    <svg
      ref={ref}
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      onMouseMove={onMove}
      onMouseLeave={() => setMouse(null)}
      aria-hidden="true"
    >
      <g stroke={PAPER} strokeWidth="1.4" fill="none" opacity="0.14">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            style={{ transition: "all 120ms linear" }}
          />
        ))}
      </g>

      {mouse && (
        <g stroke={GOLD} strokeWidth="1.6" fill="none">
          {links.map((n, i) => (
            <line
              key={i}
              x1={mouse[0]}
              y1={mouse[1]}
              x2={n.p[0]}
              y2={n.p[1]}
              opacity={Math.max(0.08, 0.5 - n.d / 900)}
            />
          ))}
        </g>
      )}

      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 4 ? 9 : 6.5}
          fill={i === 4 ? GOLD : PAPER}
          opacity={i === 4 ? 0.85 : 0.35}
          style={{ transition: "cx 120ms linear, cy 120ms linear" }}
        />
      ))}

      {mouse && (
        <g>
          <circle cx={mouse[0]} cy={mouse[1]} r="22" fill={GOLD} opacity="0.10" />
          <circle cx={mouse[0]} cy={mouse[1]} r="7" fill={GOLD} opacity="0.9" />
        </g>
      )}
    </svg>
  );
}

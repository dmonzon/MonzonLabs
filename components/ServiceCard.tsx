"use client";

import { useState } from "react";
import { NAVY, GOLD, GOLDTINT, INKSOFT } from "@/lib/theme";

interface ServiceItem {
  t: string;
  p: string;
  d: string;
  inc: readonly string[];
  note: string;
}

interface ServiceCardProps {
  item: ServiceItem;
  more: string;
  less: string;
}

function NodeDot() {
  return (
    <span
      className="inline-block rounded-full mr-3 flex-shrink-0"
      style={{ width: 8, height: 8, backgroundColor: GOLD, marginTop: 7 }}
    />
  );
}

export default function ServiceCard({ item, more, less }: ServiceCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="ml-card rounded-2xl p-6 md:p-8 flex flex-col"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <h4 className="text-lg font-bold" style={{ color: NAVY }}>
        {item.t}
      </h4>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: INKSOFT }}>
        {item.d}
      </p>

      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="mt-4 text-sm font-semibold self-start rounded-full px-4 py-1.5 transition-colors"
        style={{
          color: open ? "#FAFAF8" : NAVY,
          backgroundColor: open ? NAVY : GOLDTINT,
        }}
      >
        {open ? less : more} {open ? "▴" : "▾"}
      </button>

      <div className="ml-acc" style={{ maxHeight: open ? 600 : 0 }}>
        <div className="mb-4 pt-4">
          <span
            className="inline-block text-sm font-bold tracking-wide"
            style={{ color: GOLD }}
          >
            {item.p}
          </span>
        </div>
        <ul className="space-y-2">
          {item.inc.map((li, i) => (
            <li key={i} className="flex text-sm leading-relaxed" style={{ color: "#3A4453" }}>
              <NodeDot />
              <span>{li}</span>
            </li>
          ))}
        </ul>
        {item.note && (
          <p className="mt-4 text-xs italic leading-relaxed" style={{ color: INKSOFT }}>
            {item.note}
          </p>
        )}
      </div>
    </div>
  );
}

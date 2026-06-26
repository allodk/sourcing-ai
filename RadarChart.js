"use client";
import { CHART_COLORS } from "@/lib/data";

const DIMS = ["reliability", "quality", "pricing", "flexibility"];
const LABELS = ["Fiabilité", "Qualité", "Prix", "Flexibilité"];

export default function RadarChart({ suppliers }) {
  const W = 240, H = 240, cx = 120, cy = 115, R = 85;

  const angle = (i) => (i / DIMS.length) * 2 * Math.PI - Math.PI / 2;
  const pt = (i, val) => {
    const a = angle(i), r = (val / 100) * R;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  return (
    <svg width={W} height={H + 30} style={{ overflow: "visible" }}>
      {/* Grid rings */}
      {[25, 50, 75, 100].map((ring) => (
        <polygon key={ring}
          points={DIMS.map((_, i) => pt(i, ring).join(",")).join(" ")}
          fill="none" stroke="#1E3A5F" strokeWidth="1" strokeDasharray={ring < 100 ? "3,3" : "none"} />
      ))}
      {/* Axes */}
      {DIMS.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#1E3A5F" strokeWidth="1" />;
      })}
      {/* Labels */}
      {DIMS.map((d, i) => {
        const [x, y] = pt(i, 118);
        return (
          <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill="#8A9BB0" fontSize="10" fontFamily="Inter,sans-serif">{LABELS[i]}</text>
        );
      })}
      {/* Data polygons */}
      {suppliers.map((s, si) => (
        <polygon key={s.id}
          points={DIMS.map((d, i) => pt(i, s[d]).join(",")).join(" ")}
          fill={CHART_COLORS[si] + "25"} stroke={CHART_COLORS[si]} strokeWidth="2.5"
          style={{ animation: "fadeIn 0.5s ease" }} />
      ))}
      {/* Legend */}
      {suppliers.map((s, si) => (
        <g key={s.id + "-legend"}>
          <circle cx={16 + si * 60} cy={H + 18} r={5} fill={CHART_COLORS[si]} />
          <text x={24 + si * 60} y={H + 22} fill="#8A9BB0" fontSize="9"
            fontFamily="'IBM Plex Mono',monospace">
            {s.name.split(" ")[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}

"use client";
import { SCORE_COLOR } from "@/lib/data";

export default function ScoreRing({ score, size = 64, strokeWidth = 5 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = SCORE_COLOR(score);
  const center = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="#1E3A5F" strokeWidth={strokeWidth} />
        <circle
          cx={center} cy={center} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: size * 0.21, fontWeight: 700, color }}>
          {score}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: size * 0.12, color: "#8A9BB0" }}>
          SCORE
        </span>
      </div>
    </div>
  );
}

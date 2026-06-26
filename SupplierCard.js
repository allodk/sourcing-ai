"use client";
import ScoreRing from "./ScoreRing";

export default function SupplierCard({ supplier, onSelect, selected, inShortlist, onToggleShortlist }) {
  const statusColor = supplier.status === "Actif" ? "#00C896" : "#C4A35A";

  return (
    <div style={{
      background: selected ? "#162840" : "#111D2B",
      border: `1px solid ${selected ? "#00C896" : "#1E3A5F"}`,
      borderRadius: 12, padding: "14px", cursor: "pointer",
      transition: "all 0.2s", marginBottom: 10,
      boxShadow: selected ? "0 0 0 1px #00C89640, 0 4px 20px #00C89615" : "none",
      animation: "fadeIn 0.3s ease",
    }}>
      <div onClick={() => onSelect(supplier)} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <ScoreRing score={supplier.score} size={60} strokeWidth={5} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#00C896" }}>
              {supplier.id}
            </span>
            <span style={{
              fontSize: 10, color: statusColor,
              background: statusColor + "20", padding: "2px 8px", borderRadius: 20,
            }}>
              {supplier.status}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F0E8", marginBottom: 2 }}>
            {supplier.name}
          </div>
          <div style={{ fontSize: 11, color: "#8A9BB0", marginBottom: 8 }}>
            {supplier.sector} · {supplier.country} · {supplier.leadTime}j · min {supplier.minOrder}€
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {supplier.tags.map((t) => (
              <span key={t} style={{
                fontSize: 9, color: "#C4A35A", background: "#C4A35A18",
                border: "1px solid #C4A35A30", padding: "2px 7px", borderRadius: 4,
                fontFamily: "'IBM Plex Mono',monospace",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {supplier.certifications.map((c) => (
            <span key={c} style={{
              fontSize: 9, color: "#5A8AB0", background: "#1E3A5F",
              padding: "2px 7px", borderRadius: 4, fontFamily: "'IBM Plex Mono',monospace",
            }}>{c}</span>
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleShortlist(supplier); }}
          style={{
            fontSize: 10, flexShrink: 0,
            background: inShortlist ? "#00C89620" : "transparent",
            border: `1px solid ${inShortlist ? "#00C896" : "#2A5080"}`,
            borderRadius: 6, padding: "4px 10px",
            color: inShortlist ? "#00C896" : "#8A9BB0", cursor: "pointer",
          }}>
          {inShortlist ? "★ Shortlist" : "☆ Ajouter"}
        </button>
      </div>
    </div>
  );
}

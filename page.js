"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SUPPLIERS, SECTORS, COUNTRIES } from "@/lib/data";
import ScoreRing from "@/components/ScoreRing";
import RadarChart from "@/components/RadarChart";
import SupplierCard from "@/components/SupplierCard";

// ─── API call via our secure Next.js route ────────────────────────────────────
async function askAI(messages, system) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });
  const d = await res.json();
  return d.text || "Erreur de réponse.";
}

function buildSystem(selected, shortlist) {
  return `Vous êtes un expert en sourcing achats/fournisseurs B2B. Répondez en français, de façon concise et professionnelle. Utilisez ✅ ⚠️ 💡 📊 pour structurer. Fournisseur sélectionné: ${selected ? JSON.stringify(selected) : "aucun"}. Shortlist: ${JSON.stringify(shortlist)}. Base complète: ${JSON.stringify(SUPPLIERS)}.`;
}

// ─── METRIC BAR ───────────────────────────────────────────────────────────────
function MetricBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "#8A9BB0" }}>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color }}>{value}</span>
      </div>
      <div style={{ height: 5, background: "#1E3A5F", borderRadius: 3 }}>
        <div style={{ height: 5, width: `${value}%`, background: color, borderRadius: 3, transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}

// ─── CHAT BUBBLE ─────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 14, animation: "fadeIn 0.25s ease",
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginRight: 8, marginTop: 2,
          background: "linear-gradient(135deg,#00C896,#1E3A5F)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "11px 15px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "#1E3A5F" : "#111D2B",
        border: `1px solid ${isUser ? "#2A5080" : "#1E3A5F"}`,
        fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", color: "#F5F0E8",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
function Typing() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "linear-gradient(135deg,#00C896,#1E3A5F)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
      }}>🤖</div>
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: "#00C896",
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── INSTALL BANNER ───────────────────────────────────────────────────────────
function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div style={{
      position: "fixed", bottom: 80, left: 16, right: 16, zIndex: 1000,
      background: "#111D2B", border: "1px solid #00C896",
      borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px #00000060", animation: "slideUp 0.4s ease",
    }}>
      <div style={{ fontSize: 28 }}>📲</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#F5F0E8" }}>Installer Sourcing.AI</div>
        <div style={{ fontSize: 11, color: "#8A9BB0", marginTop: 2 }}>Accès rapide, mode hors-ligne</div>
      </div>
      <button onClick={onInstall} style={{
        background: "linear-gradient(135deg,#00C896,#0A8A66)", border: "none",
        borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 12, cursor: "pointer",
      }}>Installer</button>
      <button onClick={onDismiss} style={{
        background: "transparent", border: "none", color: "#8A9BB0",
        fontSize: 18, cursor: "pointer", padding: "0 4px",
      }}>✕</button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Filters
  const [search, setSearch]     = useState("");
  const [sector, setSector]     = useState("Tous");
  const [country, setCountry]   = useState("Tous");
  const [minScore, setMinScore] = useState(0);

  // State
  const [selected, setSelected]   = useState(null);
  const [shortlist, setShortlist] = useState([]);
  const [activeTab, setActiveTab] = useState("list");   // list | chat | fiche | comparer | email
  const [rightTab, setRightTab]   = useState("chat");   // desktop right panel tab

  // Chat
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis votre agent de sourcing. Sélectionnez un fournisseur pour l'analyser, ou posez-moi une question directement." },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  // Email
  const [emailText, setEmailText]   = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [copied, setCopied]         = useState(false);

  // PWA install
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall]       = useState(false);

  // Layout
  const [isMobile, setIsMobile] = useState(false);
  const chatEndRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Filter suppliers
  const filtered = SUPPLIERS.filter((s) => {
    const q = search.toLowerCase();
    return (
      (!q || s.name.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q)) || s.id.toLowerCase().includes(q)) &&
      (sector === "Tous" || s.sector === sector) &&
      (country === "Tous" || s.country === country) &&
      s.score >= minScore
    );
  }).sort((a, b) => b.score - a.score);

  const toggleShortlist = useCallback((s) => {
    setShortlist((prev) =>
      prev.find((x) => x.id === s.id)
        ? prev.filter((x) => x.id !== s.id)
        : prev.length < 4 ? [...prev, s] : prev
    );
  }, []);

  const sendToChat = useCallback(async (userContent, supplierOverride) => {
    const s = supplierOverride ?? selected;
    const newMsg = { role: "user", content: userContent };
    const newHistory = [...messages, newMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    const reply = await askAI(
      newHistory.map((m) => ({ role: m.role, content: m.content })),
      buildSystem(s, shortlist)
    );
    setMessages([...newHistory, { role: "assistant", content: reply }]);
    setLoading(false);
  }, [messages, selected, shortlist]);

  const handleSelect = useCallback(async (supplier) => {
    setSelected(supplier);
    if (isMobile) setActiveTab("chat");
    else setRightTab("chat");
    const msg = `Fournisseur sélectionné : ${supplier.name} (${supplier.id}). Score ${supplier.score}/100. Analysez en 3 points : ✅ Forces, ⚠️ Points d'attention, 💡 Recommandation.`;
    await sendToChat(msg, supplier);
  }, [isMobile, sendToChat]);

  const generateEmail = useCallback(async () => {
    if (!selected) return;
    setEmailLoading(true);
    setEmailText("");
    const prompt = `Rédigez un email professionnel de premier contact en français pour ${selected.name}. Concis (150 mots max), mentionnez leur spécialité (${selected.sector}, ${selected.tags.join(", ")}), demandez un rendez-vous. Commencez par "Objet:" puis le corps.`;
    const res = await askAI(
      [{ role: "user", content: prompt }],
      "Vous êtes un acheteur B2B. Répondez uniquement avec l'email, sans commentaire."
    );
    setEmailText(res);
    setEmailLoading(false);
  }, [selected]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  // ── PANELS ──────────────────────────────────────────────────────────────────

  const FilterBar = () => (
    <div style={{
      background: "#0F1923", borderBottom: "1px solid #1E3A5F",
      padding: "10px 16px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
    }}>
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Nom, tag, ID..."
        style={{
          background: "#0A1520", border: "1px solid #1E3A5F", borderRadius: 8,
          padding: "8px 12px", color: "#F5F0E8", fontSize: 13,
          width: isMobile ? "100%" : 200, fontFamily: "Inter,sans-serif",
        }} />
      <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
        <select value={sector} onChange={(e) => setSector(e.target.value)}
          style={{ background: "#0A1520", border: "1px solid #1E3A5F", borderRadius: 8, padding: "7px 10px", color: "#F5F0E8", fontSize: 12, flex: 1 }}>
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={country} onChange={(e) => setCountry(e.target.value)}
          style={{ background: "#0A1520", border: "1px solid #1E3A5F", borderRadius: 8, padding: "7px 10px", color: "#F5F0E8", fontSize: 12, flex: 1 }}>
          {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#8A9BB0", whiteSpace: "nowrap" }}>≥</span>
          <input type="range" min={0} max={90} step={5} value={minScore}
            onChange={(e) => setMinScore(+e.target.value)}
            style={{ accentColor: "#00C896", width: 80 }} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#00C896", minWidth: 22 }}>{minScore}</span>
        </div>
        {(search || sector !== "Tous" || country !== "Tous" || minScore > 0) && (
          <button onClick={() => { setSearch(""); setSector("Tous"); setCountry("Tous"); setMinScore(0); }}
            style={{ background: "transparent", border: "1px solid #E0525240", borderRadius: 8, padding: "6px 10px", color: "#E05252", fontSize: 11, cursor: "pointer" }}>
            ✕
          </button>
        )}
      </div>
    </div>
  );

  const SupplierList = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#8A9BB0" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 13 }}>Aucun résultat. Modifiez vos filtres.</div>
        </div>
      ) : filtered.map((s) => (
        <SupplierCard key={s.id} supplier={s}
          onSelect={handleSelect}
          selected={selected?.id === s.id}
          inShortlist={!!shortlist.find((x) => x.id === s.id)}
          onToggleShortlist={toggleShortlist} />
      ))}
    </div>
  );

  const ChatPanel = () => (
    <>
      {selected && (
        <div style={{ background: "#111D2B", borderBottom: "1px solid #1E3A5F", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <ScoreRing score={selected.score} size={48} strokeWidth={4} />
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#00C896" }}>{selected.id}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{selected.name}</div>
            <div style={{ fontSize: 10, color: "#8A9BB0" }}>{selected.sector} · {selected.country}</div>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {messages.map((m, i) => <Bubble key={i} msg={m} />)}
        {loading && <Typing />}
        <div ref={chatEndRef} />
      </div>
      <div style={{ borderTop: "1px solid #1E3A5F", padding: "12px 14px", background: "#0F1923" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {["Comparer les meilleurs", "ISO 14001 dispo ?", "Délai le plus court ?"].map((s) => (
            <button key={s} onClick={() => setInput(s)}
              style={{ fontSize: 10, background: "#111D2B", border: "1px solid #1E3A5F", borderRadius: 14, padding: "4px 10px", color: "#8A9BB0", cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && input.trim() && sendToChat(input)}
            placeholder="Votre question..."
            style={{ flex: 1, background: "#111D2B", border: "1px solid #1E3A5F", borderRadius: 10, padding: "10px 13px", color: "#F5F0E8", fontSize: 13, fontFamily: "Inter,sans-serif" }} />
          <button onClick={() => !loading && input.trim() && sendToChat(input)} disabled={loading || !input.trim()}
            style={{ background: loading || !input.trim() ? "#1E3A5F" : "linear-gradient(135deg,#00C896,#0A8A66)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontSize: 14, cursor: loading || !input.trim() ? "default" : "pointer", transition: "all 0.2s" }}>
            ➤
          </button>
        </div>
      </div>
    </>
  );

  const FichePanel = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
      {!selected ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#8A9BB0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 13 }}>Sélectionnez un fournisseur pour voir sa fiche.</div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <ScoreRing score={selected.score} size={80} strokeWidth={6} />
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#00C896", marginBottom: 2 }}>{selected.id}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: "#8A9BB0" }}>{selected.sector} · {selected.country} · Fondé {selected.founded}</div>
            </div>
          </div>

          {[
            ["Chiffre d'affaires", selected.revenue],
            ["Effectif", `${selected.employees} employés`],
            ["Commande min.", `${selected.minOrder} €`],
            ["Délai livraison", `${selected.leadTime} jours`],
            ["Contact", selected.contact],
            ["Site web", selected.website],
            ["Statut", selected.status],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1E3A5F20" }}>
              <span style={{ fontSize: 12, color: "#8A9BB0" }}>{label}</span>
              <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", color: "#F5F0E8", textAlign: "right", maxWidth: "60%", wordBreak: "break-all" }}>{val}</span>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, color: "#8A9BB0", marginBottom: 8, letterSpacing: 1 }}>CERTIFICATIONS</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {selected.certifications.map((c) => (
                <span key={c} style={{ fontSize: 11, color: "#5A8AB0", background: "#1E3A5F", padding: "4px 10px", borderRadius: 6, fontFamily: "'IBM Plex Mono',monospace" }}>{c}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 10, color: "#8A9BB0", marginBottom: 8, letterSpacing: 1 }}>SPÉCIALITÉS</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {selected.tags.map((t) => (
                <span key={t} style={{ fontSize: 11, color: "#C4A35A", background: "#C4A35A18", border: "1px solid #C4A35A40", padding: "4px 10px", borderRadius: 6 }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 10, color: "#8A9BB0", marginBottom: 14, letterSpacing: 1 }}>MÉTRIQUES</div>
            <MetricBar label="Fiabilité"   value={selected.reliability} color="#00C896" />
            <MetricBar label="Qualité"     value={selected.quality}     color="#5A8AB0" />
            <MetricBar label="Prix"        value={selected.pricing}     color="#C4A35A" />
            <MetricBar label="Flexibilité" value={selected.flexibility} color="#E05252" />
          </div>
        </>
      )}
    </div>
  );

  const ComparerPanel = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
      {shortlist.length < 2 ? (
        <div style={{ textAlign: "center", padding: "50px 20px", color: "#8A9BB0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
          <div style={{ fontSize: 13, marginBottom: 6 }}>Ajoutez 2 à 4 fournisseurs à la shortlist.</div>
          <div style={{ fontSize: 11 }}>Utilisez "☆ Ajouter" sur les cartes.</div>
          <div style={{ marginTop: 12, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "#00C896" }}>{shortlist.length}/4 sélectionnés</div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <RadarChart suppliers={shortlist} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#8A9BB0", borderBottom: "1px solid #1E3A5F", fontWeight: 500 }}>Critère</th>
                  {shortlist.map((s) => (
                    <th key={s.id} style={{ textAlign: "center", padding: "8px 6px", color: "#F5F0E8", borderBottom: "1px solid #1E3A5F", fontWeight: 600, fontSize: 10 }}>
                      {s.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Score",      key: "score",       fmt: (v) => `${v}/100`, bestMax: true },
                  { label: "Pays",       key: "country",     fmt: (v) => v,         bestMax: false },
                  { label: "Délai (j)",  key: "leadTime",    fmt: (v) => `${v}j`,   bestMax: false, bestMin: true },
                  { label: "Min (€)",    key: "minOrder",    fmt: (v) => `${v}€`,   bestMax: false, bestMin: true },
                  { label: "Fiabilité",  key: "reliability", fmt: (v) => `${v}%`,   bestMax: true },
                  { label: "Qualité",    key: "quality",     fmt: (v) => `${v}%`,   bestMax: true },
                  { label: "Prix",       key: "pricing",     fmt: (v) => `${v}%`,   bestMax: true },
                  { label: "Flexib.",    key: "flexibility", fmt: (v) => `${v}%`,   bestMax: true },
                  { label: "CA",         key: "revenue",     fmt: (v) => v,         bestMax: false },
                  { label: "Statut",     key: "status",      fmt: (v) => v,         bestMax: false },
                ].map((row, i) => {
                  const vals = shortlist.map((s) => s[row.key]);
                  const numVals = vals.filter((v) => typeof v === "number");
                  const best = row.bestMax ? Math.max(...numVals) : row.bestMin ? Math.min(...numVals) : null;
                  return (
                    <tr key={row.key} style={{ background: i % 2 === 0 ? "transparent" : "#0F192330" }}>
                      <td style={{ padding: "8px 10px", color: "#8A9BB0", fontSize: 11 }}>{row.label}</td>
                      {shortlist.map((s) => {
                        const isBest = best !== null && s[row.key] === best;
                        return (
                          <td key={s.id} style={{
                            padding: "8px 6px", textAlign: "center",
                            fontFamily: "'IBM Plex Mono',monospace",
                            color: isBest ? "#00C896" : "#F5F0E8",
                            fontWeight: isBest ? 700 : 400,
                            background: isBest ? "#00C89612" : "transparent",
                          }}>
                            {row.fmt(s[row.key])}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button onClick={() => {
              setInput(`Compare ces fournisseurs et recommande le meilleur : ${shortlist.map((s) => s.name).join(", ")}`);
              if (isMobile) setActiveTab("chat"); else setRightTab("chat");
            }}
              style={{ flex: 1, background: "linear-gradient(135deg,#00C896,#0A8A66)", border: "none", borderRadius: 10, padding: "11px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
              💬 Demander à l'IA
            </button>
            <button onClick={() => setShortlist([])}
              style={{ background: "transparent", border: "1px solid #E0525240", borderRadius: 10, padding: "11px 14px", color: "#E05252", fontSize: 12, cursor: "pointer" }}>
              Vider
            </button>
          </div>
        </>
      )}
    </div>
  );

  const EmailPanel = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
      {!selected ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#8A9BB0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
          <div style={{ fontSize: 13 }}>Sélectionnez un fournisseur pour générer un email.</div>
        </div>
      ) : (
        <>
          <div style={{ background: "#111D2B", border: "1px solid #1E3A5F", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#00C896" }}>{selected.id}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{selected.name}</div>
                <div style={{ fontSize: 11, color: "#8A9BB0" }}>{selected.contact}</div>
              </div>
              <button onClick={generateEmail} disabled={emailLoading}
                style={{ background: emailLoading ? "#1E3A5F" : "linear-gradient(135deg,#00C896,#0A8A66)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#fff", fontSize: 12, cursor: emailLoading ? "default" : "pointer" }}>
                {emailLoading ? "⏳..." : "✨ Générer"}
              </button>
            </div>
          </div>

          {emailText && (
            <div style={{ background: "#111D2B", border: "1px solid #1E3A5F", borderRadius: 12, padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 10, color: "#8A9BB0", letterSpacing: 1 }}>EMAIL IA</span>
                <button onClick={() => { navigator.clipboard.writeText(emailText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{ fontSize: 11, background: copied ? "#00C89620" : "#1E3A5F", border: `1px solid ${copied ? "#00C896" : "#2A5080"}`, borderRadius: 6, padding: "4px 12px", color: copied ? "#00C896" : "#8A9BB0", cursor: "pointer" }}>
                  {copied ? "✓ Copié !" : "📋 Copier"}
                </button>
              </div>
              <pre style={{ fontFamily: "Inter,sans-serif", fontSize: 12, lineHeight: 1.75, color: "#F5F0E8", whiteSpace: "pre-wrap", margin: 0 }}>
                {emailText}
              </pre>
            </div>
          )}

          {!emailText && !emailLoading && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#8A9BB0" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
              <div style={{ fontSize: 12 }}>Cliquez sur "Générer" pour créer un email personnalisé.</div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── DESKTOP LAYOUT ───────────────────────────────────────────────────────────
  const DESKTOP_RIGHT_TABS = [
    { id: "chat",     label: "💬 Chat" },
    { id: "fiche",    label: "📋 Fiche" },
    { id: "comparer", label: `⚖️ Comparer${shortlist.length > 0 ? ` (${shortlist.length})` : ""}` },
    { id: "email",    label: "✉️ Email" },
  ];

  if (!isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "#0F1923", borderBottom: "1px solid #1E3A5F", padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, paddingTop: `calc(12px + var(--safe-top))` }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#00C896,#1E3A5F)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔍</div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>SOURCING.AI</div>
            <div style={{ fontSize: 10, color: "#8A9BB0" }}>Agent de sourcing fournisseurs B2B</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 24 }}>
            {[
              { label: "RÉSULTATS", value: filtered.length, color: "#00C896" },
              { label: "SHORTLIST", value: shortlist.length, color: "#C4A35A" },
              { label: "ACTIFS", value: SUPPLIERS.filter((s) => s.status === "Actif").length, color: "#5A8AB0" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "#8A9BB0" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <FilterBar />

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left panel */}
          <div style={{ width: "42%", borderRight: "1px solid #1E3A5F", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <SupplierList />
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", background: "#0F1923", borderBottom: "1px solid #1E3A5F" }}>
              {DESKTOP_RIGHT_TABS.map((t) => (
                <button key={t.id} onClick={() => setRightTab(t.id)}
                  style={{ flex: 1, padding: "11px 4px", background: "transparent", border: "none", borderBottom: `2px solid ${rightTab === t.id ? "#00C896" : "transparent"}`, color: rightTab === t.id ? "#00C896" : "#8A9BB0", fontSize: 11, cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.2s" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {rightTab === "chat"     && <ChatPanel />}
              {rightTab === "fiche"    && <FichePanel />}
              {rightTab === "comparer" && <ComparerPanel />}
              {rightTab === "email"    && <EmailPanel />}
            </div>
          </div>
        </div>

        {showInstall && <InstallBanner onInstall={handleInstall} onDismiss={() => setShowInstall(false)} />}
      </div>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────────
  const MOBILE_TABS = [
    { id: "list",     icon: "🔍", label: "Recherche" },
    { id: "chat",     icon: "💬", label: "Chat IA" },
    { id: "fiche",    icon: "📋", label: "Fiche" },
    { id: "comparer", icon: "⚖️", label: `Comparer${shortlist.length > 0 ? ` (${shortlist.length})` : ""}` },
    { id: "email",    icon: "✉️", label: "Email" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Mobile Header */}
      <div style={{ background: "#0F1923", borderBottom: "1px solid #1E3A5F", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, paddingTop: `calc(10px + var(--safe-top))` }}>
        <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#00C896,#1E3A5F)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🔍</div>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>SOURCING.AI</div>
          <div style={{ fontSize: 9, color: "#8A9BB0" }}>{filtered.length} fournisseurs · {shortlist.length} en shortlist</div>
        </div>
      </div>

      {/* Mobile content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeTab === "list" && (
          <>
            <FilterBar />
            <SupplierList />
          </>
        )}
        {activeTab === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ChatPanel />
          </div>
        )}
        {activeTab === "fiche" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <FichePanel />
          </div>
        )}
        {activeTab === "comparer" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ComparerPanel />
          </div>
        )}
        {activeTab === "email" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <EmailPanel />
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <div style={{
        background: "#0F1923", borderTop: "1px solid #1E3A5F",
        display: "flex",
        paddingBottom: `var(--safe-bottom)`,
      }}>
        {MOBILE_TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: "10px 4px 8px", background: "transparent", border: "none",
              borderTop: `2px solid ${activeTab === t.id ? "#00C896" : "transparent"}`,
              color: activeTab === t.id ? "#00C896" : "#8A9BB0",
              fontSize: 8, cursor: "pointer", fontFamily: "Inter,sans-serif",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 8, whiteSpace: "nowrap" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {showInstall && <InstallBanner onInstall={handleInstall} onDismiss={() => setShowInstall(false)} />}
    </div>
  );
}

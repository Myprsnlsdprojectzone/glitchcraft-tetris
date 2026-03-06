import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { KeyBindings, DEFAULT_BINDINGS } from "../hooks/useTetris";

interface Props {
  bindings: KeyBindings;
  onSave:   (b: KeyBindings) => void;
  onClose:  () => void;
  isDark:   boolean;
}

const ACTION_LABELS: {
  key: keyof KeyBindings;
  label: string;
  desc: string;
  icon: string;
  group: "movement" | "game";
}[] = [
  { key: "left",     label: "Move Left",      desc: "Slide piece one step left",       icon: "←",  group: "movement" },
  { key: "right",    label: "Move Right",     desc: "Slide piece one step right",      icon: "→",  group: "movement" },
  { key: "down",     label: "Soft Drop",      desc: "Speed up descent",                icon: "↓",  group: "movement" },
  { key: "rotate",   label: "Rotate",         desc: "Rotate 90° clockwise",            icon: "↺",  group: "movement" },
  { key: "hardDrop", label: "Hard Drop",      desc: "Snap to ghost (+2 pts/cell)",     icon: "⚡", group: "movement" },
  { key: "hold",     label: "Hold Piece",     desc: "Store or swap held piece",        icon: "📦", group: "movement" },
  { key: "pause",    label: "Pause / Resume", desc: "Freeze or continue the game",     icon: "⏸", group: "game"     },
];

function formatKey(key: string): string {
  if (key === " ")          return "Space";
  if (key === "ArrowLeft")  return "← Left";
  if (key === "ArrowRight") return "→ Right";
  if (key === "ArrowDown")  return "↓ Down";
  if (key === "ArrowUp")    return "↑ Up";
  if (key === "Escape")     return "Esc";
  return key.length === 1 ? key.toUpperCase() : key;
}

function ControlsModalInner({ bindings, onSave, onClose, isDark }: Props) {
  const [draft,     setDraft]     = useState<KeyBindings>({ ...bindings });
  const [listening, setListening] = useState<keyof KeyBindings | null>(null);
  const [saved,     setSaved]     = useState(false);
  const listeningRef              = useRef(listening);
  listeningRef.current            = listening;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      if (!listeningRef.current) return;
      setDraft(prev => ({ ...prev, [listeningRef.current!]: e.key }));
      setListening(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!listening) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setListening(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [listening]);

  const bg     = isDark ? "rgba(9,16,30,0.98)"  : "rgba(255,255,255,0.98)";
  const panel  = isDark ? "rgba(6,11,22,0.98)"  : "rgba(244,248,255,0.98)";
  const border = isDark ? "#1a3050"  : "#dde8f5";
  const text   = isDark ? "#eef2ff"  : "#0f172a";
  const sub    = isDark ? "#6a84a4"  : "#64748b";
  const card   = isDark ? "rgba(8,14,26,0.95)"  : "rgba(248,252,255,0.98)";
  const accent = "#6366f1";

  const movementActions = ACTION_LABELS.filter(a => a.group === "movement");
  const gameActions     = ACTION_LABELS.filter(a => a.group === "game");

  function handleSave() {
    onSave(draft);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: "16px",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 22, width: 440,
        maxWidth: "96vw", maxHeight: "92vh",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        color: text,
        boxShadow: "0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
        animation: "modalOpen 0.28s cubic-bezier(0.34,1.2,0.64,1) both",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px",
          background: panel,
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #22d3ee 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
              boxShadow: "0 5px 16px rgba(99,102,241,0.5)",
            }}>⌨️</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px", color: text }}>
                Key Bindings
              </div>
              <div style={{ fontSize: 11, color: sub, marginTop: 2, fontWeight: 500 }}>
                Click any key, then press your desired key
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-footer-btn"
            style={{
              background: card, border: `1.5px solid ${border}`,
              borderRadius: 10, width: 34, height: 34,
              color: sub, fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "18px 22px", flex: 1 }}>

          <GroupLabel label="Movement & Actions" sub={sub} accent={accent} />
          {movementActions.map(({ key, label, desc, icon }) => (
            <BindingRow
              key={key} actionKey={key} label={label} desc={desc} icon={icon}
              value={draft[key]} isListening={listening === key}
              onToggleListen={() => setListening(listening === key ? null : key)}
              card={card} border={border} text={text} sub={sub} accent={accent} isDark={isDark}
            />
          ))}

          <div style={{ height: 14 }} />

          <GroupLabel label="Game Controls" sub={sub} accent="#22d3ee" />
          {gameActions.map(({ key, label, desc, icon }) => (
            <BindingRow
              key={key} actionKey={key} label={label} desc={desc} icon={icon}
              value={draft[key]} isListening={listening === key}
              onToggleListen={() => setListening(listening === key ? null : key)}
              card={card} border={border} text={text} sub={sub} accent={accent} isDark={isDark}
            />
          ))}

          {/* Info hint */}
          <div style={{
            marginTop: 16, padding: "11px 14px",
            background: isDark ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.05)",
            border: `1px solid rgba(99,102,241,0.22)`,
            borderRadius: 11,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
            <div style={{ fontSize: 12, color: sub, lineHeight: 1.6, fontWeight: 500 }}>
              Click any key button above to start listening, then press any keyboard key to bind it.
              Changes only apply after clicking <strong style={{ color: text }}>Save Bindings</strong>.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", gap: 10, padding: "14px 22px",
          borderTop: `1px solid ${border}`,
          background: panel, flexShrink: 0,
        }}>
          <button
            onClick={() => setDraft({ ...DEFAULT_BINDINGS })}
            className="modal-footer-btn"
            style={{
              flex: 1, padding: "11px",
              borderRadius: 11, background: "transparent",
              border: `1.5px solid ${border}`,
              color: sub, fontSize: 13, fontWeight: 600,
              fontFamily: "inherit",
            }}
          >↺ &nbsp;Reset Defaults</button>
          <button
            onClick={handleSave}
            className="modal-footer-btn"
            style={{
              flex: 1, padding: "11px",
              borderRadius: 11,
              background: saved
                ? "linear-gradient(135deg, #22d3ee 0%, #4ade80 100%)"
                : "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              border: "1.5px solid rgba(99,102,241,0.45)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              fontFamily: "inherit",
              boxShadow: "0 5px 20px rgba(99,102,241,0.42)",
              transition: "background 0.28s ease",
            }}
          >{saved ? "✓ &nbsp;Saved!" : "Save Bindings"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Binding row ── */
function BindingRow({
  label, desc, icon, value, isListening, onToggleListen,
  card, border, text, sub, accent, isDark,
}: {
  actionKey: keyof KeyBindings;
  label: string; desc: string; icon: string; value: string;
  isListening: boolean; onToggleListen: () => void;
  card: string; border: string; text: string; sub: string; accent: string; isDark: boolean;
}) {
  return (
    <div
      className="binding-row"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 7, padding: "10px 12px",
        background: isListening ? `${accent}14` : card,
        border: `1.5px solid ${isListening ? accent + "60" : border}`,
        borderRadius: 12,
        boxShadow: isListening
          ? `0 4px 18px ${accent}22`
          : isDark ? "0 1px 4px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: isListening ? `${accent}22` : isDark ? "rgba(20,34,58,0.9)" : "#eaeffa",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, border: `1px solid ${isListening ? accent + "50" : border}`,
        transition: "all 0.16s",
      }}>{icon}</div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: text }}>{label}</div>
        <div style={{ fontSize: 10.5, color: sub, marginTop: 1.5, fontWeight: 500 }}>{desc}</div>
      </div>

      <button
        onClick={onToggleListen}
        className="key-btn"
        style={{
          background: isListening ? accent : isDark ? "rgba(20,34,58,0.9)" : "#eaeffa",
          border: `1.5px solid ${isListening ? accent : border}`,
          borderRadius: 9, padding: "7px 14px",
          color: isListening ? "#fff" : text,
          fontSize: 12, fontWeight: 700,
          minWidth: 114, textAlign: "center",
          fontFamily: isListening ? "'Inter', inherit" : "'JetBrains Mono', monospace",
          letterSpacing: isListening ? "0.01em" : "-0.02em",
          boxShadow: isListening ? `0 4px 16px ${accent}50` : "none",
          animation: isListening ? "glowPulse 1.1s ease-in-out infinite" : undefined,
        }}
      >{isListening ? "⌨ Press a key…" : formatKey(value)}</button>
    </div>
  );
}

/* ── Group label ── */
function GroupLabel({ label, sub, accent }: { label: string; sub: string; accent: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      marginBottom: 9, paddingLeft: 2,
    }}>
      <div style={{
        width: 3, height: 14, borderRadius: 3,
        background: accent, flexShrink: 0,
      }} />
      <div style={{
        fontSize: 10, color: sub, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: "0.1em",
      }}>{label}</div>
    </div>
  );
}

/* ── Portal wrapper ── */
export const ControlsModal: React.FC<Props> = props =>
  ReactDOM.createPortal(<ControlsModalInner {...props} />, document.body);

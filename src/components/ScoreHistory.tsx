import { useState, useEffect } from "react";
import { ScoreEntry } from "../utils/scoreHistory";
import { supabase, fetchGlobalScores, GlobalScore } from "../utils/globalLeaderboard";

interface Props {
  scores:   ScoreEntry[];
  isDark:   boolean;
  limit?:   number;   // how many entries to show (default: all, capped at 10)
  compact?: boolean;  // ultra-thin mode for MobilePanel
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export const ScoreHistory: React.FC<Props> = ({
  scores,
  isDark,
  limit = 10,
  compact = false,
}) => {
  const [tab, setTab] = useState<"local" | "global">("local");
  const [globalScores, setGlobalScores] = useState<GlobalScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === "global") {
      setLoading(true);
      fetchGlobalScores(limit).then(data => {
        setGlobalScores(data);
        setLoading(false);
      });
    }
  }, [tab, limit]);

  const visibleLocal = scores.slice(0, limit);

  /* ── Theme tokens (match existing panel palettes) ── */
  const sub    = isDark ? "#607a98"               : "#64748b";
  const text   = isDark ? "#eef2ff"               : "#0f172a";
  const border = isDark ? "#192d4a"               : "#dde8f5";
  const rowBg  = isDark ? "rgba(6,11,22,0.6)"     : "rgba(248,252,255,0.8)";
  const gold   = "#f59e0b";
  const accent = "#6366f1";

  const levelColor = (lv: number) =>
    lv >= 10 ? "#a855f7" :
    lv >= 7  ? "#f87171" :
    lv >= 5  ? "#fb923c" :
    lv >= 3  ? "#facc15" : "#4ade80";

  /* ── Compact strip (MobilePanel top-3) ── */
  if (compact) {
    if (scores.length === 0) return null;
    return (
      <div style={{
        display: "flex", gap: 4, overflowX: "auto",
        padding: "3px 0", scrollbarWidth: "none",
      }}>
        {visibleLocal.map((e, i) => (
          <div key={i} style={{
            flexShrink: 0,
            background: rowBg,
            border: `1px solid ${border}`,
            borderRadius: 7,
            padding: "3px 7px",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ fontSize: 10 }}>{RANK_MEDALS[i] ?? `#${i + 1}`}</span>
            <span style={{
              fontSize: 10, fontWeight: 900,
              fontFamily: "'JetBrains Mono', monospace",
              color: i === 0 ? gold : text,
              letterSpacing: "-0.3px",
            }}>{e.score.toLocaleString()}</span>
            <span style={{
              fontSize: 8.5, fontWeight: 700,
              color: levelColor(e.level),
            }}>L{e.level}</span>
          </div>
        ))}
      </div>
    );
  }

  /* ── Full list (InfoPanel desktop) ── */
  if (scores.length === 0 && tab === "local") return null;

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      {/* Section header */}
      <div style={{
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.052)" : "rgba(0,0,0,0.068)"}`,
        paddingTop: 8, marginBottom: 5,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 8, color: sub, textTransform: "uppercase",
            letterSpacing: "0.12em", fontWeight: 800,
          }}>🏆</span>
          <button
            onClick={() => setTab("local")}
            style={{
              background: "transparent", border: "none", padding: 0,
              fontSize: 9, fontWeight: tab === "local" ? 800 : 500,
              color: tab === "local" ? text : sub,
              cursor: "pointer", textTransform: "uppercase",
              letterSpacing: "0.1em"
            }}
          >Local</button>
          {supabase && (
            <button
              onClick={() => setTab("global")}
              style={{
                background: "transparent", border: "none", padding: 0,
                fontSize: 9, fontWeight: tab === "global" ? 800 : 500,
                color: tab === "global" ? text : sub,
                cursor: "pointer", textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}
            >Global</button>
          )}
        </div>
        <span style={{
          fontSize: 7.5, color: sub, fontWeight: 600,
        }}>{tab === "local" ? scores.length : globalScores.length}/{limit}</span>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {tab === "global" && loading && (
          <div style={{ fontSize: 10, color: sub, textAlign: "center", padding: "10px 0" }}>Loading globally...</div>
        )}
        {tab === "local" && visibleLocal.map((e, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: rowBg,
            border: `1px solid ${i === 0 ? `${gold}55` : border}`,
            borderLeft: `2.5px solid ${i === 0 ? gold : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : border}`,
            borderRadius: 7,
            padding: "4px 7px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Subtle rank glow for #1 */}
            {i === 0 && (
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse at 0% 50%, ${gold}0f 0%, transparent 60%)`,
                pointerEvents: "none",
              }} />
            )}

            {/* Rank */}
            <span style={{ fontSize: 11, flexShrink: 0, position: "relative" }}>
              {RANK_MEDALS[i] ?? (
                <span style={{ fontSize: 8.5, color: sub, fontWeight: 800 }}>#{i + 1}</span>
              )}
            </span>

            {/* Score */}
            <span style={{
              fontSize: 11, fontWeight: 900,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-0.5px",
              color: i === 0 ? gold : text,
              filter: i === 0 ? `drop-shadow(0 0 5px ${gold}55)` : undefined,
              flexShrink: 0, position: "relative",
              minWidth: 52, textAlign: "right",
            }}>{e.score.toLocaleString()}</span>

            {/* Level badge */}
            <span style={{
              fontSize: 7.5, fontWeight: 800,
              color: levelColor(e.level),
              background: `${levelColor(e.level)}18`,
              border: `1px solid ${levelColor(e.level)}44`,
              borderRadius: 4, padding: "1px 4px",
              flexShrink: 0, letterSpacing: "0.02em",
              position: "relative",
            }}>Lv{e.level}</span>

            {/* Lines */}
            <span style={{
              fontSize: 7.5, fontWeight: 600, color: sub,
              flexShrink: 0, position: "relative",
            }}>{e.lines}L</span>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Date */}
            <span style={{
              fontSize: 7, color: sub, fontWeight: 500,
              flexShrink: 0, position: "relative",
              letterSpacing: "0.01em",
            }}>{e.date}</span>

            {/* Accent dot for top score */}
            {i === 0 && (
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 6px ${accent}`,
                flexShrink: 0,
              }} />
            )}
          </div>
        ))}

        {tab === "global" && !loading && globalScores.map((e, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: rowBg,
            border: `1px solid ${i === 0 ? `${gold}55` : border}`,
            borderLeft: `2.5px solid ${i === 0 ? gold : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : border}`,
            borderRadius: 7,
            padding: "4px 7px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Subtle rank glow for #1 */}
            {i === 0 && (
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse at 0% 50%, ${gold}0f 0%, transparent 60%)`,
                pointerEvents: "none",
              }} />
            )}

            {/* Rank */}
            <span style={{ fontSize: 11, flexShrink: 0, position: "relative" }}>
              {RANK_MEDALS[i] ?? (
                <span style={{ fontSize: 8.5, color: sub, fontWeight: 800 }}>#{i + 1}</span>
              )}
            </span>

            {/* Player Name */}
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: text, flexShrink: 0,
              width: 60, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{e.player_name}</span>

            {/* Score */}
            <span style={{
              fontSize: 11, fontWeight: 900,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-0.5px",
              color: i === 0 ? gold : text,
              filter: i === 0 ? `drop-shadow(0 0 5px ${gold}55)` : undefined,
              flexShrink: 0, position: "relative",
              minWidth: 52, textAlign: "right",
            }}>{e.score.toLocaleString()}</span>

            {/* Level badge */}
            <span style={{
              fontSize: 7.5, fontWeight: 800,
              color: levelColor(e.level),
              background: `${levelColor(e.level)}18`,
              border: `1px solid ${levelColor(e.level)}44`,
              borderRadius: 4, padding: "1px 4px",
              flexShrink: 0, letterSpacing: "0.02em",
              position: "relative",
            }}>Lv{e.level}</span>

            {/* Lines */}
            <span style={{
              fontSize: 7.5, fontWeight: 600, color: sub,
              flexShrink: 0, position: "relative",
            }}>{e.lines}L</span>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Accent dot for top score */}
            {i === 0 && (
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 6px ${accent}`,
                flexShrink: 0,
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

import { useRef, useEffect, useState } from "react";
import { Tetromino, KeyBindings } from "../hooks/useTetris";
import { NextPiece } from "./NextPiece";
import { HoldPiece } from "./HoldPiece";

interface Props {
  score:      number;
  bestScore:  number;
  lines:      number;
  level:      number;
  combo:      number;
  next:       Tetromino;
  hold:       Tetromino | null;
  holdLocked: boolean;
  running:    boolean;
  started:    boolean;
  gameOver:   boolean;
  isDark:     boolean;
  bindings:   KeyBindings;
  panelH:     number;
  onStart:        () => void;
  onTogglePause:  () => void;
  onOpenControls: () => void;
  onOpenGuide:    () => void;
  onToggleTheme:  () => void;
}

export const InfoPanel: React.FC<Props> = ({
  score, bestScore, lines, level, combo,
  next, hold, holdLocked,
  running, started, gameOver,
  isDark, bindings, panelH,
  onStart, onTogglePause, onOpenControls, onOpenGuide, onToggleTheme,
}) => {
  /* ── Theme tokens ── */
  const bg     = isDark ? "rgba(7,12,26,0.99)"  : "rgba(252,254,255,0.99)";
  const border = isDark ? "#192d4a"  : "#dde8f5";
  const text   = isDark ? "#eef2ff"  : "#0f172a";
  const sub    = isDark ? "#607a98"  : "#64748b";
  const card   = isDark ? "rgba(6,11,22,0.98)"  : "rgba(248,252,255,0.99)";
  const card2  = isDark ? "rgba(10,18,32,0.92)" : "#eef4ff";
  const accent  = "#6366f1";
  const accent2 = "#22d3ee";
  const gold    = "#f59e0b";

  /* ── Animated score ── */
  const [displayScore, setDisplayScore] = useState(score);
  const scoreAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevScore    = useRef(score);
  const [scoreBumped, setScoreBumped] = useState(false);

  useEffect(() => {
    if (score === prevScore.current) return;
    const isIncrease = score > prevScore.current;
    if (isIncrease) setScoreBumped(true);
    const diff  = score - prevScore.current;
    const steps = Math.min(18, Math.abs(diff));
    const step  = diff / steps;
    let cur     = prevScore.current;
    let count   = 0;
    if (scoreAnimRef.current) clearInterval(scoreAnimRef.current);
    let mounted = true;
    scoreAnimRef.current = setInterval(() => {
      if (!mounted) return;
      count++;
      cur += step;
      setDisplayScore(Math.round(count >= steps ? score : cur));
      if (count >= steps) {
        clearInterval(scoreAnimRef.current!);
        scoreAnimRef.current = null;
        if (mounted) {
          setDisplayScore(score);
          setTimeout(() => { if (mounted) setScoreBumped(false); }, 380);
        }
      }
    }, 22);
    prevScore.current = score;
    return () => {
      mounted = false;
      if (scoreAnimRef.current) { clearInterval(scoreAnimRef.current); scoreAnimRef.current = null; }
    };
  }, [score]);

  /* ── Level color ── */
  const linesInLevel  = lines % 10;
  const levelProgress = (linesInLevel / 10) * 100;
  const levelColor =
    level >= 10 ? "#a855f7" :
    level >= 7  ? "#f87171" :
    level >= 5  ? "#fb923c" :
    level >= 3  ? "#facc15" : "#4ade80";

  const comboColor = combo >= 5 ? "#c084fc" : "#f59e0b";
  const comboLabel = combo >= 8 ? "🔥🔥 INSANE" : combo >= 5 ? "🔥 ON FIRE" : "🔥 COMBO";

  return (
    <div
      className={running ? "panel-active" : ""}
      style={{
        width: "100%", height: panelH,
        display: "flex", flexDirection: "column",
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 16, padding: "14px 13px",
        color: text, boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: isDark
          ? [
              "0 0 0 1px rgba(99,102,241,0.06)",
              "0 24px 64px rgba(0,0,0,0.62)",
              "inset 0 1px 0 rgba(255,255,255,0.03)",
              "inset 0 -1px 0 rgba(0,0,0,0.16)",
            ].join(", ")
          : [
              "0 0 0 1px rgba(99,102,241,0.05)",
              "0 8px 36px rgba(0,0,0,0.10)",
              "inset 0 1px 0 rgba(255,255,255,0.96)",
            ].join(", "),
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        transition: "box-shadow 0.6s ease",
      }}
    >
      {/* ══ HEADER ══ */}
      <div className="panel-header-glow" style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0, marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, #5a5fcf 0%, #6366f1 45%, #818cf8 70%, #22d3ee 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, flexShrink: 0,
            boxShadow: "0 4px 16px rgba(99,102,241,0.52), inset 0 1px 0 rgba(255,255,255,0.24)",
            animation: "logoGlow 3s ease-in-out infinite",
          }}>🎮</div>
          <span style={{
            fontSize: 18, fontWeight: 900, letterSpacing: "-0.6px",
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 45%, #22d3ee 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "titleShimmer 4s linear infinite",
          }}>TETRIS</span>
        </div>
        <button
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="theme-toggle-btn"
          style={{
            background: card2, border: `1.5px solid ${border}`,
            borderRadius: 10, width: 34, height: 34,
            fontSize: 15, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: isDark
              ? "0 2px 10px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.96)",
          }}
        >{isDark ? "☀️" : "🌙"}</button>
      </div>

      {/* ══ SCORE CARD ══ */}
      <div className="stat-card" style={{
        background: card, border: `1.5px solid ${border}`,
        borderTop: `3px solid ${accent}`,
        borderRadius: 13, padding: "11px 13px",
        textAlign: "center", flexShrink: 0,
        position: "relative", overflow: "visible",
        boxShadow: isDark
          ? "inset 0 1px 0 rgba(255,255,255,0.03), 0 5px 18px rgba(0,0,0,0.28)"
          : "inset 0 1px 0 rgba(255,255,255,0.96), 0 2px 10px rgba(0,0,0,0.056)",
      }}>
        {scoreBumped && <div className="score-ring" />}
        {/* Radial glow at top */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 13,
          background: `radial-gradient(ellipse at 50% -10%, ${accent}1e 0%, transparent 68%)`,
          pointerEvents: "none", overflow: "hidden",
        }} />
        {/* Top sheen */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "46%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.055), transparent)",
          pointerEvents: "none", borderRadius: "13px 13px 0 0",
        }} />
        <div style={{
          fontSize: 9, color: sub, textTransform: "uppercase",
          letterSpacing: "0.13em", fontWeight: 800, marginBottom: 3,
          position: "relative",
        }}>Score</div>
        <div style={{
          fontSize: 28, fontWeight: 900, color: text,
          letterSpacing: "-1.6px",
          fontFamily: "'JetBrains Mono', 'Inter', monospace",
          animation: scoreBumped ? "scorePulse 0.34s ease-out" : undefined,
          position: "relative", lineHeight: 1.1,
          textShadow: scoreBumped ? `0 0 26px ${accent}88` : undefined,
          transition: "text-shadow 0.3s ease",
        }}>{displayScore.toLocaleString()}</div>
      </div>

      {/* ══ BEST SCORE ══ */}
      <div style={{ height: 6, flexShrink: 0 }} />
      <div className="stat-card" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: card, border: `1.5px solid ${border}`,
        borderLeft: `3px solid ${gold}`,
        borderRadius: 11, padding: "6px 12px", flexShrink: 0,
        position: "relative", overflow: "hidden",
        boxShadow: isDark
          ? "inset 0 1px 0 rgba(255,255,255,0.02)"
          : "inset 0 1px 0 rgba(255,255,255,0.96)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 0% 50%, ${gold}0d 0%, transparent 55%)`,
          pointerEvents: "none",
        }} />
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.09em",
          textTransform: "uppercase", position: "relative",
          background: "linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "titleShimmer 3s linear infinite",
        }}>🏆 Best</span>
        <span style={{
          fontSize: 14, fontWeight: 900,
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.5px",
          position: "relative",
          background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 6px rgba(245,158,11,0.42))",
        }}>
          {bestScore.toLocaleString()}
        </span>
      </div>

      <div style={{ height: 8, flexShrink: 0 }} />

      {/* ══ LEVEL + LINES ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, flexShrink: 0 }}>

        {/* Level */}
        <div className="stat-card" style={{
          background: card, border: `1.5px solid ${border}`,
          borderTop: `3px solid ${levelColor}`,
          borderRadius: 11, padding: "8px 10px",
          textAlign: "center", overflow: "hidden", position: "relative",
          boxShadow: isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.02)"
            : "inset 0 1px 0 rgba(255,255,255,0.96)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at 50% -5%, ${levelColor}18 0%, transparent 66%)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "40%",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            fontSize: 9, color: sub, textTransform: "uppercase",
            letterSpacing: "0.11em", fontWeight: 800, marginBottom: 2,
            position: "relative",
          }}>Level</div>
          <div style={{
            fontSize: 22, fontWeight: 900, color: levelColor,
            letterSpacing: "-0.5px", position: "relative",
            animation: level > 1 ? "levelUp 0.55s ease-out" : undefined,
            textShadow: `0 0 18px ${levelColor}48`,
          }}>{level}</div>
          {/* Progress bar */}
          <div style={{
            marginTop: 5, height: 3.5, borderRadius: 4,
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}>
            <div className="level-bar-fill" style={{
              height: "100%", width: `${levelProgress}%`, borderRadius: 4,
              background: `linear-gradient(90deg, ${levelColor}72, ${levelColor}, ${levelColor}cc)`,
              backgroundSize: "200% 100%",
              transition: "width 0.48s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: `0 0 10px ${levelColor}99, 0 0 4px ${levelColor}55`,
            }} />
          </div>
          <div style={{
            fontSize: 8, color: sub, marginTop: 3, fontWeight: 700,
            position: "relative",
          }}>{linesInLevel}/10</div>
        </div>

        {/* Lines */}
        <div className="stat-card" style={{
          background: card, border: `1.5px solid ${border}`,
          borderTop: `3px solid ${accent2}`,
          borderRadius: 11, padding: "8px 10px",
          textAlign: "center", overflow: "hidden", position: "relative",
          boxShadow: isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.02)"
            : "inset 0 1px 0 rgba(255,255,255,0.96)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at 50% -5%, ${accent2}16 0%, transparent 66%)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "40%",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            fontSize: 9, color: sub, textTransform: "uppercase",
            letterSpacing: "0.11em", fontWeight: 800, marginBottom: 2,
            position: "relative",
          }}>Lines</div>
          <div style={{
            fontSize: 22, fontWeight: 900, color: accent2,
            letterSpacing: "-0.5px", position: "relative",
            textShadow: `0 0 16px ${accent2}44`,
          }}>{lines}</div>
          <div style={{
            fontSize: 8, color: sub, marginTop: 10, fontWeight: 600,
            position: "relative",
          }}>cleared</div>
        </div>
      </div>

      {/* ══ COMBO ══ */}
      <div style={{ height: 7, flexShrink: 0 }} />
      {combo > 1 ? (
        <div style={{
          background: combo >= 5
            ? "linear-gradient(135deg, rgba(168,85,247,0.17), rgba(239,68,68,0.14))"
            : "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(239,68,68,0.11))",
          border: combo >= 5
            ? "1.5px solid rgba(168,85,247,0.48)"
            : "1.5px solid rgba(245,158,11,0.42)",
          borderRadius: 11, padding: "7px 11px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
          animation: "comboPop 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: `0 5px 22px ${combo >= 5 ? "rgba(168,85,247,0.18)" : "rgba(245,158,11,0.13)"}`,
          position: "relative", overflow: "hidden",
        }}>
          {/* Inner sheen */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.044) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 9, color: comboColor, fontWeight: 800,
              letterSpacing: "0.09em", textTransform: "uppercase",
              animation: combo >= 5 ? "flicker 0.8s ease-in-out infinite" : undefined,
              textShadow: `0 0 14px ${comboColor}88`,
            }}>
              <span className="combo-pulse-dot" style={{ background: comboColor }} />
              {comboLabel}
            </div>
            <div style={{
              fontSize: 8, color: sub, fontWeight: 600, marginTop: 1.5,
            }}>+{(combo - 1) * 50 * level} bonus pts</div>
          </div>
          <div style={{
            fontSize: 26, fontWeight: 900,
            color: combo >= 5 ? "#c084fc" : "#f87171",
            fontFamily: "'JetBrains Mono', monospace",
            animation: combo >= 5 ? "comboShake 0.5s ease-in-out" : undefined,
            textShadow: `0 0 20px ${combo >= 5 ? "rgba(192,132,252,0.68)" : "rgba(248,113,113,0.58)"}`,
            position: "relative",
          }}>×{combo}</div>
        </div>
      ) : (
        <div style={{ height: 40, flexShrink: 0 }} />
      )}

      <div style={{ height: 8, flexShrink: 0 }} />

      {/* ══ HOLD + NEXT ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0 }}>
        <div>
          <div style={{
            fontSize: 8, color: sub, textTransform: "uppercase",
            letterSpacing: "0.11em", fontWeight: 800, marginBottom: 5,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            Hold
            <KeyBadge value={bindings.hold} card={card} border={border} text={sub} small />
          </div>
          <div className="piece-preview-card" style={{
            display: "flex", justifyContent: "center",
            background: card, border: `1.5px solid ${border}`,
            borderRadius: 11, padding: "6px 4px",
            boxShadow: isDark
              ? "inset 0 1px 0 rgba(255,255,255,0.02), 0 3px 10px rgba(0,0,0,0.20)"
              : "inset 0 1px 0 rgba(255,255,255,0.96), 0 2px 8px rgba(0,0,0,0.055)",
          }}>
            <HoldPiece piece={hold} isDark={isDark} locked={holdLocked} />
          </div>
        </div>
        <div>
          <div style={{
            fontSize: 8, color: sub, textTransform: "uppercase",
            letterSpacing: "0.11em", fontWeight: 800, marginBottom: 5,
          }}>Next Up</div>
          <div className="piece-preview-card" style={{
            display: "flex", justifyContent: "center",
            background: card, border: `1.5px solid ${border}`,
            borderRadius: 11, padding: "6px 4px",
            boxShadow: isDark
              ? "inset 0 1px 0 rgba(255,255,255,0.02), 0 3px 10px rgba(0,0,0,0.20)"
              : "inset 0 1px 0 rgba(255,255,255,0.96), 0 2px 8px rgba(0,0,0,0.055)",
          }}>
            <NextPiece piece={next} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* ══ SPACER ══ */}
      <div style={{ flex: 1 }} />

      {/* ══ QUICK KEYS ══ */}
      <div style={{
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.052)" : "rgba(0,0,0,0.068)"}`,
        paddingTop: 9, flexShrink: 0, marginBottom: 8,
      }}>
        <div style={{
          fontSize: 8, color: sub, textTransform: "uppercase",
          letterSpacing: "0.12em", fontWeight: 800, marginBottom: 6,
        }}>Quick Keys</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 6px" }}>
          {([
            { action: "Left",      key: bindings.left     },
            { action: "Right",     key: bindings.right    },
            { action: "Soft Drop", key: bindings.down     },
            { action: "Rotate",    key: bindings.rotate   },
            { action: "Hard Drop", key: bindings.hardDrop },
            { action: "Hold",      key: bindings.hold     },
            { action: "Pause",     key: bindings.pause    },
          ] as const).map(({ action, key }) => (
            <div key={action} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 8.5, color: sub, fontWeight: 600 }}>{action}</span>
              <KeyBadge value={key} card={card} border={border} text={text} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ ACTION BUTTONS ══ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        {!started || gameOver ? (
          <PrimaryBtn onClick={onStart} accent={accent}>
            {gameOver ? "🔄  Play Again" : "▶  Start Game"}
          </PrimaryBtn>
        ) : (
          <PrimaryBtn onClick={onTogglePause}
            accent={running ? "#374151" : accent} glow={running}>
            {running ? "⏸  Pause" : "▶  Resume"}
          </PrimaryBtn>
        )}

        {started && !gameOver && (
          <SecondaryBtn onClick={onStart} border={border} sub={sub}>
            ↺  Restart
          </SecondaryBtn>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <SecondaryBtn onClick={onOpenControls} border={border} sub={sub}>⌨  Keys</SecondaryBtn>
          <SecondaryBtn onClick={onOpenGuide}    border={border} sub={sub}>📖  Guide</SecondaryBtn>
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ───────────────────────────────────────────────────────── */
function KeyBadge({ value, card, border, text, small }: {
  value: string; card: string; border: string; text: string; small?: boolean;
}) {
  return (
    <span style={{
      fontSize: small ? 7.5 : 8.5,
      fontWeight: 800, color: text,
      background: card, border: `1px solid ${border}`,
      borderRadius: 5, padding: small ? "1px 4px" : "1.5px 5.5px",
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: "-0.02em", whiteSpace: "nowrap",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
    }}>
      {fmtKey(value)}
    </span>
  );
}

function PrimaryBtn({ children, onClick, accent, glow, ariaLabel }: {
  children: React.ReactNode; onClick: () => void; accent: string; glow?: boolean; ariaLabel?: string;
}) {
  return (
    <button onClick={onClick} className="panel-primary-btn" aria-label={ariaLabel} style={{
      width: "100%", padding: "11px",
      borderRadius: 11,
      background: accent === "#374151"
        ? "rgba(55,65,81,0.88)"
        : `linear-gradient(135deg, #5a5fcf 0%, ${accent} 45%, #818cf8 100%)`,
      border: accent === "#374151"
        ? "1.5px solid rgba(255,255,255,0.09)"
        : "1.5px solid rgba(99,102,241,0.44)",
      color: "#fff", fontSize: 13, fontWeight: 700,
      letterSpacing: "0.025em", fontFamily: "inherit",
      boxShadow: glow
        ? "none"
        : `0 6px 28px rgba(99,102,241,0.46), inset 0 1px 0 rgba(255,255,255,0.22)`,
    }}>{children}</button>
  );
}

function SecondaryBtn({ children, onClick, border, sub }: {
  children: React.ReactNode; onClick: () => void; border: string; sub: string;
}) {
  return (
    <button onClick={onClick} className="panel-secondary-btn" style={{
      width: "100%", padding: "8px",
      borderRadius: 10, background: "transparent",
      border: `1.5px solid ${border}`,
      color: sub, fontSize: 11.5,
      fontWeight: 600, fontFamily: "inherit",
      letterSpacing: "0.01em",
    }}>{children}</button>
  );
}

function fmtKey(k: string): string {
  if (k === " ")          return "Spc";
  if (k === "ArrowLeft")  return "←";
  if (k === "ArrowRight") return "→";
  if (k === "ArrowDown")  return "↓";
  if (k === "ArrowUp")    return "↑";
  if (k === "Escape")     return "Esc";
  return k.length === 1 ? k.toUpperCase() : k;
}

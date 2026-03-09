import { Tetromino, KeyBindings } from "../hooks/useTetris";
import { NextPiece } from "./NextPiece";
import { HoldPiece } from "./HoldPiece";
import { ThemeConfig } from "../utils/themes";
import {
  hapticMove, hapticRotate, hapticHardDrop,
  hapticSoftDrop, hapticHold,
  hapticStart, hapticPause, hapticResume,
} from "../hooks/useHaptics";

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
  theme:      ThemeConfig;
  panelH:     number;
  orientation: "portrait" | "landscape";
  bindings?:  KeyBindings;
  audioMuted:     boolean;
  bgmMuted:       boolean;
  onStart:        () => void;
  onTogglePause:  () => void;
  onOpenControls: () => void;
  onOpenGuide:    () => void;
  onToggleTheme:  () => void;
  onToggleAudio:  () => void;
  onToggleBgm:    () => void;
  onMoveLeft:  () => void;
  onMoveRight: () => void;
  onRotate:    () => void;
  onHardDrop:  () => void;
  onHold:      () => void;
  onSoftDrop:  () => void;
}

export const TabletPanel: React.FC<Props> = ({
  score, bestScore, lines, level, combo,
  next, hold, holdLocked,
  running, started, gameOver,
  theme, panelH, orientation, bindings,
  audioMuted, bgmMuted,
  onStart, onTogglePause, onOpenControls, onOpenGuide, onToggleTheme, onToggleAudio, onToggleBgm,
  onMoveLeft, onMoveRight, onRotate, onHardDrop, onHold, onSoftDrop,
}) => {
  const isPortrait = orientation === "portrait";

  /* ── Theme tokens ── */
  const { bg, card, border, text, sub, accent, accent2: cyan, gold, isDark } = theme;
  const red = "#f87171";

  const levelColor =
    level >= 10 ? "#a855f7" :
    level >= 7  ? "#f87171" :
    level >= 5  ? "#fb923c" :
    level >= 3  ? "#facc15" : "#4ade80";

  /* ── Button sizes — larger than mobile, touch-friendly ── */
  const dpadSize     = isPortrait ? 68 : 60;
  const dpadBigSize  = isPortrait ? 78 : 68;
  const dpadFontSize = isPortrait ? 26 : 22;
  const dpadBigFont  = isPortrait ? 30 : 26;
  const labelFontSz  = isPortrait ? 8  : 7.5;

  /* ── D-pad button ── */
  const DPadBtn = ({
    label, icon, onClick, big, accentColor, haptic,
  }: {
    label: string; icon: string; onClick: () => void;
    big?: boolean; accentColor?: string; haptic?: () => void;
  }) => {
    const w = big ? dpadBigSize : dpadSize;
    return (
      <div
        onPointerDown={e => { e.preventDefault(); haptic?.(); onClick(); }}
        style={{
          padding: 12, margin: -12,
          touchAction: "manipulation", userSelect: "none",
          WebkitUserSelect: "none", WebkitTapHighlightColor: "transparent",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          zIndex: 10, cursor: "pointer",
        }}
      >
        <button
          className="dpad-btn"
        style={{
          width: w, height: w,
          borderRadius: big ? 22 : 18,
          background: accentColor
            ? `linear-gradient(145deg, ${accentColor}30, ${accentColor}16)`
            : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.055)",
          border: `2px solid ${accentColor ? `${accentColor}55` : border}`,
          color: accentColor ? accentColor : sub,
          fontFamily: "inherit",
          display: "flex", alignItems: "center",
          justifyContent: "center", flexDirection: "column", gap: 2,
          boxShadow: accentColor
            ? `0 6px 22px ${accentColor}35, inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.18)`
            : isDark
              ? "0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.22)"
              : "0 3px 10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
          pointerEvents: "none", // Let the wrapper handle touch
          cursor: "pointer", lineHeight: 1,
          position: "relative", overflow: "hidden",
        }}
        aria-label={label}
      >
        {/* Sheen */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "45%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.11), transparent)",
          pointerEvents: "none", borderRadius: "inherit",
        }} />
        <span style={{ fontSize: big ? dpadBigFont : dpadFontSize, lineHeight: 1, position: "relative" }}>{icon}</span>
        <span style={{
          fontSize: labelFontSz, fontWeight: 800, letterSpacing: "0.05em",
          color: accentColor ? `${accentColor}cc` : sub,
          textTransform: "uppercase", lineHeight: 1, marginTop: 2, position: "relative",
        }}>{label}</span>
      </button>
     </div>
    );
  };

  /* ── Action button ── */
  const ActionBtn = ({
    icon, label, onClick, accentColor, disabled, size = 56,
  }: {
    icon: string; label: string; onClick: () => void;
    accentColor?: string; disabled?: boolean; size?: number;
  }) => (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        padding: 12, margin: -12,
        touchAction: "manipulation", userSelect: "none",
        WebkitUserSelect: "none", WebkitTapHighlightColor: "transparent",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        zIndex: 10, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
      }}
    >
      <button
        disabled={disabled}
        className="mobile-action-btn"
      style={{
        width: size, height: size, borderRadius: Math.round(size * 0.28),
        background: accentColor
          ? `linear-gradient(145deg, ${accentColor}28, ${accentColor}14)`
          : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        border: `2px solid ${accentColor ? `${accentColor}50` : border}`,
        color: accentColor ? accentColor : sub, fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 2,
        touchAction: "none", pointerEvents: "none",
        WebkitTapHighlightColor: "transparent",
        boxShadow: accentColor
          ? `0 5px 20px ${accentColor}30, inset 0 1px 0 rgba(255,255,255,0.12)`
          : isDark
            ? "0 3px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        position: "relative", overflow: "hidden",
      }}
      aria-label={label}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "45%",
        background: "linear-gradient(to bottom, rgba(255,255,255,0.09), transparent)",
        pointerEvents: "none", borderRadius: "inherit",
      }} />
      <span style={{ fontSize: size * 0.36, position: "relative" }}>{icon}</span>
      <span style={{
        fontSize: size * 0.14, fontWeight: 800, letterSpacing: "0.05em",
        color: accentColor ? `${accentColor}cc` : sub,
        textTransform: "uppercase", lineHeight: 1, marginTop: 2, position: "relative",
      }}>{label}</span>
    </button>
  </div>
  );

  /* ── Stat card ── */
  const StatCard = ({ label, value, accentColor, fontColor }: {
    label: string; value: string; accentColor: string; fontColor?: string;
  }) => (
    <div className="mobile-stat-card" style={{
      flex: 1, background: card,
      border: `1.5px solid ${border}`,
      borderTop: `3px solid ${accentColor}`,
      borderRadius: 12, padding: isPortrait ? "6px 8px" : "7px 10px",
      textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${accentColor}12 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />
      <div style={{ fontSize: isPortrait ? 8.5 : 9, color: sub, textTransform: "uppercase",
        letterSpacing: "0.07em", fontWeight: 700 }}>{label}</div>
      <div style={{
        fontSize: isPortrait ? 16 : 18, fontWeight: 900,
        color: fontColor ?? text,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.5px",
      }}>{value}</div>
    </div>
  );

  /* ════════════════════════════════════════════════
     PORTRAIT — board on top, full-width panel below
     3-column: [previews + stats] [dpad] [actions]
  ════════════════════════════════════════════════ */
  if (isPortrait) {
    return (
      <div style={{
        width: "100%", height: panelH,
        background: bg,
        borderTop: `2px solid ${border}`,
        display: "flex", flexDirection: "column",
        overflow: "hidden", boxSizing: "border-box",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        boxShadow: isDark
          ? "0 -6px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 -3px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}>
        {/* Stats row */}
        <div style={{
          display: "flex", gap: 6, padding: "8px 12px 6px",
          alignItems: "stretch", flexShrink: 0,
          borderBottom: `1px solid ${border}`,
        }}>
          <StatCard label="Score" value={score.toLocaleString()} accentColor={accent} />
          <StatCard label="🏆 Best" value={bestScore.toLocaleString()} accentColor={gold} fontColor={gold} />
          <StatCard label="Level" value={String(level)} accentColor={levelColor} fontColor={levelColor} />
          <StatCard label="Lines" value={String(lines)} accentColor={cyan} fontColor={cyan} />
          {/* Theme toggle */}
          <button onClick={onToggleTheme} className="theme-toggle-btn" style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0, alignSelf: "center",
            background: card, border: `2px solid ${border}`,
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
          }}>{isDark ? "☀️" : "🌙"}</button>
          {/* Audio toggle */}
          <button onClick={onToggleAudio} aria-label={audioMuted ? "Unmute Sound" : "Mute Sound"} className="theme-toggle-btn" style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0, alignSelf: "center",
            background: card, border: `2px solid ${border}`,
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
          }}>{audioMuted ? "🔇" : "🔊"}</button>
          {/* BGM toggle */}
          <button onClick={onToggleBgm} aria-label={bgmMuted ? "Unmute Music" : "Mute Music"} className="theme-toggle-btn" style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0, alignSelf: "center",
            background: card, border: `2px solid ${border}`,
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
          }}>{bgmMuted ? "🎵" : "🎶"}</button>
        </div>

        {/* Controls row */}
        <div style={{
          display: "flex", flex: 1, minHeight: 0,
          alignItems: "center", justifyContent: "space-between",
          padding: "6px 14px", gap: 10,
        }}>
          {/* Left: Hold + Next + Combo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6,
            flexShrink: 0, alignItems: "center", minWidth: 80 }}>
            {combo > 1 ? (
              <div style={{
                background: combo >= 5
                  ? "linear-gradient(135deg,rgba(168,85,247,0.22),rgba(239,68,68,0.18))"
                  : "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(239,68,68,0.15))",
                border: `2px solid ${combo >= 5 ? "rgba(168,85,247,0.52)" : "rgba(245,158,11,0.48)"}`,
                borderRadius: 12, padding: "6px 10px", textAlign: "center",
                animation: "comboPop 0.24s cubic-bezier(0.34,1.56,0.64,1)",
                minWidth: 70,
              }}>
                <div style={{ fontSize: 8.5, color: combo >= 5 ? "#c084fc" : "#f59e0b",
                  fontWeight: 800, letterSpacing: "0.05em" }}>
                  {combo >= 5 ? "🔥 FIRE" : "🔥 COMBO"}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900,
                  color: combo >= 5 ? "#c084fc" : "#f87171",
                  fontFamily: "'JetBrains Mono', monospace" }}>×{combo}</div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 8, color: sub, textTransform: "uppercase",
                  letterSpacing: "0.08em", fontWeight: 700, marginBottom: 3 }}>Hold</div>
                <HoldPiece piece={hold} isDark={isDark} locked={holdLocked} />
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: sub, textTransform: "uppercase",
                letterSpacing: "0.08em", fontWeight: 700, marginBottom: 3 }}>Next</div>
              <NextPiece piece={next} isDark={isDark} />
            </div>
          </div>

          {/* Center: D-Pad */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 6 }}>
            <DPadBtn label="Rotate" icon="↻" onClick={onRotate}
              big accentColor={accent} haptic={hapticRotate} />
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <DPadBtn label="Left"  icon="←" onClick={onMoveLeft}  haptic={hapticMove} />
              <DPadBtn label="Drop"  icon="↓" onClick={onSoftDrop}  haptic={hapticSoftDrop} />
              <DPadBtn label="Right" icon="→" onClick={onMoveRight} haptic={hapticMove} />
            </div>
            <DPadBtn label="Hard↓" icon="⚡" onClick={onHardDrop}
              big accentColor={red} haptic={hapticHardDrop} />
          </div>

          {/* Right: Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6,
            flexShrink: 0, alignItems: "center", minWidth: 64 }}>
            <ActionBtn icon="📦" label={holdLocked ? "USED" : "Hold"}
              onClick={() => { hapticHold(); onHold(); }}
              accentColor={holdLocked ? undefined : cyan}
              disabled={holdLocked} />
            {!started || gameOver ? (
              <ActionBtn icon={gameOver ? "🔄" : "▶"}
                label={gameOver ? "Retry" : "Start"}
                onClick={() => { hapticStart(); onStart(); }}
                accentColor={accent} />
            ) : (
              <ActionBtn icon={running ? "⏸" : "▶"}
                label={running ? "Pause" : "Resume"}
                onClick={() => { running ? hapticPause() : hapticResume(); onTogglePause(); }}
                accentColor={running ? undefined : accent} />
            )}
            <ActionBtn icon="📖" label="Guide" onClick={onOpenGuide} />
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     LANDSCAPE — board left, panel right (side by side)
     Like a richer InfoPanel but with touch D-pad
  ════════════════════════════════════════════════ */
  return (
    <div style={{
      width: "100%", height: panelH,
      background: bg,
      border: `2px solid ${border}`,
      borderRadius: 16,
      display: "flex", flexDirection: "column",
      overflow: "hidden", boxSizing: "border-box",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      boxShadow: isDark
        ? "0 0 0 1px rgba(99,102,241,0.08), 0 20px 56px rgba(0,0,0,0.55)"
        : "0 0 0 1px rgba(99,102,241,0.06), 0 8px 32px rgba(0,0,0,0.09)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px 8px", borderBottom: `1px solid ${border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1 0%,#818cf8 50%,#22d3ee 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
            animation: "logoGlow 3s ease-in-out infinite", flexShrink: 0,
          }}>🎮</div>
          <span style={{
            fontSize: 16, fontWeight: 900, letterSpacing: "-0.5px",
            background: "linear-gradient(135deg,#6366f1 0%,#818cf8 50%,#22d3ee 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "titleShimmer 4s linear infinite",
          }}>TETRIS</span>
        </div>
        <button onClick={onToggleTheme} className="theme-toggle-btn" style={{
          background: card, border: `1.5px solid ${border}`,
          borderRadius: 9, width: 34, height: 34,
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.07)",
        }}>{isDark ? "☀️" : "🌙"}</button>
        <button onClick={onToggleAudio} aria-label={audioMuted ? "Unmute Sound" : "Mute Sound"} className="theme-toggle-btn" style={{
          background: card, border: `1.5px solid ${border}`,
          borderRadius: 9, width: 34, height: 34,
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.07)",
        }}><span style={{ position: "relative", top: 1 }}>{audioMuted ? "🔇" : "🔊"}</span></button>
        <button onClick={onToggleBgm} aria-label={bgmMuted ? "Unmute Music" : "Mute Music"} className="theme-toggle-btn" style={{
          background: "transparent", border: "none", width: 42, height: 42,
          fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          color: text, cursor: "pointer", marginLeft: 4,
        }}>
          <span style={{ position: "relative", top: 1 }}>{bgmMuted ? "🎵" : "🎶"}</span>
        </button>
      </div>

      {/* Score */}
      <div style={{ padding: "8px 14px 6px", flexShrink: 0 }}>
        <div className="stat-card" style={{
          background: card, border: `1.5px solid ${border}`,
          borderTop: `3px solid ${accent}`, borderRadius: 12,
          padding: "8px 12px", textAlign: "center",
          position: "relative", overflow: "hidden",
          boxShadow: isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 12px rgba(0,0,0,0.2)"
            : "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${accent}16 0%, transparent 65%)`,
            pointerEvents: "none",
          }} />
          <div style={{ fontSize: 9, color: sub, textTransform: "uppercase",
            letterSpacing: "0.12em", fontWeight: 700, marginBottom: 2 }}>Score</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: text,
            letterSpacing: "-1px", fontFamily: "'JetBrains Mono', monospace" }}>
            {score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Level + Lines + Best */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 6, padding: "0 14px 6px", flexShrink: 0 }}>
        <StatCard label="🏆" value={bestScore.toLocaleString()} accentColor={gold} fontColor={gold} />
        <StatCard label="Level" value={String(level)} accentColor={levelColor} fontColor={levelColor} />
        <StatCard label="Lines" value={String(lines)} accentColor={cyan} fontColor={cyan} />
      </div>

      {/* Hold + Next + Combo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 8, padding: "0 14px 6px", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 8, color: sub, textTransform: "uppercase",
            letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4, textAlign: "center" }}>
            Hold {bindings && <span style={{ fontSize: 7.5, opacity: 0.7 }}>
              ({bindings.hold === " " ? "Spc" : bindings.hold.toUpperCase()})
            </span>}
          </div>
          <div style={{
            display: "flex", justifyContent: "center",
            background: card, border: `1.5px solid ${border}`,
            borderRadius: 10, padding: "4px",
          }}>
            <HoldPiece piece={hold} isDark={isDark} locked={holdLocked} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: sub, textTransform: "uppercase",
            letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4, textAlign: "center" }}>
            Next Up
          </div>
          <div style={{
            display: "flex", justifyContent: "center",
            background: card, border: `1.5px solid ${border}`,
            borderRadius: 10, padding: "4px",
          }}>
            <NextPiece piece={next} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Combo badge */}
      {combo > 1 && (
        <div style={{ padding: "0 14px 6px", flexShrink: 0 }}>
          <div style={{
            background: combo >= 5
              ? "linear-gradient(135deg,rgba(168,85,247,0.18),rgba(239,68,68,0.16))"
              : "linear-gradient(135deg,rgba(245,158,11,0.14),rgba(239,68,68,0.13))",
            border: combo >= 5
              ? "1.5px solid rgba(168,85,247,0.48)" : "1.5px solid rgba(245,158,11,0.42)",
            borderRadius: 10, padding: "6px 10px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "comboPop 0.24s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <div>
              <div style={{ fontSize: 8.5, color: combo >= 5 ? "#c084fc" : "#f59e0b",
                fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {combo >= 5 ? "🔥 ON FIRE" : "🔥 COMBO"}
              </div>
              <div style={{ fontSize: 8, color: sub, fontWeight: 500 }}>
                +{(combo - 1) * 50 * level} pts
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900,
              color: combo >= 5 ? "#c084fc" : "#f87171",
              fontFamily: "'JetBrains Mono', monospace",
              textShadow: `0 0 14px ${combo >= 5 ? "rgba(192,132,252,0.6)" : "rgba(248,113,113,0.5)"}`,
            }}>×{combo}</div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* D-Pad */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 5, padding: "4px 14px 10px", flexShrink: 0,
      }}>
        <DPadBtn label="Rotate" icon="↻" onClick={onRotate}
          big accentColor={accent} haptic={hapticRotate} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <DPadBtn label="Left"  icon="←" onClick={onMoveLeft}  haptic={hapticMove} />
          <DPadBtn label="Drop"  icon="↓" onClick={onSoftDrop}  haptic={hapticSoftDrop} />
          <DPadBtn label="Right" icon="→" onClick={onMoveRight} haptic={hapticMove} />
        </div>
        <DPadBtn label="Hard↓" icon="⚡" onClick={onHardDrop}
          big accentColor={red} haptic={hapticHardDrop} />
      </div>

      {/* Action row */}
      <div style={{
        display: "flex", gap: 6, padding: "0 14px 12px",
        justifyContent: "center", flexShrink: 0,
      }}>
        <ActionBtn icon="📦" label={holdLocked ? "USED" : "Hold"}
          onClick={() => { hapticHold(); onHold(); }}
          accentColor={holdLocked ? undefined : cyan}
          disabled={holdLocked} size={48} />

        {!started || gameOver ? (
          <ActionBtn icon={gameOver ? "🔄" : "▶"}
            label={gameOver ? "Retry" : "Start"}
            onClick={() => { hapticStart(); onStart(); }}
            accentColor={accent} size={48} />
        ) : (
          <ActionBtn icon={running ? "⏸" : "▶"}
            label={running ? "Pause" : "Resume"}
            onClick={() => { running ? hapticPause() : hapticResume(); onTogglePause(); }}
            accentColor={running ? undefined : accent} size={48} />
        )}

        <ActionBtn icon="⌨️" label="Keys" onClick={onOpenControls} size={48} />
        <ActionBtn icon="📖" label="Guide" onClick={onOpenGuide} size={48} />
      </div>
    </div>
  );
};

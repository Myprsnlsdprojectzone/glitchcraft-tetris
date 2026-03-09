import { Tetromino } from "../hooks/useTetris";
import { NextPiece } from "./NextPiece";
import { HoldPiece } from "./HoldPiece";
import { ScoreHistory } from "./ScoreHistory";
import { ScoreEntry } from "../utils/scoreHistory";
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
  audioMuted:     boolean;
  bgmMuted:       boolean;
  scores:         ScoreEntry[];
  onStart:        () => void;
  onTogglePause:  () => void;
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

export const MobilePanel: React.FC<Props> = ({
  score, bestScore, lines, level, combo,
  next, hold, holdLocked,
  running, started, gameOver,
  theme, panelH,
  audioMuted, bgmMuted, scores,
  onStart, onTogglePause, onOpenGuide, onToggleTheme, onToggleAudio, onToggleBgm,
  onMoveLeft, onMoveRight, onRotate, onHardDrop, onHold, onSoftDrop,
}) => {
  const { bg, card, border, text, sub, accent, accent2: cyan, gold, isDark } = theme;

  const levelColor =
    level >= 10 ? "#a855f7" :
    level >= 7  ? "#f87171" :
    level >= 5  ? "#fb923c" :
    level >= 3  ? "#facc15" : "#4ade80";

  /* ── D-pad button ── */
  const DPadBtn = ({
    label, icon, onClick, big, accent: btnAccent, haptic,
  }: {
    label: string; icon: string; onClick: () => void;
    big?: boolean; accent?: string; haptic?: () => void;
  }) => (
    <button
      onPointerDown={e => { e.preventDefault(); haptic?.(); onClick(); }}
      className="dpad-btn"
      style={{
        width: big ? 58 : 50, height: big ? 58 : 50,
        borderRadius: big ? 17 : 13,
        background: btnAccent
          ? `linear-gradient(145deg, ${btnAccent}28, ${btnAccent}14)`
          : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.055)",
        border: `1.5px solid ${btnAccent ? `${btnAccent}50` : border}`,
        color: btnAccent ? btnAccent : sub,
        fontFamily: "inherit",
        display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column", gap: 1,
        boxShadow: btnAccent
          ? `0 5px 18px ${btnAccent}30, inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.15)`
          : isDark
            ? "0 3px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)"
            : "0 2px 8px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.95)",
        touchAction: "none", userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
        cursor: "pointer", lineHeight: 1,
        position: "relative", overflow: "hidden",
      }}
      aria-label={label}
    >
      {/* Sheen */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "45%",
        background: "linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)",
        pointerEvents: "none", borderRadius: "inherit",
      }} />
      <span style={{ fontSize: big ? 22 : 18, lineHeight: 1, position: "relative" }}>{icon}</span>
      <span style={{
        fontSize: 6.5, fontWeight: 800, letterSpacing: "0.05em",
        color: btnAccent ? `${btnAccent}cc` : sub,
        textTransform: "uppercase", lineHeight: 1, marginTop: 1,
        position: "relative",
      }}>{label}</span>
    </button>
  );

  /* ── Small action button ── */
  const ActionBtn = ({
    icon, label, onClick, accent: btnAccent, disabled, warning,
  }: {
    icon: string; label: string; onClick: () => void;
    accent?: string; disabled?: boolean; warning?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mobile-action-btn"
      style={{
        width: 50, height: 50, borderRadius: 14,
        background: btnAccent
          ? `linear-gradient(145deg, ${btnAccent}28, ${btnAccent}14)`
          : warning
            ? "rgba(248,113,113,0.08)"
            : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        border: `1.5px solid ${btnAccent ? `${btnAccent}50` : warning ? "rgba(248,113,113,0.3)" : border}`,
        color: btnAccent ? btnAccent : warning ? "#f87171" : sub,
        fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 1,
        opacity: disabled ? 0.38 : 1,
        touchAction: "none", cursor: disabled ? "not-allowed" : "pointer",
        WebkitTapHighlightColor: "transparent",
        boxShadow: btnAccent
          ? `0 4px 16px ${btnAccent}28, inset 0 1px 0 rgba(255,255,255,0.1)`
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 1px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        position: "relative", overflow: "hidden",
      }}
      aria-label={label}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "45%",
        background: "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)",
        pointerEvents: "none", borderRadius: "inherit",
      }} />
      <span style={{ fontSize: 18, position: "relative" }}>{icon}</span>
      <span style={{
        fontSize: 6.5, fontWeight: 800, letterSpacing: "0.05em",
        color: btnAccent ? `${btnAccent}bb` : warning ? "#f87171aa" : sub,
        textTransform: "uppercase", lineHeight: 1, marginTop: 1, position: "relative",
      }}>{label}</span>
    </button>
  );

  return (
    <div style={{
      width: "100%", height: panelH,
      background: bg,
      borderTop: `1.5px solid ${border}`,
      display: "flex", flexDirection: "column",
      overflow: "hidden", boxSizing: "border-box",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: isDark
        ? "0 -4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
        : "0 -2px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
    }}>

      {/* ── Stats bar ── */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "5px 8px 4px", gap: 5, flexShrink: 0,
        borderBottom: `1px solid ${border}`,
        background: isDark
          ? "linear-gradient(135deg, rgba(6,10,20,0.72), rgba(10,16,30,0.65))"
          : "linear-gradient(135deg, rgba(240,248,255,0.72), rgba(232,242,255,0.65))",
        boxShadow: isDark
          ? "inset 0 -1px 0 rgba(99,102,241,0.10)"
          : "inset 0 -1px 0 rgba(99,102,241,0.07)",
      }}>
        {/* Score */}
        <MiniCard label="Score" value={score.toLocaleString()} accent={accent}
          card={card} border={border} text={text} sub={sub} />
        {/* Best */}
        <MiniCard label="🏆 Best" value={bestScore.toLocaleString()} accent={gold}
          card={card} border={border} text={gold} sub={gold} />
        {/* Level */}
        <MiniCard label="Level" value={String(level)} accent={levelColor}
          card={card} border={border} text={levelColor} sub={sub} />
        {/* Lines */}
        <MiniCard label="Lines" value={String(lines)} accent={cyan}
          card={card} border={border} text={cyan} sub={sub} />

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: card, border: `1.5px solid ${border}`,
            fontSize: 15, display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: isDark
              ? "0 2px 8px rgba(0,0,0,0.3)"
              : "0 1px 6px rgba(0,0,0,0.08)",
          }}
        >{isDark ? "☀️" : "🌙"}</button>
        {/* Audio toggle */}
        <button
          onClick={onToggleAudio}
          aria-label={audioMuted ? "Unmute Sound" : "Mute Sound"}
          className="theme-toggle-btn"
          style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: card, border: `1.5px solid ${border}`,
            fontSize: 15, display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: isDark
              ? "0 2px 8px rgba(0,0,0,0.3)"
              : "0 1px 6px rgba(0,0,0,0.08)",
          }}
        ><span style={{ position: "relative", top: 1 }}>{audioMuted ? "🔇" : "🔊"}</span></button>

        <button
          onClick={onToggleBgm}
          aria-label={bgmMuted ? "Unmute Music" : "Mute Music"}
          className="theme-toggle-btn"
          style={{
            background: "transparent", border: "none",
            width: 44, height: 44, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginLeft: 8,
          }}
        ><span style={{ position: "relative", top: 1 }}>{bgmMuted ? "🎵" : "🎶"}</span></button>
      </div>

      {/* ── Top-3 compact leaderboard ── */}
      {scores.length > 0 && (
        <div style={{
          padding: "3px 8px",
          borderBottom: `1px solid ${border}`,
          background: isDark ? "rgba(6,10,20,0.55)" : "rgba(240,248,255,0.65)",
        }}>
          <ScoreHistory scores={scores} isDark={isDark} limit={3} compact />
        </div>
      )}

      {/* ── Main controls row ── */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "5px 8px", gap: 7,
        flex: 1, minHeight: 0, overflow: "hidden",
      }}>

        {/* Left: Hold + Next (or combo) */}
        <div style={{
          display: "flex", flexDirection: "column",
          gap: 5, flexShrink: 0, alignItems: "center",
        }}>
          {combo > 1 ? (
            <div style={{
              background: combo >= 5
                ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(239,68,68,0.18))"
                : "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(239,68,68,0.15))",
              border: `1.5px solid ${combo >= 5 ? "rgba(168,85,247,0.52)" : "rgba(245,158,11,0.48)"}`,
              borderRadius: 10, padding: "4px 8px", textAlign: "center",
              animation: "comboPop 0.24s cubic-bezier(0.34,1.56,0.64,1)",
              minWidth: 58,
              boxShadow: `0 4px 14px ${combo >= 5 ? "rgba(168,85,247,0.2)" : "rgba(245,158,11,0.15)"}`,
            }}>
              <div style={{
                fontSize: 7.5, color: combo >= 5 ? "#c084fc" : "#f59e0b",
                fontWeight: 800, letterSpacing: "0.05em",
              }}>{combo >= 5 ? "🔥 FIRE" : "🔥 COMBO"}</div>
              <div style={{
                fontSize: 20, fontWeight: 900,
                color: combo >= 5 ? "#c084fc" : "#f87171",
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: `0 0 12px ${combo >= 5 ? "rgba(192,132,252,0.6)" : "rgba(248,113,113,0.5)"}`,
              }}>×{combo}</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 7, color: sub, textTransform: "uppercase",
                letterSpacing: "0.08em", fontWeight: 700,
                textAlign: "center", marginBottom: 3 }}>Hold</div>
              <HoldPiece piece={hold} isDark={isDark} locked={holdLocked} />
            </div>
          )}

          <div>
            <div style={{ fontSize: 7, color: sub, textTransform: "uppercase",
              letterSpacing: "0.08em", fontWeight: 700,
              textAlign: "center", marginBottom: 3 }}>Next</div>
            <NextPiece piece={next} isDark={isDark} />
          </div>
        </div>

        {/* Center: D-Pad */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 5,
        }}>
          {/* Rotate */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DPadBtn label="Rotate" icon="↻" onClick={onRotate}
              big accent={accent} haptic={hapticRotate} />
          </div>
          {/* Left, Drop, Right */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <DPadBtn label="Left"  icon="←" onClick={onMoveLeft}  haptic={hapticMove} />
            <DPadBtn label="Drop"  icon="↓" onClick={onSoftDrop}  haptic={hapticSoftDrop} />
            <DPadBtn label="Right" icon="→" onClick={onMoveRight} haptic={hapticMove} />
          </div>
          {/* Hard Drop */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DPadBtn label="Hard↓" icon="⚡" onClick={onHardDrop}
              big accent="#f87171" haptic={hapticHardDrop} />
          </div>
        </div>

        {/* Right: Action buttons */}
        <div style={{
          display: "flex", flexDirection: "column",
          gap: 5, flexShrink: 0, alignItems: "center",
        }}>
          {/* Hold piece */}
          <ActionBtn
            icon="📦"
            label={holdLocked ? "USED" : "Hold"}
            onClick={() => { hapticHold(); onHold(); }}
            accent={holdLocked ? undefined : cyan}
            disabled={holdLocked}
          />

          {/* Start / Pause / Resume */}
          {!started || gameOver ? (
            <ActionBtn
              icon={gameOver ? "🔄" : "▶"}
              label={gameOver ? "Retry" : "Start"}
              onClick={() => { hapticStart(); onStart(); }}
              accent={accent}
            />
          ) : (
            <ActionBtn
              icon={running ? "⏸" : "▶"}
              label={running ? "Pause" : "Resume"}
              onClick={() => { running ? hapticPause() : hapticResume(); onTogglePause(); }}
              accent={running ? undefined : accent}
            />
          )}

          {/* Guide */}
          <ActionBtn icon="📖" label="Guide" onClick={onOpenGuide} />
        </div>
      </div>
    </div>
  );
};

/* ── Mini stat card ── */
function MiniCard({ label, value, accent, card, border, text, sub }: {
  label: string; value: string; accent: string;
  card: string; border: string; text: string; sub: string;
}) {
  return (
    <div className="mobile-stat-card" style={{
      flex: 1, background: card,
      border: `1px solid ${border}`,
      borderTop: `2.5px solid ${accent}`,
      borderRadius: 9, padding: "4px 6px", textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${accent}10 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />
      <div style={{ fontSize: 7.5, color: sub, textTransform: "uppercase",
        letterSpacing: "0.07em", fontWeight: 700, position: "relative" }}>{label}</div>
      <div style={{
        fontSize: 13, fontWeight: 900, letterSpacing: "-0.5px",
        fontFamily: "'JetBrains Mono', monospace", position: "relative",
        color: text,
        filter: `drop-shadow(0 0 4px ${accent}66)`,
      }}>{value}</div>
    </div>
  );
}

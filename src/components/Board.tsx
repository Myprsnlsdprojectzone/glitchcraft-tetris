import { useMemo } from "react";
import { Board as BoardType, Tetromino } from "../hooks/useTetris";

interface Props {
  board:     BoardType;
  current:   Tetromino | null;
  ghost:     Tetromino | null;
  flashRows: number[];
  isDark:    boolean;
  cellSize?: number;
}

const BOARD_W = 10;
const BOARD_H = 20;

/* ── Color helpers ─────────────────────────────────────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("");
}
function lighten(hex: string, amount: number): string {
  if (!hex.startsWith("#") || hex.length < 7) return hex;
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}
function darken(hex: string, amount: number): string {
  if (!hex.startsWith("#") || hex.length < 7) return hex;
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}
function hexAlpha(hex: string, alpha: string): string {
  if (!hex.startsWith("#") || hex.length < 7) return hex;
  return hex + alpha;
}

export const Board: React.FC<Props> = ({
  board, current, ghost, flashRows, isDark, cellSize = 34,
}) => {
  const C = cellSize;

  /* ── Merge ghost + current onto board for display ── */
  const displayBoard = useMemo(() => {
    const grid = board.map(row => row.map(cell => ({ ...cell })));

    if (ghost) {
      ghost.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (!val) return;
          const ny = ghost.y + r, nx = ghost.x + c;
          if (ny >= 0 && ny < BOARD_H && nx >= 0 && nx < BOARD_W && !grid[ny][nx].filled) {
            grid[ny][nx] = { filled: false, color: ghost.color + "44" };
          }
        });
      });
    }

    if (current) {
      current.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (!val) return;
          const ny = current.y + r, nx = current.x + c;
          if (ny >= 0 && ny < BOARD_H && nx >= 0 && nx < BOARD_W) {
            grid[ny][nx] = { filled: true, color: current.color };
          }
        });
      });
    }

    return grid;
  }, [board, current, ghost]);

  const flashSet = useMemo(() => new Set(flashRows), [flashRows]);

  /* ── Current piece bounding box for ambient glow ── */
  const currentGlow = useMemo(() => {
    if (!current) return null;
    const minC = Math.min(...current.shape.flatMap((r) =>
      r.map((v, ci) => v ? ci : 99)).filter(x => x < 99));
    const maxC = Math.max(...current.shape.flatMap((r) =>
      r.map((v, ci) => v ? ci : -1)).filter(x => x >= 0));
    const minR = current.shape.findIndex(r => r.some(v => v));
    const maxR = current.shape.length - 1 - [...current.shape].reverse().findIndex(r => r.some(v => v));
    const cx = (current.x + minC + current.x + maxC + 1) / 2;
    const cy = (current.y + minR + current.y + maxR + 1) / 2;
    return { cx, cy, color: current.color };
  }, [current]);

  const borderColor = isDark ? "#1a3458" : "#c0d4ec";
  const bgColor     = isDark ? "#060c1a" : "#f2f6fc";
  const gridColor   = isDark ? "rgba(255,255,255,0.022)" : "rgba(0,0,0,0.036)";

  return (
    <div
      data-game-board="true"
      role="img"
      aria-label="Tetris game board"
      style={{
        position:   "relative",
        width:      BOARD_W * C,
        height:     BOARD_H * C,
        border:     `2px solid ${borderColor}`,
        borderRadius: 12,
        overflow:   "hidden",
        background: bgColor,
        flexShrink: 0,
        willChange: "contents",
        boxShadow: isDark
          ? [
              "0 0 0 1px rgba(99,102,241,0.10)",
              "0 0 64px rgba(99,102,241,0.13)",
              "0 24px 64px rgba(0,0,0,0.72)",
              "inset 0 1px 0 rgba(255,255,255,0.04)",
              "inset 0 0 42px rgba(0,0,0,0.32)",
            ].join(", ")
          : [
              "0 0 0 1px rgba(99,102,241,0.07)",
              "0 12px 42px rgba(0,0,0,0.12)",
              "inset 0 1px 0 rgba(255,255,255,0.88)",
              "inset 0 0 32px rgba(0,0,0,0.022)",
            ].join(", "),
      }}
    >
      {/* ── Ambient piece glow ── */}
      {currentGlow && isDark && (
        <div style={{
          position:  "absolute",
          left:      currentGlow.cx * C - C * 2.5,
          top:       currentGlow.cy * C - C * 2.5,
          width:     C * 5,
          height:    C * 5,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${currentGlow.color}26 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex:    1,
          filter:    "blur(2px)",
          transition: "left 0.08s, top 0.08s",
        }} />
      )}

      {/* ── Grid lines (SVG) ── */}
      <svg style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}>
        {Array.from({ length: BOARD_W + 1 }, (_, i) => (
          <line key={`v${i}`}
            x1={i * C} y1={0} x2={i * C} y2={BOARD_H * C}
            stroke={gridColor} strokeWidth={1}
          />
        ))}
        {Array.from({ length: BOARD_H + 1 }, (_, i) => (
          <line key={`h${i}`}
            x1={0} y1={i * C} x2={BOARD_W * C} y2={i * C}
            stroke={gridColor} strokeWidth={1}
          />
        ))}
      </svg>

      {/* ── Corner dot accents ── */}
      {[[0,0],[BOARD_W-1,0],[0,BOARD_H-1],[BOARD_W-1,BOARD_H-1]].map(([cx,cy]) => (
        <div key={`dot-${cx}-${cy}`} style={{
          position: "absolute",
          left: cx * C + C / 2 - 1.5,
          top:  cy * C + C / 2 - 1.5,
          width: 3, height: 3, borderRadius: "50%",
          background: isDark ? "rgba(99,102,241,0.20)" : "rgba(99,102,241,0.14)",
          pointerEvents: "none", zIndex: 1,
        }} />
      ))}

      {/* ── Line-clear flash overlays ── */}
      {flashRows.map(rowIdx => (
        <div key={`flash-${rowIdx}`} style={{
          position: "absolute", left: 0, top: rowIdx * C,
          width: BOARD_W * C, height: C,
          background: "rgba(255,255,255,0.97)",
          zIndex: 8, pointerEvents: "none",
          animation: "rowFlash 0.15s ease-out forwards",
          boxShadow: "0 0 22px rgba(255,255,255,0.85), 0 0 48px rgba(255,255,255,0.5)",
        }} />
      ))}

      {/* ── Cells ── */}
      {displayBoard.map((row, r) =>
        row.map((cell, c) => {
          if (!cell.color) return null;
          const isGhost = !cell.filled && cell.color.endsWith("44");
          const isFlash = flashSet.has(r);
          const pad     = 1;
          const inner   = C - pad * 2;
          const radius  = Math.max(3, C * 0.13);

          if (isGhost) {
            const ghostBase = cell.color.slice(0, 7);
            return (
              <div key={`${r}-${c}`} style={{
                position: "absolute",
                left: c * C + pad, top: r * C + pad,
                width: inner, height: inner,
                borderRadius: radius,
                border: `1.5px solid ${ghostBase}60`,
                background: `linear-gradient(148deg, ${ghostBase}14, ${ghostBase}07)`,
                zIndex: 1, pointerEvents: "none",
                boxShadow: `inset 0 1px 0 ${ghostBase}24`,
              }}>
                <div style={{
                  position: "absolute", top: 2, left: 2,
                  width: "52%", height: "38%",
                  borderRadius: Math.max(1, C * 0.06),
                  background: "rgba(255,255,255,0.11)",
                  pointerEvents: "none",
                }} />
              </div>
            );
          }

          const baseColor = isFlash ? "#ffffff" : cell.color;
          const isYellow  = baseColor === "#facc15";

          return (
            <div key={`${r}-${c}`} style={{
              position: "absolute",
              left: c * C + pad, top: r * C + pad,
              width: inner, height: inner,
              borderRadius: radius,
              background: isFlash
                ? "#ffffff"
                : [
                    "linear-gradient(150deg,",
                    `  ${lighten(baseColor, 0.34)} 0%,`,
                    `  ${baseColor} 36%,`,
                    `  ${darken(baseColor, 0.24)} 100%`,
                    ")",
                  ].join(""),
              border: `1.5px solid ${isFlash ? "#fff" : darken(baseColor, 0.15)}`,
              zIndex: isFlash ? 7 : 2,
              pointerEvents: "none",
              boxShadow: isFlash
                ? "0 0 20px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.7)"
                : [
                    `inset 0 1.5px 0 ${lighten(baseColor, 0.52)}`,
                    `inset 0 -1.5px 0 ${darken(baseColor, 0.34)}`,
                    `inset 1.5px 0 0 ${lighten(baseColor, 0.24)}`,
                    `inset -1.5px 0 0 ${darken(baseColor, 0.14)}`,
                    `0 2px 10px ${hexAlpha(darken(baseColor, 0.5), "55")}`,
                  ].join(", "),
              transition: isFlash ? "none" : "background 0.04s",
            }}>
              {/* Top-left specular highlight */}
              {!isFlash && (
                <div style={{
                  position: "absolute", top: 2, left: 2,
                  width:  Math.max(4, inner * 0.44),
                  height: Math.max(3, inner * 0.32),
                  borderRadius: Math.max(2, C * 0.08),
                  background: `rgba(255,255,255,${isYellow ? 0.65 : 0.44})`,
                  pointerEvents: "none",
                }} />
              )}
              {/* Bottom-right depth shadow */}
              {!isFlash && (
                <div style={{
                  position: "absolute", bottom: 1, right: 1,
                  width:  Math.max(3, inner * 0.32),
                  height: Math.max(2, inner * 0.22),
                  borderRadius: Math.max(1, C * 0.05),
                  background: "rgba(0,0,0,0.20)",
                  pointerEvents: "none",
                }} />
              )}
              {/* Subtle side sheen */}
              {!isFlash && C >= 20 && (
                <div style={{
                  position: "absolute", top: "30%", left: 1, bottom: "20%",
                  width: 2,
                  background: `linear-gradient(to bottom, ${lighten(baseColor, 0.3)}44, transparent)`,
                  borderRadius: 2,
                  pointerEvents: "none",
                }} />
              )}
            </div>
          );
        })
      )}

      {/* ── Top vignette ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: C * 2.8,
        background: isDark
          ? "linear-gradient(to bottom, rgba(6,12,26,0.44) 0%, transparent 100%)"
          : "linear-gradient(to bottom, rgba(242,246,252,0.48) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* ── Bottom vignette ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: C * 1.4,
        background: isDark
          ? "linear-gradient(to top, rgba(6,12,26,0.24) 0%, transparent 100%)"
          : "linear-gradient(to top, rgba(242,246,252,0.22) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* ── Static scanline overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.016) 2px, rgba(0,0,0,0.016) 4px)",
        pointerEvents: "none", zIndex: 4,
      }} />

      {/* ── Moving CRT scan line ── */}
      <div className="scan-line-move" />

      {/* ── Left/right inner shadow ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: isDark
          ? "linear-gradient(to right, rgba(0,0,0,0.13) 0%, transparent 9%, transparent 91%, rgba(0,0,0,0.13) 100%)"
          : "linear-gradient(to right, rgba(0,0,0,0.04) 0%, transparent 9%, transparent 91%, rgba(0,0,0,0.04) 100%)",
        pointerEvents: "none", zIndex: 5,
      }} />
    </div>
  );
};

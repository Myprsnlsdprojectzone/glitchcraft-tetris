import { Tetromino } from "../hooks/useTetris";

interface Props {
  piece:  Tetromino | null;
  isDark: boolean;
  locked: boolean;
}

const PREVIEW_SIZE = 4;
const CELL = 22;

export const HoldPiece: React.FC<Props> = ({ piece, isDark, locked }) => {
  const offsetX = piece ? Math.floor((PREVIEW_SIZE - piece.shape[0].length) / 2) : 0;
  const offsetY = piece ? Math.floor((PREVIEW_SIZE - piece.shape.length) / 2) : 0;

  const containerSize = PREVIEW_SIZE * CELL;

  return (
    <div
      style={{
        width:        containerSize,
        height:       containerSize,
        position:     "relative",
        borderRadius: 8,
        background:   isDark ? "#070c1a" : "#eef3fb",
        border:       `1.5px solid ${
          locked
            ? isDark ? "#1a2a3a" : "#d8e4f0"
            : isDark ? "#1e3450" : "#d0dcf0"
        }`,
        boxShadow:    isDark
          ? "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.04)"
          : "inset 0 2px 8px rgba(0,0,0,0.04)",
        overflow:     "hidden",
        transition:   "opacity 0.25s ease, border-color 0.25s ease",
        opacity:      locked ? 0.4 : 1,
      }}
    >
      {/* Empty state */}
      {!piece && (
        <div style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            4,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            border: `1.5px dashed ${isDark ? "#1e3450" : "#c8d6e8"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: isDark ? "#2d4a68" : "#b0c4de",
          }}>📦</div>
          <span style={{
            fontSize: 8, color: isDark ? "#2a3f58" : "#a0b4cc",
            fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          }}>empty</span>
        </div>
      )}

      {/* Locked shimmer overlay */}
      {locked && piece && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
          background: isDark
            ? "rgba(7,12,26,0.45)"
            : "rgba(244,248,255,0.45)",
          borderRadius: 7,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: 10, color: isDark ? "#3a5070" : "#94aec8",
            fontWeight: 700, letterSpacing: "0.04em",
          }}>USED</span>
        </div>
      )}

      {/* Inner color glow when unlocked */}
      {piece && !locked && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at center, ${piece.color}10 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* Piece cells */}
      {piece &&
        piece.shape.map((row, r) =>
          row.map((val, c) => {
            if (!val) return null;
            const rawColor = piece.color;
            const color    = locked
              ? isDark ? "#1e3a5f" : "#b8ccdf"
              : rawColor;

            return (
              <div
                key={`${r}-${c}`}
                style={{
                  position:     "absolute",
                  left:         (offsetX + c) * CELL + 1,
                  top:          (offsetY + r) * CELL + 1,
                  width:        CELL - 2,
                  height:       CELL - 2,
                  borderRadius: 4,
                  background:   locked
                    ? color
                    : [
                        "linear-gradient(145deg,",
                        `  ${lighten(color, 0.26)} 0%,`,
                        `  ${color} 45%,`,
                        `  ${darken(color, 0.16)} 100%`,
                        ")",
                      ].join(""),
                  border:    `1.5px solid ${locked ? darken(color, 0.1) : darken(color, 0.1)}`,
                  boxShadow: locked ? "none" : [
                    `inset 0 1px 0 ${lighten(color, 0.42)}`,
                    `inset 0 -1px 0 ${darken(color, 0.28)}`,
                    `0 2px 5px ${darken(color, 0.38)}55`,
                  ].join(", "),
                  transition: "background 0.22s ease, box-shadow 0.22s ease",
                }}
              >
                {!locked && (
                  <div style={{
                    position:     "absolute",
                    top:          1,
                    left:         1,
                    width:        Math.max(3, (CELL - 2) * 0.4),
                    height:       Math.max(2, (CELL - 2) * 0.28),
                    borderRadius: 2,
                    background:   `rgba(255,255,255,${rawColor === "#facc15" ? 0.5 : 0.36})`,
                    pointerEvents: "none",
                  }} />
                )}
              </div>
            );
          })
        )}
    </div>
  );
};

/* ── Colour helpers ── */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}
function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("");
}
function lighten(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return toHex(r + (255 - r) * a, g + (255 - g) * a, b + (255 - b) * a);
}
function darken(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return toHex(r * (1 - a), g * (1 - a), b * (1 - a));
}

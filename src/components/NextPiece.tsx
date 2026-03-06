import { Tetromino } from "../hooks/useTetris";

interface Props {
  piece: Tetromino;
  isDark: boolean;
}

const PREVIEW_SIZE = 4;
const CELL = 22;

export const NextPiece: React.FC<Props> = ({ piece, isDark }) => {
  const offsetX = Math.floor((PREVIEW_SIZE - piece.shape[0].length) / 2);
  const offsetY = Math.floor((PREVIEW_SIZE - piece.shape.length) / 2);

  const containerSize = PREVIEW_SIZE * CELL;

  return (
    <div
      style={{
        width:        containerSize,
        height:       containerSize,
        position:     "relative",
        borderRadius: 8,
        background:   isDark ? "#070c1a" : "#eef3fb",
        border:       `1.5px solid ${isDark ? "#1e3450" : "#d0dcf0"}`,
        boxShadow:    isDark
          ? "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.06)"
          : "inset 0 2px 8px rgba(0,0,0,0.04)",
        overflow:     "hidden",
      }}
    >
      {/* Inner glow when piece exists */}
      <div style={{
        position:  "absolute", inset: 0,
        background: `radial-gradient(ellipse at center, ${piece.color}0e 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {piece.shape.map((row, r) =>
        row.map((val, c) => {
          if (!val) return null;
          const color = piece.color;
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
                background:   [
                  "linear-gradient(145deg,",
                  `  ${lighten(color, 0.26)} 0%,`,
                  `  ${color} 45%,`,
                  `  ${darken(color, 0.16)} 100%`,
                  ")",
                ].join(""),
                border:    `1.5px solid ${darken(color, 0.1)}`,
                boxShadow: [
                  `inset 0 1px 0 ${lighten(color, 0.42)}`,
                  `inset 0 -1px 0 ${darken(color, 0.28)}`,
                  `0 2px 5px ${darken(color, 0.38)}55`,
                ].join(", "),
              }}
            >
              {/* Specular highlight */}
              <div style={{
                position:     "absolute",
                top:          1,
                left:         1,
                width:        Math.max(3, (CELL - 2) * 0.4),
                height:       Math.max(2, (CELL - 2) * 0.28),
                borderRadius: 2,
                background:   `rgba(255,255,255,${color === "#facc15" ? 0.5 : 0.36})`,
                pointerEvents: "none",
              }} />
            </div>
          );
        })
      )}
    </div>
  );
};

/* ── Colour helpers (duplicated here to keep component self-contained) ── */
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

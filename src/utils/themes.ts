/**
 * themes — GlitchCraft Tetris colour system
 *
 * Each ThemeConfig contains every colour token used by the app.
 * Components destructure what they need; `isDark` is a field on the
 * theme so all existing `isDark ? … : …` boolean checks still compile.
 */

export interface ThemeConfig {
  id:      string;
  name:    string;
  emoji:   string;   // shown on the cycle button in panel headers

  /** Boolean flag — controls existing conditional logic in components */
  isDark:  boolean;

  /* ─── Panel & overlay tokens ─── */
  bg:           string;  // main panel / app-level background
  card:         string;  // card / container background
  card2:        string;  // secondary / nested card background
  border:       string;  // border colour
  text:         string;  // primary text
  sub:          string;  // muted / secondary text
  accent:       string;  // primary accent (buttons, badges, glows)
  accent2:      string;  // secondary accent (combo, special highlights)
  gold:         string;  // score / best-score highlight

  /* ─── Board-specific tokens ─── */
  boardBg:      string;  // game board background
  boardBorder:  string;  // board outer border
  boardGrid:    string;  // SVG grid-line colour (rgba)
  boardGlowRgb: string;  // R,G,B values for rgba() board glow

  /* ─── App-level gradients & overlays ─── */
  bgGradient:     string;  // full CSS gradient for root background
  blobA:          string;  // ambient blob A (top-left)
  blobB:          string;  // ambient blob B (bottom-right)
  blobC:          string;  // ambient blob C (centre)
  blobD:          string;  // ambient blob D (top-right)
  overlayBg:      string;  // game-over / start overlay
  overlayBgPause: string;  // pause overlay (slightly more transparent)
  overlayText:    string;  // overlay heading text
  overlaySub:     string;  // overlay body / sub text
}

/* ══════════════════════════════════════════════════════════════════════
   THEME DEFINITIONS
══════════════════════════════════════════════════════════════════════ */

const NEON: ThemeConfig = {
  id: "neon", name: "Neon", emoji: "🌌", isDark: true,
  // Panel
  bg:     "rgba(7,12,26,0.99)",
  card:   "rgba(6,11,22,0.98)",
  card2:  "rgba(10,18,32,0.92)",
  border: "#192d4a",
  text:   "#eef2ff",
  sub:    "#607a98",
  accent: "#6366f1",
  accent2:"#22d3ee",
  gold:   "#f59e0b",
  // Board
  boardBg:     "#060c1a",
  boardBorder: "#1a3458",
  boardGrid:   "rgba(255,255,255,0.022)",
  boardGlowRgb:"99,102,241",
  // App
  bgGradient: "radial-gradient(ellipse at 18% 18%, #0d1128 0%, #060b18 42%, #080d1e 72%, #0a0f20 100%)",
  blobA: "radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 68%)",
  blobB: "radial-gradient(circle,rgba(34,211,238,0.065) 0%,transparent 68%)",
  blobC: "radial-gradient(circle,rgba(168,85,247,0.045) 0%,transparent 68%)",
  blobD: "radial-gradient(circle,rgba(245,158,11,0.04) 0%,transparent 65%)",
  overlayBg:      "rgba(3,6,16,0.94)",
  overlayBgPause: "rgba(3,6,16,0.82)",
  overlayText:    "#f1f5f9",
  overlaySub:     "rgba(148,163,184,0.82)",
};

const SYNTHWAVE: ThemeConfig = {
  id: "synthwave", name: "Synthwave", emoji: "🌆", isDark: true,
  // Panel
  bg:     "rgba(16,4,38,0.99)",
  card:   "rgba(22,5,44,0.98)",
  card2:  "rgba(18,4,36,0.95)",
  border: "#3d1268",
  text:   "#ffe0ff",
  sub:    "#9b5ca8",
  accent: "#e040fb",
  accent2:"#00e5ff",
  gold:   "#ff6e6e",
  // Board
  boardBg:     "#0d0220",
  boardBorder: "#5a1a8a",
  boardGrid:   "rgba(224,64,251,0.04)",
  boardGlowRgb:"224,64,251",
  // App
  bgGradient: "radial-gradient(ellipse at 18% 18%, #1e0544 0%, #0d0220 42%, #110332 72%, #0f0228 100%)",
  blobA: "radial-gradient(circle,rgba(224,64,251,0.12) 0%,transparent 68%)",
  blobB: "radial-gradient(circle,rgba(0,229,255,0.08) 0%,transparent 68%)",
  blobC: "radial-gradient(circle,rgba(255,110,110,0.06) 0%,transparent 68%)",
  blobD: "radial-gradient(circle,rgba(224,64,251,0.06) 0%,transparent 65%)",
  overlayBg:      "rgba(10,2,24,0.94)",
  overlayBgPause: "rgba(10,2,24,0.82)",
  overlayText:    "#ffe0ff",
  overlaySub:     "rgba(155,92,168,0.90)",
};

const MATRIX: ThemeConfig = {
  id: "matrix", name: "Matrix", emoji: "💻", isDark: true,
  // Panel
  bg:     "rgba(0,6,0,0.99)",
  card:   "rgba(0,14,0,0.98)",
  card2:  "rgba(0,18,0,0.95)",
  border: "#003d00",
  text:   "#00ff41",
  sub:    "#007a1a",
  accent: "#00cc33",
  accent2:"#aaff00",
  gold:   "#aaff00",
  // Board
  boardBg:     "#000a00",
  boardBorder: "#005000",
  boardGrid:   "rgba(0,255,65,0.04)",
  boardGlowRgb:"0,255,65",
  // App
  bgGradient: "radial-gradient(ellipse at 18% 18%, #001a00 0%, #000600 42%, #000800 72%, #000a00 100%)",
  blobA: "radial-gradient(circle,rgba(0,255,65,0.10) 0%,transparent 68%)",
  blobB: "radial-gradient(circle,rgba(170,255,0,0.07) 0%,transparent 68%)",
  blobC: "radial-gradient(circle,rgba(0,204,51,0.05) 0%,transparent 68%)",
  blobD: "radial-gradient(circle,rgba(0,255,65,0.05) 0%,transparent 65%)",
  overlayBg:      "rgba(0,4,0,0.94)",
  overlayBgPause: "rgba(0,4,0,0.82)",
  overlayText:    "#00ff41",
  overlaySub:     "rgba(0,122,26,0.90)",
};

const OCEAN: ThemeConfig = {
  id: "ocean", name: "Ocean", emoji: "🌊", isDark: true,
  // Panel
  bg:     "rgba(2,18,30,0.99)",
  card:   "rgba(3,22,38,0.98)",
  card2:  "rgba(4,28,46,0.95)",
  border: "#0a3d5c",
  text:   "#e0f7ff",
  sub:    "#4a8fa8",
  accent: "#00bcd4",
  accent2:"#26c6da",
  gold:   "#80deea",
  // Board
  boardBg:     "#010e18",
  boardBorder: "#0a3d5c",
  boardGrid:   "rgba(0,188,212,0.04)",
  boardGlowRgb:"0,188,212",
  // App
  bgGradient: "radial-gradient(ellipse at 18% 18%, #04293d 0%, #011020 42%, #021828 72%, #011220 100%)",
  blobA: "radial-gradient(circle,rgba(0,188,212,0.10) 0%,transparent 68%)",
  blobB: "radial-gradient(circle,rgba(128,222,234,0.07) 0%,transparent 68%)",
  blobC: "radial-gradient(circle,rgba(0,188,212,0.05) 0%,transparent 68%)",
  blobD: "radial-gradient(circle,rgba(38,198,218,0.05) 0%,transparent 65%)",
  overlayBg:      "rgba(1,8,16,0.94)",
  overlayBgPause: "rgba(1,8,16,0.82)",
  overlayText:    "#e0f7ff",
  overlaySub:     "rgba(74,143,168,0.90)",
};

const GAMEBOY: ThemeConfig = {
  id: "gameboy", name: "Gameboy", emoji: "🎮", isDark: false,
  // Panel  (light olive LCD palette)
  bg:     "rgba(116,133,53,0.99)",
  card:   "rgba(139,172,15,0.98)",
  card2:  "rgba(155,188,15,0.98)",
  border: "#306230",
  text:   "#0f380f",
  sub:    "#306230",
  accent: "#0f380f",
  accent2:"#306230",
  gold:   "#306230",
  // Board
  boardBg:     "#8bac0f",
  boardBorder: "#306230",
  boardGrid:   "rgba(15,56,15,0.10)",
  boardGlowRgb:"15,56,15",
  // App
  bgGradient: "radial-gradient(ellipse at 18% 18%, #6e7c32 0%, #748535 42%, #7a8c3a 72%, #6e7c32 100%)",
  blobA: "radial-gradient(circle,rgba(15,56,15,0.10) 0%,transparent 68%)",
  blobB: "radial-gradient(circle,rgba(48,98,48,0.08) 0%,transparent 68%)",
  blobC: "radial-gradient(circle,rgba(15,56,15,0.06) 0%,transparent 68%)",
  blobD: "radial-gradient(circle,rgba(48,98,48,0.05) 0%,transparent 65%)",
  overlayBg:      "rgba(15,56,15,0.88)",
  overlayBgPause: "rgba(15,56,15,0.75)",
  overlayText:    "#9bbc0f",
  overlaySub:     "rgba(139,172,15,0.90)",
};

/* ── Ordered theme list (cycle order) ── */
export const THEME_ORDER = ["neon", "synthwave", "matrix", "ocean", "gameboy"] as const;
export type ThemeId = typeof THEME_ORDER[number];

export const THEMES: Record<string, ThemeConfig> = {
  neon:      NEON,
  synthwave: SYNTHWAVE,
  matrix:    MATRIX,
  ocean:     OCEAN,
  gameboy:   GAMEBOY,
};

/** Return the next theme ID in the cycle */
export function nextThemeId(current: string): string {
  const idx = THEME_ORDER.indexOf(current as ThemeId);
  return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
}

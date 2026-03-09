import { useState, useCallback, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTetris, KeyBindings, DEFAULT_BINDINGS, Tetromino } from "./hooks/useTetris";
import { useViewportScale } from "./hooks/useViewportScale";
import { useTouchControls } from "./hooks/useTouchControls";
import { setAudioEnabled } from "./hooks/useAudio";
import { isBgmEnabled, toggleBGM, startBGM, stopBGM } from "./hooks/useBGM";
import { getScores, addScore, ScoreEntry } from "./utils/scoreHistory";
import { submitGlobalScore } from "./utils/globalLeaderboard";
import { THEMES, nextThemeId, ThemeConfig } from "./utils/themes";
import { useAchievements } from "./hooks/useAchievements";
import { AchievementToast } from "./components/AchievementToast";
import { Board } from "./components/Board";
import { InfoPanel } from "./components/InfoPanel";
import { MobilePanel } from "./components/MobilePanel";
import { TabletPanel } from "./components/TabletPanel";
import { ControlsModal } from "./components/ControlsModal";
import { ManualGuide } from "./components/ManualGuide";

/* ══════════════════════════════════════════════════════════════════════
   BOARD RECT TRACKER
   Measures the [data-game-board] element's true screen position using
   getBoundingClientRect() — works through CSS transforms, zoom,
   scale(), overflow:hidden, device pixel ratio changes — everything.
══════════════════════════════════════════════════════════════════════ */
interface BoardRect { top: number; left: number; width: number; height: number; ready: boolean; }

function useBoardRect(ref: React.RefObject<HTMLElement | null>): BoardRect {
  const [rect, setRect] = useState<BoardRect>({ top: 0, left: 0, width: 0, height: 0, ready: false });

  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const canvas = ref.current.querySelector("[data-game-board]") as HTMLElement | null;
      const el = canvas ?? ref.current;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height, ready: true });
      }
    };

    measure();
    // Staggered re-measurements catch CSS transition settling + late paints
    const t1 = setTimeout(measure, 40);
    const t2 = setTimeout(measure, 150);
    const t3 = setTimeout(measure, 380);
    const t4 = setTimeout(measure, 700);

    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });

    // visualViewport fires on BOTH browser zoom (Ctrl+/-) AND pinch-zoom
    // This is the critical fix for zoom-in/out text misalignment
    const vvp = window.visualViewport;
    if (vvp) {
      vvp.addEventListener("resize", measure);
      vvp.addEventListener("scroll", measure);
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("scroll", measure);
      if (vvp) {
        vvp.removeEventListener("resize", measure);
        vvp.removeEventListener("scroll", measure);
      }
    };
  }, [ref]);

  return rect;
}

/* ── Natural desktop dimensions ──────────────────────────────────────── */
const CELL = 34;
const BOARD_W = 10 * CELL;
const BOARD_H = 20 * CELL;
const PANEL_W = 252;
const GAP = 22;
const NATURAL_W = BOARD_W + GAP + PANEL_W;
const NATURAL_H = BOARD_H;

/* ══════════════════════════════════════════════════════════════════════
   AMBIENT BLOB
══════════════════════════════════════════════════════════════════════ */
function AmbientBlob({ top, left, right, bottom, size, color, delay = "0s", duration = "10s" }: {
  top?: string; left?: string; right?: string; bottom?: string;
  size: number; color: string; delay?: string; duration?: string;
}) {
  return (
    <div style={{
      position: "absolute", top, left, right, bottom,
      width: size, height: size, borderRadius: "50%",
      background: color, pointerEvents: "none", filter: "blur(2px)",
      animation: `drift ${duration} ease-in-out infinite`,
      animationDelay: delay, willChange: "transform", zIndex: 0,
    }} />
  );
}

/* ══════════════════════════════════════════════════════════════════════
   INTERFACES
══════════════════════════════════════════════════════════════════════ */
interface GameState {
  board: any; current: Tetromino | null; ghost: Tetromino | null;
  flashRows: number[];
  next: Tetromino; hold: Tetromino | null; holdLocked: boolean;
  score: number; bestScore: number; lines: number; level: number; combo: number;
  gameOver: boolean; running: boolean; started: boolean;
  startGame: () => void; togglePause: () => void;
  moveLeft: () => void; moveRight: () => void; moveDown: () => void;
  rotatePiece: () => void; hardDrop: () => void; holdPiece: () => void;
}

interface UICallbacks {
  theme: ThemeConfig; bindings: KeyBindings;
  onToggleTheme: () => void; onOpenControls: () => void; onOpenGuide: () => void;
}

/* ══════════════════════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════════════════════ */
export default function App() {
  /* ── Theme ── */
  const [themeId, setThemeId] = useState<string>(
    () => localStorage.getItem("blockmaster_theme") ?? "neon"
  );
  const theme = THEMES[themeId] ?? THEMES.neon;

  const handleCycleTheme = useCallback(() => {
    setThemeId(prev => {
      const next = nextThemeId(prev);
      localStorage.setItem("blockmaster_theme", next);
      return next;
    });
  }, []);

  const [showControls, setShowControls] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [bindings, setBindings] = useState<KeyBindings>({ ...DEFAULT_BINDINGS });
  const [audioMuted, setAudioMuted] = useState<boolean>(
    () => localStorage.getItem("blockmaster_audio") === "off"
  );

  const handleToggleAudio = useCallback(() => {
    setAudioMuted(m => {
      const next = !m;
      setAudioEnabled(!next);
      localStorage.setItem("blockmaster_audio", next ? "off" : "on");
      return next;
    });
  }, []);

  const [bgmMuted, setBgmMuted] = useState<boolean>(!isBgmEnabled());

  const handleToggleBgm = useCallback(() => {
    const isNowPlaying = toggleBGM();
    setBgmMuted(!isNowPlaying);
  }, []);

  const { scale, isMobile, isTablet, layoutMode, vw, vh } =
    useViewportScale(NATURAL_W, NATURAL_H, 12);

  const handleSaveBindings = useCallback((b: KeyBindings) => setBindings(b), []);
  const gs = useTetris(bindings) as GameState;

  /* ── Score history ── */
  const [scores, setScores] = useState<ScoreEntry[]>(() => getScores());
  const prevGameOver = useRef(false);

  /* ── Achievements (observer — reads gs, writes localStorage) ── */
  const { achievements, toastQueue, dismissToast } = useAchievements(gs);

  useEffect(() => {
    // Fires exactly once when a started game transitions to game-over
    if (gs.started && gs.gameOver && !prevGameOver.current) {
      setScores(addScore(gs.score, gs.lines, gs.level));
      submitGlobalScore(gs.score, gs.lines, gs.level);
    }
    prevGameOver.current = gs.gameOver;
  }, [gs.gameOver, gs.started, gs.score, gs.lines, gs.level]);

  useEffect(() => {
    // Start BGM automatically when the user starts playing if not muted
    if (!bgmMuted) {
      if (gs.started && !gs.gameOver && gs.running) {
        startBGM();
      } else if (!gs.running) {
        stopBGM(); // Stop playing if paused or game over
      }
    } else {
      stopBGM();
    }
  }, [gs.started, gs.gameOver, gs.running, bgmMuted]);

  const boardRef = useRef<HTMLDivElement>(null);
  useTouchControls(boardRef as React.RefObject<HTMLElement | null>, {
    moveLeft: gs.moveLeft, moveRight: gs.moveRight, moveDown: gs.moveDown,
    rotatePiece: gs.rotatePiece, hardDrop: gs.hardDrop, holdPiece: gs.holdPiece,
    isRunning: () => gs.running,
  });

  /* ── Overlay tokens (from theme) ── */
  const { bgGradient, overlayBg, overlayBgPause, overlayText, overlaySub } = theme;

  /* ── Tablet sizes ── */
  const tabletPCell = Math.floor(Math.min((vw - 16) / 10, (vh * 0.58) / 20));
  const tabletPBoardH = tabletPCell * 20;
  const tabletPPanelH = Math.max(200, vh - tabletPBoardH - 20);
  const tabletLCell = Math.floor(Math.min((vw * 0.62 - 20) / 10, (vh - 32) / 20));
  const tabletLPanelW = Math.max(220, vw - tabletLCell * 10 - 48);

  /* ── Mobile sizes ── */
  const mobileCellSize = Math.floor(Math.min((vw - 8) / 10, (vh * 0.60) / 20));
  const mobilePanelH = Math.max(160, vh - mobileCellSize * 20 - 16);

  const isTabletPortrait = layoutMode === "tablet-portrait";
  const isTabletLandscape = layoutMode === "tablet-landscape";

  const ui: UICallbacks = {
    theme, bindings,
    onToggleTheme: handleCycleTheme,
    onOpenControls: () => setShowControls(true),
    onOpenGuide: () => setShowGuide(true),
  };

  const overlayConfig = {
    overlayBg, overlayBgPause, overlayText, overlaySub, isDark: theme.isDark, gs,
    onGuide: ui.onOpenGuide,
  };

  const overlaySize: "mobile" | "tablet" | "desktop" =
    isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: bgGradient, transition: "background 0.7s ease",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Ambient blobs */}
      <AmbientBlob top="5%" left="3%" size={560} color={theme.blobA} duration="12s" />
      <AmbientBlob bottom="7%" right="4%" size={460} color={theme.blobB} duration="15s" delay="4s" />
      <AmbientBlob top="42%" left="43%" size={340} color={theme.blobC} duration="20s" delay="7s" />
      <AmbientBlob top="15%" right="12%" size={280} color={theme.blobD} duration="17s" delay="2s" />

      {/* ════ MOBILE ════ */}
      {isMobile && (
        <div style={{
          position: "fixed", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", overflow: "hidden",
        }}>
          <div ref={boardRef} style={{
            flexShrink: 0, position: "relative",
            touchAction: "none", userSelect: "none", marginTop: 4,
          }}>
            <Board board={gs.board} current={gs.current} ghost={gs.ghost}
              flashRows={gs.flashRows} theme={theme} cellSize={mobileCellSize} />
          </div>
          <div style={{ width: "100%", flex: 1, minHeight: 0, flexShrink: 0 }}>
            <MobilePanel
              score={gs.score} bestScore={gs.bestScore} lines={gs.lines}
              level={gs.level} combo={gs.combo}
              next={gs.next} hold={gs.hold} holdLocked={gs.holdLocked}
              running={gs.running} started={gs.started} gameOver={gs.gameOver}
              theme={theme} panelH={mobilePanelH}
              audioMuted={audioMuted} onToggleAudio={handleToggleAudio}
              bgmMuted={bgmMuted} onToggleBgm={handleToggleBgm}
              scores={scores}
              onStart={gs.startGame} onTogglePause={gs.togglePause}
              onOpenGuide={ui.onOpenGuide}
              onToggleTheme={ui.onToggleTheme}
              onMoveLeft={gs.moveLeft} onMoveRight={gs.moveRight}
              onRotate={gs.rotatePiece} onHardDrop={gs.hardDrop}
              onHold={gs.holdPiece} onSoftDrop={gs.moveDown}
            />
          </div>
        </div>
      )}

      {/* ════ TABLET PORTRAIT ════ */}
      {isTabletPortrait && (
        <div style={{
          position: "fixed", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", overflow: "hidden",
        }}>
          <div ref={boardRef} style={{
            flexShrink: 0, position: "relative",
            touchAction: "none", userSelect: "none", marginTop: 8,
          }}>
            <Board board={gs.board} current={gs.current} ghost={gs.ghost}
              flashRows={gs.flashRows} theme={theme} cellSize={tabletPCell} />
          </div>
          <div style={{ width: "100%", flex: 1, minHeight: 0, flexShrink: 0 }}>
            <TabletPanel
              score={gs.score} bestScore={gs.bestScore} lines={gs.lines}
              level={gs.level} combo={gs.combo}
              next={gs.next} hold={gs.hold} holdLocked={gs.holdLocked}
              running={gs.running} started={gs.started} gameOver={gs.gameOver}
              theme={theme} panelH={tabletPPanelH} orientation="portrait"
              audioMuted={audioMuted} onToggleAudio={handleToggleAudio}
              bgmMuted={bgmMuted} onToggleBgm={handleToggleBgm}
              onStart={gs.startGame} onTogglePause={gs.togglePause}
              onOpenControls={ui.onOpenControls} onOpenGuide={ui.onOpenGuide}
              onToggleTheme={ui.onToggleTheme}
              onMoveLeft={gs.moveLeft} onMoveRight={gs.moveRight}
              onRotate={gs.rotatePiece} onHardDrop={gs.hardDrop}
              onHold={gs.holdPiece} onSoftDrop={gs.moveDown}
            />
          </div>
        </div>
      )}

      {/* ════ TABLET LANDSCAPE ════ */}
      {isTabletLandscape && (
        <div style={{
          position: "fixed", inset: 0,
          display: "flex", flexDirection: "row",
          alignItems: "center", justifyContent: "center",
          gap: 16, padding: "12px 16px", overflow: "hidden",
        }}>
          <div ref={boardRef} style={{
            flexShrink: 0, position: "relative",
            touchAction: "none", userSelect: "none",
            height: tabletLCell * 20,
          }}>
            <Board board={gs.board} current={gs.current} ghost={gs.ghost}
              flashRows={gs.flashRows} theme={theme} cellSize={tabletLCell} />
          </div>
          <div style={{ width: tabletLPanelW, height: tabletLCell * 20, flexShrink: 0 }}>
            <TabletPanel
              score={gs.score} bestScore={gs.bestScore} lines={gs.lines}
              level={gs.level} combo={gs.combo}
              next={gs.next} hold={gs.hold} holdLocked={gs.holdLocked}
              running={gs.running} started={gs.started} gameOver={gs.gameOver}
              theme={theme} panelH={tabletLCell * 20} orientation="landscape"
              bindings={bindings}
              audioMuted={audioMuted} onToggleAudio={handleToggleAudio}
              bgmMuted={bgmMuted} onToggleBgm={handleToggleBgm}
              onStart={gs.startGame} onTogglePause={gs.togglePause}
              onOpenControls={ui.onOpenControls} onOpenGuide={ui.onOpenGuide}
              onToggleTheme={ui.onToggleTheme}
              onMoveLeft={gs.moveLeft} onMoveRight={gs.moveRight}
              onRotate={gs.rotatePiece} onHardDrop={gs.hardDrop}
              onHold={gs.holdPiece} onSoftDrop={gs.moveDown}
            />
          </div>
        </div>
      )}

      {/* ════ DESKTOP ════ */}
      {!isMobile && !isTablet && (
        <div style={{
          width: NATURAL_W, height: NATURAL_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          display: "flex", flexDirection: "row",
          alignItems: "flex-start", gap: GAP,
          flexShrink: 0,
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {theme.isDark && <div className="board-neon-aura" />}
            <div ref={boardRef} className={`game-board-wrapper gradient-border${gs.running ? " board-glow-border" : ""}`}>
              <Board board={gs.board} current={gs.current} ghost={gs.ghost}
                flashRows={gs.flashRows} theme={theme} cellSize={CELL} />
            </div>
          </div>
          <div style={{ width: PANEL_W, flexShrink: 0, height: NATURAL_H }}>
            <InfoPanel
              score={gs.score} bestScore={gs.bestScore} lines={gs.lines}
              level={gs.level} combo={gs.combo}
              next={gs.next} hold={gs.hold} holdLocked={gs.holdLocked}
              running={gs.running} started={gs.started} gameOver={gs.gameOver}
              theme={theme} bindings={bindings} panelH={NATURAL_H}
              audioMuted={audioMuted} onToggleAudio={handleToggleAudio}
              bgmMuted={bgmMuted} onToggleBgm={handleToggleBgm}
              scores={scores} achievements={achievements}
              onStart={gs.startGame} onTogglePause={gs.togglePause}
              onOpenControls={ui.onOpenControls} onOpenGuide={ui.onOpenGuide}
              onToggleTheme={ui.onToggleTheme}
            />
          </div>
        </div>
      )}

      {/* ════ PORTAL OVERLAY — renders over the board via fixed positioning ════ */}
      <GameOverlays
        boardRef={boardRef as React.RefObject<HTMLElement | null>}
        size={overlaySize}
        {...overlayConfig}
      />

      {/* Portaled Modals */}
      {showControls && (
        <ControlsModal bindings={bindings} onSave={handleSaveBindings}
          onClose={() => setShowControls(false)} isDark={theme.isDark} />
      )}
      {showGuide && (
        <ManualGuide onClose={() => setShowGuide(false)}
          isDark={theme.isDark} bindings={bindings} />
      )}
      {/* Achievement toast notifications — fixed bottom-right, app-level */}
      <AchievementToast toastQueue={toastQueue} theme={theme} onDismiss={dismissToast} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   GAME OVERLAYS — Portal-based, rect-tracked, fully zoom-proof
   All font/spacing sizes are derived from the ACTUAL board pixel rect
   so they recompute perfectly whenever the user zooms in or out.
══════════════════════════════════════════════════════════════════════ */
interface OverlayConfig {
  size: "mobile" | "tablet" | "desktop";
  overlayBg: string; overlayBgPause: string;
  overlayText: string; overlaySub: string;
  isDark: boolean; gs: GameState;
  onGuide: () => void;
  boardRef: React.RefObject<HTMLElement | null>;
}

function GameOverlays({
  size, overlayBg, overlayBgPause, overlayText, overlaySub,
  isDark, gs, onGuide, boardRef,
}: OverlayConfig) {
  const rect = useBoardRect(boardRef);

  const showOverlay =
    (!gs.started && !gs.gameOver) ||
    gs.gameOver ||
    (gs.started && !gs.running && !gs.gameOver);

  if (!showOverlay || !rect.ready) return null;

  /* ── All sizes proportional to the ACTUAL rendered board rect ──────────
     When browser zoom changes → visualViewport fires → rect re-measures
     → all sizes recompute instantly → text & layout stay perfectly aligned
     at ANY zoom level (25% – 300%), on any device, any DPR               */
  const rw = rect.width;
  const rh = rect.height;
  const bu = Math.min(rw, rh) / 100; // 1% of shorter dimension = base unit

  const isDesktop = size === "desktop";
  const isMobileSz = size === "mobile";

  // All derived — clamp prevents extremes at very high/low zoom
  const c = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));

  const logoSz = c(bu * 11, 28, 90);
  const titleSz = c(bu * 9, 18, 72);
  const subSz = c(bu * 2.1, 8, 18);
  const btnPadV = c(bu * 2.5, 7, 22);
  const btnPadH = c(rw * 0.08, 14, 60);
  const btnFsz = c(bu * 2.7, 10, 20);
  const btnMinW = c(rw * 0.52, 120, 320);
  const skullSz = c(bu * 9.5, 24, 80);
  const goTitleSz = c(bu * 7.8, 18, 64);
  const scoreSz = c(bu * 5.2, 16, 48);
  const pauseSz = c(bu * 9.5, 24, 80);
  const pauseTxt = c(bu * 5.2, 16, 48);
  const statFsz = c(bu * 3.6, 12, 32);
  const statLbl = c(bu * 1.72, 7, 14);
  const statPadH = c(bu * 2.5, 10, 32);
  const pillFsz = c(bu * 1.9, 7, 16);
  const hintFsz = c(bu * 1.85, 7, 15);
  const bestFsz = c(bu * 2.0, 8, 16);
  const finalScoreLbl = c(bu * 1.6, 7, 14);
  const cardPadV = c(bu * 2.2, 6, 22);
  const cardPadH = c(rw * 0.07, 10, 40);
  const cardRad = c(bu * 2.2, 8, 22);
  const rowGap = c(bu * 1.4, 5, 16);
  const mb1 = c(bu * 1.2, 4, 16);
  const mb2 = c(bu * 1.8, 6, 20);
  const mb3 = c(bu * 2.0, 7, 22);
  const mb4 = c(bu * 3.5, 10, 36);
  const maxW = c(rw * 0.92, 160, 560);
  const padH = c(rw * 0.04, 4, 28);

  const content = (
    <div style={{
      position: "fixed",
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 9990,
      borderRadius: 12,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: showOverlay ? "auto" : "none",
    }}>

      {/* ── WELCOME ── */}
      {!gs.started && !gs.gameOver && (
        <OverlayWrap bg={overlayBg} isDark={isDark}>
          <div style={{
            animation: "slideUp 0.5s cubic-bezier(0.34,1.1,0.64,1) both",
            textAlign: "center", width: "100%",
            maxWidth: maxW, padding: `0 ${padH}px`,
            boxSizing: "border-box",
          }}>
            <LogoIcon size={logoSz} />
            <TitleText size={titleSz} />
            <Subtitle size={subSz}>Minimalist · Smooth · Polished</Subtitle>

            {/* Feature pills — only desktop with enough height */}
            {isDesktop && rh > 440 && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: rowGap - 2,
                justifyContent: "center", marginBottom: mb3
              }}>
                {["👻 Ghost", "📦 Hold", "🔥 Combos", "🏆 Best", "⚡ Drop", "🎮 Touch", "🌙 Themes", "🔊 Haptics"].map(f => (
                  <span key={f} className="feature-pill" style={{
                    fontSize: pillFsz, fontWeight: 600,
                    padding: `${c(bu * 0.7, 3, 8)}px ${c(bu * 1.8, 7, 16)}px`,
                    borderRadius: 20,
                    background: isDark ? "rgba(99,102,241,0.13)" : "rgba(99,102,241,0.09)",
                    border: "1px solid rgba(99,102,241,0.28)",
                    color: isDark ? "#a5b4fc" : "#6366f1",
                    letterSpacing: "0.03em", display: "inline-block",
                  }}>{f}</span>
                ))}
              </div>
            )}

            {/* Gesture grid — tablet & mobile */}
            {!isDesktop && (
              <GestureGrid compact={isMobileSz} isDark={isDark} bu={bu} rw={rw} />
            )}

            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: rowGap
            }}>
              <OverlayBtn onClick={gs.startGame} variant="primary"
                padV={btnPadV} padH={btnPadH} fontSize={btnFsz} minW={btnMinW}>
                ▶&nbsp;&nbsp;Start Game
              </OverlayBtn>
              <OverlayBtn onClick={onGuide} variant="ghost"
                padV={btnPadV} padH={btnPadH} fontSize={btnFsz} minW={btnMinW}>
                📖&nbsp;&nbsp;Player's Manual
              </OverlayBtn>
            </div>

            {isDesktop && (
              <div style={{
                textAlign: "center", marginTop: mb3 + 4,
                color: isDark ? "rgba(100,116,139,0.6)" : "rgba(100,116,139,0.75)",
                fontSize: hintFsz, fontWeight: 500, letterSpacing: "0.03em"
              }}>
                Arrows / WASD &nbsp;·&nbsp; Space = Hard Drop &nbsp;·&nbsp; C = Hold
              </div>
            )}
          </div>
        </OverlayWrap>
      )}

      {/* ── GAME OVER ── */}
      {gs.gameOver && (
        <OverlayWrap bg={overlayBg} isDark={isDark}>
          <div style={{
            animation: "slideUp 0.45s cubic-bezier(0.34,1.1,0.64,1) both",
            textAlign: "center",
            padding: `0 ${padH}px`,
            width: "100%", maxWidth: maxW,
            boxSizing: "border-box",
          }}>
            <div style={{
              fontSize: skullSz, marginBottom: mb1,
              animation: "skullBounce 2.2s ease-in-out infinite",
              filter: "drop-shadow(0 4px 16px rgba(248,113,113,0.5))",
            }}>💀</div>

            <div style={{
              fontSize: goTitleSz, fontWeight: 900,
              letterSpacing: `${-Math.round(goTitleSz * 0.04)}px`,
              color: "#f87171", lineHeight: 1,
              marginBottom: mb2,
              textShadow: "0 0 36px rgba(248,113,113,0.55), 0 4px 12px rgba(0,0,0,0.4)",
            }}>GAME OVER</div>

            {/* Score card */}
            <div style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              border: `1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
              borderTop: "2px solid rgba(99,102,241,0.45)",
              borderRadius: cardRad,
              padding: `${cardPadV}px ${cardPadH}px`,
              marginBottom: mb2,
              boxShadow: isDark
                ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.35)"
                : "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                fontSize: finalScoreLbl, color: overlaySub, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: mb1
              }}>
                Final Score
              </div>
              <div style={{
                fontSize: scoreSz, fontWeight: 900, color: overlayText,
                letterSpacing: `${-Math.round(scoreSz * 0.05)}px`,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {gs.score.toLocaleString()}
              </div>
            </div>

            {gs.score > 0 && gs.score >= gs.bestScore && <BestBadge fontSize={bestFsz} padH={cardPadH} />}
            {gs.score > 0 && gs.score < gs.bestScore && (
              <div style={{
                fontSize: bestFsz, color: overlaySub,
                marginBottom: mb2, fontWeight: 600, letterSpacing: "0.02em"
              }}>
                🏆 Best: {gs.bestScore.toLocaleString()}
              </div>
            )}

            {/* Stats row */}
            <div style={{
              display: "flex", gap: rowGap,
              justifyContent: "center", marginBottom: mb3, flexWrap: "wrap"
            }}>
              <StatMini label="Lines" value={gs.lines} isDark={isDark}
                overlayText={overlayText} overlaySub={overlaySub}
                fsz={statFsz} lbl={statLbl} padH={statPadH} bu={bu} />
              <StatMini label="Level" value={gs.level} isDark={isDark}
                overlayText={overlayText} overlaySub={overlaySub}
                fsz={statFsz} lbl={statLbl} padH={statPadH} bu={bu} />
            </div>

            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: rowGap
            }}>
              <OverlayBtn onClick={gs.startGame} variant="primary"
                padV={btnPadV} padH={btnPadH} fontSize={btnFsz} minW={btnMinW}>
                🔄&nbsp;&nbsp;Play Again
              </OverlayBtn>
              <OverlayBtn onClick={onGuide} variant="ghost"
                padV={btnPadV} padH={btnPadH} fontSize={btnFsz} minW={btnMinW}>
                📖&nbsp;&nbsp;View Manual
              </OverlayBtn>
            </div>
          </div>
        </OverlayWrap>
      )}

      {/* ── PAUSED ── */}
      {gs.started && !gs.running && !gs.gameOver && (
        <OverlayWrap bg={overlayBgPause} isDark={isDark}>
          <div style={{
            animation: "slideUp 0.32s ease-out both", textAlign: "center",
            maxWidth: maxW, width: "100%", boxSizing: "border-box",
            padding: `0 ${padH}px`
          }}>
            <div style={{
              fontSize: pauseSz, lineHeight: 1,
              marginBottom: mb3,
              animation: "float 2.8s ease-in-out infinite",
              filter: "drop-shadow(0 4px 16px rgba(99,102,241,0.4))",
            }}>⏸</div>
            <div style={{
              fontSize: pauseTxt, fontWeight: 900,
              letterSpacing: `${-Math.round(pauseTxt * 0.05)}px`,
              color: overlayText, marginBottom: mb1,
              textShadow: isDark ? "0 2px 20px rgba(99,102,241,0.3)" : "none",
            }}>PAUSED</div>
            <div style={{
              fontSize: c(bu * 2.0, 9, 16),
              color: overlaySub, fontWeight: 500,
              marginBottom: mb4,
              letterSpacing: "0.01em",
            }}>
              Your board is safely preserved
            </div>
            <OverlayBtn onClick={gs.togglePause} variant="primary"
              padV={btnPadV} padH={btnPadH} fontSize={btnFsz} minW={btnMinW}>
              ▶&nbsp;&nbsp;Resume Game
            </OverlayBtn>
          </div>
        </OverlayWrap>
      )}
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

/* ══════════════════════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
══════════════════════════════════════════════════════════════════════ */
function OverlayWrap({ children, bg, isDark }: {
  children: React.ReactNode; bg: string; isDark: boolean;
}) {
  return (
    <div className="overlay-shimmer" style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "16px 20px",
      background: bg,
      backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
      zIndex: 2,
      animation: "overlayFadeIn 0.38s ease-out both",
      boxShadow: isDark
        ? "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.12)"
        : "inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -1px 0 rgba(0,0,0,0.04)",
      overflowY: "auto",
    }}>{children}</div>
  );
}

function OverlayBtn({ children, onClick, variant, padV, padH, fontSize, minW }: {
  children: React.ReactNode; onClick: () => void; variant: "primary" | "ghost";
  padV: number; padH: number; fontSize: number; minW: number;
}) {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick}
      className={`overlay-btn${isPrimary ? "" : " overlay-btn-ghost"}`}
      style={{
        padding: `${padV}px ${padH}px`, borderRadius: 16,
        background: isPrimary
          ? "linear-gradient(145deg, #4f54c8 0%, #6366f1 38%, #7c81f5 72%, #818cf8 100%)"
          : "rgba(255,255,255,0.065)",
        border: isPrimary
          ? "1.5px solid rgba(129,140,248,0.55)"
          : "1.5px solid rgba(255,255,255,0.13)",
        color: isPrimary ? "#fff" : "rgba(203,213,225,0.88)",
        fontSize, fontWeight: 700, letterSpacing: "0.03em",
        minWidth: minW, fontFamily: "inherit", cursor: "pointer",
        boxShadow: isPrimary
          ? [
            "0 8px 36px rgba(99,102,241,0.58)",
            "0 2px 8px rgba(0,0,0,0.25)",
            "inset 0 1.5px 0 rgba(255,255,255,0.28)",
            "inset 0 -1px 0 rgba(0,0,0,0.18)",
          ].join(", ")
          : "none",
      }}
    >{children}</button>
  );
}

function LogoIcon({ size }: { size: number }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", marginBottom: size * 0.18 }}>
      <div style={{
        position: "absolute", inset: -size * 0.12,
        borderRadius: size * 0.36,
        border: "1.5px solid rgba(99,102,241,0.28)",
        animation: "statRipple 2.8s ease-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: size * 0.26,
        background: "linear-gradient(145deg, #4f54c8 0%, #6366f1 38%, #818cf8 72%, #22d3ee 100%)",
        fontSize: size * 0.46, position: "relative",
        boxShadow: [
          "0 14px 48px rgba(99,102,241,0.65)",
          "0 0 0 1px rgba(255,255,255,0.16)",
          "inset 0 1.5px 0 rgba(255,255,255,0.28)",
          "inset 0 -1px 0 rgba(0,0,0,0.22)",
        ].join(", "),
        animation: "logoGlow 3.2s ease-in-out infinite",
      }}>🎮</div>
    </div>
  );
}


function TitleText({ size }: { size: number }) {
  return (
    <img
      src="/logo.png"
      alt="GlitchCraft"
      draggable={false}
      style={{
        height: Math.max(40, size * 1.4),
        maxWidth: "80%",
        objectFit: "contain",
        display: "block",
        margin: "0 auto 8px",
        filter: "drop-shadow(0 0 18px rgba(99,102,241,0.7)) drop-shadow(0 0 6px rgba(34,211,238,0.45))",
        animation: "logoGlow 3s ease-in-out infinite",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    />
  );
}

function Subtitle({ children, size }: { children: React.ReactNode; size: number }) {
  return (
    <div style={{
      textAlign: "center", color: "rgba(148,163,184,0.82)",
      fontSize: size, fontWeight: 600, letterSpacing: "0.15em",
      textTransform: "uppercase", marginBottom: Math.max(12, size * 2.2),
    }}>{children}</div>
  );
}

function BestBadge({ fontSize, padH }: { fontSize: number; padH: number }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: Math.round(fontSize * 0.55),
      background: "rgba(245,158,11,0.13)", border: "1.5px solid rgba(245,158,11,0.42)",
      borderRadius: 24, padding: `${Math.round(fontSize * 0.38)}px ${padH}px`,
      marginBottom: Math.round(fontSize * 0.9),
      color: "#fbbf24", fontSize, fontWeight: 800,
      animation: "bestPulse 1.8s ease-in-out infinite",
      boxShadow: "0 4px 20px rgba(245,158,11,0.22)",
      letterSpacing: "0.02em",
    }}>🏆 New Best Score!</div>
  );
}

function StatMini({ label, value, isDark, overlayText, overlaySub, fsz, lbl, padH, bu }: {
  label: string; value: number | string;
  isDark: boolean; overlayText: string; overlaySub: string;
  fsz: number; lbl: number; padH: number; bu: number;
}) {
  return (
    <div style={{
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
      borderRadius: Math.round(bu * 2), padding: `${Math.round(bu * 1.2)}px ${padH}px`,
      textAlign: "center",
    }}>
      <div style={{
        fontSize: lbl, color: overlaySub, textTransform: "uppercase",
        letterSpacing: "0.1em", fontWeight: 700, marginBottom: Math.round(bu * 0.4)
      }}>{label}</div>
      <div style={{
        fontSize: fsz, fontWeight: 900, color: overlayText,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: `${-Math.round(fsz * 0.03)}px`
      }}>{value}</div>
    </div>
  );
}

function GestureGrid({ compact, isDark, bu, rw }: {
  compact: boolean; isDark: boolean; bu: number; rw: number;
}) {
  const gestures = [
    { icon: "👆", label: "Tap", desc: "Rotate" },
    { icon: "✌️", label: "Double Tap", desc: "Hard Drop" },
    { icon: "👈", label: "Swipe Left", desc: "Move Left" },
    { icon: "👉", label: "Swipe Right", desc: "Move Right" },
    { icon: "👇", label: "Swipe Down", desc: "Soft Drop" },
    { icon: "☝️", label: "Swipe Up", desc: "Rotate" },
    { icon: "✊", label: "Long Press", desc: "Hold Piece" },
    { icon: "⚡", label: "Fast Down", desc: "Hard Drop" },
  ];
  const iconSz = Math.max(12, Math.round(bu * 2.6));
  const lblSz = Math.max(7, Math.round(bu * 1.55));
  const descSz = Math.max(6.5, Math.round(bu * 1.45));
  const cellGap = Math.max(4, Math.round(bu * 0.9));
  const padV = Math.max(4, Math.round(bu * 1.1));
  const padH = Math.max(5, Math.round(rw * 0.025));
  const mb = Math.max(8, Math.round(bu * 2.0));
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: compact ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
      gap: cellGap,
      marginBottom: mb,
    }}>
      {gestures.map(({ icon, label, desc }) => (
        <div key={label} className="gesture-card" style={{
          background: isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
          borderRadius: Math.round(bu * 1.4),
          padding: `${padV}px ${padH}px`,
          display: "flex", alignItems: "center", gap: Math.max(4, Math.round(bu * 0.9)),
        }}>
          <span style={{ fontSize: iconSz }}>{icon}</span>
          <div>
            <div style={{
              fontSize: lblSz, fontWeight: 700,
              color: "#a5b4fc", letterSpacing: "0.03em"
            }}>{label}</div>
            <div style={{
              fontSize: descSz,
              color: "rgba(148,163,184,0.72)", fontWeight: 500
            }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

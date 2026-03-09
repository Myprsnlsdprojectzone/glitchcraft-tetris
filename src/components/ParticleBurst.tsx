/**
 * ParticleBurst — canvas-based particle explosion for line-clear events.
 *
 * Purely cosmetic. Observes `flashRows` (already produced by the game engine)
 * and spawns physics particles. Zero changes to game logic.
 *
 * Uses a single <canvas> overlay + requestAnimationFrame loop.
 * All rendering is off the React render path — zero re-renders per frame.
 */

import { useEffect, useRef, useCallback } from "react";
import { ThemeConfig } from "../utils/themes";

const BOARD_W = 10;
const BOARD_H = 20;

interface Particle {
  x: number;        // px from board left
  y: number;        // px from board top
  vx: number;       // px / frame
  vy: number;       // px / frame  (negative = upward)
  gravity: number;  // added to vy each frame
  life: number;     // 1 → 0
  decay: number;    // subtracted from life per frame
  color: string;    // CSS colour
  size: number;     // px radius / half-side
  rotation: number; // degrees
  rotSpeed: number; // degrees / frame
  shape: 0 | 1 | 2; // 0=circle  1=square  2=diamond
}

interface Props {
  flashRows: number[];
  cellSize:  number;
  theme:     ThemeConfig;
}

export const ParticleBurst: React.FC<Props> = ({ flashRows, cellSize, theme }) => {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const particlesRef   = useRef<Particle[]>([]);
  const rafRef         = useRef<number | null>(null);
  const loopRunning    = useRef(false);
  const prevFlashLen   = useRef(0);

  /* ── Animation loop — no deps needed (only reads refs) ── */
  const runLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { loopRunning.current = false; return; }
    const ctx = canvas.getContext("2d");
    if (!ctx)   { loopRunning.current = false; return; }

    /* physics update */
    particlesRef.current = particlesRef.current
      .map(p => ({
        ...p,
        x:        p.x + p.vx,
        y:        p.y + p.vy,
        vy:       p.vy + p.gravity,
        rotation: p.rotation + p.rotSpeed,
        life:     p.life - p.decay,
      }))
      .filter(p => p.life > 0.01);

    /* draw */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 1.5); // pop in, fade out at end
      ctx.fillStyle   = p.color;
      ctx.shadowBlur  = p.size * 4;
      ctx.shadowColor = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.shape === 0) {
        /* circle */
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 1) {
        /* square */
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        /* diamond (45° rotated square) */
        const h = p.size * 0.75;
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-h / 2, -h / 2, h, h);
      }

      ctx.restore();
    });

    if (particlesRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(runLoop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      loopRunning.current = false;
    }
  }, []); // stable — only reads refs

  /* ── Spawn on line-clear, then kick off loop ── */
  useEffect(() => {
    /* guard: only fire on the leading edge ([] → [rows]) */
    if (flashRows.length > 0 && prevFlashLen.current === 0) {
      const C        = cellSize;
      const boardW   = BOARD_W * C;
      const themeClrs: string[] = [
        theme.accent, theme.accent2, theme.gold,
        "#ffffff", theme.accent, theme.accent2,
      ];

      const newParticles: Particle[] = [];

      flashRows.forEach(rowIdx => {
        const centerY = rowIdx * C + C / 2;
        const COUNT   = 20; // per cleared row

        for (let i = 0; i < COUNT; i++) {
          const angle = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.9;
          const speed = 1.8 + Math.random() * 5;

          newParticles.push({
            x:        Math.random() * boardW,
            y:        centerY + (Math.random() - 0.5) * C * 0.6,
            vx:       Math.cos(angle) * speed,
            vy:       Math.sin(angle) * speed - 1.8, // upward bias
            gravity:  0.13,
            life:     1,
            decay:    0.011 + Math.random() * 0.012, // ~80–110 frames ≈ 1.3–1.8 s
            color:    themeClrs[Math.floor(Math.random() * themeClrs.length)],
            size:     3.5 + Math.random() * 5.5,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 14,
            shape:    Math.floor(Math.random() * 3) as 0 | 1 | 2,
          });
        }
      });

      particlesRef.current = [...particlesRef.current, ...newParticles];

      if (!loopRunning.current) {
        loopRunning.current = true;
        rafRef.current = requestAnimationFrame(runLoop);
      }
    }

    prevFlashLen.current = flashRows.length;
  }, [flashRows, cellSize, theme.accent, theme.accent2, theme.gold, runLoop]);

  /* ── Cleanup RAF on unmount ── */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const W = BOARD_W * cellSize;
  const H = BOARD_H * cellSize;

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-hidden="true"
      style={{
        position:      "absolute",
        top:           0,
        left:          0,
        width:         W,
        height:        H,
        pointerEvents: "none",
        zIndex:        9,           // above cells (z2) and flash (z7-8), below overlays
      }}
    />
  );
};

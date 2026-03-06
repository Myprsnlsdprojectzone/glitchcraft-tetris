import { useEffect, useRef, useCallback } from "react";
import { hapticMove, hapticRotate, hapticHardDrop, hapticSoftDrop } from "./useHaptics";

/**
 * Touch control system for mobile Tetris.
 *
 * Gestures on the BOARD element:
 *   • Swipe Left         → Move Left
 *   • Swipe Right        → Move Right
 *   • Swipe Down (fast)  → Soft Drop (repeating while held)
 *   • Swipe Up           → Rotate
 *   • Short Tap          → Rotate
 *   • Long Press (≥450ms)→ Hold Piece
 *   • Double Tap         → Hard Drop
 *
 * Thresholds are generous so they feel natural on phones.
 */

interface Actions {
  moveLeft:   () => void;
  moveRight:  () => void;
  moveDown:   () => void;
  rotatePiece:() => void;
  hardDrop:   () => void;
  holdPiece:  () => void;
  isRunning:  () => boolean;
}

const SWIPE_THRESHOLD   = 22;   // px — min distance to register a swipe
const LONG_PRESS_MS     = 420;  // ms — long press → hold piece
const DOUBLE_TAP_MS     = 280;  // ms — max interval between taps for double-tap
const SOFT_DROP_REPEAT  = 80;   // ms — repeat interval while swiping down

export function useTouchControls(
  boardRef: React.RefObject<HTMLElement | null>,
  actions: Actions,
) {
  const startX   = useRef(0);
  const startY   = useRef(0);
  const startT   = useRef(0);
  const moved    = useRef(false);           // did finger move enough?
  const longTimer= useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropTimer= useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTap  = useRef(0);
  const actRef   = useRef(actions);
  actRef.current = actions;

  const clearDropTimer = useCallback(() => {
    if (dropTimer.current) { clearInterval(dropTimer.current); dropTimer.current = null; }
  }, []);

  const clearLongTimer = useCallback(() => {
    if (longTimer.current) { clearTimeout(longTimer.current); longTimer.current = null; }
  }, []);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!actRef.current.isRunning()) return;
      const t = e.changedTouches[0];
      startX.current = t.clientX;
      startY.current = t.clientY;
      startT.current = Date.now();
      moved.current  = false;

      // Long-press → hold piece
      clearLongTimer();
      longTimer.current = setTimeout(() => {
        if (!moved.current) {
          actRef.current.holdPiece();
          moved.current = true; // prevent tap firing
        }
      }, LONG_PRESS_MS);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!actRef.current.isRunning()) return;
      e.preventDefault(); // prevent scroll while playing

      const t  = e.changedTouches[0];
      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;

      if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
        moved.current = true;
        clearLongTimer();
      }

      // Continuous soft drop while swiping down — haptic on each step
      if (dy > SWIPE_THRESHOLD && Math.abs(dx) < Math.abs(dy) * 0.7) {
        if (!dropTimer.current) {
          hapticSoftDrop();
          actRef.current.moveDown();
          dropTimer.current = setInterval(() => {
            hapticSoftDrop();
            actRef.current.moveDown();
          }, SOFT_DROP_REPEAT);
        }
      } else {
        clearDropTimer();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      clearLongTimer();
      clearDropTimer();

      if (!actRef.current.isRunning()) return;

      const t    = e.changedTouches[0];
      const dx   = t.clientX - startX.current;
      const dy   = t.clientY - startY.current;
      const dt   = Date.now() - startT.current;
      const adx  = Math.abs(dx);
      const ady  = Math.abs(dy);

      // ── Was it a quick tap (no real movement)? ──
      if (!moved.current && adx < SWIPE_THRESHOLD && ady < SWIPE_THRESHOLD) {
        const now = Date.now();
        if (now - lastTap.current < DOUBLE_TAP_MS) {
          // Double-tap → Hard Drop (haptic fires inside hardDrop action)
          lastTap.current = 0;
          actRef.current.hardDrop();
        } else {
          lastTap.current = now;
          // Single tap → Rotate (haptic fires inside rotatePiece action)
          setTimeout(() => {
            if (Date.now() - lastTap.current >= DOUBLE_TAP_MS) {
              actRef.current.rotatePiece();
            }
          }, DOUBLE_TAP_MS + 10);
        }
        return;
      }

      // ── Directional swipe ──
      if (!moved.current) return;

      // Horizontal swipe (left / right) — haptic fires inside moveLeft/moveRight
      if (adx > ady && adx > SWIPE_THRESHOLD) {
        if (dx < 0) {
          hapticMove();
          actRef.current.moveLeft();
        } else {
          hapticMove();
          actRef.current.moveRight();
        }
        return;
      }

      // Vertical swipe up → rotate — haptic fires inside rotatePiece
      if (ady > adx && dy < -SWIPE_THRESHOLD) {
        hapticRotate();
        actRef.current.rotatePiece();
        return;
      }

      // Fast downward swipe → hard drop — haptic fires inside hardDrop
      if (ady > adx && dy > SWIPE_THRESHOLD && dt < 250) {
        hapticHardDrop();
        actRef.current.hardDrop();
        return;
      }
    };

    const onTouchCancel = () => {
      clearLongTimer();
      clearDropTimer();
    };

    el.addEventListener("touchstart",  onTouchStart,  { passive: true  });
    el.addEventListener("touchmove",   onTouchMove,   { passive: false });
    el.addEventListener("touchend",    onTouchEnd,    { passive: true  });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true  });

    return () => {
      el.removeEventListener("touchstart",  onTouchStart);
      el.removeEventListener("touchmove",   onTouchMove);
      el.removeEventListener("touchend",    onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
      clearLongTimer();
      clearDropTimer();
    };
  }, [boardRef, clearDropTimer, clearLongTimer]);
}

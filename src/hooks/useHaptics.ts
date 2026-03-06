/**
 * useHaptics — Rich vibration feedback for mobile Tetris
 *
 * All patterns use the Web Vibration API (navigator.vibrate).
 * Gracefully no-ops on desktop / unsupported browsers.
 *
 * Pattern format: [vibrate, pause, vibrate, pause, ...]  (ms)
 *
 * Design philosophy:
 *   • Every game event has a UNIQUE, recognisable pattern
 *   • Intensity scales with significance (move < rotate < lock < clear < tetris)
 *   • Addictive feedback loop — players feel every action in their hands
 *   • Never annoying — patterns are short and purposeful
 */

/* ── Feature detection ──────────────────────────────────────────────────────── */
const canVibrate = (): boolean =>
  typeof navigator !== "undefined" &&
  typeof navigator.vibrate === "function";

function vibrate(pattern: number | number[]): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* noop — some browsers throw if vibration is blocked */
  }
}

/* ── Haptic pattern library ─────────────────────────────────────────────────── */

/**
 * Move left / right — barely-there micro-tick
 * Lets the player feel each cell movement without fatigue
 */
export function hapticMove(): void {
  vibrate(6);
}

/**
 * Rotate — crisp, snappy double-click feel
 * Distinct from move so player knows rotation happened
 */
export function hapticRotate(): void {
  vibrate([8, 4, 8]);
}

/**
 * Soft drop — subtle pulse per row descended
 * Gentle gravity feel
 */
export function hapticSoftDrop(): void {
  vibrate(5);
}

/**
 * Hard drop — sharp, firm impact thud
 * The piece slams down — player should feel it
 */
export function hapticHardDrop(): void {
  vibrate([12, 8, 40]);
}

/**
 * Piece lock (normal landing) — short firm buzz
 * Confirms piece has been placed
 */
export function hapticPieceLock(): void {
  vibrate([18, 6, 10]);
}

/**
 * Hold piece — distinctive double-tap feel
 * Clearly different from move/rotate
 */
export function hapticHold(): void {
  vibrate([10, 12, 10]);
}

/**
 * Single line clear — satisfying firm buzz
 */
export function hapticLineClear1(): void {
  vibrate([30, 10, 20]);
}

/**
 * Double line clear — two-beat punch
 */
export function hapticLineClear2(): void {
  vibrate([30, 10, 30, 10, 40]);
}

/**
 * Triple line clear — escalating three-beat rumble
 */
export function hapticLineClear3(): void {
  vibrate([30, 8, 40, 8, 50, 8, 60]);
}

/**
 * TETRIS (4 lines) — full dramatic triumph sequence
 * Long, powerful, unmistakable. Players will chase this feeling.
 */
export function hapticTetris(): void {
  vibrate([40, 10, 40, 10, 40, 10, 100, 20, 80]);
}

/**
 * Combo bonus — escalating beat based on streak count
 * Higher combos = more intense pattern
 */
export function hapticCombo(streak: number): void {
  if (streak <= 1) return;
  if (streak === 2) {
    vibrate([20, 10, 20]);
  } else if (streak === 3) {
    vibrate([20, 8, 25, 8, 30]);
  } else if (streak === 4) {
    vibrate([20, 6, 25, 6, 30, 6, 40]);
  } else if (streak === 5) {
    vibrate([20, 6, 25, 6, 30, 6, 40, 6, 55]);
  } else if (streak >= 6 && streak < 9) {
    // "ON FIRE" — rapid escalating
    vibrate([15, 5, 20, 5, 25, 5, 30, 5, 40, 5, 60]);
  } else {
    // INSANE combo ≥ 9 — long dramatic rumble
    vibrate([15, 4, 20, 4, 25, 4, 30, 4, 40, 4, 60, 10, 80, 15, 100]);
  }
}

/**
 * Level up — triumphant ascending multi-beat pattern
 * Distinctive enough that player recognises a level-up purely by feel
 */
export function hapticLevelUp(): void {
  vibrate([20, 10, 30, 10, 20, 8, 40, 8, 60, 12, 100]);
}

/**
 * Game over — long, descending death rattle
 * Sombre, final. Players will recognise this as "that's it"
 */
export function hapticGameOver(): void {
  vibrate([60, 20, 50, 20, 40, 20, 30, 20, 80]);
}

/**
 * Start game — quick welcome burst
 * Signals game has started
 */
export function hapticStart(): void {
  vibrate([15, 8, 25, 8, 40]);
}

/**
 * Pause — single medium pulse
 */
export function hapticPause(): void {
  vibrate(25);
}

/**
 * Resume — double-pulse, inverse of pause
 */
export function hapticResume(): void {
  vibrate([15, 10, 30]);
}

/**
 * Ghost piece reach (piece hits ghost position) — ultra-soft tick
 * Optional subtle cue that piece is at landing zone
 */
export function hapticGhostReach(): void {
  vibrate(4);
}

/* ── Dispatcher — maps n cleared lines to the right pattern ─────────────────── */
export function hapticLineClear(lines: number, combo: number): void {
  // Fire line-clear pattern first
  switch (lines) {
    case 1: hapticLineClear1(); break;
    case 2: hapticLineClear2(); break;
    case 3: hapticLineClear3(); break;
    case 4: hapticTetris();     break;
    default: break;
  }

  // Then schedule combo feedback after the line-clear pattern finishes
  // (so they don't overlap and cancel each other)
  if (combo > 1) {
    const delay = lines === 4 ? 320 : lines === 3 ? 200 : lines === 2 ? 140 : 80;
    setTimeout(() => hapticCombo(combo), delay);
  }
}

/* ── Hook — returns all haptic functions, memoised to stable references ──────── */
export function useHaptics() {
  return {
    hapticMove,
    hapticRotate,
    hapticSoftDrop,
    hapticHardDrop,
    hapticPieceLock,
    hapticHold,
    hapticLineClear,
    hapticLevelUp,
    hapticGameOver,
    hapticStart,
    hapticPause,
    hapticResume,
    hapticGhostReach,
    hapticCombo,
    canVibrate,
  };
}

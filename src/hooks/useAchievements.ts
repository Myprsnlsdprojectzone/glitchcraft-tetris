/**
 * useAchievements — observes existing GameState and unlocks badges.
 *
 * Pure observer: reads gs.flashRows, gs.combo, gs.level, gs.score,
 * gs.hold, gs.gameOver, gs.started.  Nothing inside useTetris.ts touched.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACHIEVEMENT_LIST,
  AchievementState,
  buildAchievementState,
  loadAchievements,
  saveAchievements,
} from "../utils/achievements";

/* ── Minimal interface — only what this hook needs to observe ── */
interface ObservedGameState {
  flashRows: number[];
  combo:     number;
  level:     number;
  score:     number;
  hold:      unknown;      // null = no hold, anything else = used
  gameOver:  boolean;
  started:   boolean;
}

export function useAchievements(gs: ObservedGameState) {
  /* ── Persistent unlock store (id → timestamp) ── */
  const unlockedRef = useRef<Record<string, number>>(loadAchievements());

  const [achievements, setAchievements] = useState<AchievementState[]>(
    () => buildAchievementState(unlockedRef.current)
  );
  const [toastQueue, setToastQueue] = useState<AchievementState[]>([]);

  /* ── Per-game trackers ── */
  const holdUsed      = useRef(false);  // did player use hold this game?
  const tetrisCount   = useRef(0);      // Tetris clears this game
  const prevStarted   = useRef(false);
  const prevFlashLen  = useRef(0);
  const prevGameOver  = useRef(false);

  /* ── Core unlock function — idempotent ── */
  const unlock = useCallback((ids: string[]) => {
    const now   = Date.now();
    const fresh: AchievementState[] = [];

    ids.forEach(id => {
      if (!(id in unlockedRef.current)) {
        unlockedRef.current[id] = now;
        const def = ACHIEVEMENT_LIST.find(a => a.id === id);
        if (def) fresh.push({ ...def, unlocked: true, unlockedAt: now });
      }
    });

    if (fresh.length > 0) {
      saveAchievements(unlockedRef.current);
      setAchievements(buildAchievementState(unlockedRef.current));
      setToastQueue(q => [...q, ...fresh]);
    }
  }, []);

  /* ── New game started — reset per-game trackers ── */
  useEffect(() => {
    if (gs.started && !prevStarted.current) {
      holdUsed.current    = false;
      tetrisCount.current = 0;
    }
    prevStarted.current = gs.started;
  }, [gs.started]);

  /* ── Track hold usage ── */
  useEffect(() => {
    if (gs.hold !== null) holdUsed.current = true;
  }, [gs.hold]);

  /* ── Line-clear events via flashRows leading-edge ── */
  useEffect(() => {
    if (gs.flashRows.length > 0 && prevFlashLen.current === 0) {
      const ids: string[] = [];

      if (!("first_line" in unlockedRef.current))
        ids.push("first_line");

      if (gs.flashRows.length === 4) {
        tetrisCount.current++;

        if (!("first_tetris" in unlockedRef.current))
          ids.push("first_tetris");

        if (
          tetrisCount.current >= 2 &&
          !("double_tetris" in unlockedRef.current)
        )
          ids.push("double_tetris");
      }

      if (ids.length > 0) unlock(ids);
    }

    prevFlashLen.current = gs.flashRows.length;
  }, [gs.flashRows, unlock]);

  /* ── Combo achievements ── */
  useEffect(() => {
    const ids: string[] = [];
    if (gs.combo >= 5  && !("combo_5"  in unlockedRef.current)) ids.push("combo_5");
    if (gs.combo >= 10 && !("combo_10" in unlockedRef.current)) ids.push("combo_10");
    if (ids.length > 0) unlock(ids);
  }, [gs.combo, unlock]);

  /* ── Level achievements ── */
  useEffect(() => {
    const ids: string[] = [];
    if (gs.level >= 5  && !("level_5"  in unlockedRef.current)) ids.push("level_5");
    if (gs.level >= 10 && !("level_10" in unlockedRef.current)) ids.push("level_10");
    if (ids.length > 0) unlock(ids);
  }, [gs.level, unlock]);

  /* ── Score achievements ── */
  useEffect(() => {
    const ids: string[] = [];
    if (gs.score >= 1000 && !("score_1000" in unlockedRef.current)) ids.push("score_1000");
    if (gs.score >= 5000 && !("score_5000" in unlockedRef.current)) ids.push("score_5000");
    if (ids.length > 0) unlock(ids);
  }, [gs.score, unlock]);

  /* ── Game over → Purist check ── */
  useEffect(() => {
    if (gs.gameOver && !prevGameOver.current && gs.started) {
      if (!holdUsed.current && !("no_hold" in unlockedRef.current)) {
        unlock(["no_hold"]);
      }
    }
    prevGameOver.current = gs.gameOver;
  }, [gs.gameOver, gs.started, unlock]);

  /* ── Dismiss a toast (called by AchievementToast after timeout) ── */
  const dismissToast = useCallback((id: string) => {
    setToastQueue(q => q.filter(a => a.id !== id));
  }, []);

  return { achievements, toastQueue, dismissToast };
}

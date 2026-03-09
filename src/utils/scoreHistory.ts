/**
 * scoreHistory — Local leaderboard persistence for GlitchCraft
 *
 * Pure utility module (no React). Stores the top-10 scores in localStorage.
 * Each entry records: score, lines cleared, level reached, and a human-readable
 * date + time string derived from the system clock at game-over time.
 */

const STORAGE_KEY = "blockmaster_scores";
const MAX_ENTRIES = 10;

export interface ScoreEntry {
  score: number;
  lines: number;
  level: number;
  date:  string; // e.g. "Mar 9"
  time:  string; // e.g. "11:35 PM"
}

/** Read the stored top-10 list. Returns [] on first launch or parse error. */
export function getScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ScoreEntry[];
  } catch {
    return [];
  }
}

/**
 * Append a new game result, keep the top MAX_ENTRIES by score, persist, and
 * return the updated sorted list.
 */
export function addScore(score: number, lines: number, level: number): ScoreEntry[] {
  const now = new Date();

  const entry: ScoreEntry = {
    score,
    lines,
    level,
    date: now.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  };

  const existing = getScores();
  const updated = [...existing, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently ignore storage quota errors
  }

  return updated;
}

/** Remove all stored scores (used for testing / reset). */
export function clearScores(): void {
  localStorage.removeItem(STORAGE_KEY);
}

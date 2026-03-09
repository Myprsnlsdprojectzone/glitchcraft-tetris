/**
 * achievements — GlitchCraft Tetris badge system
 *
 * Defines 10 achievements and provides localStorage persistence helpers.
 * No React — pure data layer.
 */

export interface AchievementDef {
  id:    string;
  name:  string;
  desc:  string;
  emoji: string;
}

export interface AchievementState extends AchievementDef {
  unlocked:   boolean;
  unlockedAt: number | null; // epoch ms
}

export const ACHIEVEMENT_LIST: AchievementDef[] = [
  { id: "first_line",    emoji: "✨", name: "First Clear",    desc: "Clear your first line" },
  { id: "first_tetris",  emoji: "🏆", name: "Tetris!",        desc: "Clear 4 lines at once" },
  { id: "double_tetris", emoji: "⚡", name: "Double Tetris",  desc: "Clear Tetris twice in one game" },
  { id: "combo_5",       emoji: "🔥", name: "Combo x5",       desc: "Achieve a 5× combo" },
  { id: "combo_10",      emoji: "💥", name: "On Fire",         desc: "Achieve a 10× combo" },
  { id: "level_5",       emoji: "🚀", name: "Level Up",        desc: "Reach Level 5" },
  { id: "level_10",      emoji: "🌟", name: "Veteran",         desc: "Reach Level 10" },
  { id: "score_1000",    emoji: "💯", name: "Scorer",          desc: "Score 1,000 points" },
  { id: "score_5000",    emoji: "💎", name: "Elite",           desc: "Score 5,000 points" },
  { id: "no_hold",       emoji: "🚫", name: "Purist",          desc: "Finish a game without using Hold" },
];

const STORAGE_KEY = "glitchcraft_achievements_v1";

/** Load unlocked record: { id: unlockedAtTimestamp } */
export function loadAchievements(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveAchievements(data: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/** Merge persistent unlock record with the static definition list */
export function buildAchievementState(
  unlocked: Record<string, number>
): AchievementState[] {
  return ACHIEVEMENT_LIST.map(def => ({
    ...def,
    unlocked:   def.id in unlocked,
    unlockedAt: unlocked[def.id] ?? null,
  }));
}

/** Reset all achievements (for dev / testing) */
export function resetAchievements(): void {
  localStorage.removeItem(STORAGE_KEY);
}

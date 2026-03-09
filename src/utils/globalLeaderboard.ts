import { createClient } from "@supabase/supabase-js";

// Safe loading of environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

// Only initialize Supabase if the user has provided real keys
const isConfigured = 
  supabaseUrl.includes("supabase.co") && 
  supabaseAnonKey.length > 20 && 
  !supabaseUrl.includes("example");

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface GlobalScore {
  id?: string;
  player_name: string;
  score: number;
  lines: number;
  level: number;
  created_at?: string;
}

/**
 * Gets or generates a stable anonymous player name for this device.
 */
function getPlayerName(): string {
  if (typeof localStorage === "undefined") return "Player";
  let name = localStorage.getItem("blockmaster_player_name");
  if (!name) {
    name = `Player-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    localStorage.setItem("blockmaster_player_name", name);
  }
  return name;
}

/**
 * Submits a score to the global leaderboard table.
 * Fails silently if Supabase is not configured or the network is down.
 */
export async function submitGlobalScore(score: number, lines: number, level: number): Promise<void> {
  if (!supabase || score === 0) return;
  
  const playerName = getPlayerName();

  try {
    await supabase
      .from("leaderboard")
      .insert([
        { player_name: playerName, score, lines, level }
      ]);
  } catch (err) {
    console.warn("Global leaderboard submission failed (safe to ignore):", err);
  }
}

/**
 * Fetches the top globally ranked scores.
 * Returns an empty array if Supabase is not configured.
 */
export async function fetchGlobalScores(limit = 100): Promise<GlobalScore[]> {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("player_name, score, lines, level")
      .order("score", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as GlobalScore[]) || [];
  } catch (err) {
    console.warn("Global leaderboard fetch failed:", err);
    return [];
  }
}

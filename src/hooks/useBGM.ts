/**
 * useBGM — Isolated Background Ambient Music engine for Aesthetic Block Master
 *
 * Designed to loop a non-distracting 8-bit chiptune ambient track.
 * Strictly adheres to AI Agent Behavior Contract: Does NOT interfere
 * with the existing useAudio.ts engine or its AudioContext.
 */

const BGM_KEY = "blockmaster_bgm";

let bgmEnabled: boolean =
  typeof localStorage !== "undefined"
    ? localStorage.getItem(BGM_KEY) !== "off"
    : true;

let ctx: AudioContext | null = null;
let isPlaying = false;
let sequenceTimer: ReturnType<typeof setTimeout> | null = null;

export function setBgmEnabled(v: boolean): void {
  bgmEnabled = v;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(BGM_KEY, v ? "on" : "off");
  }
  if (!bgmEnabled) {
    stopBGM();
  }
}

export function isBgmEnabled(): boolean {
  return bgmEnabled;
}

function getCtx(): AudioContext | null {
  if (!bgmEnabled) return null;
  if (typeof window === "undefined") return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AC: typeof AudioContext = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;

  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();

  return ctx;
}

/**
 * A highly ambient, slow, non-distracting chord progression.
 * Frequencies correspond to a mellow C minor 9 chord progression.
 */
const AMBIENT_SEQUENCE = [
  { freq: 130.81, duration: 4.0 }, // C3
  { freq: 155.56, duration: 4.0 }, // Eb3
  { freq: 196.00, duration: 4.0 }, // G3
  { freq: 233.08, duration: 4.0 }, // Bb3
  { freq: 155.56, duration: 4.0 }, // Eb3
  { freq: 233.08, duration: 4.0 }, // Bb3
  { freq: 261.63, duration: 4.0 }, // C4
  { freq: 196.00, duration: 4.0 }, // G3
];

let seqIndex = 0;

function playNextNote() {
  if (!isPlaying || !bgmEnabled) return;
  const c = getCtx();
  if (!c) return;

  const note = AMBIENT_SEQUENCE[seqIndex];
  seqIndex = (seqIndex + 1) % AMBIENT_SEQUENCE.length;

  const osc = c.createOscillator();
  const gain = c.createGain();

  // Use triangle for a softer, more rounded ambient pad sound
  osc.type = "triangle";
  osc.frequency.setValueAtTime(note.freq, c.currentTime);

  // Slow attack and slow release for ambient pads
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.04, c.currentTime + 1.5); // Very quiet
  gain.gain.linearRampToValueAtTime(0, c.currentTime + note.duration);

  // Lowpass filter to muffle the harsh high frequencies
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600; 

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + note.duration);

  // Schedule next note slightly before this one ends for overlap (reverb illusion)
  sequenceTimer = setTimeout(playNextNote, (note.duration - 0.5) * 1000);
}

export function startBGM(): void {
  if (isPlaying || !bgmEnabled) return;
  isPlaying = true;
  playNextNote();
}

export function stopBGM(): void {
  isPlaying = false;
  if (sequenceTimer) {
    clearTimeout(sequenceTimer);
    sequenceTimer = null;
  }
}

export function toggleBGM(): boolean {
  if (bgmEnabled) {
    setBgmEnabled(false);
    return false;
  } else {
    setBgmEnabled(true);
    startBGM();
    return true;
  }
}

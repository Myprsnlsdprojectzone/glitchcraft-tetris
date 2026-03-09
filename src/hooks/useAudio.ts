/**
 * useAudio — 8-bit chiptune sound engine for GlitchCraft
 *
 * Uses the browser-native Web Audio API exclusively.
 * No npm dependencies. No audio files. Fully procedural.
 *
 * Architecture mirrors useHaptics.ts:
 *  • Standalone exported functions — no React state required
 *  • AudioContext is created LAZILY on first call (satisfies browser autoplay policy)
 *  • All functions are silent no-ops when muted or when API is unavailable
 *  • Mute state persists via localStorage key "blockmaster_audio"
 */

const AUDIO_KEY = "blockmaster_audio";

// ── Mute state ─────────────────────────────────────────────────────────────────
// Initialised synchronously from localStorage so the first sound call is correct.
let audioEnabled: boolean =
  typeof localStorage !== "undefined"
    ? localStorage.getItem(AUDIO_KEY) !== "off"
    : true;

export function setAudioEnabled(v: boolean): void {
  audioEnabled = v;
}

export function isAudioEnabled(): boolean {
  return audioEnabled;
}

// ── AudioContext — lazy singleton ──────────────────────────────────────────────
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!audioEnabled) return null;
  if (typeof window === "undefined") return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AC: typeof AudioContext = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;

  if (!ctx) ctx = new AC();

  // Resume suspended context (required after tab backgrounding or first gesture)
  if (ctx.state === "suspended") void ctx.resume();

  return ctx;
}

// ── Tone builder ───────────────────────────────────────────────────────────────
interface ToneSegment {
  freq:     number;         // Hz
  type:     OscillatorType; // "square" | "sawtooth" | "triangle" | "sine"
  startAt:  number;         // seconds from AudioContext.currentTime
  duration: number;         // seconds
  gain:     number;         // peak volume 0–1
}

function playTones(segments: ToneSegment[]): void {
  const c = getCtx();
  if (!c) return;

  const now = c.currentTime;

  for (const seg of segments) {
    const osc  = c.createOscillator();
    const gain = c.createGain();

    osc.type = seg.type;
    osc.frequency.setValueAtTime(seg.freq, now + seg.startAt);

    // ADSR-lite: instant attack, linear decay to zero
    gain.gain.setValueAtTime(0,        now + seg.startAt);
    gain.gain.linearRampToValueAtTime(seg.gain, now + seg.startAt + 0.005);
    gain.gain.linearRampToValueAtTime(0,        now + seg.startAt + seg.duration);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + seg.startAt);
    osc.stop(now  + seg.startAt + seg.duration + 0.01);
  }
}

// ── Sound library ──────────────────────────────────────────────────────────────

/** Move left / right — ultra-short 220 Hz square tick */
export function audioMove(): void {
  playTones([
    { freq: 220, type: "square", startAt: 0, duration: 0.035, gain: 0.08 },
  ]);
}

/** Rotate — quick ascending two-tone chirp */
export function audioRotate(): void {
  playTones([
    { freq: 330, type: "square", startAt: 0,    duration: 0.05, gain: 0.10 },
    { freq: 440, type: "square", startAt: 0.05, duration: 0.06, gain: 0.10 },
  ]);
}

/** Soft drop — subtle blip per row descended */
export function audioSoftDrop(): void {
  playTones([
    { freq: 180, type: "square", startAt: 0, duration: 0.030, gain: 0.07 },
  ]);
}

/** Hard drop — descending sawtooth impact thud */
export function audioHardDrop(): void {
  playTones([
    { freq: 280, type: "sawtooth", startAt: 0,    duration: 0.06, gain: 0.18 },
    { freq: 160, type: "sawtooth", startAt: 0.06, duration: 0.10, gain: 0.14 },
  ]);
}

/** Piece lock — short firm click */
export function audioPieceLock(): void {
  playTones([
    { freq: 300, type: "square", startAt: 0, duration: 0.055, gain: 0.12 },
  ]);
}

/** Hold piece — warbling triangle descend */
export function audioHold(): void {
  playTones([
    { freq: 440, type: "triangle", startAt: 0,    duration: 0.07, gain: 0.14 },
    { freq: 330, type: "triangle", startAt: 0.07, duration: 0.09, gain: 0.12 },
  ]);
}

// ── Line clear sounds ──────────────────────────────────────────────────────────

function audioLineClear1(): void {
  playTones([
    { freq: 523, type: "square", startAt: 0,    duration: 0.09, gain: 0.18 },
    { freq: 659, type: "square", startAt: 0.09, duration: 0.12, gain: 0.18 },
  ]);
}

function audioLineClear2(): void {
  playTones([
    { freq: 523, type: "square", startAt: 0,    duration: 0.08, gain: 0.18 },
    { freq: 659, type: "square", startAt: 0.08, duration: 0.08, gain: 0.18 },
    { freq: 784, type: "square", startAt: 0.16, duration: 0.12, gain: 0.20 },
  ]);
}

function audioLineClear3(): void {
  playTones([
    { freq: 523,  type: "square", startAt: 0,    duration: 0.07, gain: 0.18 },
    { freq: 659,  type: "square", startAt: 0.07, duration: 0.07, gain: 0.18 },
    { freq: 784,  type: "square", startAt: 0.14, duration: 0.07, gain: 0.20 },
    { freq: 1047, type: "square", startAt: 0.21, duration: 0.14, gain: 0.22 },
  ]);
}

/** TETRIS (4-line clear) — triumphant 4-note fanfare */
export function audioTetris(): void {
  playTones([
    { freq: 523,  type: "square", startAt: 0,    duration: 0.10, gain: 0.22 },
    { freq: 659,  type: "square", startAt: 0.10, duration: 0.10, gain: 0.22 },
    { freq: 784,  type: "square", startAt: 0.20, duration: 0.10, gain: 0.22 },
    { freq: 1047, type: "square", startAt: 0.30, duration: 0.22, gain: 0.26 },
  ]);
}

/**
 * Dispatcher — maps line count to the correct sound.
 * Called by useTetris exactly like hapticLineClear (minus the combo arg).
 */
export function audioLineClear(lines: number): void {
  switch (lines) {
    case 1: audioLineClear1(); break;
    case 2: audioLineClear2(); break;
    case 3: audioLineClear3(); break;
    case 4: audioTetris();     break;
    default: break;
  }
}

/** Level up — ascending 4-step arpeggio */
export function audioLevelUp(): void {
  playTones([
    { freq: 392,  type: "square", startAt: 0,    duration: 0.08, gain: 0.18 },
    { freq: 523,  type: "square", startAt: 0.09, duration: 0.08, gain: 0.18 },
    { freq: 659,  type: "square", startAt: 0.18, duration: 0.08, gain: 0.20 },
    { freq: 784,  type: "square", startAt: 0.27, duration: 0.16, gain: 0.22 },
  ]);
}

/** Game over — descending 5-note death jingle */
export function audioGameOver(): void {
  playTones([
    { freq: 440, type: "sawtooth", startAt: 0,    duration: 0.12, gain: 0.20 },
    { freq: 370, type: "sawtooth", startAt: 0.14, duration: 0.12, gain: 0.18 },
    { freq: 311, type: "sawtooth", startAt: 0.28, duration: 0.12, gain: 0.16 },
    { freq: 261, type: "sawtooth", startAt: 0.42, duration: 0.12, gain: 0.14 },
    { freq: 196, type: "sawtooth", startAt: 0.56, duration: 0.24, gain: 0.18 },
  ]);
}

/** Start game — 3-note welcome burst */
export function audioStart(): void {
  playTones([
    { freq: 523, type: "square", startAt: 0,    duration: 0.08, gain: 0.18 },
    { freq: 659, type: "square", startAt: 0.09, duration: 0.08, gain: 0.18 },
    { freq: 784, type: "square", startAt: 0.18, duration: 0.14, gain: 0.22 },
  ]);
}

/** Pause — single soft triangle tone */
export function audioPause(): void {
  playTones([
    { freq: 392, type: "triangle", startAt: 0, duration: 0.12, gain: 0.15 },
  ]);
}

/** Resume — two-note double-blip */
export function audioResume(): void {
  playTones([
    { freq: 523, type: "square", startAt: 0,    duration: 0.07, gain: 0.15 },
    { freq: 659, type: "square", startAt: 0.08, duration: 0.09, gain: 0.18 },
  ]);
}

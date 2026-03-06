import { useState, useEffect, useCallback, useRef } from "react";
import {
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
} from "./useHaptics";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Cell = { filled: boolean; color: string };
export type Board = Cell[][];
export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export interface KeyBindings {
  left: string;
  right: string;
  down: string;
  rotate: string;
  hardDrop: string;
  hold: string;
  pause: string;
}

export const DEFAULT_BINDINGS: KeyBindings = {
  left:     "ArrowLeft",
  right:    "ArrowRight",
  down:     "ArrowDown",
  rotate:   "ArrowUp",
  hardDrop: " ",
  hold:     "c",
  pause:    "Escape",
};

// ─── Constants ────────────────────────────────────────────────────────────────
export const BOARD_WIDTH  = 10;
export const BOARD_HEIGHT = 20;

const BEST_SCORE_KEY = "tetris_best_score";

const TETROMINOES: Record<TetrominoType, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]],           color: "#22d3ee" },
  O: { shape: [[1, 1], [1, 1]],         color: "#facc15" },
  T: { shape: [[0, 1, 0], [1, 1, 1]],  color: "#a855f7" },
  S: { shape: [[0, 1, 1], [1, 1, 0]],  color: "#4ade80" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]],  color: "#f87171" },
  J: { shape: [[1, 0, 0], [1, 1, 1]],  color: "#60a5fa" },
  L: { shape: [[0, 0, 1], [1, 1, 1]],  color: "#fb923c" },
};

// Points for 1–4 line clears (index = lines cleared)
const SCORE_TABLE = [0, 100, 300, 500, 800];
const BASE_SPEED      = 800;
const SPEED_INCREMENT = 60;

// ─── Bag randomiser (7-bag) ───────────────────────────────────────────────────
let bag: TetrominoType[] = [];
function nextFromBag(): TetrominoType {
  if (bag.length === 0) {
    bag = (Object.keys(TETROMINOES) as TetrominoType[])
      .map((t) => ({ t, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ t }) => t);
  }
  return bag.pop()!;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function emptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: "" }))
  );
}

function makeTetromino(type: TetrominoType): Tetromino {
  const { shape, color } = TETROMINOES[type];
  return {
    type,
    shape,
    color,
    x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
    y: 0,
  };
}

function randomTetromino(): Tetromino {
  return makeTetromino(nextFromBag());
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
}

function isValid(
  board: Board,
  piece: Tetromino,
  dx = 0,
  dy = 0,
  shape?: number[][]
): boolean {
  const s = shape ?? piece.shape;
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT) return false;
      if (ny < 0) continue;
      if (board[ny][nx].filled) return false;
    }
  }
  return true;
}

function placePiece(board: Board, piece: Tetromino): Board {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  piece.shape.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        const ny = piece.y + r;
        const nx = piece.x + c;
        if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
          newBoard[ny][nx] = { filled: true, color: piece.color };
        }
      }
    });
  });
  return newBoard;
}

function clearLines(board: Board): { board: Board; cleared: number; clearedRows: number[] } {
  const clearedRows: number[] = [];
  board.forEach((row, i) => {
    if (row.every((cell) => cell.filled)) clearedRows.push(i);
  });
  const remaining = board.filter((row) => !row.every((cell) => cell.filled));
  const cleared   = BOARD_HEIGHT - remaining.length;
  const empty     = Array.from({ length: cleared }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: "" }))
  );
  return { board: [...empty, ...remaining], cleared, clearedRows };
}

function ghostPosition(board: Board, piece: Tetromino): number {
  let dy = 0;
  while (isValid(board, piece, 0, dy + 1)) dy++;
  return dy;
}

function loadBest(): number {
  try { return parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10) || 0; }
  catch { return 0; }
}

function saveBest(score: number) {
  try { localStorage.setItem(BEST_SCORE_KEY, String(score)); } catch { /* noop */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTetris(bindings: KeyBindings) {
  const [board,       setBoard]       = useState<Board>(emptyBoard());
  const [current,    setCurrent]     = useState<Tetromino | null>(null);
  const [next,       setNext]        = useState<Tetromino>(randomTetromino());
  const [hold,       setHold]        = useState<Tetromino | null>(null);
  const [holdLocked, setHoldLocked]  = useState(false);   // can't hold twice in a row
  const [score,      setScore]       = useState(0);
  const [lines,      setLines]       = useState(0);
  const [level,      setLevel]       = useState(1);
  const [combo,      setCombo]       = useState(0);        // consecutive clear streak
  const [bestScore,  setBestScore]   = useState(loadBest);
  const [flashRows,  setFlashRows]   = useState<number[]>([]); // rows being cleared
  const [gameOver,   setGameOver]    = useState(false);
  const [running,    setRunning]     = useState(false);
  const [started,    setStarted]     = useState(false);

  // ── Mutable refs so callbacks always see fresh state ──────────────────────
  const boardRef      = useRef(board);
  const currentRef    = useRef(current);
  const nextRef       = useRef(next);
  const holdRef       = useRef(hold);
  const holdLockedRef = useRef(holdLocked);
  const runningRef    = useRef(running);
  const gameOverRef   = useRef(gameOver);
  const startedRef    = useRef(started);
  const linesRef      = useRef(lines);
  const scoreRef      = useRef(score);
  const comboRef      = useRef(combo);
  const levelRef      = useRef(level);

  boardRef.current      = board;
  currentRef.current    = current;
  nextRef.current       = next;
  holdRef.current       = hold;
  holdLockedRef.current = holdLocked;
  runningRef.current    = running;
  gameOverRef.current   = gameOver;
  startedRef.current    = started;
  linesRef.current      = lines;
  scoreRef.current      = score;
  comboRef.current      = combo;
  levelRef.current      = level;

  // ── Spawn ──────────────────────────────────────────────────────────────────
  const spawn = useCallback((piece: Tetromino, boardState: Board) => {
    if (!isValid(boardState, piece, 0, 0)) {
      setGameOver(true);
      setRunning(false);
      hapticGameOver();
      // Save best score on game over
      setScore((s) => {
        const best = loadBest();
        if (s > best) { saveBest(s); setBestScore(s); }
        return s;
      });
      return false;
    }
    setCurrent(piece);
    return true;
  }, []);

  // ── Lock piece & spawn next ────────────────────────────────────────────────
  const lockAndSpawn = useCallback(
    (piece: Tetromino, boardState: Board) => {
      const placed = placePiece(boardState, piece);
      const { board: clearedBoard, cleared: count, clearedRows } = clearLines(placed);

      if (count > 0) {
        // Flash rows briefly before committing
        setFlashRows(clearedRows);

        // ── Haptic: line clear fires immediately so player feels it ──
        const newComboForHaptic = comboRef.current + 1;
        hapticLineClear(count, newComboForHaptic);

        setTimeout(() => {
          setFlashRows([]);
          setBoard(clearedBoard);

          const newCombo = comboRef.current + 1;
          setCombo(newCombo);

          setLines((l) => {
            const newLines = l + count;
            const newLevel = Math.floor(newLines / 10) + 1;
            if (newLevel > levelRef.current) {
              setLevel(newLevel);
              levelRef.current = newLevel;
              // ── Haptic: level up — delayed so it doesn't clash with line-clear ──
              setTimeout(() => hapticLevelUp(), 160);
            }
            return newLines;
          });

          // Score: base × level × combo multiplier
          const basePoints    = SCORE_TABLE[count] * levelRef.current;
          const comboBonus    = newCombo > 1 ? (newCombo - 1) * 50 * levelRef.current : 0;
          const totalPoints   = basePoints + comboBonus;
          setScore((s) => {
            const next = s + totalPoints;
            const best = loadBest();
            if (next > best) { saveBest(next); setBestScore(next); }
            return next;
          });

          const nextPiece = nextRef.current;
          setNext(randomTetromino());
          setHoldLocked(false);
          spawn(nextPiece, clearedBoard);
        }, 120);

        // Still lock board visually right now (with placed but uncleared)
        setBoard(placed);
      } else {
        // No clear — reset combo streak, fire lock haptic
        hapticPieceLock();
        setCombo(0);
        setBoard(clearedBoard);
        const nextPiece = nextRef.current;
        setNext(randomTetromino());
        setHoldLocked(false);
        spawn(nextPiece, clearedBoard);
      }
    },
    [spawn]
  );

  // ── Movement callbacks ─────────────────────────────────────────────────────
  const moveLeft = useCallback(() => {
    const p = currentRef.current;
    if (!p || !runningRef.current) return;
    if (isValid(boardRef.current, p, -1, 0)) {
      hapticMove();
      setCurrent({ ...p, x: p.x - 1 });
    }
  }, []);

  const moveRight = useCallback(() => {
    const p = currentRef.current;
    if (!p || !runningRef.current) return;
    if (isValid(boardRef.current, p, 1, 0)) {
      hapticMove();
      setCurrent({ ...p, x: p.x + 1 });
    }
  }, []);

  const moveDown = useCallback(() => {
    const p = currentRef.current;
    if (!p || !runningRef.current) return;
    if (isValid(boardRef.current, p, 0, 1)) {
      hapticSoftDrop();
      setCurrent({ ...p, y: p.y + 1 });
    } else {
      lockAndSpawn(p, boardRef.current);
    }
  }, [lockAndSpawn]);

  const rotatePiece = useCallback(() => {
    const p = currentRef.current;
    if (!p || !runningRef.current) return;
    const rotated = rotate(p.shape);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (isValid(boardRef.current, p, kick, 0, rotated)) {
        hapticRotate();
        setCurrent({ ...p, shape: rotated, x: p.x + kick });
        return;
      }
    }
  }, []);

  const hardDrop = useCallback(() => {
    const p = currentRef.current;
    if (!p || !runningRef.current) return;
    const dy = ghostPosition(boardRef.current, p);
    const dropped = { ...p, y: p.y + dy };
    hapticHardDrop();
    setScore((s) => {
      const next = s + dy * 2;
      const best = loadBest();
      if (next > best) { saveBest(next); setBestScore(next); }
      return next;
    });
    lockAndSpawn(dropped, boardRef.current);
  }, [lockAndSpawn]);

  // ── Hold piece ─────────────────────────────────────────────────────────────
  const holdPiece = useCallback(() => {
    const p = currentRef.current;
    if (!p || !runningRef.current || holdLockedRef.current) return;

    hapticHold();
    const heldPrev = holdRef.current;

    // Reset current piece shape (in case it was rotated)
    const fresh: Tetromino = {
      ...makeTetromino(p.type),
    };

    setHold(fresh);
    setHoldLocked(true);

    if (heldPrev) {
      // Swap — put held piece back into play
      const swapped: Tetromino = {
        ...heldPrev,
        x: Math.floor((BOARD_WIDTH - heldPrev.shape[0].length) / 2),
        y: 0,
      };
      spawn(swapped, boardRef.current);
    } else {
      // No held piece — use next
      const nextPiece = nextRef.current;
      setNext(randomTetromino());
      spawn(nextPiece, boardRef.current);
    }
  }, [spawn]);

  // ── Game controls ──────────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    setRunning((r) => {
      if (r) hapticPause();
      else   hapticResume();
      return !r;
    });
  }, []);

  const startGame = useCallback(() => {
    hapticStart();
    bag = []; // reset bag
    const fresh  = emptyBoard();
    const first  = randomTetromino();
    const second = randomTetromino();
    setBoard(fresh);
    setScore(0);
    setLines(0);
    setLevel(1);
    setCombo(0);
    setHold(null);
    setHoldLocked(false);
    setFlashRows([]);
    setGameOver(false);
    setNext(second);
    setCurrent(first);
    setRunning(true);
    setStarted(true);
  }, []);

  // ── Gravity ────────────────────────────────────────────────────────────────
  const speed = Math.max(100, BASE_SPEED - (level - 1) * SPEED_INCREMENT);

  useEffect(() => {
    if (!running || gameOver) return;
    const interval = setInterval(() => moveDown(), speed);
    return () => clearInterval(interval);
  }, [running, gameOver, moveDown, speed]);

  // ── Keyboard handler ───────────────────────────────────────────────────────
  const bindingsRef    = useRef(bindings);
  bindingsRef.current  = bindings;

  const holdPieceRef   = useRef(holdPiece);
  holdPieceRef.current = holdPiece;

  const refs = {
    togglePause: useRef(togglePause),
    moveLeft:    useRef(moveLeft),
    moveRight:   useRef(moveRight),
    moveDown:    useRef(moveDown),
    rotatePiece: useRef(rotatePiece),
    hardDrop:    useRef(hardDrop),
  };
  refs.togglePause.current = togglePause;
  refs.moveLeft.current    = moveLeft;
  refs.moveRight.current   = moveRight;
  refs.moveDown.current    = moveDown;
  refs.rotatePiece.current = rotatePiece;
  refs.hardDrop.current    = hardDrop;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;
      const b = bindingsRef.current;

      // Normalise: treat uppercase "C" same as "c" for hold
      const key = e.key;

      if (key === b.pause) {
        e.preventDefault();
        if (startedRef.current) refs.togglePause.current();
        return;
      }

      if (!runningRef.current) return;

      if      (key === b.left      || key === b.left.toUpperCase())     { e.preventDefault(); refs.moveLeft.current(); }
      else if (key === b.right     || key === b.right.toUpperCase())    { e.preventDefault(); refs.moveRight.current(); }
      else if (key === b.down      || key === b.down.toUpperCase())     { e.preventDefault(); refs.moveDown.current(); }
      else if (key === b.rotate    || key === b.rotate.toUpperCase())   { e.preventDefault(); refs.rotatePiece.current(); }
      else if (key === b.hardDrop)                                       { e.preventDefault(); refs.hardDrop.current(); }
      else if (key === b.hold      || key === b.hold.toUpperCase())     { e.preventDefault(); holdPieceRef.current(); }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // stable — reads everything via refs

  // ── Ghost piece ────────────────────────────────────────────────────────────
  const ghost: Tetromino | null =
    current && running
      ? { ...current, y: current.y + ghostPosition(board, current) }
      : null;

  return {
    board,
    current,
    ghost,
    next,
    hold,
    holdLocked,
    flashRows,
    score,
    lines,
    level,
    combo,
    bestScore,
    gameOver,
    running,
    started,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    rotatePiece,
    hardDrop,
    holdPiece,
  };
}

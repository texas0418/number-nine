// src/daily/cipher.ts
// Pure module: the nightly transmission. Every calendar day gets a FRESH
// random substitution key (numbers 1..26 -> letters), generated
// deterministically from the day key so every player on earth sees the same
// puzzle. Yesterday's key teaches you nothing about tonight's — the skill
// that transfers is deduction (frequency, word shapes), never memory.
// Tested in Node by test-cipher.ts.

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** FNV-1a — stable string hash for seeding. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** letter -> number (1..26), a fresh permutation per day key. */
export function keyForDay(dayKey: string): Map<string, number> {
  const rand = mulberry32(hashSeed(`number-nine:${dayKey}`));
  const numbers = shuffled(
    Array.from({ length: 26 }, (_, i) => i + 1),
    rand,
  );
  return new Map([...ALPHABET].map((ch, i) => [ch, numbers[i]]));
}

/** One cipher symbol: an enciphered letter, or a literal (apostrophe). */
export type CipherSymbol =
  | { num: number }
  | { literal: string };

export interface DailyPuzzle {
  dayKey: string;
  /** Words of the plaintext, as cipher symbols. */
  words: CipherSymbol[][];
  /** Ground-truth letter for each number that appears (for checking). */
  answerByNum: Map<number, string>;
  /** Letters pre-revealed by "signal strength" so a night's solve stays 2-4 min. */
  revealedLetters: string[];
}

/** Distinct plaintext letters, most frequent first (ties alphabetical). */
export function lettersByFrequency(plaintext: string): string[] {
  const counts = new Map<string, number>();
  for (const ch of plaintext.toUpperCase())
    if (ALPHABET.includes(ch)) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  return [...counts.keys()].sort(
    (a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b),
  );
}

/** Crossword-style weekly rhythm: gentle Monday, mean Saturday.
 *  Index by JS getDay() (0 = Sunday). */
export const REVEALS_BY_WEEKDAY = [3, 4, 3, 3, 3, 2, 1] as const;

export function revealCount(dayKey: string): number {
  const [y, m, d] = dayKey.split('-').map(Number);
  return REVEALS_BY_WEEKDAY[new Date(y, m - 1, d, 12).getDay()];
}

export function buildPuzzle(dayKey: string, plaintext: string): DailyPuzzle {
  const key = keyForDay(dayKey);
  const answerByNum = new Map<number, string>();
  const words: CipherSymbol[][] = plaintext
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      [...word].flatMap<CipherSymbol>((ch) => {
        const num = key.get(ch);
        if (num === undefined) return ch === "'" ? [{ literal: ch }] : [];
        answerByNum.set(num, ch);
        return [{ num }];
      }),
    );
  const revealed = lettersByFrequency(plaintext).slice(0, revealCount(dayKey));
  return { dayKey, words, answerByNum, revealedLetters: revealed };
}

/** True when every number appearing in the puzzle has the correct letter. */
export function isSolved(
  puzzle: DailyPuzzle,
  guessByNum: Map<number, string>,
): boolean {
  for (const [num, letter] of puzzle.answerByNum)
    if (guessByNum.get(num) !== letter) return false;
  return true;
}

/** Share-card text: solved letters visible, the rest redacted. Spoiler-safe
 *  because unsolved positions never leak the letter. */
export function redactedTranscript(
  puzzle: DailyPuzzle,
  guessByNum: Map<number, string>,
): string {
  return puzzle.words
    .map((word) =>
      word
        .map((sym) =>
          'literal' in sym
            ? sym.literal
            : guessByNum.get(sym.num) === puzzle.answerByNum.get(sym.num)
              ? puzzle.answerByNum.get(sym.num)
              : '█',
        )
        .join(''),
    )
    .join(' ');
}

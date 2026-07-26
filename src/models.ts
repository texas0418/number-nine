// src/models.ts
// Pure module (no expo imports): Number Nine's domain model.
//
// Two halves. The STORY half is a chapter scene graph: an ordered list of
// typographic blocks the engine renders as one continuous scroll — prose,
// rotated passages (the reader physically turns the phone; the app itself
// stays portrait-locked, DEVICE 6 style), the station's mirrored voice,
// forks, logbook asides, and gate widgets that stop the scroll until solved.
// The DAILY half is a substitution-cipher transmission with a fresh key each
// day; those types live close to the cipher math in src/daily/cipher.ts.
// Times are epoch ms; day keys are local 'YYYY-MM-DD'.

export type ChapterBlock =
  | { kind: 'chapterCard'; number: string; title: string; cue?: AudioCue }
  | { kind: 'room'; text: string; cue?: AudioCue }
  | { kind: 'thought'; text: string; cue?: AudioCue }
  | { kind: 'prose'; text: string; faded?: boolean; cue?: AudioCue }
  | { kind: 'voice'; text: string; mirrored: boolean; cue?: AudioCue }
  | { kind: 'rotated'; text: string; direction?: 'down' | 'up'; cue?: AudioCue }
  | { kind: 'staircase'; steps: string[]; direction?: 'down' | 'up'; cue?: AudioCue }
  | { kind: 'logbook'; lines: string[]; cue?: AudioCue }
  | { kind: 'fork'; leftLabel: string; left: string; rightLabel: string; right: string; join: string }
  | { kind: 'radio'; id: string; bandLowKhz: number; bandHighKhz: number; targetKhz: number; lockedText: string; unlockedText: string; cue?: AudioCue }
  | { kind: 'keypad'; id: string; answer: string; prompt: string; unlockedText: string; cue?: AudioCue }
  | { kind: 'safe'; id: string; answer: string; prompt: string; unlockedText: string; cue?: AudioCue }
  // A word/decode lock: letter entry, not digits. The "cipher" of the fiction.
  | { kind: 'cipher'; id: string; answer: string; prompt: string; unlockedText: string; cue?: AudioCue }
  | { kind: 'chapterEnd'; title: string };

export const AUDIO_CUES = ['static-swell', 'ident', 'silence'] as const;
export type AudioCue = (typeof AUDIO_CUES)[number];

export const isAudioCue = (v: unknown): v is AudioCue =>
  typeof v === 'string' && (AUDIO_CUES as readonly string[]).includes(v);

export interface Chapter {
  id: number; // 1..6
  title: string; // "Broadcast One"
  blocks: ChapterBlock[];
}

/** Radio gates count as solved when tuned within this many kHz of target. */
export const RADIO_LOCK_TOLERANCE_KHZ = 3;

export const isRadioLocked = (tunedKhz: number, targetKhz: number): boolean =>
  Math.abs(tunedKhz - targetKhz) <= RADIO_LOCK_TOLERANCE_KHZ;

/** Signal strength 0..1 for the tuner needle/audio mix — linear falloff. */
export function signalStrength(
  tunedKhz: number,
  targetKhz: number,
  bandLowKhz: number,
  bandHighKhz: number,
): number {
  const span = Math.max(1, (bandHighKhz - bandLowKhz) / 4);
  const dist = Math.abs(tunedKhz - targetKhz);
  return Math.max(0, Math.min(1, 1 - dist / span));
}

// ------------------------------------------------------------------ progress

export interface ChapterProgress {
  chapterId: number;
  /** Furthest block index revealed (gates freeze this until solved). */
  blockIndex: number;
  completedMs: number | null;
}

export interface DailySolve {
  dayKey: string; // local 'YYYY-MM-DD'
  solvedMs: number;
}

/** Local-calendar day key. Pinned to local time on purpose: "tonight's
 *  signal" should roll over at the player's midnight, not UTC's. */
export function dayKeyFromMs(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function prevDayKey(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  // Local noon dodges DST edges when stepping a calendar day.
  return dayKeyFromMs(new Date(y, m - 1, d, 12).getTime() - 24 * 3600 * 1000);
}

/** Consecutive-night streak ending today or yesterday (a streak survives
 *  until a full night is missed). `solvedDays` may be in any order. */
export function currentStreak(solvedDays: string[], todayKey: string): number {
  const set = new Set(solvedDays);
  let cursor = set.has(todayKey) ? todayKey : prevDayKey(todayKey);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = prevDayKey(cursor);
  }
  return streak;
}

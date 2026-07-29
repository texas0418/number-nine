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
  // `scene` sets the ambient backdrop that fills the screen until the next room.
  | { kind: 'room'; text: string; scene?: SceneId; cue?: AudioCue }
  | { kind: 'thought'; text: string; cue?: AudioCue }
  | { kind: 'prose'; text: string; faded?: boolean; cue?: AudioCue }
  | { kind: 'voice'; text: string; mirrored: boolean; cue?: AudioCue }
  | { kind: 'rotated'; text: string; direction?: 'down' | 'up'; cue?: AudioCue }
  | { kind: 'staircase'; steps: string[]; direction?: 'down' | 'up'; cue?: AudioCue }
  | { kind: 'logbook'; lines: string[]; cue?: AudioCue }
  // An inline framed object image (the receiver, the telephone, the safe…).
  | { kind: 'plate'; image: SceneId; caption?: string; cue?: AudioCue }
  | { kind: 'fork'; leftLabel: string; left: string; rightLabel: string; right: string; join: string; stopsCue?: AudioCue }
  | { kind: 'radio'; id: string; bandLowKhz: number; bandHighKhz: number; targetKhz: number; lockedText: string; unlockedText: string; cue?: AudioCue; stopsCue?: AudioCue }
  // `feltGroups`: digits delivered ONLY as haptic knock-groups via the
  // in-widget palm control (B3's code slot — the wall says the number).
  | { kind: 'keypad'; id: string; answer: string; prompt: string; unlockedText: string; feltGroups?: number[]; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  | { kind: 'safe'; id: string; answer: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // A word/decode lock: letter entry, not digits. The "cipher" of the fiction.
  | { kind: 'cipher'; id: string; answer: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // An EAR puzzle: listen to the melody, play it back on brass keys.
  // `answer` is the key-index sequence, e.g. '123134'.
  | { kind: 'melody'; id: string; answer: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // An OBSERVATION puzzle: touch the hidden detail in a photograph.
  // `target` is a normalized rect {x,y,w,h} within the image.
  | { kind: 'hotspot'; id: string; image: SceneId; revealImage?: SceneId; target: { x: number; y: number; w: number; h: number }; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // A TOUCH-ECHO puzzle: the phone knocks in grouped counts (haptic-first);
  // the reader knocks the same groups back. `groups` = knocks per group.
  | { kind: 'knock'; id: string; groups: number[]; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // A SEALED thing (an envelope, a parcel): one tap tears it open — an act,
  // not a puzzle, like the fork — and the page continues below.
  | { kind: 'seal'; id: string; image: SceneId; caption: string; tornCaption: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // The OVERLEAF: a page with writing on its back. Physically turning the
  // phone face-down (or dragging the dog-ear) turns the page; tap
  // `targetWord` on the verso to pass. `backPrompt` is the caption while
  // the verso is up (a nudge that the page wants touching).
  | { kind: 'flip'; id: string; front: string[]; back: string[]; targetWord: string; prompt: string; backPrompt?: string; unlockedText: string; mirroredBack?: boolean; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // SHY INK: `hiddenLine` resolves only when the lamp is turned down —
  // system brightness below threshold, or the in-page wick dragged low.
  // Tap `targetWord` in the revealed line to pass.
  | { kind: 'lamp'; id: string; aboveText: string[]; hiddenLine: string; targetWord: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // A GPO ROTARY DIAL: dial the digits by dragging holes to the finger
  // stop. `answer` is the dialed digit string (letters live on the ring).
  | { kind: 'rotary'; id: string; answer: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Set the hands of a 24-hour clock. Answer in minutes-of-day.
  | { kind: 'clock'; id: string; answerHour: number; answerMinute: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Face the needle: hold the compass on `targetDeg` (0 = north) within
  // `toleranceDeg` for a beat. Magnetometer feeds it; the ring drags too.
  | { kind: 'compass'; id: string; targetDeg: number; toleranceDeg: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // BE STILL: rest the phone (or a motionless finger) for `holdMs`.
  | { kind: 'stillness'; id: string; holdMs: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // SHAKE LOOSE: physically shake the phone (or hammer taps) until it gives.
  | { kind: 'shake'; id: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // THE OTHER SIDE OF THE TABLE: lines that change when the phone is
  // physically inverted; tap `targetWord` in the inverted reading.
  | { kind: 'invert'; id: string; upright: string[]; inverted: string[]; targetWord: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // FEED THE SET: plug the phone in (or hold the plug glyph home).
  | { kind: 'mains'; id: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // BOTH HANDS: two-or-more touches held on the panel together.
  | { kind: 'chord'; id: string; holdMs: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // PACE IT OUT: face `bearingDeg` and take `paces` steps (bounce-detected
  // while the bearing holds; a tap is also a pace).
  | { kind: 'paces'; id: string; bearingDeg: number; toleranceDeg: number; paces: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // B4 — THE EXAMINATION. Her whisper: audio (never load-bearing) plays only
  // against the ear (proximity); the listening ACT — durationMs of nearness,
  // or the held fallback — is the gate.
  | { kind: 'whisper'; id: string; durationMs: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Combo ink: the hidden line resolves only DARK (lamp down) *and* at her
  // hour — the real clock, or the receiver's clock wound to it (the lie;
  // she notices: noticedText replaces unlockedText and the kv flag sticks).
  | { kind: 'ink'; id: string; aboveText: string[]; hiddenLine: string; targetWord: string; hour: number; minute: number; prompt: string; unlockedText: string; noticedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Daily crossover: which word did she say TONIGHT? Candidates come from
  // src/daily/crossover.ts (tonight's actual transmission + decoys).
  | { kind: 'signalword'; id: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Stereo bearing: swing the aerial (compass heading, drag fallback) until
  // her voice centres; dwell on the bearing to pass.
  | { kind: 'bearing'; id: string; bearingDeg: number; toleranceDeg: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // The séance plate: EXPOSE it (take a screenshot — watchShutter), or hold
  // it to the lamp (long-press). The plate differs after.
  | { kind: 'exposure'; id: string; image: SceneId; revealImage: SceneId; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Circuit trace: drag one unbroken path through the terminals in the
  // order the clues dictate; a wrong terminal sparks and the path dies.
  | { kind: 'trace'; id: string; nodes: string[]; order: number[]; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Her hour proper: passable when the real clock stands at hour:minute —
  // or wound there (the lie again, and she likes it less each time).
  | { kind: 'hour'; id: string; hour: number; minute: number; prompt: string; unlockedText: string; noticedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // B5 — THE OTHER LISTENERS. Severance: cut the phone off from the world
  // (the OS switch is the act; the gate witnesses the result).
  | { kind: 'sever'; id: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // RF gain: the hardware volume rockers as the set's gain knob; `mark` is
  // the wanted etch (1..9), named only by the clues.
  | { kind: 'gain'; id: string; mark: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Triangulation: three weak carriers, three bearing lines, one crossing.
  | { kind: 'triangulate'; id: string; bandLowKhz: number; bandHighKhz: number; stations: { khz: number; siteX: number; siteY: number; bearingDeg: number }[]; target: { x: number; y: number; w: number; h: number }; mapImage?: SceneId; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // Morse SENDING: the key under the reader's own finger; the word comes
  // from the clues, the alphabet from an artifact.
  | { kind: 'morsesend'; id: string; word: string; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // The staged mic gate: blow out the lamp, then hum her ident back. The
  // permission dialog is part of the scene; the tines carry a refusal.
  | { kind: 'micstage'; id: string; tinesAnswer: string; prompt: string; lampOutText: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  // The pocket slip (NOT a gate): the station leaves `text` in the reader's
  // clipboard as this block reveals. They find it later, mid-paste.
  | { kind: 'slip'; text: string }
  // THE REGISTER: three ruled lines look empty; two carry scraped ghosts
  // and refuse the thumb cold. `trueWell` (0-based) never took ink — a
  // thumb held there like a seal signs it, and the entry dries in her type
  // as the machine's own name (`{NAME}` in unlockedText).
  | { kind: 'register'; id: string; trueWell: number; prompt: string; unlockedText: string; solveCue?: AudioCue; cue?: AudioCue; stopsCue?: AudioCue }
  | { kind: 'chapterEnd'; title: string };

/** Keys into the image registry in src/engine/scenes.ts (backdrops + plates). */
export type SceneId =
  | 'hall'
  | 'study'
  | 'cellar'
  | 'marsh'
  | 'churchyard'
  | 'wall-crack'
  | 'wall-burst'
  | 'obj-seance'
  | 'obj-seance-after'
  | 'map-marsh'
  | 'obj-ness'
  | 'obj-van'
  | 'obj-valve'
  | 'obj-grave'
  | 'obj-receiver'
  | 'obj-telephone'
  | 'obj-logbook'
  | 'obj-safe'
  | 'obj-letter'
  | 'obj-cards'
  | 'obj-clock'
  | 'obj-compass'
  | 'obj-mast'
  | 'obj-key';

export const AUDIO_CUES = [
  'static-swell',
  'ident',
  'silence',
  'key-unlock',
  'safe-open',
  'unlock',
  'phone-ring',
  'lamp-off',
  'page-turn',
  'footsteps',
  'hinge-creak',
  'scrape',
  'pips',
  'wire-hum',
  'marsh-wind',
  'morse-key',
  'knock-far',
  'letter-tear',
  'pips-muffled',
  'rust-break',
  'plaster-fall',
  'hasp-open',
  'hum-settle',
  'sheet-rustle',
  'whisper',
  'spark',
  'parish',
] as const;
export type AudioCue = (typeof AUDIO_CUES)[number];

export const isAudioCue = (v: unknown): v is AudioCue =>
  typeof v === 'string' && (AUDIO_CUES as readonly string[]).includes(v);

export interface Chapter {
  id: number; // 1..6
  title: string; // "Broadcast One"
  blocks: ChapterBlock[];
  /** The PRESSURE VALVE (doctrine: nudges, never instructions): per-gate
   *  margin notes in Halloran's second-log hand, keyed by gate id. The
   *  engine surfaces one only after the reader has been stuck at that gate
   *  for a long while — atmosphere removing a wall, never a walkthrough. */
  hints?: Record<string, string>;
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

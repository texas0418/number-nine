// src/daily/headerkey.ts
// HEADER-KEY NIGHTS. One night a week the station prints a word in its header,
// and that word IS the key.
//
// The construction is the classical keyed alphabet: take the word, drop
// repeated letters, follow it with the rest of A-Z in order, then number the
// result 1..26. A listener who recognises what the header word is for can write
// the whole key out in thirty seconds and read the transmission straight off.
//
// This variant is STRICTLY ADDITIVE, which is why it is safe. A listener who
// does not recognise it is looking at an ordinary substitution cryptogram and
// solves it exactly as on any other night, by frequency and word shape. The
// night can be short-cut; it can never be made harder.
//
// TWO RULES THE KEYWORD MUST OBEY, both enforced in test-cipher.ts:
//
//   1. It must NOT be a word from any transmission. Broadcast Four's crossover
//      gate asks "WHAT DID I SAY TONIGHT" and re-deals with a different true
//      word each time; printing a real word from tonight's line in the header
//      would hand that gate its answer.
//   2. It must be at least four distinct letters, or the keyed alphabet barely
//      differs from plain A-Z and the night gives itself away as trivial.
//
// Pure module: no expo imports, so `npm test` can run it in Node.

// Deliberately imports NOTHING from ./cipher. cipher.ts imports this module, so
// importing back would make a cycle — and a module cycle is precisely the shape
// that has already broken a release build on this project once. Twenty-six
// characters and eight lines of hash are cheaper than that risk.
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** FNV-1a, the same construction cipher.ts uses, kept local to avoid the cycle. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Monday. The gentlest night in REVEALS_BY_WEEKDAY already, which suits a
 *  variant whose whole nature is a shortcut rather than an obstacle. Fixed for
 *  the same reason Morse night is fixed: an unpredictable variant reads as a
 *  broken puzzle, a known one is something a listener returns for. */
export const HEADER_KEY_WEEKDAY: number = 1;

/** The station's own lexicon. Deliberately words the station would use about
 *  itself and its equipment, and deliberately NOT words that appear in any of
 *  the 365 transmissions — see rule 1 above. */
// NOTE: AERIAL and CARRIER were in this list and were REMOVED — test-cipher.ts
// caught both occurring in the 365 transmissions, which would have handed
// Broadcast Four's crossover gate a true word. Anything added here must pass
// that test.
export const HEADER_KEYWORDS: readonly string[] = [
  'DIALTONE',
  'EARPHONE',
  'FILAMENT',
  'GRIDBIAS',
  'HEADSET',
  'KILOCYCLE',
  'LOUDSPEAKER',
  'MAINSHUM',
  'OSCILLATOR',
  'PENTODE',
  'QUARTZ',
  'RHEOSTAT',
  'SIDEBAND',
  'TRANSFORMER',
  'VALVEHOLDER',
  'WAVEBAND',
];

export function weekdayOfKey(dayKey: string): number {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12).getDay();
}

export const isHeaderKeyNight = (dayKey: string): boolean =>
  weekdayOfKey(dayKey) === HEADER_KEY_WEEKDAY;

/** Tonight's header word. Deterministic from the day key, so every listener on
 *  earth is handed the same one. */
export function keywordForDay(dayKey: string): string {
  const h = hash(`number-nine:header:${dayKey}`);
  return HEADER_KEYWORDS[h % HEADER_KEYWORDS.length];
}

/** The keyed alphabet: the word with repeats dropped, then the rest of A-Z.
 *  Numbering this 1..26 is the whole trick. */
export function keyedAlphabet(keyword: string): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ch of keyword.toUpperCase())
    if (LETTERS.includes(ch) && !seen.has(ch)) {
      seen.add(ch);
      out.push(ch);
    }
  for (const ch of LETTERS) if (!seen.has(ch)) out.push(ch);
  return out.join('');
}

/** letter -> number for a header-key night. */
export function headerKeyMap(dayKey: string): Map<string, number> {
  return new Map(
    [...keyedAlphabet(keywordForDay(dayKey))].map((ch, i) => [ch, i + 1]),
  );
}

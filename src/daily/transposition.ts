// src/daily/transposition.ts
// TURNED-AROUND NIGHTS. On Sundays she sends the whole line back to front.
//
// This is the station's own rule, not a new one. The first listening log in
// Broadcast One carries it in the margin — "her words arrive turned around" —
// and the book composes it into gate after gate. The nightly signal simply
// obeys the same law one night a week, which means a free listener meets the
// rule that the paid story is built on before they ever buy anything.
//
// WHY THIS IS THE SAFE FORM OF TRANSPOSITION. A columnar or keyed transposition
// destroys word shapes, and word shapes are half of what a solver actually uses
// on a substitution cryptogram. A whole-line reversal preserves everything the
// solve depends on: the letter multiset is identical, so frequency analysis is
// untouched, and every word keeps its length and its pattern, merely mirrored.
// The substitution is exactly as hard as on any other night. What changes is
// that the solved line reads backwards, and recognising that is the one thing
// this station has always asked of a listener.
//
// THE CROSSOVER IS UNAFFECTED. Broadcast Four's b4-night gate takes its answer
// and its decoys from `transmissionForDay(dayKey).plaintext` — the FORWARD
// line — so the words it deals are real forward words no matter how the night
// was displayed. A reader who has met the rule in Broadcast One reads the
// turned-around night and answers normally.
//
// Pure module: no expo imports, so `npm test` can run it in Node.

/** Sunday. Morse takes Thursday and the header key takes Monday; the three
 *  variants can never collide, which test-cipher.ts asserts. */
export const TRANSPOSITION_WEEKDAY: number = 0;

export function weekdayOfDay(dayKey: string): number {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12).getDay();
}

export const isTurnedAroundNight = (dayKey: string): boolean =>
  weekdayOfDay(dayKey) === TRANSPOSITION_WEEKDAY;

/** The whole line, back to front. Character-wise rather than word-wise, so the
 *  words themselves are mirrored too: a listener who turns it around gets the
 *  transmission exactly as sent, and a listener who does not sees words of the
 *  right shapes in the wrong direction.
 *
 *  Deliberately NOT a keyed or columnar transposition. See the header. */
export const turnAround = (plaintext: string): string =>
  [...plaintext].reverse().join('');

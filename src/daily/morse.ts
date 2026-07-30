// src/daily/morse.ts
// MORSE NIGHTS. One night a week she sends in CW instead of counting aloud.
//
// This is a PRESENTATION change and nothing else. The plaintext, the key, the
// answer map and the solved check are all untouched: on a Morse night the cell
// still carries the same ciphertext number, it is simply printed as the dots
// and dashes a real numbers station would key. Solve it exactly as any other
// night, once you have read the figures back.
//
// Why that matters beyond taste: Broadcast Four's crossover gate (`b4-night`,
// "WHAT DID I SAY TONIGHT") resolves against the transmission's PLAINTEXT. If a
// variant ever altered the plaintext or the key, that gate would break. This one
// cannot, by construction.
//
// Pure module: no expo imports, so `npm test` can run it in Node.

/** International Morse for the ten digits. A numbers station keying figures
 *  sends these; letters never appear, because the ciphertext is numeric. */
export const MORSE_DIGITS: readonly string[] = [
  '-----', // 0
  '.----', // 1
  '..---', // 2
  '...--', // 3
  '....-', // 4
  '.....', // 5
  '-....', // 6
  '--...', // 7
  '---..', // 8
  '----.', // 9
];

/** Thursday. Fixed rather than random ON PURPOSE: a variant that lands
 *  unpredictably reads as a broken puzzle, while a variant that lands on a known
 *  night becomes something a listener comes back for. Same weekday for every
 *  listener on earth, like everything else about the nightly signal. */
export const MORSE_WEEKDAY: number = 4;

/** Weekday of a day key, using local noon so daylight saving cannot shift it. */
export function weekdayOf(dayKey: string): number {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12).getDay();
}

export const isMorseNight = (dayKey: string): boolean =>
  weekdayOf(dayKey) === MORSE_WEEKDAY;

/** A ciphertext number as keyed figures, one Morse group per digit.
 *  `18` becomes `.---- ---..`. Never zero-padded: the station sends the figures
 *  it has, and a leading zero would be a figure it did not send. */
export function morseForNumber(n: number): string {
  return String(n)
    .split('')
    .map((d) => MORSE_DIGITS[Number(d)])
    .join(' ');
}

/** The reading burden of a Morse night is real even though the puzzle is
 *  identical, so the night hands back one more letter than its weekday would
 *  normally give. Presentation change, not difficulty change — this is the line
 *  that keeps that claim honest. */
export const MORSE_NIGHT_BONUS_REVEALS = 1;

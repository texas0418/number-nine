// src/daily/morse.ts
// MORSE NIGHTS. One night a week she keys part of the transmission in CW.
//
// FIRST DESIGN, ABANDONED 2026-07-30: the ciphertext figures themselves were
// printed as Morse. It was safe and it was worthless. Reading the marks got you
// the number the other six nights print for free, so knowing Morse let you read
// faster and never let you solve better. Every player paid; nobody was paid.
// The tell was that the night needed a compensating extra letter — you do not
// compensate for a feature, you compensate for friction.
//
// WHAT IT IS NOW: the grid is ordinary. Above it she keys a short GIFT — a
// letter and the number it stands for, in Morse, unexplained. A listener who
// reads it starts two pairings ahead. A listener who cannot reads an ordinary
// Thursday and loses nothing they ever had. Knowledge is an advantage rather
// than a toll, which is how the header-key night already works.
//
// The gift must be a PAIRING. "E is free" is worth nothing on its own: a reveal
// in this puzzle is the number-to-letter link, so she keys the letter and then
// its figure.
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

/** International Morse for the letters, so she can key which letter she is
 *  giving away. */
export const MORSE_LETTERS: Readonly<Record<string, string>> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
  V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};

export const morseForLetter = (ch: string): string =>
  MORSE_LETTERS[ch.toUpperCase()] ?? '';

/** How many pairings she keys on a Morse night. Two: enough to be worth the
 *  reading, few enough that a listener who cannot read Morse is playing an
 *  ordinary night rather than a crippled one. */
export const MORSE_GIFT_COUNT = 2;

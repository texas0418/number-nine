// src/daily/keyedGift.ts
// What she keys above the grid on a Morse night: a short list of PAIRINGS, each
// a letter and the ciphertext figure it stands for, sent in Morse and never
// explained.
//
// A listener who reads it starts two pairings ahead of one who does not. Nobody
// is ever behind: the grid itself is an ordinary night, and the gift is added
// on top rather than taken out of what the night would otherwise give. That is
// the rule the first version of Morse night broke — see morse.ts for the
// autopsy.
//
// The gift is NOT applied automatically. It has to be read and then entered, or
// it is not a gift, it is a reveal with extra steps.
//
// Lives in its own module rather than in morse.ts because it needs the puzzle
// type from cipher.ts, and cipher.ts imports morse.ts. Importing back would
// close a module cycle, which is the shape that has already cost this project a
// release build once.

import type { DailyPuzzle } from './cipher';
import { MORSE_GIFT_COUNT, morseForLetter, morseForNumber } from './morse';

export interface KeyedGift {
  letter: string;
  num: number;
}

/** The pairings she gives away tonight: the most-used letters that are NOT
 *  already revealed, so the gift is always worth more than what the grid has
 *  handed over for free. Deterministic — frequency order with an alphabetical
 *  tiebreak — so every listener on earth is given the same two. */
export function keyedGifts(
  puzzle: DailyPuzzle,
  count: number = MORSE_GIFT_COUNT,
): KeyedGift[] {
  const uses = new Map<number, number>();
  for (const word of puzzle.words)
    for (const sym of word)
      if ('num' in sym) uses.set(sym.num, (uses.get(sym.num) ?? 0) + 1);

  return [...uses.entries()]
    .flatMap(([num, n]) => {
      const letter = puzzle.answerByNum.get(num);
      if (!letter || puzzle.revealedLetters.includes(letter)) return [];
      return [{ letter, num, n }];
    })
    .sort((a, b) => b.n - a.n || a.letter.localeCompare(b.letter))
    .slice(0, count)
    .map(({ letter, num }) => ({ letter, num }));
}

/** One pairing as she sends it: the letter, a separator, then the figure.
 *  `E = 24` becomes `.  =  ..--- ....-`. The separator is a printed glyph
 *  rather than a keyed one, because a keyed equals-sign is a piece of trivia
 *  and this is already asking enough. */
export const giftToMorse = (g: KeyedGift): string =>
  `${morseForLetter(g.letter)}  =  ${morseForNumber(g.num)}`;

/** The whole preamble, ready to print. Empty when there is nothing left worth
 *  giving, which keeps the line off the screen rather than showing an empty
 *  flourish. */
export const giftLine = (gifts: KeyedGift[]): string =>
  gifts.map(giftToMorse).join('   ·   ');

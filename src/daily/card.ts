// src/daily/card.ts
// The share card's CONTENT, separated from its appearance so the thing that
// must never leak can be tested in Node.
//
// Channel 1 in MARKETING.md calls the nightly share the always-on ad: it is the
// only advertising surface that works for a book, because a text novella cannot
// be sold with a video. The card carries a redacted transcript, which is
// intriguing rather than spoiling, so posting it costs the sharer nothing and
// makes a reader curious.
//
// THE ONE RULE: an unsolved position must never reveal its letter. The card is
// posted publicly, to an audience who mostly have not solved tonight, and one
// leak turns the ad into a spoiler. Enforced in test-cipher.ts.
//
// Pure module: no expo imports, no react-native imports.

import type { DailyPuzzle } from './cipher';

/** One position on the card: a letter the sharer actually earned, a literal
 *  (the apostrophe), or a bar. `null` means barred. */
export interface CardCell {
  letter: string | null;
  literal?: boolean;
}

/** The card's grid, word by word. Barred wherever the sharer's guess is absent
 *  or wrong — never where it is merely unchecked, because a wrong guess shown
 *  as a letter would be both a lie and a leak. */
export function cardWords(
  puzzle: DailyPuzzle,
  guessByNum: Map<number, string>,
): CardCell[][] {
  return puzzle.words.map((word) =>
    word.map((sym) => {
      if ('literal' in sym) return { letter: sym.literal, literal: true };
      const truth = puzzle.answerByNum.get(sym.num);
      const guess = guessByNum.get(sym.num);
      return { letter: guess === truth && truth !== undefined ? truth : null };
    }),
  );
}

/** How much of tonight the sharer actually got, 0..1. Drives the line under
 *  the grid: a card that says nothing about progress is just a redaction. */
export function solvedFraction(
  puzzle: DailyPuzzle,
  guessByNum: Map<number, string>,
): number {
  let total = 0;
  let got = 0;
  for (const [num, letter] of puzzle.answerByNum) {
    total += 1;
    if (guessByNum.get(num) === letter) got += 1;
  }
  return total === 0 ? 0 : got / total;
}

/** The line under the grid. Speaks like the station: a count of nights, never
 *  a score, never a percentage, never a rank. */
export function cardStatusLine(streak: number, solved: boolean): string {
  if (!solved) return 'STILL DECODING';
  if (streak <= 1) return 'RECEIVED · FIRST NIGHT';
  return `RECEIVED · ${streak} NIGHTS LISTENING`;
}

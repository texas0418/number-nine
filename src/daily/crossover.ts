// src/daily/crossover.ts
// Pure module (no expo imports — Node-testable): the B4 DAILY CROSSOVER.
// One of Broadcast Four's examinations asks the reader what she said
// TONIGHT — and the answer lives in tonight's actual Tonight's Signal line,
// the same line every player on earth is decoding this evening. We author
// both sides (the transmissions in schedule.ts and the decoy pool here), so
// the gate is always fair and always fresh.
//
// Re-deal design (device QA, two rounds): a wrong touch re-deals the card
// ENTIRELY — a different true word from tonight's line, three fresh decoys,
// every slot new. Nothing persists between deals, so diffing them teaches
// nothing; recognizing a word you decoded tonight is the only way in. This
// requires every transmission line to carry >=2 eligible words (tested) and
// decoys to be length-matched to the answer (a lone short word among long
// station-words would be a tell).

import { hashSeed, mulberry32 } from './cipher';
import { transmissionForDay } from './schedule';

/** Words of tonight's line a card may ask about: >=5 letters, first
 *  occurrence order. schedule.ts must keep every line at >=2 of these. */
export function eligibleWords(dayKey: string): string[] {
  const words = transmissionForDay(dayKey)
    .plaintext.toUpperCase()
    .split(/\s+/)
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    if (w.length >= 5 && !seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

/** Which of tonight's words this deal asks about — never the same word
 *  twice running, so consecutive cards always differ. */
export function answerForDeal(dayKey: string, deal: number): string {
  const el = eligibleWords(dayKey);
  let prev = -1;
  let idx = 0;
  for (let d = 0; d <= deal; d++) {
    const rand = mulberry32(hashSeed(`number-nine:crossover-answer:${dayKey}:${d}`));
    idx = Math.floor(rand() * el.length);
    if (el.length > 1 && idx === prev) idx = (idx + 1) % el.length;
    prev = idx;
  }
  return el[idx];
}

// Words with the cadence of her lines, spanning lengths 5..11 so any
// answer finds length-matched company — every one verifiably ABSENT from a
// given night before it is offered (filtered against tonight's plaintext).
const DECOY_POOL = [
  'BRASS',
  'CHIME',
  'FROST',
  'LATCH',
  'REEDS',
  'VALVE',
  'AERIAL',
  'BELFRY',
  'CHAPEL',
  'EMBERS',
  'STATIC',
  'VESTRY',
  'COMPASS',
  'CRYSTAL',
  'LANTERN',
  'PARAFFIN',
  'DIALTONE',
  'EVENSONG',
  'INTERVAL',
  'LISTENER',
  'MIDNIGHT',
  'OVERCAST',
  'PROTOCOL',
  'RECEIVER',
  'TELEGRAM',
  'WIRELESS',
  'BREATHING',
  'FREQUENCY',
  'HALFLIGHT',
  'SIGNALMAN',
  'STILLNESS',
  'CHURCHYARD',
  'KILOCYCLES',
  'OSCILLATOR',
  'WAVELENGTH',
  'TRANSMITTER',
] as const;

/** The gate's candidate words for a night's `deal`: one word she truly said
 *  tonight among length-matched decoys, order deterministic from the day
 *  key (all players see the same cards). `count` includes the answer; a
 *  wrong touch deals the next card, on which EVERYTHING differs. */
export function nightWordChoices(
  dayKey: string,
  count = 4,
  deal = 0,
): { words: string[]; answerIndex: number } {
  const answer = answerForDeal(dayKey, deal);
  const line = transmissionForDay(dayKey).plaintext.toUpperCase();
  const rand = mulberry32(hashSeed(`number-nine:crossover:${dayKey}:${deal}`));
  const bag = DECOY_POOL.filter(
    (w) => !line.includes(w) && Math.abs(w.length - answer.length) <= 2,
  );
  const decoys: string[] = [];
  const pool = [...bag];
  while (decoys.length < count - 1 && pool.length > 0) {
    decoys.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  const words = [...decoys];
  const answerIndex = Math.floor(rand() * count);
  words.splice(answerIndex, 0, answer);
  return { words: words.slice(0, count), answerIndex };
}

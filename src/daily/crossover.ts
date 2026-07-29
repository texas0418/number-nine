// src/daily/crossover.ts
// Pure module (no expo imports — Node-testable): the B4 DAILY CROSSOVER.
// One of Broadcast Four's examinations asks the reader what she said
// TONIGHT — and the answer lives in tonight's actual Tonight's Signal line,
// the same line every player on earth is decoding this evening. We author
// both sides (the transmissions in schedule.ts and the decoy pool here), so
// the gate is always fair and always fresh.

import { hashSeed, mulberry32 } from './cipher';
import { transmissionForDay } from './schedule';

/** The word she says tonight: the LONGEST word of tonight's transmission
 *  (first on ties) — long words survive a half-solved cryptogram best, so a
 *  reader who abandoned the night's puzzle midway still has a fair shot. */
export function tonightsWord(dayKey: string): string {
  const words = transmissionForDay(dayKey).plaintext.split(/\s+/).filter(Boolean);
  return words.reduce((best, w) => (w.length > best.length ? w : best), words[0]);
}

// Words with the cadence of her lines — every one verifiably ABSENT from a
// given night before it is offered (filtered against tonight's plaintext).
const DECOY_POOL = [
  'AERIAL',
  'BREATHING',
  'CHURCHYARD',
  'DIALTONE',
  'EVENSONG',
  'FREQUENCY',
  'HALFLIGHT',
  'INTERVAL',
  'KILOCYCLES',
  'LISTENER',
  'MIDNIGHT',
  'OVERCAST',
  'PROTOCOL',
  'RECEIVER',
  'SIGNALMAN',
  'STILLNESS',
  'TELEGRAM',
  'WAVELENGTH',
] as const;

/** The gate's candidate words for a night: tonight's word hidden among
 *  decoys, order deterministic from the day key (all players see the same
 *  card). `count` includes the answer. */
export function nightWordChoices(
  dayKey: string,
  count = 4,
): { words: string[]; answerIndex: number } {
  const answer = tonightsWord(dayKey);
  const line = transmissionForDay(dayKey).plaintext.toUpperCase();
  const rand = mulberry32(hashSeed(`number-nine:crossover:${dayKey}`));
  const pool = DECOY_POOL.filter((w) => !line.includes(w));
  const decoys: string[] = [];
  const bag = [...pool];
  while (decoys.length < count - 1 && bag.length > 0) {
    decoys.push(bag.splice(Math.floor(rand() * bag.length), 1)[0]);
  }
  const words = [...decoys];
  const answerIndex = Math.floor(rand() * count);
  words.splice(answerIndex, 0, answer);
  return { words: words.slice(0, count), answerIndex };
}

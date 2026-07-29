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
 *  card). `count` includes the answer. `deal` re-deals the card after a
 *  wrong touch — fresh decoys, same answer — so elimination teaches
 *  nothing; only having HEARD tonight's signal does (device QA: four fixed
 *  words fell to brute force in three touches). */
export function nightWordChoices(
  dayKey: string,
  count = 4,
  deal = 0,
): { words: string[]; answerIndex: number } {
  const answer = tonightsWord(dayKey);
  const line = transmissionForDay(dayKey).plaintext.toUpperCase();
  const pool = DECOY_POOL.filter((w) => !line.includes(w));
  // The SHADOW decoy: one decoy as permanent as the answer (day-seeded, not
  // deal-seeded). Without it, the answer would be the only word to survive
  // every re-deal, and diffing two deals would read it straight off
  // (device QA: it did). With it, persistence narrows to two — a coin flip
  // at best, behind the off-air waits.
  const dayRand = mulberry32(hashSeed(`number-nine:crossover-shadow:${dayKey}`));
  const shadow = pool[Math.floor(dayRand() * pool.length)];
  const rand = mulberry32(hashSeed(`number-nine:crossover:${dayKey}:${deal}`));
  const decoys: string[] = [shadow];
  const bag = pool.filter((w) => w !== shadow);
  while (decoys.length < count - 1 && bag.length > 0) {
    decoys.push(bag.splice(Math.floor(rand() * bag.length), 1)[0]);
  }
  const words = [...decoys];
  const answerIndex = Math.floor(rand() * count);
  words.splice(answerIndex, 0, answer);
  // one more shuffle so the shadow's slot is as restless as the rest
  const final = words.slice(0, count);
  const ai = final.indexOf(answer);
  for (let i = final.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [final[i], final[j]] = [final[j], final[i]];
  }
  return { words: final, answerIndex: ai >= 0 ? final.indexOf(answer) : 0 };
}

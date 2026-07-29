// test-cipher.ts — the daily transmission math, run in Node: npx tsx test-cipher.ts

import {
  ALPHABET,
  buildPuzzle,
  isSolved,
  keyForDay,
  lettersByFrequency,
  redactedTranscript,
  revealCount,
} from './src/daily/cipher';
import { TRANSMISSIONS, daysSinceEpoch, transmissionForDay } from './src/daily/schedule';

let failures = 0;
const ok = (name: string, cond: boolean, detail = '') => {
  if (!cond) {
    console.log(`FAIL ${name} ${detail}`);
    failures++;
  } else console.log(`ok   ${name}`);
};

// --- key generation -------------------------------------------------------
const k1 = keyForDay('2026-08-01');
const k2 = keyForDay('2026-08-01');
const k3 = keyForDay('2026-08-02');
ok('key is deterministic per day',
  JSON.stringify([...k1]) === JSON.stringify([...k2]));
ok('key differs between days',
  JSON.stringify([...k1]) !== JSON.stringify([...k3]));
ok('key is a permutation of 1..26',
  new Set([...k1.values()]).size === 26 &&
    [...k1.values()].every((n) => n >= 1 && n <= 26));
ok('key covers the alphabet', [...k1.keys()].sort().join('') === ALPHABET);

// Fresh key every day for a year: no two consecutive days share a mapping.
let sameDays = 0;
for (let d = 1; d <= 365; d++) {
  const day = new Date(Date.UTC(2026, 7, 1 + d)).toISOString().slice(0, 10);
  const prev = new Date(Date.UTC(2026, 7, d)).toISOString().slice(0, 10);
  if (
    JSON.stringify([...keyForDay(day)]) === JSON.stringify([...keyForDay(prev)])
  )
    sameDays++;
}
ok('no repeated key on consecutive days across a year', sameDays === 0);

// --- puzzle build ---------------------------------------------------------
const p = buildPuzzle('2026-08-05', 'THE STATION SINGS BEFORE IT SPEAKS');
ok('word count matches', p.words.length === 6);
ok('answer map covers distinct letters',
  p.answerByNum.size === new Set('THESTATIONSINGSBEFOREITSPEAKS').size);
ok('reveal count follows weekday rhythm',
  p.revealedLetters.length === revealCount('2026-08-05'));

const guesses = new Map([...p.answerByNum].map(([n, l]) => [n, l]));
ok('correct mapping solves', isSolved(p, guesses));
const wrong = new Map(guesses);
const firstNum = [...wrong.keys()][0];
wrong.set(firstNum, wrong.get(firstNum) === 'X' ? 'Y' : 'X');
ok('wrong letter does not solve', !isSolved(p, wrong));

// --- redaction ------------------------------------------------------------
const empty = new Map<number, string>();
const redacted = redactedTranscript(p, empty);
ok('unsolved transcript leaks no letters', !/[A-Z]/.test(redacted));
ok('solved transcript reads plain',
  redactedTranscript(p, guesses) === 'THE STATION SINGS BEFORE IT SPEAKS');

// --- frequency + schedule -------------------------------------------------
ok('frequency puts E or T near front for English text',
  ['E', 'T', 'S'].includes(lettersByFrequency('THE STATION SINGS BEFORE IT SPEAKS')[0]));
ok('epoch day zero', daysSinceEpoch('2026-08-01') === 0);
ok('serial advances', transmissionForDay('2026-08-02').serial === 2);
ok('pre-epoch days still get a transmission',
  TRANSMISSIONS.includes(transmissionForDay('2026-07-25').plaintext));
ok('transmissions are cipher-safe (A-Z, space, apostrophe only)',
  TRANSMISSIONS.every((t) => /^[A-Z' ]+$/.test(t)));

// --- B4 daily crossover ---------------------------------------------------
{
  const { tonightsWord, nightWordChoices } = require('./src/daily/crossover') as
    typeof import('./src/daily/crossover');
  ok('tonight\'s word is the longest word of the line',
    tonightsWord('2026-08-01') === 'STATION');
  const card = nightWordChoices('2026-08-01');
  ok('crossover card holds four words', card.words.length === 4);
  ok('the answer sits where the index says',
    card.words[card.answerIndex] === tonightsWord('2026-08-01'));
  ok('crossover card is deterministic per night',
    JSON.stringify(nightWordChoices('2026-08-01')) === JSON.stringify(card));
  // Fairness guard, a year out AND across re-deals (wrong touches re-deal
  // the card): exactly one candidate must appear in the night's line —
  // decoys verifiably absent — every night, every deal.
  let crossoverFails = 0;
  for (let d = 0; d < 365; d++) {
    const day = new Date(Date.UTC(2026, 7, 1 + d)).toISOString().slice(0, 10);
    const line = transmissionForDay(day).plaintext.toUpperCase();
    for (let deal = 0; deal < 4; deal++) {
      const c = nightWordChoices(day, 4, deal);
      const present = c.words.filter((w) => line.includes(w)).length;
      if (present !== 1 || c.words[c.answerIndex] !== tonightsWord(day)) crossoverFails++;
    }
  }
  ok('365 nights x 4 deals of crossover cards stay fair', crossoverFails === 0);
  ok(
    're-deals change the decoys, not the answer',
    JSON.stringify(nightWordChoices('2026-08-01', 4, 1).words) !==
      JSON.stringify(nightWordChoices('2026-08-01', 4, 0).words),
  );
  // Anti-diffing guard, a year out: the words that survive EVERY deal must
  // number at least two (answer + shadow decoy) — persistence alone must
  // never single the answer out.
  let diffableNights = 0;
  for (let d = 0; d < 365; d++) {
    const day = new Date(Date.UTC(2026, 7, 1 + d)).toISOString().slice(0, 10);
    let persistent = new Set(nightWordChoices(day, 4, 0).words);
    for (let deal = 1; deal < 6; deal++) {
      const w = new Set(nightWordChoices(day, 4, deal).words);
      persistent = new Set([...persistent].filter((x) => w.has(x)));
    }
    if (persistent.size < 2) diffableNights++;
  }
  ok('no night is solvable by diffing re-deals', diffableNights === 0);
}

// Solvability guard: every night of the next year must build a puzzle whose
// solved transcript round-trips to its plaintext.
let roundTripFails = 0;
for (let d = 0; d < 365; d++) {
  const day = new Date(Date.UTC(2026, 7, 1 + d)).toISOString().slice(0, 10);
  const { plaintext } = transmissionForDay(day);
  const puz = buildPuzzle(day, plaintext);
  const full = new Map([...puz.answerByNum]);
  if (redactedTranscript(puz, full) !== plaintext.toUpperCase()) roundTripFails++;
}
ok('365 nightly puzzles round-trip', roundTripFails === 0);

if (failures) {
  console.log(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nall cipher tests passed');

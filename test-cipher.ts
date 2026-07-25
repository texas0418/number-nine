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

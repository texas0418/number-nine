// test-models.ts — pure domain math, run in Node: npx tsx test-models.ts

import {
  currentStreak,
  dayKeyFromMs,
  isRadioLocked,
  prevDayKey,
  signalStrength,
} from './src/models';
import { visibleCount, solvedGatesBefore } from './src/engine/reveal';
import { BROADCAST_ONE } from './src/chapters/broadcast1';

let failures = 0;
const ok = (name: string, cond: boolean, detail = '') => {
  if (!cond) {
    console.log(`FAIL ${name} ${detail}`);
    failures++;
  } else console.log(`ok   ${name}`);
};

// --- radio ---------------------------------------------------------------
ok('lock inside tolerance', isRadioLocked(4623, 4625));
ok('no lock outside tolerance', !isRadioLocked(4620, 4625));
ok('strength peaks at target', signalStrength(4625, 4625, 4400, 4800) === 1);
ok('strength fades with distance',
  signalStrength(4500, 4625, 4400, 4800) < signalStrength(4600, 4625, 4400, 4800));
ok('strength clamps at zero', signalStrength(4400, 4625, 4400, 4800) === 0);

// --- day keys + streaks --------------------------------------------------
const noon = new Date(2026, 6, 25, 12).getTime();
ok('dayKey format', dayKeyFromMs(noon) === '2026-07-25');
ok('prevDayKey steps a day', prevDayKey('2026-07-25') === '2026-07-24');
ok('prevDayKey crosses months', prevDayKey('2026-08-01') === '2026-07-31');
ok('streak with today solved',
  currentStreak(['2026-07-23', '2026-07-24', '2026-07-25'], '2026-07-25') === 3);
ok('streak survives one pending night',
  currentStreak(['2026-07-23', '2026-07-24'], '2026-07-25') === 2);
ok('streak breaks after a missed night',
  currentStreak(['2026-07-22'], '2026-07-25') === 0);
ok('streak handles unsorted input',
  currentStreak(['2026-07-25', '2026-07-23', '2026-07-24'], '2026-07-25') === 3);

// --- chapter reveal math -------------------------------------------------
const blocks = BROADCAST_ONE.blocks;
const GATE_KINDS = ['radio', 'fork', 'keypad', 'safe', 'cipher', 'melody', 'hotspot'];
const ANSWER_KINDS = ['keypad', 'safe', 'cipher', 'melody'];
const gateIdxs = blocks
  .map((b, i) => ({ b, i }))
  .filter(({ b }) => GATE_KINDS.includes(b.kind))
  .map(({ i }) => i);
// Seven puzzles (hotspot, safe, radio, cipher, melody, telephone, count) + 1 fork.
ok('broadcast one has seven solve-puzzles plus the fork', gateIdxs.length === 8);
const puzzleCount = blocks.filter(
  (b) => ANSWER_KINDS.includes(b.kind) || b.kind === 'radio' || b.kind === 'hotspot',
).length;
ok('broadcast one has at least seven puzzles', puzzleCount >= 7);
// Variety doctrine: not just codes — observation (hotspot) and ear (melody)
// mechanics must be present alongside the entry locks.
const mechanics = new Set(
  blocks.filter((b) => GATE_KINDS.includes(b.kind) && b.kind !== 'fork').map((b) => b.kind),
);
ok('puzzles span at least six mechanics', mechanics.size >= 6);
ok('has a non-code observation puzzle', mechanics.has('hotspot'));
ok('has a non-code ear puzzle', mechanics.has('melody'));

// Puzzle doctrine: no gate's literal answer may appear in the three blocks
// preceding it (clues must live far from their locks).
const answerNear = gateIdxs.some((gi) => {
  const b = blocks[gi];
  const key =
    b.kind === 'radio'
      ? String(b.targetKhz)
      : ANSWER_KINDS.includes(b.kind)
        ? (b as { answer: string }).answer
        : null;
  if (!key) return false;
  return blocks.slice(Math.max(0, gi - 3), gi).some((prev) =>
    JSON.stringify(prev).toUpperCase().includes(key.toUpperCase()),
  );
});
ok('no gate answer within three blocks of its gate', !answerNear);
ok('reveal stops at first gate',
  visibleCount(blocks, new Set()) === gateIdxs[0] + 1);
ok('reveal stops at second gate once first solved',
  visibleCount(blocks, new Set([gateIdxs[0]])) === gateIdxs[1] + 1);
ok('all blocks visible when gates solved',
  visibleCount(blocks, new Set(gateIdxs)) === blocks.length);
ok('resume reconstructs solved gates',
  [...solvedGatesBefore(blocks, blocks.length)].join(',') === gateIdxs.join(','));
ok('fresh start reconstructs none', solvedGatesBefore(blocks, 0).size === 0);
ok('chapter ends with chapterEnd', blocks[blocks.length - 1].kind === 'chapterEnd');

if (failures) {
  console.log(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nall model tests passed');

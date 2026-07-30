// test-site.ts — the Listeners' Society archive, checked against the book it
// annotates. Pure: no filesystem, no expo. Run in Node: npx tsx test-site.ts
//
// The archive is a second copy of the puzzle design, written in prose, kept
// in a different directory. That is exactly the sort of thing that rots
// silently — a gate's answer changes during a playtest round and the clue
// page goes on confidently describing the old one. These checks make that a
// build failure rather than a support email.

import { BROADCAST_ONE } from './src/chapters/broadcast1';
import { BROADCAST_TWO } from './src/chapters/broadcast2';
import { BROADCAST_THREE } from './src/chapters/broadcast3';
import { BROADCAST_FOUR } from './src/chapters/broadcast4';
import { BROADCAST_FIVE } from './src/chapters/broadcast5';
import { BROADCAST_SIX } from './src/chapters/broadcast6';
import { SECTIONS } from './site/clues';
import { cluedGateIds, slugify, verifyArchive } from './site/verify';

const CHAPTERS = [
  BROADCAST_ONE,
  BROADCAST_TWO,
  BROADCAST_THREE,
  BROADCAST_FOUR,
  BROADCAST_FIVE,
  BROADCAST_SIX,
];

let failures = 0;
const ok = (name: string, cond: boolean, detail = '') => {
  if (!cond) {
    console.log(`FAIL ${name} ${detail}`);
    failures++;
  } else console.log(`ok   ${name}`);
};

// --- coverage and leaks (the whole of verify.ts) -------------------------
const { problems, intercepts } = verifyArchive(CHAPTERS, SECTIONS);
ok('archive matches the book', problems.length === 0, `\n  ${problems.join('\n  ')}`);

const requiredTotal = CHAPTERS.reduce((n, c) => n + cluedGateIds(c).length, 0);
ok('every puzzle gate is catalogued', intercepts === requiredTotal,
  `${intercepts} intercepts for ${requiredTotal} gates`);

// --- every broadcast is represented --------------------------------------
ok('six sections', SECTIONS.length === 6);
for (const s of SECTIONS)
  ok(`${s.title} has intercepts`, s.intercepts.length > 0);

// --- the three steps are actually written --------------------------------
for (const section of SECTIONS)
  for (const i of section.intercepts) {
    const filled =
      i.heading.trim().length > 0 &&
      i.standfirst.trim().length > 0 &&
      i.where.trim().length > 0 &&
      i.members.trim().length > 0 &&
      i.transcript.trim().length > 0;
    ok(`${i.id} is fully written`, filled);
  }

// --- the grading actually grades -----------------------------------------
// Step one re-aims attention and step two is a real nudge, so two should
// never be the SHORTER of the pair by a wide margin — that pattern has
// always meant step two was left as a stub.
for (const section of SECTIONS)
  for (const i of section.intercepts)
    ok(`${i.id} step two carries its weight`, i.members.length > 120,
      `${i.members.length} chars`);

// --- slugs are stable, lowercase and free of punctuation -----------------
for (const section of SECTIONS)
  for (const i of section.intercepts) {
    const slug = slugify(i.heading);
    ok(`${i.id} slug is url-safe`, /^[a-z0-9-]+$/.test(slug), slug);
  }

// --- the daily-crossover gate must not print an answer at all ------------
// b4-night's answer is different every night, so any transcript that names a
// specific word is wrong by construction and would mislead every reader who
// arrived on a different evening.
const night = SECTIONS.flatMap((s) => s.intercepts).find((i) => i.id === 'b4-night');
ok('the crossover gate promises no fixed answer',
  !!night && /tonight/i.test(night.transcript));

console.log(failures ? `\n${failures} FAILED` : '\nall site checks passed');
process.exit(failures ? 1 : 0);

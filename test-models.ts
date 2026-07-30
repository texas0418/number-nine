// test-models.ts — pure domain math, run in Node: npx tsx test-models.ts

import {
  currentStreak,
  dayKeyFromMs,
  isRadioLocked,
  prevDayKey,
  signalStrength,
} from './src/models';
import { GATE_KINDS as ENGINE_GATE_KINDS, progressIndex, solvedGatesBefore, visibleCount } from './src/engine/reveal';
import { BROADCAST_ONE } from './src/chapters/broadcast1';
import { BROADCAST_TWO } from './src/chapters/broadcast2';
import { BROADCAST_THREE } from './src/chapters/broadcast3';
import { BROADCAST_FOUR } from './src/chapters/broadcast4';
import { BROADCAST_FIVE } from './src/chapters/broadcast5';
import { BROADCAST_SIX } from './src/chapters/broadcast6';
import type { Chapter, ChapterBlock } from './src/models';

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
// Ten puzzles (find-safe, safe, radio, cipher, melody, brick, tin, telephone,
// count, last-word) + 1 fork.
ok('broadcast one has ten solve-puzzles plus the fork', gateIdxs.length === 11);
const puzzleCount = blocks.filter(
  (b) => ANSWER_KINDS.includes(b.kind) || b.kind === 'radio' || b.kind === 'hotspot',
).length;
ok('broadcast one has at least nine puzzles', puzzleCount >= 9);
// Variety doctrine: not just codes — observation (hotspot) and ear (melody)
// mechanics must be present alongside the entry locks.
const mechanics = new Set(
  blocks.filter((b) => GATE_KINDS.includes(b.kind) && b.kind !== 'fork').map((b) => b.kind),
);
ok('puzzles span at least six mechanics', mechanics.size >= 6);
ok('has a non-code observation puzzle', mechanics.has('hotspot'));
ok('has a non-code ear puzzle', mechanics.has('melody'));

// Puzzle doctrine: no gate's literal answer may appear in the three blocks
// preceding it (clues must live far from their locks). Generalized over
// every answer-bearing gate kind so new mechanics stay honest.
const answerKeyOf = (b: ChapterBlock): string | null => {
  if (b.kind === 'radio') return String(b.targetKhz);
  if (b.kind === 'morsesend') return b.word;
  if (b.kind === 'clock')
    return `${String(b.answerHour).padStart(2, '0')}${String(b.answerMinute).padStart(2, '0')}`;
  if ('answer' in b && typeof (b as { answer?: unknown }).answer === 'string')
    return (b as { answer: string }).answer;
  return null;
};
const answersNearGates = (bs: ChapterBlock[]): boolean =>
  bs.some((b, gi) => {
    const key = answerKeyOf(b);
    if (!key || !(ENGINE_GATE_KINDS as readonly string[]).includes(b.kind)) return false;
    return bs.slice(Math.max(0, gi - 3), gi).some((prev) =>
      JSON.stringify(prev).toUpperCase().includes(key.toUpperCase()),
    );
  });
ok('no gate answer within three blocks of its gate', !answersNearGates(blocks));

// Pressure-valve doctrine: a margin note removes a WALL, it never hands over
// the number. No hint may contain the literal thing its own gate wants —
// including the word a flip/lamp gate asks you to touch and the figures a
// knocking wall wants echoed.
const secretOf = (b: ChapterBlock): string | null => {
  if (b.kind === 'knock') return b.groups.join('');
  if ('targetWord' in b && typeof b.targetWord === 'string') return b.targetWord;
  return answerKeyOf(b);
};
const gatesById = (ch: Chapter): Map<string, ChapterBlock> =>
  new Map(
    ch.blocks.flatMap((b) =>
      (ENGINE_GATE_KINDS as readonly string[]).includes(b.kind) && 'id' in b
        ? [[(b as { id: string }).id, b] as const]
        : [],
    ),
  );
const hintsLeakAnswers = (ch: Chapter): boolean => {
  const byId = gatesById(ch);
  return Object.entries(ch.hints ?? {}).some(([id, note]) => {
    const gate = byId.get(id);
    const secret = gate ? secretOf(gate) : null;
    return !!secret && note.toUpperCase().includes(secret.toUpperCase());
  });
};
/** Every gate the reader can stall at must have a note. B1 and B2 predate the
 *  valve, so this is the check that keeps the retro-fit complete. */
const hintsCoverEveryGate = (ch: Chapter): boolean =>
  [...gatesById(ch).keys()].every((id) => !!ch.hints?.[id]);
ok('reveal stops at first gate',
  visibleCount(blocks, new Set()) === gateIdxs[0] + 1);
ok('reveal stops at second gate once first solved',
  visibleCount(blocks, new Set([gateIdxs[0]])) === gateIdxs[1] + 1);
ok('all blocks visible when gates solved',
  visibleCount(blocks, new Set(gateIdxs)) === blocks.length);
ok('resume reconstructs solved gates',
  [...solvedGatesBefore(blocks, blocks.length)].join(',') === gateIdxs.join(','));
ok('fresh start reconstructs none', solvedGatesBefore(blocks, 0).size === 0);

// Regression (resume-skipped-a-puzzle bug): after solving ONLY the first gate,
// the persisted index must NOT mark the second gate solved on resume.
{
  const oneSolved = new Set([gateIdxs[0]]);
  const saved = progressIndex(blocks, oneSolved);
  ok('progressIndex points at the next unsolved gate', saved === gateIdxs[1]);
  const restored = solvedGatesBefore(blocks, saved);
  ok('resume after one solve restores exactly one gate',
    restored.size === 1 && restored.has(gateIdxs[0]) && !restored.has(gateIdxs[1]));
}
ok('chapter ends with chapterEnd', blocks[blocks.length - 1].kind === 'chapterEnd');
ok(
  'b1 hints all reference real gates',
  Object.keys(BROADCAST_ONE.hints ?? {}).every((id) => gatesById(BROADCAST_ONE).has(id)),
);
ok('b1 hints cover every gate', hintsCoverEveryGate(BROADCAST_ONE));
ok('b1 hints never contain their own answer', !hintsLeakAnswers(BROADCAST_ONE));

// --- Broadcast Two doctrine ----------------------------------------------
{
  const b2 = BROADCAST_TWO.blocks;
  const CODE_ENTRY = ['keypad', 'safe', 'cipher'];
  const b2Gates = b2.filter((b) => (ENGINE_GATE_KINDS as readonly string[]).includes(b.kind));
  ok('b2 has ten gates plus the fork (letter seal + sending key)', b2Gates.length === 11);
  // Doctrine (Simon 2026-07-28): at most ONE code-entry puzzle per broadcast
  // from B2 on.
  const codeCount = b2.filter((b) => CODE_ENTRY.includes(b.kind)).length;
  ok('b2 has exactly one code-entry puzzle', codeCount === 1);
  const b2Mechanics = new Set(
    b2Gates.filter((b) => b.kind !== 'fork').map((b) => b.kind),
  );
  const b1Mechanics = new Set(
    blocks
      .filter((b) => (ENGINE_GATE_KINDS as readonly string[]).includes(b.kind) && b.kind !== 'fork')
      .map((b) => b.kind),
  );
  // Ramp doctrine: each broadcast raises the bar — more distinct mechanics
  // than the one before.
  ok('b2 spans more mechanics than b1', b2Mechanics.size > b1Mechanics.size);
  ok('b2 answers stay three blocks from their gates', !answersNearGates(b2));
  ok('b2 ends with chapterEnd', b2[b2.length - 1].kind === 'chapterEnd');
  ok('b2 knock pattern spells the new frequency', (() => {
    const knock = b2.find((b) => b.kind === 'knock');
    const radio = b2.find((b) => b.kind === 'radio');
    return (
      knock?.kind === 'knock' &&
      radio?.kind === 'radio' &&
      knock.groups.join('') === String(radio.targetKhz)
    );
  })());
  ok(
    'b2 hints all reference real gates',
    Object.keys(BROADCAST_TWO.hints ?? {}).every((id) => gatesById(BROADCAST_TWO).has(id)),
  );
  // Includes the two un-failable acts (the seal, the sending key): the page
  // will not continue without the reader's hand, so they can strand too.
  ok('b2 hints cover every gate', hintsCoverEveryGate(BROADCAST_TWO));
  ok('b2 hints never contain their own answer', !hintsLeakAnswers(BROADCAST_TWO));
}

// --- Broadcast Three doctrine ---------------------------------------------
{
  const b3 = BROADCAST_THREE.blocks;
  const CODE_ENTRY = ['keypad', 'safe', 'cipher'];
  const b3Gates = b3.filter((b) => (ENGINE_GATE_KINDS as readonly string[]).includes(b.kind));
  ok('b3 has eight puzzles plus the fork', b3Gates.length === 9);
  ok(
    'b3 has exactly one code-entry puzzle',
    b3.filter((b) => CODE_ENTRY.includes(b.kind)).length === 1,
  );
  ok('b3 answers stay three blocks from their gates', !answersNearGates(b3));
  ok('b3 ends with chapterEnd', b3[b3.length - 1].kind === 'chapterEnd');
  // the felt digits must match the typed answer (the wall says the number)
  const box = b3.find((b) => b.kind === 'keypad');
  ok(
    'b3 poor-box felt groups spell its answer',
    box?.kind === 'keypad' && (box.feltGroups ?? []).join('') === box.answer,
  );
  // every pressure-valve hint points at a real gate id
  const gateIds = new Set(
    b3Gates.flatMap((b) => ('id' in b ? [(b as { id: string }).id] : [])),
  );
  ok(
    'b3 hints all reference real gates',
    Object.keys(BROADCAST_THREE.hints ?? {}).every((id) => gateIds.has(id)),
  );
  ok('b3 hints never contain their own answer', !hintsLeakAnswers(BROADCAST_THREE));
  ok('b3 hints cover every gate', hintsCoverEveryGate(BROADCAST_THREE));
}

// --- Broadcast Four doctrine ----------------------------------------------
{
  const b4 = BROADCAST_FOUR.blocks;
  const CODE_ENTRY = ['keypad', 'safe', 'cipher'];
  const b4Gates = b4.filter((b) => (ENGINE_GATE_KINDS as readonly string[]).includes(b.kind));
  ok('b4 has eight puzzles plus the fork', b4Gates.length === 9);
  ok(
    'b4 has exactly one code-entry puzzle',
    b4.filter((b) => CODE_ENTRY.includes(b.kind)).length === 1,
  );
  ok('b4 answers stay three blocks from their gates', !answersNearGates(b4));
  ok('b4 ends with chapterEnd', b4[b4.length - 1].kind === 'chapterEnd');
  // Ramp doctrine: B4's finale composes FOUR rules. The logbook's sent marks
  // must decode to the typed answer under: groups reversed (B3's sheets),
  // minus the borrowed nine (B2's climb), alphabet from the far end (B1's
  // tin). If the numbers and the answer ever drift apart, this fails.
  const verdict = b4.find((b) => b.kind === 'cipher');
  const marksLine = b4
    .flatMap((b) => (b.kind === 'logbook' ? b.lines : []))
    .find((l) => /\d+\s*·\s*\d+/.test(l));
  const sent = (marksLine ?? '').match(/\d+/g)?.map(Number) ?? [];
  const decoded = [...sent]
    .reverse()
    .map((n) => n - 9)
    .map((n) => String.fromCharCode(64 + (27 - n)))
    .join('');
  ok(
    'b4 verdict marks decode to the typed answer (4 rules)',
    verdict?.kind === 'cipher' && sent.length === 6 && decoded === verdict.answer,
  );
  // the trace's order must be a valid index path into its nodes, skipping E
  const trace = b4.find((b) => b.kind === 'trace');
  ok(
    'b4 trace order indexes real terminals and shuns the earth',
    trace?.kind === 'trace' &&
      trace.order.every((i) => i >= 0 && i < trace.nodes.length) &&
      !trace.order.includes(trace.nodes.indexOf('E')),
  );
  // her hour and her wave are ONE fact: the ink keeps 23:14 and the result
  // tunes at 2314 kHz (Simon, round 3: the hour gate repeated the ink's
  // solution; the frequency leap replaced it)
  const ink = b4.find((b) => b.kind === 'ink');
  const radio = b4.find((b) => b.kind === 'radio');
  ok(
    'b4 result frequency encodes the ink gate\'s hour',
    ink?.kind === 'ink' &&
      radio?.kind === 'radio' &&
      ink.hour === 23 && ink.minute === 14 &&
      radio.targetKhz === ink.hour * 100 + ink.minute,
  );
  ok('b4 keeps no hour gate (the clock lie lives in the ink alone)',
    !b4.some((b) => b.kind === 'hour'));
  // every pressure-valve hint points at a real gate id
  const gateIds = new Set(
    b4Gates.flatMap((b) => ('id' in b ? [(b as { id: string }).id] : [])),
  );
  ok(
    'b4 hints all reference real gates',
    Object.keys(BROADCAST_FOUR.hints ?? {}).every((id) => gateIds.has(id)),
  );
  ok('b4 hints never contain their own answer', !hintsLeakAnswers(BROADCAST_FOUR));
  ok('b4 hints cover every gate', hintsCoverEveryGate(BROADCAST_FOUR));
}

// --- Broadcast Five doctrine ----------------------------------------------
{
  const b5 = BROADCAST_FIVE.blocks;
  const CODE_ENTRY = ['keypad', 'safe', 'cipher'];
  const b5Gates = b5.filter((b) => (ENGINE_GATE_KINDS as readonly string[]).includes(b.kind));
  ok('b5 has seven puzzles plus the fork', b5Gates.length === 8);
  ok(
    'b5 has exactly one code-entry puzzle',
    b5.filter((b) => CODE_ENTRY.includes(b.kind)).length === 1,
  );
  ok('b5 answers stay three blocks from their gates', !answersNearGates(b5));
  ok('b5 ends with chapterEnd', b5[b5.length - 1].kind === 'chapterEnd');
  // The finale's answer must NEVER appear in the book — the reader carries
  // coordinates into the real world and brings the name back.
  const where = b5.find((b) => b.kind === 'cipher');
  ok(
    'b5 finale answer appears nowhere in any chapter text',
    where?.kind === 'cipher' &&
      ![...b5, ...BROADCAST_FOUR.blocks, ...BROADCAST_THREE.blocks].some(
        (b) =>
          b !== where &&
          JSON.stringify(b).toUpperCase().includes(where.answer.toUpperCase()),
      ),
  );
  // Triangulation geometry: each locked bearing line must pass through the
  // target rect's center within half the rect's size — three lines, one
  // honest crossing.
  const tri = b5.find((b) => b.kind === 'triangulate');
  ok(
    'b5 bearing lines cross inside the target',
    tri?.kind === 'triangulate' &&
      tri.stations.every((st) => {
        const cx = tri.target.x + tri.target.w / 2;
        const cy = tri.target.y + tri.target.h / 2;
        const rad = ((st.bearingDeg - 180) * Math.PI) / 180;
        // line from site along bearing: direction (sin B, -cos B) in map
        // coords (y down); distance from center to the line
        const dx = Math.sin((st.bearingDeg * Math.PI) / 180);
        const dy = -Math.cos((st.bearingDeg * Math.PI) / 180);
        const px = cx - st.siteX;
        const py = cy - st.siteY;
        const cross = Math.abs(px * dy - py * dx);
        const along = px * dx + py * dy;
        void rad;
        return cross <= tri.target.w / 2 && along > 0;
      }),
  );
  // The morse word must be sendable: every letter in the artifact alphabet.
  const send = b5.find((b) => b.kind === 'morsesend');
  ok(
    'b5 morse word is A-Z only',
    send?.kind === 'morsesend' && /^[A-Z]+$/.test(send.word),
  );
  // The slip must exist and carry coordinates (the pocket is a clue channel).
  const slip = b5.find((b) => b.kind === 'slip');
  ok(
    'b5 pocket slip carries coordinates',
    slip?.kind === 'slip' && /\d+ \d+ \d+ N/.test(slip.text),
  );
  // every pressure-valve hint points at a real gate id
  const gateIds = new Set(
    b5Gates.flatMap((b) => ('id' in b ? [(b as { id: string }).id] : [])),
  );
  ok(
    'b5 hints all reference real gates',
    Object.keys(BROADCAST_FIVE.hints ?? {}).every((id) => gateIds.has(id)),
  );
  ok('b5 hints never contain their own answer', !hintsLeakAnswers(BROADCAST_FIVE));
  ok('b5 hints cover every gate', hintsCoverEveryGate(BROADCAST_FIVE));
}

// --- Broadcast Six doctrine -----------------------------------------------
{
  const b6 = BROADCAST_SIX.blocks;
  const CODE_ENTRY = ['keypad', 'safe', 'cipher'];
  const b6Gates = b6.filter((b) => (ENGINE_GATE_KINDS as readonly string[]).includes(b.kind));
  ok('b6 has ten gates (the choice included)', b6Gates.length === 10);
  ok(
    'b6 has exactly one code-entry puzzle',
    b6.filter((b) => CODE_ENTRY.includes(b.kind)).length === 1,
  );
  ok('b6 answers stay three blocks from their gates', !answersNearGates(b6));
  ok('b6 ends with chapterEnd', b6[b6.length - 1].kind === 'chapterEnd');
  ok(
    'b6 keeps two real nights',
    b6.filter((b) => b.kind === 'nightgate').length === 2,
  );
  // The five-rule verdict: the logbook's twelve figures must decode to the
  // typed answer — strike the wall's figures (the book's own numbers),
  // reverse, minus her minute (14), minus her nine, far-end alphabet.
  const name = b6.find((b) => b.kind === 'cipher');
  const figuresBlock = b6
    .flatMap((b) => (b.kind === 'logbook' ? [b.lines.join(' ')] : []))
    .find((l) => l.includes('twelve figures'));
  const figures = (figuresBlock ?? '').match(/\d+/g)?.map(Number).filter((n) => n > 12) ?? [];
  const WALL = [91, 46, 25, 90];
  const struck = figures.filter((_, i) => i % 3 !== 2);
  const wallFigures = figures.filter((_, i) => i % 3 === 2);
  const decoded = [...struck]
    .reverse()
    .map((n) => n - 9 - 14)
    .map((n) => String.fromCharCode(64 + (27 - n)))
    .join('');
  ok(
    'b6 verdict figures decode to the typed name (5 rules)',
    name?.kind === 'cipher' &&
      figures.length === 12 &&
      decoded === name.answer &&
      wallFigures.every((n) => WALL.includes(n)),
  );
  // The night-one fragment must be the first six figures verbatim.
  const frag1 = b6
    .flatMap((b) => (b.kind === 'logbook' ? [b.lines.join(' ')] : []))
    .find((l) => l.includes('NIGHT THE FIRST'));
  ok(
    'b6 night-one fragment matches the final transmission',
    (frag1 ?? '').match(/\d+/g)?.filter((s) => Number(s) > 12).slice(0, 6).join(',') ===
      figures.slice(0, 6).join(','),
  );
  // The ritual keeps the learned settings: her wave, the worn mark, her hour.
  const rit = b6.find((b) => b.kind === 'ritual');
  ok(
    'b6 ritual keeps the learned settings',
    rit?.kind === 'ritual' &&
      rit.targetKhz === 2314 && rit.gainMark === 7 &&
      rit.hour === 23 && rit.minute === 14,
  );
  // The séance knocks the cellar door's number.
  const seance = b6.find((b) => b.kind === 'seance');
  ok(
    'b6 seance knocks four six two five',
    seance?.kind === 'seance' && seance.groups.join('') === '4625',
  );
  // Two endings, both present, plus the shared coda.
  const choice = b6.find((b) => b.kind === 'endingfork');
  ok(
    'b6 offers two endings and a coda',
    choice?.kind === 'endingfork' &&
      choice.left.length > 0 && choice.right.length > 0 && choice.coda.length > 0,
  );
  const gateIds = new Set(
    b6Gates.flatMap((b) => ('id' in b ? [(b as { id: string }).id] : [])),
  );
  ok(
    'b6 hints all reference real gates',
    Object.keys(BROADCAST_SIX.hints ?? {}).every((id) => gateIds.has(id)),
  );
  ok('b6 hints never contain their own answer', !hintsLeakAnswers(BROADCAST_SIX));
  ok('b6 hints cover every gate', hintsCoverEveryGate(BROADCAST_SIX));
}

// --- permissions the app must not ask for --------------------------------
// The B5 mic gate was cut after playtesting, but its permission string sat in
// app.json for another two broadcasts. A declared permission the app never
// exercises is a routine App Review rejection, and expo-audio's plugin only
// DROPS the key when the value is exactly `false` — omitting it falls back to
// Apple's generic default string. So assert the value, not its absence.
{
  const appJson = require('./app.json') as {
    expo: { plugins: (string | [string, Record<string, unknown>])[] };
  };
  const audioPlugin = appJson.expo.plugins.find(
    (p): p is [string, Record<string, unknown>] =>
      Array.isArray(p) && p[0] === 'expo-audio',
  );
  ok('expo-audio is configured', !!audioPlugin);
  ok(
    'the app declares no microphone permission',
    audioPlugin?.[1]?.microphonePermission === false,
    String(audioPlugin?.[1]?.microphonePermission),
  );
  ok(
    'no gate kind can ask for the mic',
    !(ENGINE_GATE_KINDS as readonly string[]).includes('micstage'),
  );
  // expo-audio defaults enableBackgroundPlayback to true, which writes
  // UIBackgroundModes: audio. This app does the opposite on purpose — iOS
  // pauses every player on background and audio.ts resumes them on
  // foreground — and declaring a background mode you do not use is
  // App Review guideline 2.5.4.
  ok(
    'the app claims no background audio it does not play',
    audioPlugin?.[1]?.enableBackgroundPlayback === false,
    String(audioPlugin?.[1]?.enableBackgroundPlayback),
  );
}

// --- her voice: the cues, the files and the chapters must agree -----------
// The clips are treated offline and dropped in by hand, so the three lists
// can drift silently: a cue with no file plays nothing, a file no chapter
// names is dead weight in the bundle, and neither fails a build.
{
  const fs = require('fs') as typeof import('fs');
  const audioSrc = fs.readFileSync('src/audio.ts', 'utf8');
  const onDisk = new Set(
    fs.readdirSync('assets/audio').filter((f: string) => f.endsWith('.wav')),
  );

  const registered = [...audioSrc.matchAll(/'([^']+)': require\('\.\.\/assets\/audio\/([^']+)'\)/g)]
    .map((m) => ({ cue: m[1], file: m[2] }));
  const missing = registered.filter((r) => !onDisk.has(r.file));
  ok('every registered clip exists on disk', missing.length === 0,
    missing.map((m) => m.file).join(', '));

  // Every voice cue named by a chapter must be registered in SFX_FILES.
  const named = new Set<string>();
  for (const c of [BROADCAST_ONE, BROADCAST_TWO, BROADCAST_THREE,
                   BROADCAST_FOUR, BROADCAST_FIVE, BROADCAST_SIX])
    for (const b of c.blocks) {
      const cue = (b as { cue?: string }).cue;
      if (cue && (cue.startsWith('v-b') || cue === 'ident-then-voice')) named.add(cue);
    }
  const regCues = new Set(registered.map((r) => r.cue));
  const unplayable = [...named].filter(
    (c) => c !== 'ident-then-voice' && !regCues.has(c),
  );
  ok('every voice line a chapter names has a clip', unplayable.length === 0,
    unplayable.join(', '));

  // All ten digits, or the nightly signal cannot be spoken.
  const digits = Array.from({ length: 10 }, (_, i) => `num-${i}.wav`);
  ok('all ten digits are present for the sequencer',
    digits.every((d) => onDisk.has(d)),
    digits.filter((d) => !onDisk.has(d)).join(', '));

  ok('her recorded lines are all reachable from the book',
    [...regCues].filter((c) => c.startsWith('v-b') && c !== 'v-b1-1' && !named.has(c)).length === 0);
}

if (failures) {
  console.log(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nall model tests passed');

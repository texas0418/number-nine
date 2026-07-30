// test-cipher.ts — the daily transmission math, run in Node: npx tsx test-cipher.ts

import { ALPHABET, REVEALS_BY_WEEKDAY, buildPuzzle, isSolved, keyForDay, lettersByFrequency, redactedTranscript, revealCount } from './src/daily/cipher';
import { isMorseNight, MORSE_DIGITS, MORSE_WEEKDAY, morseForNumber } from './src/daily/morse';
import { HEADER_KEYWORDS, HEADER_KEY_WEEKDAY, isHeaderKeyNight, keyedAlphabet, keywordForDay } from './src/daily/headerkey';
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
ok('a full year of nights is authored', TRANSMISSIONS.length >= 365);
ok('no transmission repeats a night',
  new Set(TRANSMISSIONS).size === TRANSMISSIONS.length);
// The cryptogram lays each word out as a row of cells and a word may not
// wrap. DailySignalScreen's boxSizes only just fits a 12-letter word at the
// largest Dynamic Type size, with nothing spare — 11 keeps the headroom.
ok('no word is wider than the cell grid can hold',
  TRANSMISSIONS.every((t) => t.split(' ').every((w) => w.length <= 11)));
// Too short is an unsolvable cryptogram (nothing to get frequency purchase
// on); too long overflows the card.
ok('every line is a workable cryptogram length',
  TRANSMISSIONS.every((t) => t.length >= 22 && t.length <= 46));

// --- B4 daily crossover ---------------------------------------------------
{
  const { eligibleWords, answerForDeal, nightWordChoices } =
    require('./src/daily/crossover') as typeof import('./src/daily/crossover');
  // Authoring constraint: every line must offer >=2 askable words, or the
  // re-deal design collapses back to a fixed answer.
  ok(
    'every transmission line carries two or more eligible words',
    TRANSMISSIONS.every(
      (_, i) =>
        eligibleWords(
          new Date(Date.UTC(2026, 7, 1 + i)).toISOString().slice(0, 10),
        ).length >= 2,
    ),
  );
  const card = nightWordChoices('2026-08-01');
  ok('crossover card holds four words', card.words.length === 4);
  ok(
    'the answer sits where the index says and she truly said it',
    card.words[card.answerIndex] === answerForDeal('2026-08-01', 0) &&
      transmissionForDay('2026-08-01').plaintext.includes(card.words[card.answerIndex]),
  );
  ok(
    'crossover card is deterministic per night and deal',
    JSON.stringify(nightWordChoices('2026-08-01')) === JSON.stringify(card),
  );
  // The whole-card guarantee, a year out and six deals deep: four words,
  // exactly ONE from tonight's line, decoys length-matched to the answer
  // (no stylistic tell), and consecutive deals never ask the same word —
  // every card is entirely fresh, so diffing deals teaches nothing.
  let crossoverFails = 0;
  for (let d = 0; d < 365; d++) {
    const day = new Date(Date.UTC(2026, 7, 1 + d)).toISOString().slice(0, 10);
    const line = transmissionForDay(day).plaintext.toUpperCase();
    for (let deal = 0; deal < 6; deal++) {
      const c = nightWordChoices(day, 4, deal);
      const ansLen = c.words[c.answerIndex].length;
      const bad =
        c.words.length !== 4 ||
        c.words.filter((w) => line.includes(w)).length !== 1 ||
        !line.includes(c.words[c.answerIndex]) ||
        c.words.some((w) => Math.abs(w.length - ansLen) > 2) ||
        (deal > 0 && answerForDeal(day, deal) === answerForDeal(day, deal - 1));
      if (bad) crossoverFails++;
    }
  }
  ok('365 nights x 6 deals: fresh, fair, tell-free cards', crossoverFails === 0);
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

// --- Morse nights ----------------------------------------------------------
// A PRESENTATION variant: the ciphertext number is keyed as figures instead of
// printed as digits. Everything the puzzle and the B4 crossover depend on must
// be provably unchanged, which is what these assert.
{
  const morseThu = '2026-08-06'; // a Thursday
  const plainWed = '2026-08-05';
  ok('morse night lands on Thursday', isMorseNight(morseThu));
  ok('other nights are not morse', !isMorseNight(plainWed));
  ok('every digit has a five-symbol code',
    MORSE_DIGITS.length === 10 && MORSE_DIGITS.every((c) => c.length === 5));
  ok('all digit codes are distinct', new Set(MORSE_DIGITS).size === 10);
  ok('a number keys as one group per digit', morseForNumber(18) === '.---- ---..');
  ok('single digits key as one group', morseForNumber(7) === '--...');
  ok('no zero padding', morseForNumber(1) === '.----');

  // The whole claim of this variant is that the puzzle is untouched. Build the
  // same plaintext on a Morse night and a plain night and compare everything
  // the solver, the share card and the B4 crossover actually read.
  const line = TRANSMISSIONS[0];
  const a = buildPuzzle(morseThu, line);
  const b = buildPuzzle(plainWed, line);
  const shape = (p: typeof a) => p.words.map((w) => w.length).join(',');
  ok('morse night has the same word shape', shape(a) === shape(b));
  ok('morse night resolves the same plaintext',
    [...a.answerByNum.values()].sort().join('') ===
      [...b.answerByNum.values()].sort().join(''));
  const solve = (p: typeof a) => new Map([...p.answerByNum]);
  ok('a morse night still solves', isSolved(a, solve(a)));
  ok('morse night hands back one extra letter',
    revealCount(morseThu) === REVEALS_BY_WEEKDAY[4] + 1);
  ok('a plain night is unchanged',
    revealCount(plainWed) === REVEALS_BY_WEEKDAY[3]);
}

// --- Header-key nights -----------------------------------------------------
// STRICTLY ADDITIVE: a listener who recognises the header word writes the key
// out in seconds; one who does not sees an ordinary cryptogram. These assert
// that it can never become an obstacle, and that it cannot leak the crossover.
{
  const mon = '2026-08-03'; // a Monday
  const tue = '2026-08-04';
  ok('header-key night lands on Monday', isHeaderKeyNight(mon));
  ok('other nights are not header-key', !isHeaderKeyNight(tue));
  ok('header-key and morse never collide',
    HEADER_KEY_WEEKDAY !== MORSE_WEEKDAY);

  // RULE 1, and the important one: no header word may appear in any of the 365
  // transmissions. b4-night asks "WHAT DID I SAY TONIGHT" and re-deals a true
  // word each time; a header word that was also a real word would hand it over.
  const allWords = new Set(TRANSMISSIONS.flatMap((t) => t.toUpperCase().split(/[^A-Z]+/)));
  const leaked = HEADER_KEYWORDS.filter((w) => allWords.has(w));
  ok('no header keyword appears in any transmission', leaked.length === 0, leaked.join(','));

  // RULE 2: enough distinct letters that the keyed alphabet really moves.
  const thin = HEADER_KEYWORDS.filter((w) => new Set(w).size < 4);
  ok('every header keyword has 4+ distinct letters', thin.length === 0, thin.join(','));

  // The keyed alphabet must still be a permutation, or the cipher is broken.
  for (const w of HEADER_KEYWORDS) {
    const a = keyedAlphabet(w);
    if (a.length !== 26 || new Set(a).size !== 26) {
      ok(`keyed alphabet for ${w} is a permutation`, false);
      break;
    }
  }
  ok('keyed alphabets are all permutations', true);

  const map = keyForDay(mon);
  ok('header-key map is a bijection onto 1..26',
    new Set(map.values()).size === 26 &&
      [...map.values()].every((n) => n >= 1 && n <= 26));
  ok('header-key night is deterministic',
    JSON.stringify([...keyForDay(mon)]) === JSON.stringify([...keyForDay(mon)]));

  // The whole point: knowing the word reproduces the key exactly.
  const derived = new Map(
    [...keyedAlphabet(keywordForDay(mon))].map((ch, i) => [ch, i + 1] as const),
  );
  ok('the header word derives the whole key',
    [...derived].every(([ch, n]) => map.get(ch) === n));

  // And the crossover stays safe: same plaintext resolved, same word shape.
  const line = TRANSMISSIONS[3];
  const hk = buildPuzzle(mon, line);
  const plain = buildPuzzle(tue, line);
  ok('header-key night has the same word shape',
    hk.words.map((w) => w.length).join(',') === plain.words.map((w) => w.length).join(','));
  ok('header-key night resolves the same plaintext',
    [...hk.answerByNum.values()].sort().join('') ===
      [...plain.answerByNum.values()].sort().join(''));
  ok('a header-key night still solves', isSolved(hk, new Map([...hk.answerByNum])));
}

if (failures) {
  console.log(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nall cipher tests passed');

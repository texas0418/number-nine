// src/chapters/broadcast1.ts
// Broadcast One — the FREE chapter, the whole top of the funnel. Its job is to
// convert: sustain the writing and the dread long enough that the reader wants
// Broadcasts Two–Six, and end on a held breath, not a wall. Full draft
// (~25-30 min), open to a polish pass.
//
// FIVE puzzles, five DIFFERENT kinds (device feedback: too few, too easy, "just
// hidden codes"). None is a found number you simply type — each needs a
// different act of mind:
//   1. THE SAFE (combination) — deduce the year he STOPPED from a 1904–1963
//      memorial seen much earlier; pick the later number. Digits: 1963.
//   2. THE DIAL (analog tuning) — cross-reference the aerial licence "No.
//      46-25" with the card "where we are licensed": tune 4625 kHz.
//   3. THE CIPHER (letter decode) — realize the counted numbers are LETTERS
//      (A=1): the group 14·9·14·5 spells a word. Letters: NINE.
//   4. THE TELEPHONE (orientation) — the voice speaks MIRRORED; read it turned
//      around: FIVE·NINE·TWO becomes 2·9·5. Digits: 295.
//   5. THE COUNT (deduction) — she counts ninety groups every night; tonight
//      she counted them, then his name, then began again. Reason it: 91.
//
// Puzzle doctrine (AGENTS.md, tested in test-models.ts): a gate's literal
// answer never appears within three blocks of the gate. Clues live far away
// and cross-modal. Wrong answers get atmosphere, never an error message.

import type { Chapter } from '../models';

export const BROADCAST_ONE: Chapter = {
  id: 1,
  title: 'BROADCAST ONE',
  blocks: [
    { kind: 'chapterCard', number: 'BROADCAST ONE', title: 'The Licence', cue: 'ident' },

    // --- The estrangement (and, planted early, the years on the stone) -----
    { kind: 'room', text: 'The Hall', scene: 'hall' },
    {
      kind: 'prose',
      text: 'They had not spoken in nineteen years when Halloran died, which was its own tidy symmetry, because Halloran had been dead in every way that counted to Edwin since a certain winter long ago. The stone in the churchyard gave the plain arithmetic of him — 1904 to 1963 — and nothing of the silence in between.',
      cue: 'silence',
    },
    {
      kind: 'prose',
      text: 'The solicitor’s letter called Edwin "next of kin," as though the phrase were a door held open — the property having passed to his brother, the letter noted in passing, on the death of his wife, whom it did not trouble to name. He had not wanted to walk through that door. One does anyway. The house stood where the land gave up and became marsh, and it had the particular quiet of a place that has been listened in for a very long time.',
    },
    {
      kind: 'prose',
      text: 'The parcel waited on the hall table: a shortwave receiver wrapped in oilcloth, a logbook with water-swollen pages, and a single brass key. Edwin signed for all three. The delivery man would not meet his eyes, and left the way people leave a room where something has just been said that should not have been.',
    },
    { kind: 'plate', image: 'obj-receiver', caption: 'the receiver · war surplus, working' },

    // --- The study: effects, and the safe (PUZZLE 1) ----------------------
    { kind: 'room', text: 'The Study', scene: 'study', cue: 'key-unlock' },
    {
      kind: 'prose',
      text: 'The brass key opened nothing in the hall, nor the kitchen, nor the two cold bedrooms. It opened the study, where Halloran had done his listening, and where the air was still faintly sweet with a pipe no one had smoked in six weeks.',
    },
    {
      kind: 'logbook',
      lines: [
        'EFFECTS OF H. MARSH — ITEMIZED FOR PROBATE',
        'one receiver, war surplus, working',
        'one logbook, damp, entries incomplete',
        'one wireless aerial licence, No. 46-25,',
        '  marked RENEW BY JUNE (never renewed)',
        'one desk safe, contents unknown, LOCKED',
        'one pencil, sharpened to nothing',
      ],
    },
    {
      kind: 'prose',
      text: 'A desk safe, the inventory said. But no safe showed itself anywhere in the study — only the bookshelves, the desk, the cold window, and Halloran’s watercolours of the marsh, hung level as judgement. Edwin walked the walls twice. Old houses keep their secrets in plain sight, and so, he was beginning to understand, had his brother.',
    },
    {
      kind: 'hotspot',
      id: 'b1-find-safe',
      image: 'study',
      target: { x: 0.13, y: 0.33, w: 0.2, h: 0.18 },
      prompt: 'the study wall',
      unlockedText: 'the watercolour swings on a hinge · behind it, steel',
      solveCue: 'hinge-creak',
    },
    {
      kind: 'prose',
      text: 'The safe was the size of a biscuit tin, set flush into the plaster: three brass wheels, and a place for one figure before them. Halloran had been a man who kept only one number in his head, and had said so once, at a Christmas neither brother enjoyed — a man should carry a single number, and it should be the one he can never put down.',
    },
    { kind: 'plate', image: 'obj-safe', caption: 'the desk safe · contents unknown' },
    {
      kind: 'safe',
      id: 'b1-safe',
      answer: '1963',
      prompt: 'the desk safe · one figure, then three wheels',
      unlockedText: 'the wheels give · the door swings on the year that ended them both',
      solveCue: 'safe-open',
    },
    {
      kind: 'prose',
      text: 'Inside was a single index card. On it, in Halloran’s hand, four words underlined twice: WHERE WE ARE LICENSED. Nothing else. Edwin turned it over; the back was blank, and the blankness was somehow the worse of the two sides.',
    },

    // --- The logbook: the descent, and clues sown for later gates ----------
    {
      kind: 'prose',
      text: 'He read the logbook because there was nothing else to do and because the house seemed to want him to. Halloran had been a listener — not a talker, never once in nineteen years a telephone call — but a listener of the patient, nocturnal kind, the kind that keeps a pencil sharpened.',
    },
    { kind: 'plate', image: 'obj-logbook', caption: 'the listening log · entries incomplete' },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'LISTENING LOG — H. MARSH',
        '3 JUN 63 · 2314 · a station where none should be.',
        '  six notes, a music box. then a woman counts.',
        '11 JUN 63 · 2314 · ninety groups again.',
        '13 JUN 63 · she said the song was for me.',
        '14 JUN 63 ·',
        '',
        'margin, a smaller, more careful hand:',
        '· her words arrive turned around',
        '· the numbers are letters, with patience',
        '· do not answer before she rings off',
      ],
    },
    {
      kind: 'prose',
      text: 'The fourteenth of June was blank. Every night after it was blank. Nineteen years of nightly entries, and then a man simply stops, mid-June, mid-sentence, the pencil worn to nothing and the safe holding a card that reads like an address.',
    },

    // --- Descent to the cellar (PUZZLE 2 lead-in), typeset as stairs -------
    {
      kind: 'prose',
      text: 'The receiver wanted a mains socket, and the only one still live was in the cellar, where the marsh pressed closest to the walls and the house kept its cold like a held breath.',
      cue: 'static-swell',
    },
    {
      kind: 'staircase',
      direction: 'down',
      cue: 'footsteps',
      steps: [
        'The cellar stairs went down eleven steps,',
        'and the dark came up at the sixth,',
        'and from below — faint, patient,',
        'already switched on though no plug',
        'had touched the wall —',
        'something was humming in six notes.',
      ],
    },
    { kind: 'room', text: 'The Cellar', scene: 'cellar' },
    {
      kind: 'prose',
      text: 'The receiver sat on the workbench with its dial lamp lit and its cord coiled beside it, unplugged. The card from the safe was in his breast pocket; he could feel the two underlines through the cloth. He reached for the dial with a steadiness he did not feel.',
    },
    {
      kind: 'radio',
      id: 'b1-tune',
      bandLowKhz: 4400,
      bandHighKhz: 4800,
      targetKhz: 4625,
      lockedText: 'drag the dial · the static thins where the carrier lives',
      unlockedText: 'carrier locked · she is already singing',
      cue: 'static-swell',
    },

    // --- The broadcast, and the cipher (PUZZLE 3) --------------------------
    { kind: 'voice', text: 'NINE. NINE. NINE. GOOD EVENING, LISTENER.', mirrored: false, cue: 'ident' },
    {
      kind: 'prose',
      text: 'The voice was a woman’s, flat and clean as a pressed flower, with no room in it at all. She played the six notes first — a music box running down — then began to count, in groups of five, unhurried, as though she had every night in the world and meant to spend them one at a time.',
    },
    {
      kind: 'prose',
      text: 'Edwin found the sharpened pencil in his hand without any memory of taking it up, and found he had already written thirty groups down the margin of his brother’s log. One group came back, and came back, and came back — the same four figures, as if they were not a count at all but a word she could not stop saying.',
    },
    {
      kind: 'logbook',
      lines: [
        'his hand, unsteady, down the margin:',
        '06 22 19 · 11 14 08 · 25 04 25',
        '14 09 14 05   ← this one, again',
        '14 09 14 05   ← and again',
        '14 09 14 05   ← she will not let it go',
      ],
    },
    {
      kind: 'cipher',
      id: 'b1-decode',
      answer: 'NINE',
      prompt: 'the repeated group · four letters',
      unlockedText: 'the slate settles · she has been saying her own name all along',
    },
    {
      kind: 'prose',
      text: 'He set the four letters down and did not like the shape they made. The station had a name, and it had been counting its name into the dark for nineteen years, and tonight, for the first time, someone had been patient enough to spell it back.',
    },
    {
      kind: 'prose',
      text: 'In the drawer beneath the bench, wrapped in a handkerchief, lay a music box no larger than a matchbox — four brass tines worn bright with use. His brother had built things all his life, and had never once built anything without a reason. The mechanism would not wind. It was waiting, patiently, to be played.',
    },
    {
      kind: 'melody',
      id: 'b1-musicbox',
      answer: '123134',
      prompt: 'the music box',
      unlockedText: 'the tines remember her song · the lid lifts',
    },
    {
      kind: 'prose',
      text: 'Inside the lid, scratched fine as hairs, were tally marks. Edwin counted them twice: ninety. The box had been keeping score of something for a long time, and the score was old, and tonight — he felt it with a listener’s certainty — the score had changed.',
    },
    {
      kind: 'prose',
      text: 'The cold came through the cellar wall unevenly. Beneath the little barred window, one brick sat a fraction proud of its courses, and alone among all its neighbours it did not sweat.',
    },
    {
      kind: 'hotspot',
      id: 'b1-brick',
      image: 'cellar',
      target: { x: 0.01, y: 0.53, w: 0.23, h: 0.17 },
      prompt: 'the cellar wall',
      unlockedText: 'the brick comes away · behind it, a tin box, wartime issue',
      solveCue: 'scrape',
    },
    {
      kind: 'prose',
      text: 'The tin was GPO stock, stencilled and rusted shut around four brass wheels set into its lid. His brother had hidden it the way he had done everything in this house — where only a listener would think to feel for it, and locked the way she liked things kept.',
    },
    {
      kind: 'keypad',
      id: 'b1-tin',
      answer: '5264',
      prompt: 'the tin box · four wheels',
      unlockedText: 'the wheels agree · the lid lifts on a photograph',
    },
    {
      kind: 'prose',
      text: 'A photograph, silvered with age: a woman at this same workbench, headphones over her hair, laughing at whoever held the camera. On the back, in pencil, two words — my best listener — and nothing else. No name.',
    },

    // --- Fork (narrative branch, not a puzzle) ----------------------------
    {
      kind: 'fork',
      leftLabel: 'READ THE LOG',
      left: 'He turned to the blank fourteenth of June, and it was not blank now. Tonight’s date stood at the head of the page — in pencil, in his own hand, the graphite still bright — though he had written nothing there.',
      rightLabel: 'OPEN THE BENCH',
      right: 'He opened the drawer beneath the bench: ninety index cards, banded in string, each a night in Halloran’s neat columns. He thumbed to the last. It was dated tomorrow, and its columns were already full.',
      join: 'Either way the arithmetic was the same, and the arithmetic was the thing he could not put down. She had been counting toward something for nineteen years. It had a date, and by every reckoning in that cold room the date was nearly here.',
    },
    { kind: 'voice', text: 'FIVE. NINE. TWO. EDWIN.', mirrored: true },
    { kind: 'thought', text: 'He had not told the radio his name. He had not spoken his name aloud in this house at all.' },

    // --- Ascent (stairs, climbing) and the telephone (PUZZLE 4) -----------
    {
      kind: 'prose',
      text: 'Upstairs, faintly, the telephone began to ring — the way a thing rings when it has been ringing a long while and fully intends to go on.',
      cue: 'phone-ring',
    },
    {
      kind: 'staircase',
      direction: 'up',
      cue: 'footsteps',
      steps: [
        'He took the eleven steps two at a time,',
        'the cold peeling off him like a wet coat,',
        'up out of the cellar,',
        'into the hall, where the telephone',
        'shivered on its little table.',
      ],
    },
    { kind: 'room', text: 'The Hall', scene: 'hall' },
    {
      kind: 'prose',
      text: 'She had given him three figures by name, in her flat clean voice, and a man who has been handed three figures in the dark will always dial them. He lifted the receiver and dialled.',
    },
    { kind: 'plate', image: 'obj-telephone', caption: 'the hall telephone · still ringing' },
    {
      kind: 'keypad',
      id: 'b1-phone',
      answer: '295',
      prompt: 'the telephone',
      unlockedText: 'the line clicks open · and somebody, close, is breathing',
      stopsCue: 'phone-ring',
    },
    { kind: 'voice', text: 'YOU COUNTED WRONG, EDWIN. WE WILL BEGIN AGAIN.', mirrored: false },

    // --- The count (PUZZLE 5, deduction) and the cliffhanger --------------
    {
      kind: 'prose',
      text: 'He thought about the count then, because the voice wanted him to. Ninety groups. Ninety, every night, for nineteen years without fail — the log said so, and the log did not lie. But tonight she had counted the ninety, and then she had spoken his name into the middle of them, and then she had begun again.',
    },
    {
      kind: 'logbook',
      lines: [
        'the last card in the tin, dated tomorrow:',
        'GROUPS COUNTED TONIGHT: ______',
        '(the space left blank, waiting for a hand)',
      ],
    },
    {
      kind: 'keypad',
      id: 'b1-count',
      answer: '91',
      prompt: 'fill the card',
      unlockedText: 'the pencil moves on its own · the number was always going to be this',
    },
    {
      kind: 'prose',
      text: 'And then, before the line went dead, she spoke once more — slowly, deliberately, the way one speaks to a child or to the deaf — and what she gave him was not a count at all.',
    },
    {
      kind: 'logbook',
      cue: 'page-turn',
      lines: [
        'her last groups of the night, in a shaking hand:',
        '20 · 05 · 18 · 01 · 07 · 18 · 01 · 13',
        '(no ident followed. the first time in nineteen years.)',
      ],
    },
    {
      kind: 'cipher',
      id: 'b1-lastword',
      answer: 'MARGARET',
      prompt: 'the last transmission · eight letters',
      unlockedText: 'her words arrive turned around · and turned, they make a name',
    },
    {
      kind: 'prose',
      text: 'Margaret. The woman in the photograph, laughing at her workbench. The wife the solicitor’s letter had not troubled to name. His brother’s best listener — nineteen years dead, and counting still. The station had not taken Halloran first.',
    },
    {
      kind: 'prose',
      text: 'Sixty feet away, behind a door he had left open onto the dark, the receiver put out its dial lamp. Politely. The way a guest turns down the lamp when the conversation is finished and the night, properly, is only beginning.',
      faded: true,
      cue: 'lamp-off',
    },
    {
      kind: 'prose',
      text: 'Edwin Marsh did not catch his train in the morning. There would be no more ordinary mornings — only broadcasts now, one a night, counting down the last of them. He sat in the cold hall with the receiver warm against his ear and listened, because listening was the one thing the Marsh brothers had ever truly known how to do.',
    },
    { kind: 'chapterEnd', title: 'END OF BROADCAST ONE' },
  ],
};
